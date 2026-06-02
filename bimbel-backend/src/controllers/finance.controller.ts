// PRIVATE_FIXED/bimbel-backend/src/controllers/finance.controller.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import axios from "axios";
import { generatePDFBuffer, uploadToSupabase } from "../utils/pdfGenerator";

// Helper to calculate cycle Sunday date
const getCycleSundayStr = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
  const cycleSunday = new Date(d);
  cycleSunday.setDate(d.getDate() - day);
  
  const yyyy = cycleSunday.getFullYear();
  const mm = String(cycleSunday.getMonth() + 1).padStart(2, "0");
  const dd = String(cycleSunday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// ==============================
// GET UNIFIED FINANCE DATA
// ==============================
export const getFinance = async (req: Request, res: Response) => {
  try {
    // 1. Fetch all attendances that are relevant for finance (disetujui, selesai, diselesaikan)
    const attendances = await prisma.attendance.findMany({
      where: {
        status: {
          in: ["disetujui", "selesai", "diselesaikan"],
        },
      },
      include: {
        tutor: true,
        student: {
          include: {
            level: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Helper to calculate Gross and Profit
    const getCalculatedMetrics = (item: any) => {
      const feeNet = item.feeNet || 0;
      let gross = feeNet;
      let potongan = 10;
      if (item.student?.level) {
        const lvl = item.student.level;
        potongan = lvl.potonganAdmin;
        gross = (lvl.hargaJual / lvl.durasiMenit) * item.durationMin;
      }
      const adminProfit = gross - feeNet;
      return { gross, adminProfit, feeNet };
    };


    // Grouping for Payout (unpaid, status: disetujui)
    const groupedPayout = new Map<string, any>();
    // Grouping for History (paid, status: selesai)
    const groupedHistory = new Map<string, any>();

    attendances.forEach((item) => {
      const tutorId = item.tutorId;
      const metrics = getCalculatedMetrics(item);

      if (item.status === "disetujui") {
        if (!groupedPayout.has(tutorId)) {
          groupedPayout.set(tutorId, {
            id: "",
            tutorId,
            tutorKode: item.tutor?.kode || "TUT-000",
            tutorNama: item.tutor?.nama || item.tutor?.kode || "Tutor",
            namaBank: item.tutor?.namaBank || "-",
            noRekening: item.tutor?.noRek || "-",
            jumlahSesi: 0,
            totalNominal: 0, // Tutor fee bersih
            status: "disetujui",
            periodeStart: "",
            periodeEnd: "",
            sessions: []
          });
        }
        const pay = groupedPayout.get(tutorId);
        pay.jumlahSesi += 1;
        pay.totalNominal += metrics.feeNet;
        
        // Dynamic dates
        const dateStr = item.createdAt.toISOString().split("T")[0];
        if (!pay.periodeStart || dateStr < pay.periodeStart) pay.periodeStart = dateStr;
        if (!pay.periodeEnd || dateStr > pay.periodeEnd) pay.periodeEnd = dateStr;

        // Add session details
        pay.sessions.push({
          tanggal: dateStr,
          siswa: item.student?.fullName || "-",
          mapel: item.subjectName,
          durasi: item.durationMin,
          fee: metrics.feeNet
        });
      }

      if (item.status === "selesai") {
        // Group by payoutId if it exists, otherwise fallback to cycleSunday
        const cycleSunday = getCycleSundayStr(item.createdAt);
        const uniqueKey = item.payoutId || `${tutorId}-${cycleSunday}`;
        
        const updatedAtStr = item.updatedAt ? item.updatedAt.toISOString().split("T")[0] : item.createdAt.toISOString().split("T")[0];

        if (!groupedHistory.has(uniqueKey)) {
          // Calculate cycle Saturday based on cycleSunday
          const cycleSundayDate = new Date(cycleSunday);
          const cycleSaturdayDate = new Date(cycleSundayDate);
          cycleSaturdayDate.setDate(cycleSundayDate.getDate() + 6);
          const cycleSaturday = cycleSaturdayDate.toISOString().split("T")[0];

          groupedHistory.set(uniqueKey, {
            id: item.payoutId || "",
            transactionId: item.payoutId || "",
            tutorId,
            tutorKode: item.tutor?.kode || "TUT-000",
            tutorNama: item.tutor?.nama || item.tutor?.kode || "Tutor",
            namaBank: item.tutor?.namaBank || "-",
            noRekening: item.tutor?.noRek || "-",
            jumlahSesi: 0,
            totalNominal: 0,
            status: "sudah-payout",
            periodeStart: cycleSunday,
            periodeEnd: cycleSaturday,
            tanggalTransfer: "",
            sessions: []
          });
        }
        const hist = groupedHistory.get(uniqueKey);
        hist.jumlahSesi += 1;
        hist.totalNominal += metrics.feeNet;
        
        const dateStr = item.createdAt.toISOString().split("T")[0];
        
        // Gunakan updatedAt untuk tanggalTransfer (kapan admin memproses 'selesai')
        if (!hist.tanggalTransfer || updatedAtStr > hist.tanggalTransfer) hist.tanggalTransfer = updatedAtStr;

        hist.sessions.push({
          tanggal: dateStr,
          siswa: item.student?.fullName || "-",
          mapel: item.subjectName,
          durasi: item.durationMin,
          fee: metrics.feeNet
        });
      }
    });

    // Convert map to arrays and add transaction IDs
    const payoutList = Array.from(groupedPayout.values()).map((item, index) => ({
      ...item,
      id: `TRX-${new Date().getFullYear()}${String(index + 1).padStart(3, "0")}-UNPAID`,
    }));

    // We no longer group history by week. We just convert the map to an array.
    const historyList: any[] = [];
    const cleanSupabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
    
    for (const hist of Array.from(groupedHistory.values())) {
      if (!hist.id) {
        // Fallback for legacy history without payoutId
        const cycleSundayFormatted = hist.periodeStart.replace(/-/g, "");
        hist.id = `TRX-${cycleSundayFormatted}-${hist.tutorKode}-PAID`;
        hist.transactionId = `TRX-${cycleSundayFormatted}-${hist.tutorKode}-PAID`;
      }
      
      const fileName = `${hist.transactionId}.pdf`;
      if (cleanSupabaseUrl) {
        hist.pdfUrl = `${cleanSupabaseUrl}/storage/v1/object/public/slips/${fileName}`;
      } else {
        hist.pdfUrl = null;
      }

      historyList.push(hist);
    }

    // Summary calculations
    const totalReadyToPay = payoutList.reduce((acc, curr) => acc + curr.totalNominal, 0);
    const totalTutorsWaiting = payoutList.length;

    // Monthly profits calculation
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let estimatedProfitThisMonth = 0;
    let estimatedProfitLastMonth = 0;

    attendances.forEach((item) => {
      const metrics = getCalculatedMetrics(item);
      const itemDate = new Date(item.createdAt);
      
      if (itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth) {
        estimatedProfitThisMonth += metrics.adminProfit;
      } else if (
        (itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth - 1) ||
        (currentMonth === 0 && itemDate.getFullYear() === currentYear - 1 && itemDate.getMonth() === 11)
      ) {
        estimatedProfitLastMonth += metrics.adminProfit;
      }
    });

    const profitGrowthRate = estimatedProfitLastMonth === 0 
      ? 0.0
      : Math.round(((estimatedProfitThisMonth - estimatedProfitLastMonth) / estimatedProfitLastMonth) * 100 * 10) / 10;

    // Monthly chart data (Recharts)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySummary = new Map<string, { grossRevenue: number, adminProfit: number }>();
    
    // Seed last 4 months
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const key = `${monthNames[d.getMonth()]}`;
      monthlySummary.set(key, { grossRevenue: 0, adminProfit: 0 });
    }

    attendances.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const monthKey = monthNames[itemDate.getMonth()];
      if (monthlySummary.has(monthKey)) {
        const metrics = getCalculatedMetrics(item);
        const data = monthlySummary.get(monthKey)!;
        data.grossRevenue += metrics.gross;
        data.adminProfit += metrics.adminProfit;
      }
    });

    const monthlyData = Array.from(monthlySummary.entries()).map(([bulan, val]) => ({
      bulan,
      grossRevenue: Math.round(val.grossRevenue),
      adminProfit: Math.round(val.adminProfit),
    }));

    // Weekly breakdown for the current month
    const weeklySummary = [
      { minggu: "W1", gross: 0, profit: 0 },
      { minggu: "W2", gross: 0, profit: 0 },
      { minggu: "W3", gross: 0, profit: 0 },
      { minggu: "W4", gross: 0, profit: 0 },
    ];

    attendances.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      if (itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth) {
        const metrics = getCalculatedMetrics(item);
        const date = itemDate.getDate();
        let weekIdx = 0;
        if (date > 21) weekIdx = 3;
        else if (date > 14) weekIdx = 2;
        else if (date > 7) weekIdx = 1;
        
        weeklySummary[weekIdx].gross += metrics.gross;
        weeklySummary[weekIdx].profit += metrics.adminProfit;
      }
    });

    const weeklyData = weeklySummary.map((w) => ({
      minggu: w.minggu,
      gross: Math.round(w.gross),
      profit: Math.round(w.profit),
    }));

    // Top 5 Tutors revenue contribution
    const tutorRevenueMap = new Map<string, any>();
    attendances.forEach((item) => {
      const tutorId = item.tutorId;
      const metrics = getCalculatedMetrics(item);

      if (!tutorRevenueMap.has(tutorId)) {
        tutorRevenueMap.set(tutorId, {
          nama: item.tutor?.nama || "Tutor",
          totalGross: 0,
          adminShare: 0,
          sessions: 0
        });
      }
      const data = tutorRevenueMap.get(tutorId);
      data.totalGross += metrics.gross;
      data.adminShare += metrics.adminProfit;
      data.sessions += 1;
    });

    const topTutorRevenue = Array.from(tutorRevenueMap.values())
      .sort((a, b) => b.adminShare - a.adminShare)
      .slice(0, 5)
      .map(item => ({
        ...item,
        totalGross: Math.round(item.totalGross),
        adminShare: Math.round(item.adminShare),
      }));

    res.json({
      summary: {
        totalReadyToPay,
        totalTutorsWaiting,
        estimatedProfitThisMonth: Math.round(estimatedProfitThisMonth),
        profitGrowthRate: profitGrowthRate
      },
      payout: payoutList,
      history: historyList,
      reports: {
        monthlyData,
        weeklyData,
        topTutorRevenue
      }
    });
  } catch (error) {
    console.error("FINANCE ERROR:", error);
    res.status(500).json({ message: "Gagal ambil data keuangan" });
  }
};

// Helper to send WA via Fonnte
// Helper to send WA via Fonnte
const sendWA = async (to: string, message: string, fileUrl?: string, fileName?: string) => {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.log("Fonnte Token is empty. Skipping WhatsApp sending.");
    return;
  }

  // Normalize phone number to format international E.164 (62...) without + sign
  let cleanPhone = to.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  }

  const payload: any = {
    target: cleanPhone,
    message: message,
  };

  if (fileUrl) {
    payload.url = fileUrl;
    if (fileName) {
      payload.filename = fileName;
    }
  }

  try {
    const res = await axios.post(
      "https://api.fonnte.com/send",
      payload,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    console.log("Fonnte Send WA Response:", res.data);
  } catch (error: any) {
    console.error("Fonnte Send WA Error:", error.response?.data || error.message);
  }
};

// ==============================
// PROCESS TUTOR PAYOUT
// ==============================
export const processPayout = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.body;

    if (!tutorId) {
      return res.status(400).json({
        message: "Tutor ID wajib diisi",
      });
    }

    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    // Fetch attendances that will be paid
    const attendances = await prisma.attendance.findMany({
      where: {
        tutorId,
        status: "disetujui",
      },
      include: {
        student: true,
      },
    });

    if (attendances.length === 0) {
      return res.status(400).json({ message: "Tidak ada presensi yang disetujui untuk payout" });
    }

    // Generate a unique payout ID for this specific payout action
    const dates = attendances.map(a => new Date(a.createdAt).getTime());
    const minDate = new Date(Math.min(...dates));
    const cycleSunday = getCycleSundayStr(minDate);
    const cycleSundayFormatted = cycleSunday.replace(/-/g, "");
    
    // Add a short random suffix to ensure multiple payouts in the same week are separated
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const transactionId = `TRX-${cycleSundayFormatted}-${tutor.kode}-${randomSuffix}-PAID`;

    // Update status seluruh presensi tutor yang 'disetujui' menjadi 'selesai' dan set payoutId
    const result = await prisma.attendance.updateMany({
      where: {
        tutorId,
        status: "disetujui",
      },
      data: {
        status: "selesai",
        payoutId: transactionId,
      },
    });

    // Send WhatsApp slip notification if tutor has a WA number
    if (tutor.noWa) {
      // Fetch system settings to get custom agency/bimbel name
      const settings = await prisma.systemSetting.findUnique({
        where: { id: "system" },
      });
      const namaBimbel = settings?.namaBimbel || "BimbelMelly";

      const totalPayout = attendances.reduce((sum, item) => sum + item.feeNet, 0);

      const getCyclePeriodText = (startStr: Date) => {
        const startDate = new Date(startStr);
        const startDay = startDate.getDay();
        const sunday = new Date(startDate);
        sunday.setDate(startDate.getDate() - startDay);

        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);

        return `${sunday.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} s/d ${saturday.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
      };
      
      const cyclePeriodStr = getCyclePeriodText(minDate);

      const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount).replace("Rp", "Rp ");
      };

      let message = `SLIP GAJI TUTOR - ${namaBimbel.toUpperCase()}\n`;
      message += `===============================\n`;
      message += `ID Transaksi : ${transactionId}\n`;
      message += `Nama Tutor  : ${tutor.nama || "Tutor"} (${tutor.kode})\n`;
      message += `Periode     : ${cyclePeriodStr}\n`;
      message += `Jumlah Sesi : ${attendances.length} sesi\n`;
      message += `Total Transfer: ${formatRupiah(totalPayout)}\n\n`;

      message += `Detail Rekening: \n`;
      message += `Bank: ${tutor.namaBank || "-"}\n`;
      message += `Rekening: ${tutor.noRek || "-"}\n`;
      message += `Status: Sudah Ditransfer\n\n`;

      message += `Rincian Sesi Mengajar:\n`;
      attendances.forEach((item, idx) => {
        const itemDate = new Date(item.createdAt);
        const dateFormatted = `${itemDate.getDate()} ${itemDate.toLocaleDateString("id-ID", { month: "short" })}`;
        message += `${idx + 1}. ${dateFormatted} - ${item.student?.fullName || "Siswa"} - ${item.subjectName} (${item.durationMin}m) - ${formatRupiah(item.feeNet)}\n`;
      });

      message += `===============================\n`;
      message += `Terima kasih atas dedikasi Anda mengajar di ${namaBimbel}! Slip gaji PDF lengkap dapat diunduh di dashboard admin.`;

      // Map sessions for PDF generator
      const sessionsMapped = attendances.map((item) => ({
        tanggal: item.createdAt.toISOString(),
        siswa: item.student?.fullName || "Siswa",
        mapel: item.subjectName,
        durasi: item.durationMin,
        fee: item.feeNet
      }));

      // Trigger async send so it doesn't block the API response
      (async () => {
        try {
          const pdfBuffer = await generatePDFBuffer({
            payoutId: transactionId,
            tutorNama: tutor.nama || "Tutor",
            tutorKode: tutor.kode,
            periodeStr: cyclePeriodStr,
            totalNominal: totalPayout,
            namaBank: tutor.namaBank || "-",
            noRekening: tutor.noRek || "-",
            sessions: sessionsMapped,
            namaBimbel
          });

          const fileName = `${transactionId}.pdf`;
          const fileUrl = await uploadToSupabase(pdfBuffer, fileName);

          let finalMessage = message;
          if (fileUrl) {
            finalMessage += `\n\nLink Akses PDF Slip Gaji:\n${fileUrl}`;
          }

          await sendWA(tutor.noWa!, finalMessage, fileUrl || undefined, fileName || undefined);
        } catch (err) {
          console.error("Failed to generate and upload PDF slip in processPayout:", err);
          await sendWA(tutor.noWa!, message);
        }
      })();
    }

    res.json({
      message: "Payout berhasil diproses",
      count: result.count,
    });
  } catch (error) {
    console.error("PROCESS PAYOUT ERROR:", error);
    res.status(500).json({
      message: "Gagal memproses payout",
    });
  }
};

// ==============================
// RESEND PAYOUT SLIP WHATSAPP
// ==============================
export const sendWhatsAppPayout = async (req: Request, res: Response) => {
  try {
    const {
      tutorId,
      payoutId,
      tutorNama,
      tutorKode,
      periodeStart,
      periodeEnd,
      tanggalTransfer,
      totalNominal,
      namaBank,
      noRekening,
      sessions
    } = req.body;

    if (!tutorId) {
      return res.status(400).json({ message: "Tutor ID wajib diisi" });
    }

    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    if (!tutor.noWa) {
      return res.status(400).json({ message: "Tutor tidak memiliki nomor WhatsApp yang terdaftar" });
    }

    // Fetch system settings to get custom agency/bimbel name
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "system" },
    });
    const namaBimbel = settings?.namaBimbel || "BimbelMelly";

    const formatDateStr = (dStr: string) => {
      const d = new Date(dStr);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    };

    // Calculate weekly cycle period from Sunday of start date's week to Saturday of end date's week
    const getCyclePeriod = (startStr: string, endStr: string) => {
      if (!startStr) return "-";
      const startDate = new Date(startStr);
      const startDay = startDate.getDay();
      const sunday = new Date(startDate);
      sunday.setDate(startDate.getDate() - startDay);

      const endDate = endStr ? new Date(endStr) : startDate;
      const endDay = endDate.getDay();
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);

      return `${formatDateStr(sunday.toISOString().split('T')[0])} s/d ${formatDateStr(saturday.toISOString().split('T')[0])}`;
    };

    const formatRupiah = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount).replace("Rp", "Rp ");
    };

    let message = `SLIP GAJI TUTOR - ${namaBimbel.toUpperCase()}\n`;
    message += `===============================\n`;
    message += `ID Transaksi : ${payoutId || "-"}\n`;
    message += `Nama Tutor  : ${tutor.nama || tutorNama || "Tutor"} (${tutor.kode || tutorKode})\n`;
    message += `Periode     : ${getCyclePeriod(periodeStart, periodeEnd)}\n`;
    message += `Jumlah Sesi : ${sessions?.length || 0} sesi\n`;
    message += `Total Transfer: ${formatRupiah(totalNominal)}\n\n`;

    message += `Detail Rekening: \n`;
    message += `Bank: ${tutor.namaBank || namaBank || "-"}\n`;
    message += `Rekening: ${tutor.noRek || noRekening || "-"}\n`;
    message += `Status: Sudah Ditransfer\n\n`;

    if (sessions && sessions.length > 0) {
      message += `Rincian Sesi Mengajar:\n`;
      sessions.forEach((item: any, idx: number) => {
        const itemDate = new Date(item.tanggal);
        const dateFormatted = `${itemDate.getDate()} ${itemDate.toLocaleDateString("id-ID", { month: "short" })}`;
        message += `${idx + 1}. ${dateFormatted} - ${item.siswa} - ${item.mapel} (${item.durasi}m) - ${formatRupiah(item.fee)}\n`;
      });
    }

    message += `===============================\n`;
    message += `Terima kasih atas dedikasi Anda mengajar di ${namaBimbel}! Slip gaji PDF lengkap dapat diunduh di dashboard admin.`;

    const cyclePeriodStr = getCyclePeriod(periodeStart, periodeEnd);

    // Trigger async send so it doesn't block the API response
    (async () => {
      try {
        const pdfBuffer = await generatePDFBuffer({
          payoutId: payoutId || "TRX-MANUAL",
          tutorNama: tutor.nama || tutorNama || "Tutor",
          tutorKode: tutor.kode || tutorKode,
          periodeStr: cyclePeriodStr,
          totalNominal: totalNominal,
          namaBank: tutor.namaBank || namaBank || "-",
          noRekening: tutor.noRek || noRekening || "-",
          sessions: sessions || [],
          namaBimbel
        });

        // We should use the payoutId if it's available. The frontend will pass payoutId = TRX-...-PAID
        const fileName = `${payoutId}.pdf`;
        const fileUrl = await uploadToSupabase(pdfBuffer, fileName);

        let finalMessage = message;
        if (fileUrl) {
          finalMessage += `\n\nLink Akses PDF Slip Gaji:\n${fileUrl}`;
        }

        await sendWA(tutor.noWa!, finalMessage, fileUrl || undefined, fileName || undefined);
      } catch (err) {
        console.error("Failed to generate and upload PDF slip in sendWhatsAppPayout:", err);
        await sendWA(tutor.noWa!, message);
      }
    })();

    res.json({ message: "WhatsApp slip gaji berhasil dikirim" });
  } catch (error) {
    console.error("SEND PAYOUT WHATSAPP ERROR:", error);
    res.status(500).json({ message: "Gagal mengirim WhatsApp slip gaji" });
  }
};
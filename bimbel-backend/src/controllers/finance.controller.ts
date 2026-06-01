// PRIVATE_FIXED/bimbel-backend/src/controllers/finance.controller.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";

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
        const dateKey = item.createdAt.toISOString().split("T")[0];
        const uniqueKey = `${tutorId}-${dateKey}`; // group by tutor and transfer date

        if (!groupedHistory.has(uniqueKey)) {
          groupedHistory.set(uniqueKey, {
            id: "",
            tutorId,
            tutorKode: item.tutor?.kode || "TUT-000",
            tutorNama: item.tutor?.nama || item.tutor?.kode || "Tutor",
            namaBank: item.tutor?.namaBank || "-",
            noRekening: item.tutor?.noRek || "-",
            jumlahSesi: 0,
            totalNominal: 0,
            status: "sudah-payout",
            periodeStart: dateKey,
            periodeEnd: dateKey,
            tanggalTransfer: dateKey,
            sessions: []
          });
        }
        const hist = groupedHistory.get(uniqueKey);
        hist.jumlahSesi += 1;
        hist.totalNominal += metrics.feeNet;
        hist.sessions.push({
          tanggal: dateKey,
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

    const historyList = Array.from(groupedHistory.values()).map((item, index) => ({
      ...item,
      id: `TRX-${item.tanggalTransfer.replace(/-/g, "")}-W${index + 1}-PAID`,
    }));

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

    // Update status seluruh presensi tutor yang 'disetujui' menjadi 'selesai'
    const result = await prisma.attendance.updateMany({
      where: {
        tutorId,
        status: "disetujui",
      },
      data: {
        status: "selesai",
      },
    });

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
import { Router, Request } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import { verifyToken, AuthRequest } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";
import { uploadFileToSupabase, generatePDFBuffer } from "../../utils/pdfGenerator";
import { getSettings } from "../admin/admin.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const getCycleSundayStr = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const cycleSunday = new Date(d);
  cycleSunday.setDate(d.getDate() - day);
  
  const yyyy = cycleSunday.getFullYear();
  const mm = String(cycleSunday.getMonth() + 1).padStart(2, "0");
  const dd = String(cycleSunday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// 1. GET SYSTEM SETTINGS FOR TUTOR (Public/Tutor Access)
router.get("/settings", verifyToken, allowRoles("tutor"), getSettings as any);

// 2. GET TUTOR PROFILE
router.get("/profile", verifyToken, allowRoles("tutor"), async (req: AuthRequest, res) => {
  try {
    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.userId },
    });
    if (!tutor) {
      return res.status(404).json({ message: "Profil tutor tidak ditemukan" });
    }
    res.json(tutor);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil profil tutor" });
  }
});

// 2. UPDATE TUTOR PROFILE
router.put("/profile", verifyToken, allowRoles("tutor"), async (req: AuthRequest, res) => {
  try {
    const { nama, noWa, alamat, namaBank, noRek } = req.body;
    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.userId },
    });
    if (!tutor) {
      return res.status(404).json({ message: "Profil tutor tidak ditemukan" });
    }

    const updated = await prisma.tutor.update({
      where: { id: tutor.id },
      data: { nama, noWa, alamat, namaBank, noRek },
    });

    res.json({ message: "Profil berhasil diperbarui", data: updated });
  } catch (error) {
    console.error("PUT PROFILE ERROR:", error);
    res.status(500).json({ message: "Gagal memperbarui profil tutor" });
  }
});

// 3. GET TUTOR'S STUDENTS AND SUBJECTS
router.get("/students", verifyToken, allowRoles("tutor"), async (req: AuthRequest, res) => {
  try {
    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.userId },
      include: {
        students: {
          where: { isActive: true },
          include: {
            level: {
              include: {
                subjects: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    const formattedStudents = tutor.students.map((student) => ({
      id: student.id,
      name: student.fullName,
      subjects: student.level.subjects.map((sub) => sub.name),
      level: {
        id: student.level.id,
        name: student.level.name,
        hargaJual: student.level.hargaJual,
        durasiMenit: student.level.durasiMenit,
        potonganAdmin: student.level.potonganAdmin,
      },
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data siswa" });
  }
});

// 4. GET TUTOR'S SESSIONS HISTORY
router.get("/sessions", verifyToken, allowRoles("tutor"), async (req: AuthRequest, res) => {
  try {
    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    const sessions = await prisma.attendance.findMany({
      where: { tutorId: tutor.id },
      include: {
        student: {
          include: {
            level: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = sessions.map((s) => ({
      id: s.id,
      date: s.createdAt.toISOString(),
      sessionId: `SES-${s.createdAt.toISOString().split("T")[0].replace(/-/g, "")}-${s.id.substring(0, 4).toUpperCase()}`,
      amount: s.feeNet,
      status: s.status,
      student: s.student?.fullName || "Siswa",
      subject: s.subjectName,
      duration: s.durationMin,
      notes: s.notes || "",
      photoUrl: s.photoUrl,
    }));

    res.json(result);
  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data sesi" });
  }
});

// 5. GET TUTOR'S PAYOUT TRANSACTIONS
router.get("/payouts", verifyToken, allowRoles("tutor"), async (req: AuthRequest, res) => {
  try {
    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        tutorId: tutor.id,
        status: { in: ["disetujui", "selesai"] },
      },
      include: {
        student: {
          include: {
            level: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const groupedPayout = new Map<string, any>();
    const groupedHistory = new Map<string, any>();

    attendances.forEach((item) => {
      const dateStr = item.createdAt.toISOString().split("T")[0];
      const fee = item.feeNet;

      if (item.status === "disetujui") {
        const key = "UNPAID";
        if (!groupedPayout.has(key)) {
          groupedPayout.set(key, {
            id: `TRX-UNPAID`,
            transactionId: "PENDING-PAYOUT",
            date: new Date().toISOString().split("T")[0],
            amount: 0,
            status: "diproses",
            periodeStart: "",
            periodeEnd: "",
            sessions: [],
          });
        }
        const pay = groupedPayout.get(key);
        pay.amount += fee;
        if (!pay.periodeStart || dateStr < pay.periodeStart) pay.periodeStart = dateStr;
        if (!pay.periodeEnd || dateStr > pay.periodeEnd) pay.periodeEnd = dateStr;
        pay.sessions.push({
          id: item.id,
          tanggal: dateStr,
          siswa: item.student?.fullName || "Siswa",
          mapel: item.subjectName,
          durasi: item.durationMin,
          fee: fee,
        });
      }

      if (item.status === "selesai") {
        const cycleSunday = getCycleSundayStr(item.createdAt);
        const key = item.payoutId || cycleSunday;
        
        const updatedAtStr = item.updatedAt ? item.updatedAt.toISOString().split("T")[0] : item.createdAt.toISOString().split("T")[0];

        if (!groupedHistory.has(key)) {
          // Calculate cycle Saturday based on cycleSunday
          const cycleSundayDate = new Date(cycleSunday);
          const cycleSaturdayDate = new Date(cycleSundayDate);
          cycleSaturdayDate.setDate(cycleSundayDate.getDate() + 6);
          const cycleSaturday = cycleSaturdayDate.toISOString().split("T")[0];

          groupedHistory.set(key, {
            id: item.payoutId || "",
            transactionId: item.payoutId || "",
            date: cycleSunday,
            amount: 0,
            status: "sudah-payout",
            periodeStart: cycleSunday,
            periodeEnd: cycleSaturday,
            tanggalTransfer: "",
            sessions: [],
          });
        }
        const hist = groupedHistory.get(key);
        hist.amount += fee;
        
        // Gunakan updatedAt untuk tanggalTransfer (kapan admin memproses 'selesai')
        if (!hist.tanggalTransfer || updatedAtStr > hist.tanggalTransfer) hist.tanggalTransfer = updatedAtStr;
        
        hist.sessions.push({
          id: item.id,
          tanggal: dateStr,
          siswa: item.student?.fullName || "Siswa",
          mapel: item.subjectName,
          durasi: item.durationMin,
          fee: fee,
        });
      }
    });

    const payoutList: any[] = [];

    if (groupedPayout.has("UNPAID")) {
      payoutList.push(groupedPayout.get("UNPAID"));
    }

    const historyList = Array.from(groupedHistory.values());
    const cleanSupabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");

    for (const hist of historyList) {
      if (!hist.id) {
        // Fallback for legacy history
        const cycleSundayFormatted = hist.date.replace(/-/g, "");
        hist.id = `TRX-${cycleSundayFormatted}-PAID`;
        hist.transactionId = `TRX-${cycleSundayFormatted}`;
      }
      
      const fileName = `${hist.id}.pdf`; // ID is equivalent to the full payout ID including suffixes
      if (cleanSupabaseUrl) {
        hist.pdfUrl = `${cleanSupabaseUrl}/storage/v1/object/public/slips/${fileName}`;
      } else {
        hist.pdfUrl = null;
      }

      payoutList.push(hist);
    }

    payoutList.sort((a, b) => b.date.localeCompare(a.date));

    res.json(payoutList);
  } catch (error) {
    console.error("GET PAYOUTS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data payout" });
  }
});

// 5a. GET PAYOUT PDF ON THE FLY
router.get("/payouts/:payoutId/pdf", verifyToken, allowRoles("tutor"), async (req: AuthRequest, res) => {
  try {
    const payoutId = req.params.payoutId as string;

    // Parse the date (cycle Sunday) from the payoutId: TRX-YYYYMMDD or TRX-YYYYMMDD-PAID
    const matchData = payoutId.match(/^TRX-(\d{4})(\d{2})(\d{2})/);
    if (!matchData) {
      return res.status(400).json({ message: "Format ID Payout tidak valid" });
    }
    const [, year, month, day] = matchData;
    const cycleSunday = `${year}-${month}-${day}`;

    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    // Fetch finished sessions for this tutor
    const attendances = await prisma.attendance.findMany({
      where: {
        tutorId: tutor.id,
        status: "selesai",
      },
      include: {
        student: {
          include: {
            level: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Filter sessions matching this specific payoutId, or fallback to cycle Sunday for legacy
    const matchedSessions = attendances.filter((item) => {
      if (item.payoutId && item.payoutId === payoutId) {
        return true;
      }
      if (!item.payoutId && getCycleSundayStr(item.createdAt) === cycleSunday) {
        return true;
      }
      return false;
    });

    if (matchedSessions.length === 0) {
      return res.status(404).json({ message: "Rincian sesi untuk payout ini tidak ditemukan" });
    }

    // Get system settings for bimbel name
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "system" },
    });
    const namaBimbel = settings?.namaBimbel || "BimbelMelly";

    // Format week cycle period text
    const getCyclePeriodText = (sundayStr: string) => {
      const sunday = new Date(sundayStr);
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);

      const formatDateStr = (d: Date) => {
        return d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      };

      return `${formatDateStr(sunday)} s/d ${formatDateStr(saturday)}`;
    };

    // Map sessions to PDF format
    const sessionsMapped = matchedSessions.map((item) => ({
      tanggal: item.createdAt.toISOString(),
      siswa: item.student?.fullName || "Siswa",
      mapel: item.subjectName,
      durasi: item.durationMin,
      fee: item.feeNet
    }));

    const totalNominal = matchedSessions.reduce((acc, s) => acc + s.feeNet, 0);

    const pdfBuffer = await generatePDFBuffer({
      payoutId,
      tutorNama: tutor.nama || "Tutor",
      tutorKode: tutor.kode,
      periodeStr: getCyclePeriodText(cycleSunday),
      totalNominal,
      namaBank: tutor.namaBank || "-",
      noRekening: tutor.noRek || "-",
      sessions: sessionsMapped,
      namaBimbel
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${payoutId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("GET PAYOUT PDF ERROR:", error);
    res.status(500).json({ message: "Gagal memproses file PDF slip gaji" });
  }
});


// 6. CREATE NEW ATTENDANCE
router.post("/attendances", verifyToken, allowRoles("tutor"), upload.single("photo"), async (req: AuthRequest, res) => {
  try {
    const { studentId, subjectName, durationMin, notes, date, time } = req.body;

    if (!studentId || !subjectName || !durationMin) {
      return res.status(400).json({ message: "Siswa, mata pelajaran, dan durasi wajib diisi" });
    }

    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { level: true },
    });

    if (!student) {
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    }

    const dbLevel = student.level;
    const pricePerMin = dbLevel.hargaJual / dbLevel.durasiMenit;
    const gross = pricePerMin * Number(durationMin);
    const feeNet = Math.round(gross * ((100 - dbLevel.potonganAdmin) / 100));

    let photoUrl = "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60";
    const multerFile = (req as any).file;
    if (multerFile) {
      const extension = multerFile.originalname.split(".").pop();
      const fileName = `attendance-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
      const uploadedUrl = await uploadFileToSupabase(multerFile.buffer, fileName, multerFile.mimetype);
      if (uploadedUrl) {
        photoUrl = uploadedUrl;
      }
    }

    let createdAt = new Date();
    if (date && time) {
      createdAt = new Date(`${date}T${time}:00+07:00`);
    }

    const attendance = await prisma.attendance.create({
      data: {
        tutorId: tutor.id,
        studentId: student.id,
        subjectName,
        durationMin: Number(durationMin),
        photoUrl,
        notes: notes || "",
        feeNet,
        status: "tertunda",
        createdAt,
      },
    });

    res.status(201).json({ message: "Presensi berhasil dikirim", data: attendance });
  } catch (error) {
    console.error("CREATE ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Gagal mengirim presensi" });
  }
});

// 6a. EDIT ATTENDANCE
router.put("/attendances/:id", verifyToken, allowRoles("tutor"), upload.single("photo"), async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { studentId, subjectName, durationMin, notes, date, time } = req.body;

    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: id as string },
      include: { student: { include: { level: true } } },
    });

    if (!attendance || attendance.tutorId !== tutor.id) {
      return res.status(404).json({ message: "Presensi tidak ditemukan" });
    }

    if (attendance.status !== "tertunda" && attendance.status !== "disetujui") {
      return res.status(400).json({ message: "Hanya presensi berstatus tertunda atau diselesaikan yang dapat diedit" });
    }

    const studentToUse = studentId 
      ? await prisma.student.findUnique({ where: { id: studentId }, include: { level: true } })
      : attendance.student;

    if (!studentToUse) {
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    }

    let feeNet = attendance.feeNet;
    if (durationMin || studentId) {
      const dbLevel = studentToUse.level;
      const pricePerMin = dbLevel.hargaJual / dbLevel.durasiMenit;
      const gross = pricePerMin * Number(durationMin || attendance.durationMin);
      feeNet = Math.round(gross * ((100 - dbLevel.potonganAdmin) / 100));
    }

    let photoUrl = attendance.photoUrl;
    const multerFile = (req as any).file;
    if (multerFile) {
      const extension = multerFile.originalname.split(".").pop();
      const fileName = `attendance-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
      const uploadedUrl = await uploadFileToSupabase(multerFile.buffer, fileName, multerFile.mimetype);
      if (uploadedUrl) {
        photoUrl = uploadedUrl;
      }
    }

    let createdAt = attendance.createdAt;
    if (date && time) {
      createdAt = new Date(`${date}T${time}:00+07:00`);
    }

    const updated = await prisma.attendance.update({
      where: { id: id as string },
      data: {
        studentId: studentId || attendance.studentId,
        subjectName: subjectName || attendance.subjectName,
        durationMin: durationMin ? Number(durationMin) : attendance.durationMin,
        notes: notes !== undefined ? notes : attendance.notes,
        photoUrl,
        feeNet,
        createdAt,
      },
    });

    res.json({ message: "Presensi berhasil diperbarui", data: updated });
  } catch (error) {
    console.error("UPDATE ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Gagal memperbarui presensi" });
  }
});

// 6b. DELETE ATTENDANCE
router.delete("/attendances/:id", verifyToken, allowRoles("tutor"), async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: id as string },
    });

    if (!attendance || attendance.tutorId !== tutor.id) {
      return res.status(404).json({ message: "Presensi tidak ditemukan" });
    }

    if (attendance.status !== "tertunda" && attendance.status !== "disetujui") {
      return res.status(400).json({ message: "Hanya presensi berstatus tertunda atau diselesaikan yang dapat dihapus" });
    }

    await prisma.attendance.delete({
      where: { id: id as string },
    });

    res.json({ message: "Presensi berhasil dihapus" });
  } catch (error) {
    console.error("DELETE ATTENDANCE ERROR:", error);
    res.status(500).json({ message: "Gagal menghapus presensi" });
  }
});

// 7. CHANGE PASSWORD
router.post("/change-password", verifyToken, allowRoles("tutor"), async (req: AuthRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Password lama dan baru harus diisi" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Password lama salah" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: "Gagal memperbarui password" });
  }
});

export default router;

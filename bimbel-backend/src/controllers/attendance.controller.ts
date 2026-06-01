// PRIVATE_FIXED/bimbel-backend/src/controllers/attendance.controller.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";

// ==============================
// GET ALL ATTENDANCES
// ==============================
export const getAttendances = async (req: Request, res: Response) => {
  try {
    const data = await prisma.attendance.findMany({
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

    const result = data.map((item) => {
      const tutorRekeningLengkap = !!(
        item.tutor?.noRek &&
        item.tutor?.noRek.trim() !== "" &&
        item.tutor?.noRek.trim() !== "-" &&
        item.tutor?.namaBank &&
        item.tutor?.namaBank.trim() !== "" &&
        item.tutor?.namaBank.trim() !== "-"
      );
      const dateObj = new Date(item.createdAt);
      
      // format waktu mulai HH:MM
      const waktuMulai = dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).replace(".", ":");

      return {
        id: item.id,
        tutorId: item.tutorId,
        tutorNama: item.tutor?.nama || item.tutor?.kode || "Tutor",
        tutorRekeningLengkap,
        tutorNoRek: item.tutor?.noRek || "",
        tutorNamaBank: item.tutor?.namaBank || "",
        siswaId: item.studentId,
        siswaNama: item.student?.fullName || "-",
        mapelNama: item.subjectName,
        tanggal: item.createdAt,
        waktuMulai,
        durasi: item.durationMin,
        level: item.student?.level?.name || "-",
        buktiUrl: item.photoUrl,
        catatan: item.notes || "",
        feeBersih: item.feeNet,
        status: !tutorRekeningLengkap ? "tertunda" : item.status, // "tertunda" | "diselesaikan" | "disetujui" | "ditolak" | "selesai"
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal ambil data presensi",
    });
  }
};

// ==============================
// APPROVE ATTENDANCE
// ==============================
export const approveAttendance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: { tutor: true, student: true },
    }) as any;

    if (!attendance) {
      return res.status(404).json({ message: "Data presensi tidak ditemukan" });
    }

    if (attendance.status === "disetujui" || attendance.status === "selesai") {
      return res.status(400).json({ message: "Presensi sudah disetujui atau sudah selesai" });
    }

    // Cek rekening tutor
    if (
      !attendance.tutor?.noRek ||
      attendance.tutor?.noRek.trim() === "" ||
      attendance.tutor?.noRek.trim() === "-" ||
      !attendance.tutor?.namaBank ||
      attendance.tutor?.namaBank.trim() === "" ||
      attendance.tutor?.namaBank.trim() === "-"
    ) {
      return res.status(400).json({ message: "Rekening tutor belum lengkap" });
    }

    // Update status presensi dan buat rekam keuangan dalam transaction
    await prisma.$transaction([
      prisma.attendance.update({
        where: { id },
        data: { status: "disetujui" },
      }),
      prisma.finance.create({
        data: {
          tutorId: attendance.tutorId,
          amount: attendance.feeNet,
          type: "masuk",
          note: `Fee mengajar siswa ${attendance.student?.fullName || "-"} - ${attendance.subjectName}`,
        },
      }),
    ]);

    res.json({ message: "Presensi berhasil disetujui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menyetujui presensi" });
  }
};

// ==============================
// DECLINE ATTENDANCE
// ==============================
export const declineAttendance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Alasan penolakan harus diisi" });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      return res.status(404).json({ message: "Data presensi tidak ditemukan" });
    }

    const newNotes = attendance.notes 
      ? `${attendance.notes}\n[Ditolak: ${reason}]`
      : `[Ditolak: ${reason}]`;

    await prisma.attendance.update({
      where: { id },
      data: {
        status: "ditolak",
        notes: newNotes,
      },
    });

    res.json({ message: "Presensi berhasil ditolak" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menolak presensi" });
  }
};

// ==============================
// UPDATE ATTENDANCE (EDIT)
// ==============================
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { mapelNama, durasi, feeBersih, catatan, tanggal, status } = req.body;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      return res.status(404).json({ message: "Data presensi tidak ditemukan" });
    }

    if (attendance.status === "selesai") {
      return res.status(400).json({ message: "Presensi sudah selesai payout dan tidak dapat diedit" });
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        subjectName: mapelNama,
        durationMin: Number(durasi),
        feeNet: Number(feeBersih),
        notes: catatan,
        createdAt: tanggal ? new Date(tanggal) : undefined,
        status: status, // Save status as well!
      },
    });

    res.json({ message: "Presensi berhasil diperbarui", data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui presensi" });
  }
};

// ==============================
// GET ATTENDANCE REKAP
// ==============================
export const getAttendanceRekap = async (req: Request, res: Response) => {
  try {
    const activeTutorsCount = await prisma.tutor.count({
      where: { status: true }
    });

    const attendances = await prisma.attendance.findMany({
      where: {
        status: {
          in: ["disetujui", "selesai"]
        }
      },
      include: {
        tutor: true
      }
    });

    const totalSesi = attendances.length;
    const totalDurasiMenit = attendances.reduce((acc, curr) => acc + curr.durationMin, 0);
    const totalJam = Math.round(totalDurasiMenit / 60);

    // Group by tutor
    const tutorGroups = new Map<string, any>();

    attendances.forEach((item) => {
      const tutorId = item.tutorId;
      if (!tutorGroups.has(tutorId)) {
        tutorGroups.set(tutorId, {
          tutorId: item.tutor?.kode || tutorId,
          tutorNama: item.tutor?.nama || "Tutor",
          totalSesi: 0,
          totalDurasi: 0, // in hours
          totalPendapatan: 0,
        });
      }

      const group = tutorGroups.get(tutorId);
      group.totalSesi += 1;
      group.totalDurasi += item.durationMin / 60;
      group.totalPendapatan += item.feeNet;
    });

    // Convert to array, round durations, and sort by totalPendapatan to rank
    const rekapList = Array.from(tutorGroups.values())
      .map((item) => ({
        ...item,
        totalDurasi: Math.round(item.totalDurasi * 10) / 10, // round to 1 decimal place
      }))
      .sort((a, b) => b.totalPendapatan - a.totalPendapatan)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));

    res.json({
      totalTutors: activeTutorsCount,
      totalJam,
      totalSesi,
      rekapList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil rekap jam mengajar" });
  }
};
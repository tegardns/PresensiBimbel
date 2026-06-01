// PRIVATE_FIXED/bimbel-backend/src/controllers/attendance.controller.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";

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

    const result = data.map((item: any, index: number) => ({
      id: `PRS-${String(index + 1).padStart(3, "0")}`,
      attendanceId: item.id,

      tutorId: item.tutorId,
      tutor: item.tutor?.nama || item.tutor?.email || item.tutor?.kode || "Tutor",

      siswaId: item.studentId,
      siswa: item.student?.fullName || "-",

      level: item.student?.level?.name || "-",
      mapel: item.subjectName,
      durasi: item.durationMin,
      fee: item.feeNet,
      status: item.status,
      tanggal: item.createdAt,
      foto: item.photoUrl,
      catatan: item.notes || "-",
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal ambil data presensi",
    });
  }
};
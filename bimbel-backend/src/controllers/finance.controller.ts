// PRIVATE_FIXED/bimbel-backend/src/controllers/finance.controller.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getFinance = async (req: Request, res: Response) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        status: {
          in: ["diselesaikan", "disetujui", "selesai"],
        },
      },
      include: {
        tutor: true,
        student: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const groupedByTutor = new Map<string, any>();

    attendances.forEach((item) => {
      const tutorId = item.tutorId;

      if (!groupedByTutor.has(tutorId)) {
        groupedByTutor.set(tutorId, {
          id: "",
          tutorId,
          tutorNama:
            item.tutor?.nama ||
            item.tutor?.email ||
            item.tutor?.kode ||
            "Tutor tidak diketahui",
          namaBank: item.tutor?.namaBank || "-",
          noRekening: item.tutor?.noRek || "-",
          totalNominal: 0,
          tanggalPayout: null,
          status: "diproses",
          sesiList: [],
        });
      }

      const transaksi = groupedByTutor.get(tutorId);

      transaksi.totalNominal += item.feeNet || 0;

      transaksi.sesiList.push({
        id: item.id,
        siswaNama: item.student?.fullName || "-",
        mapelNama: item.subjectName || "-",
        tanggal: item.createdAt,
        durasi: item.durationMin || 0,
        feeBersih: item.feeNet || 0,
      });

      if (item.status === "selesai") {
        transaksi.status = "sudah-payout";
        transaksi.tanggalPayout = item.createdAt;
      }
    });

    const result = Array.from(groupedByTutor.values()).map((item, index) => ({
      ...item,
      id: `TRX-${String(index + 1).padStart(3, "0")}`,
    }));

    res.json(result);
  } catch (error) {
    console.error("FINANCE ERROR:", error);

    res.status(500).json({
      message: "Gagal ambil data keuangan",
    });
  }
};
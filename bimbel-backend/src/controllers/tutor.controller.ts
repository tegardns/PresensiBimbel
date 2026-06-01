import { Request, Response } from "express";
import prisma from "../lib/prisma";

// ==============================
// GET ALL TUTORS
// ==============================
export const getTutors = async (req: Request, res: Response) => {
  try {
    const tutors = await prisma.tutor.findMany({
      orderBy: {
        kode: "desc",
      },
      include: {
        students: {
          select: {
            id: true,
            fullName: true,
            schoolName: true,
            level: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    const result = tutors.map((t) => ({
      ...t,
      totalStudents: t.students.length,
    }));

    res.json(result);
  } catch (error) {
    console.error("GET TUTORS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data tutor" });
  }
};

// ==============================
// GET STUDENTS
// ==============================
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
    });

    res.json(students);
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);
    res.status(500).json({ message: "Gagal ambil siswa" });
  }
};

// ==============================
// CREATE TUTOR
// ==============================
export const createTutor = async (req: Request, res: Response) => {
  try {
    const { studentIds, ...body } = req.body;

    // 🔥 AUTO GENERATE KODE
    const lastTutor = await prisma.tutor.findFirst({
      orderBy: { kode: "desc" },
      select: { kode: true },
    });

    let nextNumber = 1;

    if (lastTutor?.kode) {
      const num = parseInt(lastTutor.kode.replace("TUT-", "")) || 0;
      nextNumber = num + 1;
    }

    const kode = `TUT-${String(nextNumber).padStart(3, "0")}`;

    const tutor = await prisma.tutor.create({
      data: {
        kode,
        nama: body.nama,
        email: body.email,
        posisi: body.posisi,
        noWa: body.noWa,
        alamat: body.alamat,
        namaBank: body.namaBank,
        noRek: body.noRek,
        status: body.status === "aktif",

        // 🔥 RELASI SISWA
        students: {
          connect: (studentIds || []).map((id: string) => ({ id })),
        },
      },
    });

    res.status(201).json(tutor);
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ message: "Gagal tambah tutor" });
  }
};

// ==============================
// UPDATE TUTOR
// ==============================
export const updateTutor = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { studentIds, ...body } = req.body;

    const tutor = await prisma.tutor.update({
      where: { id },
      data: {
        nama: body.nama,
        email: body.email,
        posisi: body.posisi,
        noWa: body.noWa,
        alamat: body.alamat,
        namaBank: body.namaBank,
        noRek: body.noRek,
        status: body.status === "aktif",

        // 🔥 REPLACE RELASI
        students: {
          set: (studentIds || []).map((id: string) => ({ id })),
        },
      },
    });

    res.json(tutor);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Gagal update tutor" });
  }
};

// ==============================
// DELETE
// ==============================
export const deleteTutor = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await prisma.tutor.delete({
      where: { id },
    });

    res.json({ message: "Tutor berhasil dihapus" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Gagal hapus tutor" });
  }
};

// ==============================
// TOGGLE STATUS
// ==============================
export const toggleTutorStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const tutor = await prisma.tutor.findUnique({
      where: { id },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    const updated = await prisma.tutor.update({
      where: { id },
      data: { status: !tutor.status },
    });

    res.json(updated);
  } catch (error) {
    console.error("TOGGLE ERROR:", error);
    res.status(500).json({ message: "Gagal ubah status" });
  }
};

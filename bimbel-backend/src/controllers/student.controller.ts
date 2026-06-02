// PRIVATE_FIXED/bimbel-backend/src/controllers/student.controller.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";

// ==============================
// GET STUDENTS
// ==============================
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        level: true,
      },
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data siswa",
    });
  }
};

// ==============================
// CREATE STUDENT
// ==============================
export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      levelId,
      schoolName,
      address,
      parentName,
      parentPhone,
      isActive,
    } = req.body;

    if (!fullName || !levelId) {
      return res.status(400).json({
        message: "Nama siswa dan level wajib diisi",
      });
    }

    const total = await prisma.student.count();
    const kode = `SIS-${String(total + 1).padStart(3, "0")}`;

    const student = await prisma.student.create({
      data: {
        kode,
        fullName,
        levelId,
        schoolName,
        address,
        parentName,
        parentPhone,
        isActive: isActive ?? true,
      },
      include: {
        level: true,
      },
    });

    res.status(201).json(student);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menambahkan siswa",
    });
  }
};

// ==============================
// UPDATE STUDENT
// ==============================
export const updateStudent = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      levelId,
      schoolName,
      address,
      parentName,
      parentPhone,
      isActive,
    } = req.body;

    if (!fullName || !levelId) {
      return res.status(400).json({
        message: "Nama siswa dan level wajib diisi",
      });
    }

    const student = await prisma.student.update({
      where: {
        id,
      },
      data: {
        fullName,
        levelId,
        schoolName,
        address,
        parentName,
        parentPhone,
        isActive,
      },
      include: {
        level: true,
      },
    });

    res.json(student);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengupdate siswa",
    });
  }
};

// ==============================
// DELETE STUDENT
// ==============================
export const deleteStudent = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attendances: true }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        message: "Siswa tidak ditemukan",
      });
    }

    if (student._count.attendances > 0) {
      return res.status(400).json({
        message: "Siswa tidak dapat dihapus karena sudah memiliki riwayat presensi. Silakan nonaktifkan status keaktifannya saja.",
      });
    }

    await prisma.student.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Siswa berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);

    res.status(500).json({
      message: "Gagal menghapus siswa",
    });
  }
};


// ==============================
// TOGGLE STUDENT STATUS
// ==============================
export const toggleStudentStatus = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: {
        id,
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Siswa tidak ditemukan",
      });
    }

    const updatedStudent = await prisma.student.update({
      where: {
        id,
      },
      data: {
        isActive: !student.isActive,
      },
      include: {
        level: true,
      },
    });

    res.json(updatedStudent);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengubah status siswa",
    });
  }
};
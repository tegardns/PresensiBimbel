// PRIVATE_FIXED/bimbel-backend/src/controllers/subject.controller.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";

// ==============================
// HELPER: GENERATE CODE
// ==============================
const generateSubjectCode = async () => {
  const subjects = await prisma.subject.findMany({
    select: {
      code: true,
    },
  });

  const numbers = subjects
    .map((subject) => {
      const match = subject.code.match(/MAP-(\d+)/);
      return match ? Number(match[1]) : 0;
    })
    .filter((number) => !Number.isNaN(number));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `MAP-${String(nextNumber).padStart(3, "0")}`;
};

// ==============================
// GET SUBJECTS
// ==============================
export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        level: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const result = subjects.map((item) => ({
      id: item.id,
      code: item.code,
      nama: item.name,
      name: item.name,
      levelId: item.levelId,
      level: item.level.name,
      status: item.isActive ? "aktif" : "nonaktif",
      isActive: item.isActive,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal ambil data mapel",
    });
  }
};

// ==============================
// CREATE SUBJECT
// ==============================
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, nama, levelId, isActive } = req.body;

    const subjectName = name || nama;

    if (!subjectName || !levelId) {
      return res.status(400).json({
        message: "Nama mapel dan level wajib diisi",
      });
    }

    const code = await generateSubjectCode();

    const subject = await prisma.subject.create({
      data: {
        code,
        name: subjectName,
        levelId,
        isActive: isActive ?? true,
      },
      include: {
        level: true,
      },
    });

    res.status(201).json({
      id: subject.id,
      code: subject.code,
      nama: subject.name,
      name: subject.name,
      levelId: subject.levelId,
      level: subject.level.name,
      status: subject.isActive ? "aktif" : "nonaktif",
      isActive: subject.isActive,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menambahkan mapel",
    });
  }
};

// ==============================
// UPDATE SUBJECT
// ==============================
export const updateSubject = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, nama, levelId, isActive } = req.body;

    const subjectName = name || nama;

    if (!subjectName || !levelId) {
      return res.status(400).json({
        message: "Nama mapel dan level wajib diisi",
      });
    }

    const subject = await prisma.subject.update({
      where: {
        id,
      },
      data: {
        name: subjectName,
        levelId,
        isActive,
      },
      include: {
        level: true,
      },
    });

    res.json({
      id: subject.id,
      code: subject.code,
      nama: subject.name,
      name: subject.name,
      levelId: subject.levelId,
      level: subject.level.name,
      status: subject.isActive ? "aktif" : "nonaktif",
      isActive: subject.isActive,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengupdate mapel",
    });
  }
};

// ==============================
// DELETE SUBJECT
// ==============================
export const deleteSubject = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    await prisma.subject.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Mapel berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menghapus mapel",
    });
  }
};

// ==============================
// TOGGLE SUBJECT STATUS
// ==============================
export const toggleSubjectStatus = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Mapel tidak ditemukan",
      });
    }

    const updatedSubject = await prisma.subject.update({
      where: {
        id,
      },
      data: {
        isActive: !subject.isActive,
      },
      include: {
        level: true,
      },
    });

    res.json({
      id: updatedSubject.id,
      code: updatedSubject.code,
      nama: updatedSubject.name,
      name: updatedSubject.name,
      levelId: updatedSubject.levelId,
      level: updatedSubject.level.name,
      status: updatedSubject.isActive ? "aktif" : "nonaktif",
      isActive: updatedSubject.isActive,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengubah status mapel",
    });
  }
};
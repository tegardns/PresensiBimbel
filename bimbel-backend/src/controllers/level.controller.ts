// PRIVATE_FIXED/bimbel-backend/src/controllers/level.controller.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";

// ==============================
// GET LEVELS
// ==============================
export const getLevels = async (req: Request, res: Response) => {
  try {
    const levels = await prisma.level.findMany({
      orderBy: {
        code: "asc",
      },
      select: {
        id: true,
        name: true,
        code: true,
        hargaJual: true,
        durasiMenit: true,
        potonganAdmin: true,
      },
    });

    const result = levels.map((item, index) => ({
      id: item.id,
      code: item.code || `LVL-00${index + 1}`,
      name: item.name,
      nama: item.name,
      hargaJual: item.hargaJual,
      durasiMenit: item.durasiMenit,
      potonganAdmin: item.potonganAdmin,
    }));

    res.json(result);
  } catch (error: any) {
    console.error("LEVEL ERROR:", error);

    res.status(500).json({
      message: "Gagal ambil data level",
    });
  }
};

// ==============================
// UPDATE LEVEL
// ==============================
export const updateLevel = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { hargaJual, durasiMenit, potonganAdmin } = req.body;

    if (
      hargaJual === undefined ||
      durasiMenit === undefined ||
      potonganAdmin === undefined
    ) {
      return res.status(400).json({
        message: "Harga jual, durasi menit, dan potongan admin wajib diisi",
      });
    }

    const level = await prisma.level.update({
      where: {
        id,
      },
      data: {
        hargaJual: Number(hargaJual),
        durasiMenit: Number(durasiMenit),
        potonganAdmin: Number(potonganAdmin),
      },
    });

    res.json({
      id: level.id,
      code: level.code,
      name: level.name,
      nama: level.name,
      hargaJual: level.hargaJual,
      durasiMenit: level.durasiMenit,
      potonganAdmin: level.potonganAdmin,
    });
  } catch (error: any) {
    console.error("UPDATE LEVEL ERROR:", error);

    res.status(500).json({
      message: "Gagal mengupdate level",
    });
  }
};
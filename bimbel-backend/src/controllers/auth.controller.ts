// PRIVATE_FIXED/bimbel-backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Email tidak ditemukan",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    res.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token: "dummy-token",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal login",
    });
  }
};

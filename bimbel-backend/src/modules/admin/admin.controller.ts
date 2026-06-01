import { Request, Response } from "express";
import prisma from "../../config/prisma";
import bcrypt from "bcrypt";

// ==============================
// GET ALL TUTOR ACCOUNTS
// ==============================
export const getTutorAccounts = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "tutor" },
      include: { tutor: true },
      orderBy: { createdAt: "desc" },
    });

    const result = users.map((user, idx) => {
      const tutor = user.tutor;
      return {
        id: `ACC-${String(idx + 1).padStart(3, "0")}`,
        userId: user.id,
        tutorId: tutor ? tutor.id : "",
        tutorKode: tutor ? tutor.kode : "-",
        nama: tutor ? tutor.nama : "Tutor",
        email: tutor ? tutor.email : user.email,
        status: user.isActive ? "aktif" : "nonaktif",
        lastLogin: "-",
      };
    });

    res.json(result);
  } catch (error) {
    console.error("GET TUTOR ACCOUNTS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data akun tutor" });
  }
};

// ==============================
// GET TUTORS WITHOUT ACCOUNTS
// ==============================
export const getTutorsWithoutAccounts = async (req: Request, res: Response) => {
  try {
    const tutors = await prisma.tutor.findMany({
      where: {
        userId: null,
      },
      orderBy: {
        kode: "asc",
      },
    });
    res.json(tutors);
  } catch (error) {
    console.error("GET TUTORS WITHOUT ACCOUNTS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data tutor" });
  }
};

// ==============================
// CREATE TUTOR ACCOUNT
// ==============================
export const createTutorAccount = async (req: Request, res: Response) => {
  try {
    const { tutorId, status, password } = req.body;

    if (!tutorId) {
      return res.status(400).json({ message: "Tutor wajib dipilih" });
    }

    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor tidak ditemukan" });
    }

    if (tutor.userId) {
      return res.status(400).json({ message: "Tutor sudah memiliki akun" });
    }

    const email = tutor.email;
    if (!email) {
      return res.status(400).json({ message: "Tutor tidak memiliki email di Master Data" });
    }

    // Check if user email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email tutor sudah terdaftar di sistem" });
    }

    const rawPassword = password || "tutor123";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "tutor",
        isActive: status === "aktif",
      },
    });

    await prisma.tutor.update({
      where: { id: tutorId },
      data: { userId: user.id },
    });

    res.status(201).json({ message: "Akun tutor berhasil ditambahkan", userId: user.id });
  } catch (error) {
    console.error("CREATE TUTOR ACCOUNT ERROR:", error);
    res.status(500).json({ message: "Gagal membuat akun tutor" });
  }
};

// ==============================
// UPDATE TUTOR ACCOUNT
// ==============================
export const updateTutorAccount = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // user.id
    const { status, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    const dataToUpdate: any = {
      isActive: status === "aktif",
    };

    if (password && password.trim() !== "") {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({ message: "Akun tutor berhasil diperbarui" });
  } catch (error) {
    console.error("UPDATE TUTOR ACCOUNT ERROR:", error);
    res.status(500).json({ message: "Gagal memperbarui akun tutor" });
  }
};

// ==============================
// DELETE TUTOR ACCOUNT
// ==============================
export const deleteTutorAccount = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // user.id

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    // Unlink from Tutor
    await prisma.tutor.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "Akun tutor berhasil dihapus" });
  } catch (error) {
    console.error("DELETE TUTOR ACCOUNT ERROR:", error);
    res.status(500).json({ message: "Gagal menghapus akun tutor" });
  }
};

// ==============================
// CHANGE ADMIN PASSWORD
// ==============================
export const changeAdminPassword = async (req: any, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.user?.userId;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return res.status(404).json({ message: "Akun admin tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Password lama tidak sesuai" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: adminId },
      data: { passwordHash },
    });

    res.json({ message: "Password admin berhasil diubah" });
  } catch (error) {
    console.error("CHANGE ADMIN PASSWORD ERROR:", error);
    res.status(500).json({ message: "Gagal mengubah password admin" });
  }
};

// ==============================
// GET SYSTEM SETTINGS
// ==============================
export const getSettings = async (req: Request, res: Response) => {
  try {
    let setting = await prisma.systemSetting.findUnique({
      where: { id: "system" },
    });

    if (!setting) {
      setting = await prisma.systemSetting.create({
        data: {
          id: "system",
          namaBimbel: "BimbelMelly Pusat",
          whatsapp: "+62 812-3456-7890",
          alamat: "Jl. Pendidikan No. 123, Jakarta Selatan 12345",
          logoUrl: null,
          komisiAdmin: 10,
          infoPayout: "Transfer dilakukan setiap hari Minggu pukul 18:00 WIB. Pastikan data rekening Anda sudah lengkap dan benar.",
          maintenance: false,
        },
      });
    }

    res.json(setting);
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil pengaturan sistem" });
  }
};

// ==============================
// UPDATE SYSTEM SETTINGS
// ==============================
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { namaBimbel, whatsapp, alamat, logoUrl, komisiAdmin, infoPayout, maintenance } = req.body;

    const setting = await prisma.systemSetting.upsert({
      where: { id: "system" },
      update: {
        namaBimbel: namaBimbel !== undefined ? namaBimbel : undefined,
        whatsapp: whatsapp !== undefined ? whatsapp : undefined,
        alamat: alamat !== undefined ? alamat : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        komisiAdmin: komisiAdmin !== undefined ? parseFloat(komisiAdmin) : undefined,
        infoPayout: infoPayout !== undefined ? infoPayout : undefined,
        maintenance: maintenance !== undefined ? !!maintenance : undefined,
      },
      create: {
        id: "system",
        namaBimbel: namaBimbel || "BimbelMelly Pusat",
        whatsapp: whatsapp || "+62 812-3456-7890",
        alamat: alamat || "Jl. Pendidikan No. 123, Jakarta Selatan 12345",
        logoUrl: logoUrl || null,
        komisiAdmin: komisiAdmin !== undefined ? parseFloat(komisiAdmin) : 10,
        infoPayout: infoPayout || "Transfer dilakukan setiap hari Minggu pukul 18:00 WIB. Pastikan data rekening Anda sudah lengkap dan benar.",
        maintenance: !!maintenance,
      },
    });

    res.json({ message: "Pengaturan berhasil diperbarui", setting });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    res.status(500).json({ message: "Gagal memperbarui pengaturan sistem" });
  }
};


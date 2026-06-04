import { Request, Response } from "express";
import prisma from "../config/prisma";

// Mengambil riwayat notifikasi terkirim
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (error) {
    console.error("Gagal mengambil riwayat notifikasi:", error);
    res.status(500).json({ message: "Gagal mengambil riwayat notifikasi" });
  }
};

// Mengirim notifikasi baru ke Tutor
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, target, tutorId } = req.body;

    if (!title || !body || !target) {
      return res.status(400).json({ message: "Judul, pesan, dan target harus diisi" });
    }

    // Buat record notifikasi di database
    const notification = await prisma.notification.create({
      data: {
        title,
        body,
        target,
        tutorId: target === "specific" ? tutorId : null,
        status: "terkirim",
      },
    });

    // Ambil token penerima sesuai target
    let tokens: string[] = [];
    if (target === "all") {
      const allTokens = await prisma.tutorDeviceToken.findMany({
        select: { token: true },
      });
      tokens = allTokens.map((t) => t.token);
    } else if (target === "specific" && tutorId) {
      const specificTokens = await prisma.tutorDeviceToken.findMany({
        where: { tutorId },
        select: { token: true },
      });
      tokens = specificTokens.map((t) => t.token);
    }

    // Logger simulasi pengiriman push notification
    console.log(
      `[Push Notification] Mengirim push ke ${tokens.length} perangkat. Judul: "${title}", Pesan: "${body}"`
    );

    // TEMPLATE UNTUK FIREBASE CLOUD MESSAGING (FCM) INTEGRATION:
    // ---------------------------------------------------------
    // import admin from "firebase-admin";
    // if (tokens.length > 0) {
    //   const message = {
    //     notification: { title, body },
    //     tokens: tokens,
    //   };
    //   const response = await admin.messaging().sendEachForMulticast(message);
    //   console.log(`${response.successCount} notifikasi berhasil terkirim via FCM.`);
    // }

    res.json({
      message: "Notifikasi berhasil dikirim",
      notification,
      recipientCount: tokens.length,
    });
  } catch (error) {
    console.error("Gagal mengirim notifikasi:", error);
    res.status(500).json({ message: "Gagal mengirim notifikasi" });
  }
};

// Mendaftarkan token perangkat Tutor (Web, Android, iOS)
export const registerToken = async (req: Request, res: Response) => {
  try {
    const { token, platform, tutorId } = req.body;

    if (!token || !platform || !tutorId) {
      return res.status(400).json({ message: "Token, platform, dan tutorId harus diisi" });
    }

    // Simpan atau update token perangkat
    const deviceToken = await prisma.tutorDeviceToken.upsert({
      where: { token },
      update: {
        tutorId,
        platform,
        updatedAt: new Date(),
      },
      create: {
        token,
        platform,
        tutorId,
      },
    });

    res.json({ message: "Token perangkat berhasil didaftarkan", deviceToken });
  } catch (error) {
    console.error("Gagal registrasi token perangkat:", error);
    res.status(500).json({ message: "Gagal registrasi token perangkat" });
  }
};

// Mengambil statistik perangkat terdaftar
export const getDeviceStats = async (req: Request, res: Response) => {
  try {
    const webCount = await prisma.tutorDeviceToken.count({ where: { platform: "web" } });
    const androidCount = await prisma.tutorDeviceToken.count({ where: { platform: "android" } });
    const iosCount = await prisma.tutorDeviceToken.count({ where: { platform: "ios" } });

    res.json({
      web: webCount,
      android: androidCount,
      ios: iosCount,
      total: webCount + androidCount + iosCount,
    });
  } catch (error) {
    console.error("Gagal mengambil statistik perangkat:", error);
    res.status(500).json({ message: "Gagal mengambil statistik perangkat" });
  }
};

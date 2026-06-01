// PRIVATE_FIXED/bimbel-backend/prisma/seed2.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding start...");

  // =============================
  // LEVEL
  // =============================
  const level1 = await prisma.level.create({
    data: {
      code: "LVL-1",
      name: "SD",
      hargaJual: 50000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  const level2 = await prisma.level.create({
    data: {
      code: "LVL-2",
      name: "SMP",
      hargaJual: 50000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  const level3 = await prisma.level.create({
    data: {
      code: "LVL-3",
      name: "SMA",
      hargaJual: 60000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  const level4 = await prisma.level.create({
    data: {
      code: "LVL-4",
      name: "SMK",
      hargaJual: 40000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  // =============================
  // SUBJECT
  // =============================
  await prisma.subject.createMany({
    data: [
      { code: "MTK-SD", name: "Matematika SD", levelId: level1.id },
      { code: "ENG-SD", name: "Bahasa Inggris SD", levelId: level1.id },
      { code: "MTK-SMP", name: "Matematika SMP", levelId: level2.id },
      { code: "ENG-SMP", name: "Bahasa Inggris SMP", levelId: level2.id },
      { code: "MTK-SMA", name: "Matematika SMA", levelId: level3.id },
      { code: "ENG-SMA", name: "Bahasa Inggris SMA", levelId: level3.id },
    ],
  });

  // =============================
  // STUDENT
  // =============================
  const students = await prisma.student.createMany({
    data: [
      {
        fullName: "Budi Santoso",
        levelId: level1.id,
        parentName: "Pak Budi",
        parentPhone: "0811111111",
        kode: ""
      },
      {
        fullName: "Siti Aminah",
        levelId: level1.id,
        parentName: "Bu Siti",
        parentPhone: "0822222222",
        kode: ""
      },
      {
        fullName: "Andi Pratama",
        levelId: level2.id,
        parentName: "Pak Andi",
        parentPhone: "0833333333",
        kode: ""
      },
    ],
  });

  const allStudents = await prisma.student.findMany();

  // =============================
  // TUTOR + USER
  // =============================
  const tutorPassword = await bcrypt.hash("tutor123", 10);

  const tutorUser = await prisma.user.create({
    data: {
      email: "tutor1@gmail.com",
      passwordHash: tutorPassword,
      role: "tutor",
    },
  });

  const tutor = await prisma.tutor.create({
    data: {
      kode: "TUT-001",
      nama: "Ahmad Fauzi",
      email: "tutor1@gmail.com",
      posisi: "Tutor Matematika",
      noWa: "08123456789",
      alamat: "Semarang",
      status: true,
      userId: tutorUser.id,

      // 🔥 RELASI MANY TO MANY
      students: {
        connect: allStudents.slice(0, 2).map((s) => ({ id: s.id })),
      },
    },
  });

  // =============================
  // ATTENDANCE
  // =============================
  await prisma.attendance.create({
    data: {
      tutorId: tutor.id,
      studentId: allStudents[0].id,
      subjectName: "Matematika",
      durationMin: 60,
      photoUrl: "https://dummy.com/photo.jpg",
      feeNet: 40000,
      status: "diselesaikan",
    },
  });

  // =============================
  // FINANCE
  // =============================
  await prisma.finance.create({
    data: {
      tutorId: tutor.id,
      amount: 40000,
      type: "income",
      note: "Gaji les pertama",
    },
  });

  console.log("✅ SEEDING SELESAI");
}

main()
  .catch((e) => {
    console.error("❌ ERROR SEED:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// PRIVATE_FIXED/bimbel-backend/prisma/seeds/students.seed.ts

import type { PrismaClient } from "@prisma/client";

type Levels = Awaited<ReturnType<typeof import("./levels.seed").seedLevels>>;

export async function seedStudents(prisma: PrismaClient, levels: Levels) {
  const student1 = await prisma.student.upsert({
    where: { kode: "STD-001" },
    update: {
      fullName: "Budi Santoso",
      levelId: levels.levelSD.id,
      parentName: "Pak Budi",
      parentPhone: "0811111111",
      isActive: true,
    },
    create: {
      kode: "STD-001",
      fullName: "Budi Santoso",
      levelId: levels.levelSD.id,
      parentName: "Pak Budi",
      parentPhone: "0811111111",
      isActive: true,
    },
  });

  const student2 = await prisma.student.upsert({
    where: { kode: "STD-002" },
    update: {
      fullName: "Siti Aminah",
      levelId: levels.levelSD.id,
      parentName: "Bu Siti",
      parentPhone: "0822222222",
      isActive: true,
    },
    create: {
      kode: "STD-002",
      fullName: "Siti Aminah",
      levelId: levels.levelSD.id,
      parentName: "Bu Siti",
      parentPhone: "0822222222",
      isActive: true,
    },
  });

  const student3 = await prisma.student.upsert({
    where: { kode: "STD-003" },
    update: {
      fullName: "Andi Pratama",
      levelId: levels.levelSMP.id,
      parentName: "Pak Andi",
      parentPhone: "0833333333",
      isActive: true,
    },
    create: {
      kode: "STD-003",
      fullName: "Andi Pratama",
      levelId: levels.levelSMP.id,
      parentName: "Pak Andi",
      parentPhone: "0833333333",
      isActive: true,
    },
  });

  console.log("✅ Students seeded");

  return {
    student1,
    student2,
    student3,
  };
}
// PRIVATE_FIXED/bimbel-backend/prisma/seeds/subjects.seed.ts

import type { PrismaClient } from "@prisma/client";

type Levels = Awaited<ReturnType<typeof import("./levels.seed").seedLevels>>;

export async function seedSubjects(prisma: PrismaClient, levels: Levels) {
  const subjects = [
    { code: "CLS-DAS", name: "Calistung Dasar", levelId: levels.levelCalistung.id },
    { code: "CLS-LAN", name: "Calistung Lanjutan", levelId: levels.levelCalistung.id },
    { code: "MTK-SD", name: "Matematika SD", levelId: levels.levelSD.id },
    { code: "ENG-SD", name: "Bahasa Inggris SD", levelId: levels.levelSD.id },
    { code: "MTK-SMP", name: "Matematika SMP", levelId: levels.levelSMP.id },
    { code: "ENG-SMP", name: "Bahasa Inggris SMP", levelId: levels.levelSMP.id },
    { code: "MTK-SMA", name: "Matematika SMA", levelId: levels.levelSMA.id },
    { code: "ENG-SMA", name: "Bahasa Inggris SMA", levelId: levels.levelSMA.id },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {
        name: subject.name,
        levelId: subject.levelId,
        isActive: true,
      },
      create: {
        ...subject,
        isActive: true,
      },
    });
  }

  console.log("✅ Subjects seeded");
}
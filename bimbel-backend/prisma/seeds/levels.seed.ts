// PRIVATE_FIXED/bimbel-backend/prisma/seeds/levels.seed.ts

import type { PrismaClient } from "@prisma/client";

export async function seedLevels(prisma: PrismaClient) {
  const levelCalistung = await prisma.level.upsert({
    where: { code: "LVL-1" },
    update: {
      name: "Calistung",
      hargaJual: 35000,
      durasiMenit: 75,
      potonganAdmin: 20,
    },
    create: {
      code: "LVL-1",
      name: "Calistung",
      hargaJual: 35000,
      durasiMenit: 75,
      potonganAdmin: 20,
    },
  });

  const levelSD = await prisma.level.upsert({
    where: { code: "LVL-2" },
    update: {
      name: "SD",
      hargaJual: 50000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
    create: {
      code: "LVL-2",
      name: "SD",
      hargaJual: 50000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  const levelSMP = await prisma.level.upsert({
    where: { code: "LVL-3" },
    update: {
      name: "SMP",
      hargaJual: 60000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
    create: {
      code: "LVL-3",
      name: "SMP",
      hargaJual: 60000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  const levelSMA = await prisma.level.upsert({
    where: { code: "LVL-4" },
    update: {
      name: "SMA",
      hargaJual: 70000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
    create: {
      code: "LVL-4",
      name: "SMA",
      hargaJual: 70000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  console.log("✅ Levels seeded");

  return {
    levelCalistung,
    levelSD,
    levelSMP,
    levelSMA,
  };
}
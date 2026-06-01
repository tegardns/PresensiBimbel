// PRIVATE_FIXED/bimbel-backend/prisma/seeds/levels.seed.ts

import type { PrismaClient } from "@prisma/client";

export async function seedLevels(prisma: PrismaClient) {
  const levelSD = await prisma.level.upsert({
    where: { code: "LVL-1" },
    update: {
      name: "SD",
      hargaJual: 50000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
    create: {
      code: "LVL-1",
      name: "SD",
      hargaJual: 50000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  const levelSMP = await prisma.level.upsert({
    where: { code: "LVL-2" },
    update: {
      name: "SMP",
      hargaJual: 50000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
    create: {
      code: "LVL-2",
      name: "SMP",
      hargaJual: 50000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  const levelSMA = await prisma.level.upsert({
    where: { code: "LVL-3" },
    update: {
      name: "SMA",
      hargaJual: 60000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
    create: {
      code: "LVL-3",
      name: "SMA",
      hargaJual: 60000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  const levelSMK = await prisma.level.upsert({
    where: { code: "LVL-4" },
    update: {
      name: "SMK",
      hargaJual: 40000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
    create: {
      code: "LVL-4",
      name: "SMK",
      hargaJual: 40000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  });

  console.log("✅ Levels seeded");

  return {
    levelSD,
    levelSMP,
    levelSMA,
    levelSMK,
  };
}
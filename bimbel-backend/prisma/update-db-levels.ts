// PRIVATE_FIXED/bimbel-backend/prisma/update-db-levels.ts
import { PrismaClient } from "@prisma/client";
import process from "process";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database in-place levels update...");

  // 1. Update Levels
  console.log("Updating level structures...");
  const lvl1 = await prisma.level.upsert({
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
  console.log("✓ LVL-1 updated to Calistung:", lvl1.id);

  const lvl2 = await prisma.level.upsert({
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
  console.log("✓ LVL-2 updated to SD:", lvl2.id);

  const lvl3 = await prisma.level.upsert({
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
  console.log("✓ LVL-3 updated to SMP:", lvl3.id);

  const lvl4 = await prisma.level.upsert({
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
  console.log("✓ LVL-4 updated to SMA:", lvl4.id);

  // 2. Adjust Subjects
  console.log("Adjusting subjects database records...");

  // Remove SMK-specific subjects if any
  const deletedSubjects = await prisma.subject.deleteMany({
    where: {
      OR: [
        { code: "MTK-SMK" },
        { name: { contains: "SMK" } }
      ]
    }
  });
  console.log(`✓ Deleted ${deletedSubjects.count} SMK subjects.`);

  // Upsert subjects for Calistung
  await prisma.subject.upsert({
    where: { code: "CLS-DAS" },
    update: { name: "Calistung Dasar", levelId: lvl1.id, isActive: true },
    create: { code: "CLS-DAS", name: "Calistung Dasar", levelId: lvl1.id, isActive: true }
  });
  await prisma.subject.upsert({
    where: { code: "CLS-LAN" },
    update: { name: "Calistung Lanjutan", levelId: lvl1.id, isActive: true },
    create: { code: "CLS-LAN", name: "Calistung Lanjutan", levelId: lvl1.id, isActive: true }
  });

  // Re-map or upsert existing subjects
  await prisma.subject.upsert({
    where: { code: "MTK-SD" },
    update: { levelId: lvl2.id, name: "Matematika SD" },
    create: { code: "MTK-SD", levelId: lvl2.id, name: "Matematika SD" }
  });
  await prisma.subject.upsert({
    where: { code: "ENG-SD" },
    update: { levelId: lvl2.id, name: "Bahasa Inggris SD" },
    create: { code: "ENG-SD", levelId: lvl2.id, name: "Bahasa Inggris SD" }
  });

  await prisma.subject.upsert({
    where: { code: "MTK-SMP" },
    update: { levelId: lvl3.id, name: "Matematika SMP" },
    create: { code: "MTK-SMP", levelId: lvl3.id, name: "Matematika SMP" }
  });
  await prisma.subject.upsert({
    where: { code: "ENG-SMP" },
    update: { levelId: lvl3.id, name: "Bahasa Inggris SMP" },
    create: { code: "ENG-SMP", levelId: lvl3.id, name: "Bahasa Inggris SMP" }
  });

  await prisma.subject.upsert({
    where: { code: "MTK-SMA" },
    update: { levelId: lvl4.id, name: "Matematika SMA" },
    create: { code: "MTK-SMA", levelId: lvl4.id, name: "Matematika SMA" }
  });
  await prisma.subject.upsert({
    where: { code: "ENG-SMA" },
    update: { levelId: lvl4.id, name: "Bahasa Inggris SMA" },
    create: { code: "ENG-SMA", levelId: lvl4.id, name: "Bahasa Inggris SMA" }
  });

  console.log("✓ Subjects aligned successfully.");
  console.log("🎉 Database levels restructured successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

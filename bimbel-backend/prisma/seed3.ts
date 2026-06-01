// PRIVATE_FIXED/bimbel-backend/prisma/seed3.ts
import prisma from "../src/lib/prisma";

async function main() {
  console.log("Seeding Level...");

  const levels = [
    {
      code: "LVL-4",
      name: "Calistung",
      hargaJual: 40000,
      durasiMenit: 60,
      potonganAdmin: 10,
    },
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { code: level.code },
      update: {},
      create: level,
    });
  }

  console.log("Level berhasil di-seed 🚀");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

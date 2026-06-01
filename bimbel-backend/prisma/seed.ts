// PRIVATE_FIXED/bimbel-backend/prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import process from "process";
import { seedUsers } from "./seeds/users.seed";
import { seedLevels } from "./seeds/levels.seed";
import { seedSubjects } from "./seeds/subjects.seed";
import { seedStudents } from "./seeds/students.seed";
import { seedTutors } from "./seeds/tutors.seed";
import { seedSamples } from "./seeds/samples.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const users = await seedUsers(prisma);
  const levels = await seedLevels(prisma);
  await seedSubjects(prisma, levels);
  const students = await seedStudents(prisma, levels);
  const tutor = await seedTutors(prisma, users, students);

  await seedSamples(prisma, tutor, students);

  console.log("✅ Seeding selesai");
  console.log("");
  console.log("Admin login:");
  console.log("Email    : admin@gmail.com");
  console.log("Password : admin123");
  console.log("");
  console.log("Tutor login:");
  console.log("Email    : tutor1@gmail.com");
  console.log("Password : tutor123");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
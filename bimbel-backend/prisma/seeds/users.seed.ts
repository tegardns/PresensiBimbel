// PRIVATE_FIXED/bimbel-backend/prisma/seeds/users.seed.ts

import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordTutor = await bcrypt.hash("tutor123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      passwordHash: passwordAdmin,
      role: "admin",
      isActive: true,
    },
    create: {
      email: "admin@gmail.com",
      passwordHash: passwordAdmin,
      role: "admin",
      isActive: true,
    },
  });

  const tutorUser = await prisma.user.upsert({
    where: { email: "tutor1@gmail.com" },
    update: {
      passwordHash: passwordTutor,
      role: "tutor",
      isActive: true,
    },
    create: {
      email: "tutor1@gmail.com",
      passwordHash: passwordTutor,
      role: "tutor",
      isActive: true,
    },
  });

  console.log("✅ Users seeded");

  return {
    adminUser,
    tutorUser,
  };
}
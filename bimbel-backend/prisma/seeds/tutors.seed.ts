// PRIVATE_FIXED/bimbel-backend/prisma/seeds/tutors.seed.ts

import type { PrismaClient } from "@prisma/client";

type Users = Awaited<ReturnType<typeof import("./users.seed").seedUsers>>;
type Students = Awaited<ReturnType<typeof import("./students.seed").seedStudents>>;

export async function seedTutors(
  prisma: PrismaClient,
  users: Users,
  students: Students
) {
  const tutor = await prisma.tutor.upsert({
    where: { kode: "TUT-001" },
    update: {
      nama: "Ahmad Fauzi",
      email: "tutor1@gmail.com",
      posisi: "Tutor Matematika",
      noWa: "08123456789",
      alamat: "Semarang",
      status: true,
      userId: users.tutorUser.id,
      students: {
        set: [{ id: students.student1.id }, { id: students.student2.id }],
      },
    },
    create: {
      kode: "TUT-001",
      nama: "Ahmad Fauzi",
      email: "tutor1@gmail.com",
      posisi: "Tutor Matematika",
      noWa: "08123456789",
      alamat: "Semarang",
      status: true,
      userId: users.tutorUser.id,
      students: {
        connect: [{ id: students.student1.id }, { id: students.student2.id }],
      },
    },
  });

  console.log("✅ Tutors seeded");

  return tutor;
}
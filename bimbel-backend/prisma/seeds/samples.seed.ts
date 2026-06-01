// PRIVATE_FIXED/bimbel-backend/prisma/seeds/samples.seed.ts

import type { PrismaClient, Tutor } from "@prisma/client";

type Students = Awaited<ReturnType<typeof import("./students.seed").seedStudents>>;

export async function seedSamples(
  prisma: PrismaClient,
  tutor: Tutor,
  students: Students
) {
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      tutorId: tutor.id,
      studentId: students.student1.id,
      subjectName: "Matematika SD",
    },
  });

  if (!existingAttendance) {
    await prisma.attendance.create({
      data: {
        tutorId: tutor.id,
        studentId: students.student1.id,
        subjectName: "Matematika SD",
        durationMin: 60,
        photoUrl: "https://dummy.com/photo.jpg",
        feeNet: 40000,
        status: "diselesaikan",
      },
    });
  }

  const existingFinance = await prisma.finance.findFirst({
    where: {
      tutorId: tutor.id,
      amount: 40000,
      type: "income",
      note: "Gaji les pertama",
    },
  });

  if (!existingFinance) {
    await prisma.finance.create({
      data: {
        tutorId: tutor.id,
        amount: 40000,
        type: "income",
        note: "Gaji les pertama",
      },
    });
  }

  console.log("✅ Sample attendance & finance seeded");
}
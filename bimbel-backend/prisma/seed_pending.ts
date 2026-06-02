import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding 5 data Presensi yang belum di-Approve (status: tertunda)...");

  // 1. Get tutor
  const tutor = await prisma.tutor.findFirst();
  if (!tutor) {
    console.error("❌ Tidak ada tutor di database. Silakan jalankan seed utama terlebih dahulu.");
    process.exit(1);
  }

  // 2. Get student
  const student = await prisma.student.findFirst();
  if (!student) {
    console.error("❌ Tidak ada siswa di database. Silakan jalankan seed utama terlebih dahulu.");
    process.exit(1);
  }

  console.log(`Menggunakan Tutor: ${tutor.nama} (${tutor.kode})`);
  console.log(`Menggunakan Siswa: ${student.fullName} (${student.kode})`);

  // 3. Create 5 pending attendances
  const subjects = ["Matematika", "Bahasa Inggris", "Fisika", "Kimia", "Biologi"];
  const duration = 60;
  const feeNet = 35000; // fee bersih tutor per sesi

  for (let i = 0; i < 5; i++) {
    const date = new Date();
    // Spread them over the last few days
    date.setDate(date.getDate() - i);

    const attendance = await prisma.attendance.create({
      data: {
        tutorId: tutor.id,
        studentId: student.id,
        subjectName: subjects[i % subjects.length] + " SD",
        durationMin: duration,
        photoUrl: `https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=200&auto=format&fit=crop`,
        notes: `Sesi pembelajaran ke-${i + 1}. Pembahasan bab ${i + 1}.`,
        feeNet: feeNet,
        status: "tertunda",
        createdAt: date,
      },
    });

    console.log(`✅ Berhasil membuat presensi tertunda: ${attendance.subjectName} pada ${attendance.createdAt.toLocaleDateString()}`);
  }

  console.log("🚀 Selesai melakukan seeding 5 data Presensi tertunda!");
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding presensi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import dotenv from "dotenv";
dotenv.config();

import prisma from "../src/config/prisma";
import { generatePDFBuffer, uploadToSupabase } from "../src/utils/pdfGenerator";

const getCycleSundayStr = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const cycleSunday = new Date(d);
  cycleSunday.setDate(d.getDate() - day);
  
  const yyyy = cycleSunday.getFullYear();
  const mm = String(cycleSunday.getMonth() + 1).padStart(2, "0");
  const dd = String(cycleSunday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

async function main() {
  console.log("Starting historical PDF generation...");

  const settings = await prisma.systemSetting.findUnique({
    where: { id: "system" },
  });
  const namaBimbel = settings?.namaBimbel || "BimbelMelly";

  const tutors = await prisma.tutor.findMany();

  for (const tutor of tutors) {
    console.log(`Processing Tutor: ${tutor.nama} (${tutor.kode})`);

    const attendances = await prisma.attendance.findMany({
      where: {
        tutorId: tutor.id,
        status: "selesai",
      },
      include: {
        student: {
          include: {
            level: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (attendances.length === 0) {
      continue;
    }

    // Group by cycleSunday
    const groupedHistory = new Map<string, any[]>();
    attendances.forEach((item) => {
      const cycleSunday = getCycleSundayStr(item.createdAt);
      if (!groupedHistory.has(cycleSunday)) {
        groupedHistory.set(cycleSunday, []);
      }
      groupedHistory.get(cycleSunday)!.push(item);
    });

    // Process each payout group
    for (const [cycleSunday, sessions] of groupedHistory.entries()) {
      const cycleSundayStr = cycleSunday.replace(/-/g, "");
      const transactionId = `TRX-${cycleSundayStr}-PAID`;
      const fileName = `TRX-${cycleSundayStr}-${tutor.kode}-PAID.pdf`;
      
      const totalPayout = sessions.reduce((sum, s) => sum + s.feeNet, 0);

      // Period text
      const sundayDate = new Date(cycleSunday);
      const saturdayDate = new Date(sundayDate);
      saturdayDate.setDate(sundayDate.getDate() + 6);
      
      const formatDateStr = (d: Date) => {
        return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      };
      
      const cyclePeriodStr = `${formatDateStr(sundayDate)} s/d ${formatDateStr(saturdayDate)}`;

      const sessionsMapped = sessions.map((item) => ({
        tanggal: item.createdAt.toISOString(),
        siswa: item.student?.fullName || "Siswa",
        mapel: item.subjectName,
        durasi: item.durationMin,
        fee: item.feeNet
      }));

      console.log(`Generating PDF for ${fileName}...`);
      
      try {
        const pdfBuffer = await generatePDFBuffer({
          payoutId: transactionId,
          tutorNama: tutor.nama || "Tutor",
          tutorKode: tutor.kode,
          periodeStr: cyclePeriodStr,
          totalNominal: totalPayout,
          namaBank: tutor.namaBank || "-",
          noRekening: tutor.noRek || "-",
          sessions: sessionsMapped,
          namaBimbel
        });

        const fileUrl = await uploadToSupabase(pdfBuffer, fileName);
        if (fileUrl) {
          console.log(`✅ Uploaded: ${fileUrl}`);
        } else {
          console.log(`❌ Failed to upload ${fileName}`);
        }
      } catch (err) {
        console.error(`Error processing ${fileName}:`, err);
      }
    }
  }

  console.log("Finished generating historical PDFs.");
}

main().catch(console.error).finally(() => prisma.$disconnect());

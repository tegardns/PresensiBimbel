import PDFDocument from "pdfkit";
import axios from "axios";

export const generatePDFBuffer = (data: {
  payoutId: string;
  tutorNama: string;
  tutorKode: string;
  periodeStr: string;
  totalNominal: number;
  namaBank: string;
  noRekening: string;
  sessions: any[];
  namaBimbel: string;
}): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Design PDF layout
    doc.fillColor("#0f172a");

    // Title / Header
    doc.font("Helvetica-Bold").fontSize(18).text(data.namaBimbel.toUpperCase(), { align: "center" });
    doc.font("Helvetica").fontSize(10).text("Sistem Penggajian & Presensi Tutor", { align: "center" });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(12).text("SLIP GAJI TUTOR (WEEKLY)", { align: "center", characterSpacing: 1 });
    doc.moveDown(1);

    // Separator line
    doc.strokeColor("#cbd5e1").lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Info Section (Grid equivalent)
    const startY = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).text("Detail Penerima Gaji", 50, startY);
    doc.font("Helvetica").fontSize(9);
    doc.text(`Nama Tutor  : ${data.tutorNama}`, 50, doc.y + 5);
    doc.text(`Kode Tutor  : ${data.tutorKode}`, 50, doc.y + 3);
    doc.text(`Rekening    : ${data.namaBank} - ${data.noRekening}`, 50, doc.y + 3);

    // Right Column Info
    doc.font("Helvetica-Bold").fontSize(10).text("Detail Transaksi", 320, startY);
    doc.font("Helvetica").fontSize(9);
    doc.text(`ID Transaksi : ${data.payoutId}`, 320, startY + 15);
    doc.text(`Periode      : ${data.periodeStr}`, 320, doc.y + 3);
    doc.text(`Status       : LUNAS / BERHASIL`, 320, doc.y + 3);

    doc.moveDown(2);
    // Draw separator before table
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Table Title
    doc.font("Helvetica-Bold").fontSize(10).text("Rincian Sesi Mengajar");
    doc.moveDown(0.5);

    // Table Header
    const tableHeaderY = doc.y;
    doc.rect(50, tableHeaderY - 4, 495, 20).fill("#f1f5f9");
    doc.fillColor("#475569");
    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("Tanggal", 60, tableHeaderY);
    doc.text("Siswa", 140, tableHeaderY);
    doc.text("Mata Pelajaran", 260, tableHeaderY);
    doc.text("Durasi", 390, tableHeaderY);
    doc.text("Fee", 470, tableHeaderY, { width: 65, align: "right" });

    doc.fillColor("#0f172a");
    doc.font("Helvetica");
    doc.moveDown(0.8);

    // Table Rows
    data.sessions.forEach((s, index) => {
      // Alternating row background
      const rowY = doc.y;
      if (index % 2 === 1) {
        doc.rect(50, rowY - 3, 495, 18).fill("#f8fafc");
        doc.fillColor("#0f172a");
      }

      const formattedDate = new Date(s.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
      const feeFormatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
      }).format(s.fee).replace("Rp", "Rp ");

      doc.text(formattedDate, 60, rowY);
      doc.text(s.siswa, 140, rowY, { width: 110, ellipsis: true });
      doc.text(s.mapel, 260, rowY, { width: 120, ellipsis: true });
      doc.text(`${s.durasi} menit`, 390, rowY);
      doc.text(feeFormatted, 470, rowY, { width: 65, align: "right" });
      doc.moveDown(0.9);
    });

    doc.moveDown(1);
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Total Section
    const totalFormatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(data.totalNominal).replace("Rp", "Rp ");

    const totalY = doc.y;
    doc.rect(345, totalY - 6, 200, 26).fill("#ecfdf5");
    doc.fillColor("#047857");
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Total Transfer:", 355, totalY);
    doc.text(totalFormatted, 435, totalY, { width: 100, align: "right" });

    // Note Footer
    doc.fillColor("#64748b");
    doc.font("Helvetica-Oblique").fontSize(8);
    doc.text("Catatan: Fee yang tertera pada slip gaji adalah pendapatan bersih tutor", 50, totalY + 30);

    // Signatures
    doc.fillColor("#0f172a");
    doc.font("Helvetica");
    doc.moveDown(3);
    const sigY = doc.y;
    doc.text("Penerima,", 50, sigY, { width: 200, align: "center" });
    doc.text("Hormat Kami,", 345, sigY, { width: 200, align: "center" });

    doc.moveDown(3.5);
    doc.font("Helvetica-Bold");
    doc.text(data.tutorNama, 50, doc.y, { width: 200, align: "center" });
    doc.text(`${data.namaBimbel} Admin`, 345, doc.y, { width: 200, align: "center" });

    doc.font("Helvetica").fontSize(8).fillColor("#64748b");
    doc.text("Tutor", 50, doc.y + 12, { width: 200, align: "center" });
    doc.text("Manajemen Keuangan", 345, doc.y + 12, { width: 200, align: "center" });

    doc.end();
  });
};

export const uploadToSupabase = async (
  pdfBuffer: Buffer,
  fileName: string
): Promise<string | null> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("⚠️ SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di .env. Lewati upload PDF.");
    return null;
  }

  const cleanUrl = supabaseUrl.replace(/\/$/, "");

  try {
    const uploadUrl = `${cleanUrl}/storage/v1/object/Slips/${fileName}`;

    const headers: any = {
      apikey: supabaseKey,
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    };

    if (supabaseKey.startsWith("eyJ")) {
      headers["Authorization"] = `Bearer ${supabaseKey}`;
    }

    await axios.post(uploadUrl, pdfBuffer, { headers });

    // Public URL to retrieve the uploaded file
    const publicUrl = `${cleanUrl}/storage/v1/object/public/Slips/${fileName}`;
    return publicUrl;
  } catch (error: any) {
    console.error("❌ Gagal mengunggah PDF ke Supabase Storage:", error.response?.data || error.message);
    return null;
  }
};

export const uploadFileToSupabase = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string | null> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("⚠️ SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di .env. Lewati upload file.");
    return null;
  }

  const cleanUrl = supabaseUrl.replace(/\/$/, "");

  try {
    const uploadUrl = `${cleanUrl}/storage/v1/object/Presensi/${fileName}`;

    const headers: any = {
      apikey: supabaseKey,
      "Content-Type": contentType,
      "x-upsert": "true",
    };

    if (supabaseKey.startsWith("eyJ")) {
      headers["Authorization"] = `Bearer ${supabaseKey}`;
    }

    await axios.post(uploadUrl, fileBuffer, { headers });

    const publicUrl = `${cleanUrl}/storage/v1/object/public/Presensi/${fileName}`;
    return publicUrl;
  } catch (error: any) {
    console.error("❌ Gagal mengunggah file ke Supabase Storage:", error.response?.data || error.message);
    return null;
  }
};

export const uploadPhotoToSupabase = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string | null> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("⚠️ SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di .env. Lewati upload foto.");
    return null;
  }

  const cleanUrl = supabaseUrl.replace(/\/$/, "");

  try {
    const uploadUrl = `${cleanUrl}/storage/v1/object/Foto/${fileName}`;

    const headers: any = {
      apikey: supabaseKey,
      "Content-Type": contentType,
      "x-upsert": "true",
    };

    if (supabaseKey.startsWith("eyJ")) {
      headers["Authorization"] = `Bearer ${supabaseKey}`;
    }

    await axios.post(uploadUrl, fileBuffer, { headers });

    const publicUrl = `${cleanUrl}/storage/v1/object/public/Foto/${fileName}`;
    return publicUrl;
  } catch (error: any) {
    console.error("❌ Gagal mengunggah foto ke Supabase Storage:", error.response?.data || error.message);
    return null;
  }
};

export const deleteFileFromSupabase = async (
  bucket: string,
  fileName: string
): Promise<boolean> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("⚠️ SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di .env. Lewati delete file.");
    return false;
  }

  const cleanUrl = supabaseUrl.replace(/\/$/, "");

  try {
    const deleteUrl = `${cleanUrl}/storage/v1/object/${bucket}/${fileName}`;

    const headers: any = {
      apikey: supabaseKey,
    };

    if (supabaseKey.startsWith("eyJ")) {
      headers["Authorization"] = `Bearer ${supabaseKey}`;
    }

    await axios.delete(deleteUrl, { headers });
    console.log(`✅ Berhasil menghapus file ${fileName} dari bucket ${bucket}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Gagal menghapus file ${fileName} dari bucket ${bucket}:`, error.response?.data || error.message);
    return false;
  }
};



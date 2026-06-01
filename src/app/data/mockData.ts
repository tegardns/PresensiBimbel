// PRIVATE_FIXED/src/app/data/mockData.ts
// Central Mock Data dengan Relasi yang Konsisten

// ============= MASTER DATA =============

export interface Level {
  id: string;
  nama: string;
  harga: number;
  durasi: number[];
  status: "aktif" | "nonaktif";
}

export const levels: Level[] = [
  {
    id: "LVL-001",
    nama: "Calistung",
    harga: 40000,
    durasi: [60, 90, 120],
    status: "aktif",
  },
  {
    id: "LVL-002",
    nama: "SD",
    harga: 50000,
    durasi: [60, 90, 120],
    status: "aktif",
  },
  {
    id: "LVL-003",
    nama: "SMP",
    harga: 60000,
    durasi: [60, 90, 120, 150, 180],
    status: "aktif",
  },
  {
    id: "LVL-004",
    nama: "SMA",
    harga: 70000,
    durasi: [60, 90, 120, 150, 180],
    status: "aktif",
  },
];

export interface Mapel {
  id: string;
  nama: string;
  levelId: string;
  status: "aktif" | "nonaktif";
}

export const mapels: Mapel[] = [
  { id: "MAP-001", nama: "Matematika", levelId: "LVL-002", status: "aktif" },
  { id: "MAP-002", nama: "Matematika", levelId: "LVL-003", status: "aktif" },
  { id: "MAP-003", nama: "Matematika", levelId: "LVL-004", status: "aktif" },
  { id: "MAP-004", nama: "Fisika", levelId: "LVL-003", status: "aktif" },
  { id: "MAP-005", nama: "Fisika", levelId: "LVL-004", status: "aktif" },
  { id: "MAP-006", nama: "Kimia", levelId: "LVL-003", status: "aktif" },
  { id: "MAP-007", nama: "Kimia", levelId: "LVL-004", status: "aktif" },
  { id: "MAP-008", nama: "Biologi", levelId: "LVL-003", status: "aktif" },
  { id: "MAP-009", nama: "Biologi", levelId: "LVL-004", status: "aktif" },
  {
    id: "MAP-010",
    nama: "Bahasa Inggris",
    levelId: "LVL-002",
    status: "aktif",
  },
  {
    id: "MAP-011",
    nama: "Bahasa Inggris",
    levelId: "LVL-003",
    status: "aktif",
  },
  {
    id: "MAP-012",
    nama: "Bahasa Inggris",
    levelId: "LVL-004",
    status: "aktif",
  },
];

export interface Tutor {
  id: string;
  kode?: string; // <-- TAMBAHAN
  nama: string;
  email: string;
  posisi: string;
  noWa: string;
  alamat: string;
  namaBank: string;
  noRek: string;
  username: string;
  status: "aktif" | "nonaktif";
  foto?: string;
  totalStudents?: number;
  students?: {
    id: string;
    fullName: string;
    schoolName: string;
  }[];
}

export const tutors: Tutor[] = [
  {
    id: "TUT-001",
    nama: "Mellysa",
    email: "mellysa@bimbelmelly.com",
    posisi: "Tentor Matematika & Fisika",
    noWa: "081234567890",
    alamat: "Jl. Merdeka No. 123, Jakarta Selatan",
    namaBank: "BCA",
    noRek: "1234567890",
    username: "mellysa",
    status: "aktif",
  },
  {
    id: "TUT-002",
    nama: "Budi Santoso",
    email: "budi.santoso@bimbelmelly.com",
    posisi: "Tentor Fisika & Kimia",
    noWa: "082345678901",
    alamat: "Jl. Sudirman No. 45, Jakarta Pusat",
    namaBank: "Mandiri",
    noRek: "0987654321",
    username: "budi.santoso",
    status: "aktif",
  },
  {
    id: "TUT-003",
    nama: "Dedi Prasetyo",
    email: "dedi.prasetyo@bimbelmelly.com",
    posisi: "Tentor Matematika",
    noWa: "083456789012",
    alamat: "Jl. Gatot Subroto No. 78, Jakarta Selatan",
    namaBank: "BNI",
    noRek: "5556667778",
    username: "dedi.prasetyo",
    status: "aktif",
  },
];

export interface Siswa {
  id: string;
  nama: string;
  levelId: string;
  sekolah: string;
  alamat: string;
  namaOrtu: string;
  noWaOrtu: string;
  status: "aktif" | "nonaktif";
}

export const siswas: Siswa[] = [
  {
    id: "SIS-001",
    nama: "Ahmad Rizki",
    levelId: "LVL-002",
    sekolah: "SD Negeri 01 Jakarta",
    alamat: "Jl. Kebon Jeruk No. 12, Jakarta",
    namaOrtu: "Bapak Ahmad",
    noWaOrtu: "081111111111",
    status: "aktif",
  },
  {
    id: "SIS-002",
    nama: "Budi Santoso",
    levelId: "LVL-003",
    sekolah: "SMP Negeri 5 Jakarta",
    alamat: "Jl. Tanah Abang No. 34, Jakarta",
    namaOrtu: "Ibu Santi",
    noWaOrtu: "082222222222",
    status: "aktif",
  },
  {
    id: "SIS-003",
    nama: "Dedi Prasetyo",
    levelId: "LVL-004",
    sekolah: "SMA Negeri 8 Jakarta",
    alamat: "Jl. Menteng No. 56, Jakarta",
    namaOrtu: "Bapak Prasetyo",
    noWaOrtu: "083333333333",
    status: "aktif",
  },
  {
    id: "SIS-004",
    nama: "Eka Putri",
    levelId: "LVL-002",
    sekolah: "SD Negeri 03 Jakarta",
    alamat: "Jl. Cempaka No. 78, Jakarta",
    namaOrtu: "Ibu Putri",
    noWaOrtu: "084444444444",
    status: "aktif",
  },
  {
    id: "SIS-005",
    nama: "Fahmi Rahman",
    levelId: "LVL-003",
    sekolah: "SMP Negeri 12 Jakarta",
    alamat: "Jl. Mawar No. 90, Jakarta",
    namaOrtu: "Bapak Rahman",
    noWaOrtu: "085555555555",
    status: "aktif",
  },
  {
    id: "SIS-006",
    nama: "Gita Sari",
    levelId: "LVL-004",
    sekolah: "SMA Negeri 10 Jakarta",
    alamat: "Jl. Melati No. 11, Jakarta",
    namaOrtu: "Ibu Sari",
    noWaOrtu: "086666666666",
    status: "aktif",
  },
];

// ============= PRESENSI DATA =============

export interface Presensi {
  id: string;
  tutorId: string;
  siswaId: string;
  mapelId: string;
  tanggal: string;
  waktuMulai: string;
  durasi: number;
  buktiUrl: string;
  catatan: string;
  feeBersih: number;
  status: "pending" | "disetujui" | "ditolak" | "selesai";
  tertundaReason?: string;
  approvedAt?: string;
}

export const presensis: Presensi[] = [
  {
    id: "SES-20260422-001",
    tutorId: "TUT-001",
    siswaId: "SIS-001",
    mapelId: "MAP-001",
    tanggal: "2026-04-22",
    waktuMulai: "14:00",
    durasi: 90,
    buktiUrl: "https://via.placeholder.com/800x600",
    catatan: "Belajar perkalian dan pembagian",
    feeBersih: 67500, // (50000/60) * 90 * 0.9
    status: "pending",
  },
  {
    id: "SES-20260422-002",
    tutorId: "TUT-002",
    siswaId: "SIS-003",
    mapelId: "MAP-005",
    tanggal: "2026-04-22",
    waktuMulai: "15:30",
    durasi: 120,
    buktiUrl: "https://via.placeholder.com/800x600",
    catatan: "Materi gerak lurus",
    feeBersih: 126000, // (70000/60) * 120 * 0.9
    status: "pending",
  },
  {
    id: "SES-20260421-001",
    tutorId: "TUT-001",
    siswaId: "SIS-002",
    mapelId: "MAP-004",
    tanggal: "2026-04-21",
    waktuMulai: "10:00",
    durasi: 90,
    buktiUrl: "https://via.placeholder.com/800x600",
    catatan: "Fisika dasar tentang gaya",
    feeBersih: 81000, // (60000/60) * 90 * 0.9
    status: "disetujui",
    approvedAt: "2026-04-21 18:00",
  },
  {
    id: "SES-20260420-001",
    tutorId: "TUT-001",
    siswaId: "SIS-001",
    mapelId: "MAP-001",
    tanggal: "2026-04-20",
    waktuMulai: "14:00",
    durasi: 90,
    buktiUrl: "https://via.placeholder.com/800x600",
    catatan: "Matematika pecahan",
    feeBersih: 67500,
    status: "selesai",
    approvedAt: "2026-04-20 18:00",
  },
  {
    id: "SES-20260419-001",
    tutorId: "TUT-002",
    siswaId: "SIS-003",
    mapelId: "MAP-005",
    tanggal: "2026-04-19",
    waktuMulai: "15:00",
    durasi: 120,
    buktiUrl: "https://via.placeholder.com/800x600",
    catatan: "Fisika listrik",
    feeBersih: 126000,
    status: "selesai",
    approvedAt: "2026-04-19 20:00",
  },
  {
    id: "SES-20260418-001",
    tutorId: "TUT-003",
    siswaId: "SIS-002",
    mapelId: "MAP-002",
    tanggal: "2026-04-18",
    waktuMulai: "16:00",
    durasi: 90,
    buktiUrl: "https://via.placeholder.com/800x600",
    catatan: "Aljabar dasar",
    feeBersih: 81000,
    status: "selesai",
    approvedAt: "2026-04-18 19:00",
  },
];

// ============= PAYOUT DATA =============

export interface Payout {
  id: string;
  tutorId: string;
  periodeStart: string;
  periodeEnd: string;
  jumlahSesi: number;
  totalNominal: number;
  status: "disetujui" | "diproses" | "sudah-payout";
  tanggalTransfer?: string;
  sessionIds: string[];
}

export const payouts: Payout[] = [
  {
    id: "TRX-20260420-W16-M",
    tutorId: "TUT-001",
    periodeStart: "2026-04-14",
    periodeEnd: "2026-04-20",
    jumlahSesi: 8,
    totalNominal: 540000,
    status: "disetujui",
    sessionIds: ["SES-20260420-001"],
  },
  {
    id: "TRX-20260420-W16-B",
    tutorId: "TUT-002",
    periodeStart: "2026-04-14",
    periodeEnd: "2026-04-20",
    jumlahSesi: 5,
    totalNominal: 630000,
    status: "diproses",
    sessionIds: ["SES-20260419-001"],
  },
  {
    id: "TRX-20260413-W15-M",
    tutorId: "TUT-001",
    periodeStart: "2026-04-07",
    periodeEnd: "2026-04-13",
    jumlahSesi: 10,
    totalNominal: 675000,
    status: "sudah-payout",
    tanggalTransfer: "2026-04-14",
    sessionIds: [],
  },
  {
    id: "TRX-20260413-W15-B",
    tutorId: "TUT-002",
    periodeStart: "2026-04-07",
    periodeEnd: "2026-04-13",
    jumlahSesi: 7,
    totalNominal: 882000,
    status: "sudah-payout",
    tanggalTransfer: "2026-04-14",
    sessionIds: [],
  },
];

// ============= HELPER FUNCTIONS =============

export const getLevelById = (id: string) => levels.find((l) => l.id === id);
export const getLevelByName = (name: string) =>
  levels.find((l) => l.nama === name);
export const getMapelById = (id: string) => mapels.find((m) => m.id === id);
export const getTutorById = (id: string) => tutors.find((t) => t.id === id);
export const getSiswaById = (id: string) => siswas.find((s) => s.id === id);
export const getPresensiById = (id: string) =>
  presensis.find((p) => p.id === id);

export const calculateFee = (levelId: string, durasi: number): number => {
  const level = getLevelById(levelId);
  if (!level) return 0;
  const hargaPerMenit = level.harga / 60;
  const total = hargaPerMenit * durasi;
  return Math.round(total * 0.9); // 90% untuk tutor
};

export const calculateAdminCommission = (
  levelId: string,
  durasi: number,
): number => {
  const level = getLevelById(levelId);
  if (!level) return 0;
  const hargaPerMenit = level.harga / 60;
  const total = hargaPerMenit * durasi;
  return Math.round(total * 0.1); // 10% untuk admin
};

export const getPresensiByTutor = (tutorId: string) =>
  presensis.filter((p) => p.tutorId === tutorId);
export const getPresensiByStatus = (status: Presensi["status"]) =>
  presensis.filter((p) => p.status === status);
export const getPayoutByTutor = (tutorId: string) =>
  payouts.filter((p) => p.tutorId === tutorId);

// Dashboard Statistics
export const getStatistics = () => {
  const today = new Date().toISOString().split("T")[0];
  const todayPresensis = presensis.filter((p) => p.tanggal === today);
  const activeTutors = tutors.filter((t) => t.status === "aktif").length;
  const activeSiswas = siswas.filter((s) => s.status === "aktif").length;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthPresensis = presensis.filter(
    (p) => p.tanggal.startsWith(currentMonth) && p.status === "selesai",
  );
  const monthRevenue = monthPresensis.reduce((sum, p) => {
    const siswa = getSiswaById(p.siswaId);
    if (!siswa) return sum;
    return sum + calculateAdminCommission(siswa.levelId, p.durasi);
  }, 0);

  return {
    todayPresensis: todayPresensis.length,
    activeTutors,
    activeSiswas,
    monthRevenue,
    pendingApprovals: getPresensiByStatus("pending").length,
  };
};

// Authentication Data - Sinkron dengan Akun Tutor & Admin

export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  nama: string;
  email: string;
  role: 'admin';
  status: 'aktif' | 'nonaktif';
}

export interface TutorLoginAccount {
  id: string;
  tutorId: string;
  username: string;
  password: string;
  nama: string;
  email: string;
  role: 'tutor';
  status: 'aktif' | 'nonaktif';
}

// Admin Accounts
export const adminAccounts: AdminAccount[] = [
  {
    id: 'ADM-001',
    username: 'admin',
    password: 'admin123', // Demo password
    nama: 'Admin Utama',
    email: 'admin@bimbelmelly.com',
    role: 'admin',
    status: 'aktif',
  },
];

// Tutor Login Accounts - Sinkron dengan Pengaturan > Keamanan & Akun
// Password default untuk demo: nama_tutor (lowercase, no space)
export const tutorLoginAccounts: TutorLoginAccount[] = [
  {
    id: 'ACC-001',
    tutorId: 'TUT-001',
    username: 'mellysa',
    password: 'mellysa123', // Demo password
    nama: 'Mellysa',
    email: 'mellysa@bimbelmelly.com',
    role: 'tutor',
    status: 'aktif',
  },
  {
    id: 'ACC-002',
    tutorId: 'TUT-002',
    username: 'budi.santoso',
    password: 'budi123', // Demo password
    nama: 'Budi Santoso',
    email: 'budi.santoso@bimbelmelly.com',
    role: 'tutor',
    status: 'aktif',
  },
  {
    id: 'ACC-003',
    tutorId: 'TUT-003',
    username: 'dedi.prasetyo',
    password: 'dedi123', // Demo password
    nama: 'Dedi Prasetyo',
    email: 'dedi.prasetyo@bimbelmelly.com',
    role: 'tutor',
    status: 'aktif',
  },
];

export type UserAccount = AdminAccount | TutorLoginAccount;

// Authentication Functions
export const authenticateUser = (
  username: string,
  password: string
): UserAccount | null => {
  // Check admin accounts
  const admin = adminAccounts.find(
    (a) => a.username === username && a.password === password && a.status === 'aktif'
  );
  if (admin) return admin;

  // Check tutor accounts
  const tutor = tutorLoginAccounts.find(
    (t) => t.username === username && t.password === password && t.status === 'aktif'
  );
  if (tutor) return tutor;

  return null;
};

export const getUserByUsername = (username: string): UserAccount | null => {
  const admin = adminAccounts.find((a) => a.username === username);
  if (admin) return admin;

  const tutor = tutorLoginAccounts.find((t) => t.username === username);
  if (tutor) return tutor;

  return null;
};

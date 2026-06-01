export interface TutorResponse {
  id: string;
  kode: string;

  nama: string;
  email: string;
  posisi: string;
  noWa: string;

  alamat?: string;
  namaBank?: string;
  noRek?: string;

  status: boolean;

  totalStudents: number; // 🔥 penting
}

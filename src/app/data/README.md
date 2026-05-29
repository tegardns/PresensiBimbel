# Sistem Data Terpusat - BimbelMelly Admin Dashboard

## Overview

Semua data mock dalam aplikasi ini sekarang tersinkronisasi melalui file central `mockData.ts`. Ini memastikan konsistensi data di seluruh aplikasi dan memudahkan maintenance.

## Struktur Data

### 1. Master Data

#### Levels (LVL-001 - LVL-004)
- **Calistung**: Rp 40.000 (60, 90, 120 menit)
- **SD**: Rp 50.000 (60, 90, 120 menit)
- **SMP**: Rp 60.000 (60, 90, 120, 150, 180 menit)
- **SMA**: Rp 70.000 (60, 90, 120, 150, 180 menit)

#### Tutors (TUT-001 - TUT-003)
- TUT-001: Mellysa (BCA - 1234567890)
- TUT-002: Budi Santoso (Mandiri - 0987654321)
- TUT-003: Dedi Prasetyo (BNI - 5556667778)

#### Siswa (SIS-001 - SIS-006)
- SIS-001: Ahmad Rizki (SD)
- SIS-002: Budi Santoso (SMP)
- SIS-003: Dedi Prasetyo (SMA)
- SIS-004: Eka Putri (SD)
- SIS-005: Fahmi Rahman (SMP)
- SIS-006: Gita Sari (SMA)

#### Mata Pelajaran (MAP-001 - MAP-012)
- Matematika: SD, SMP, SMA
- Fisika: SMP, SMA
- Kimia: SMP, SMA
- Biologi: SMP, SMA
- Bahasa Inggris: SD, SMP, SMA

### 2. Transactional Data

#### Presensi
Status:
- **pending**: Menunggu approval admin
- **disetujui**: Disetujui admin, masuk ke perhitungan payout
- **ditolak**: Ditolak admin
- **selesai**: Sudah di-payout ke tutor

#### Payout
Status:
- **disetujui**: Siap diproses
- **diproses**: Sedang dalam proses transfer
- **sudah-payout**: Transfer selesai

## Relasi Data

```
Level (1) ----< (N) Siswa
Level (1) ----< (N) Mapel

Tutor (1) ----< (N) Presensi
Siswa (1) ----< (N) Presensi
Mapel (1) ----< (N) Presensi

Tutor (1) ----< (N) Payout
Payout (1) ----< (N) Presensi (via sessionIds)
```

## Perhitungan Fee

### Fee Tutor (90%)
```typescript
feeTutor = (hargaLevel / 60) * durasi * 0.9
```

### Komisi Admin (10%)
```typescript
komisiAdmin = (hargaLevel / 60) * durasi * 0.1
```

### Contoh:
- Level SMA: Rp 70.000
- Durasi: 120 menit
- Fee Tutor: (70000/60) * 120 * 0.9 = Rp 126.000
- Komisi Admin: (70000/60) * 120 * 0.1 = Rp 14.000
- **Total**: Rp 140.000

## Helper Functions

### Getter Functions
```typescript
getLevelById(id: string): Level | undefined
getLevelByName(name: string): Level | undefined
getMapelById(id: string): Mapel | undefined
getTutorById(id: string): Tutor | undefined
getSiswaById(id: string): Siswa | undefined
getPresensiById(id: string): Presensi | undefined
```

### Calculation Functions
```typescript
calculateFee(levelId: string, durasi: number): number
calculateAdminCommission(levelId: string, durasi: number): number
```

### Filter Functions
```typescript
getPresensiByTutor(tutorId: string): Presensi[]
getPresensiByStatus(status: string): Presensi[]
getPayoutByTutor(tutorId: string): Payout[]
```

### Statistics
```typescript
getStatistics(): {
  todayPresensis: number
  activeTutors: number
  activeSiswas: number
  monthRevenue: number
  pendingApprovals: number
}
```

## Cara Menggunakan

### Import Data
```typescript
import { 
  tutors, 
  siswas, 
  levels, 
  mapels,
  presensis,
  payouts,
  getTutorById,
  calculateFee
} from '../../data/mockData';
```

### Contoh Penggunaan
```typescript
// Mendapatkan data tutor
const tutor = getTutorById('TUT-001');

// Mendapatkan semua presensi pending
const pendingPresensi = presensis.filter(p => p.status === 'pending');

// Menghitung fee
const fee = calculateFee('LVL-004', 120); // SMA, 120 menit

// Transform untuk UI
const presensiUI = presensis.map(p => {
  const tutor = getTutorById(p.tutorId);
  const siswa = getSiswaById(p.siswaId);
  return {
    ...p,
    tutorNama: tutor?.nama,
    siswaNama: siswa?.nama
  };
});
```

## Data Flow

1. **Master Data** → Digunakan oleh semua modul
2. **Presensi** → Dibuat oleh tutor, approved by admin
3. **Approved Presensi** → Masuk ke perhitungan payout
4. **Payout** → Diproses mingguan (Minggu - Sabtu)
5. **Statistics** → Dihitung realtime dari data presensi & payout

## Komponen yang Sudah Terintegrasi

✅ Master Data
- DataTutor
- DataSiswa
- DataMapel
- DataLevel

✅ Presensi
- AntreanPersetujuan
- RiwayatPresensi
- RekapJamMengajar

✅ Keuangan
- PayoutMingguan
- RiwayatPembayaran
- LaporanPendapatan

✅ Dashboard
- Statistics Cards
- Charts & Graphs

✅ Pengaturan
- KeamananAkun (Tutor Accounts)

## Notes

- Semua data mock bersifat **consistent** - ID yang sama merujuk ke entitas yang sama
- Data **relational** - perubahan di master data akan reflect di semua tempat
- **Validation** - helper functions memastikan data integrity
- **Type-safe** - semua interface di-export untuk type checking

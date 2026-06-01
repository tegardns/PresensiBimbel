# PresensiBimbel

Frontend dan backend untuk sistem presensi tutor pada Bimbel Saka.

Project ini terdiri dari dua bagian utama:

1. **Frontend** — React + Vite untuk tampilan admin dan tutor.
2. **Backend** — Express + TypeScript + Prisma untuk API, autentikasi, master data, presensi, dan keuangan.

---

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Material UI
- Axios
- React Router

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Supabase
- JWT Authentication
- bcrypt / bcryptjs
- Multer
- Sharp
- Zod

---

## Struktur Folder

```txt
PresensiBimbel/
├── bimbel-backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── components_tutor/
│   │   ├── data/
│   │   ├── App.tsx
│   │   └── TutorDashboard.tsx
│   ├── services/
│   │   └── api.ts
│   ├── styles/
│   ├── utils/
│   ├── app.tsx
│   └── main.tsx
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## Fitur Utama
### Admin
- Login admin
- Dashboard
- Master data tutor
- Master data siswa
- Master data level
- Master data mata pelajaran
- Data presensi
- Data keuangan
- Riwayat pembayaran
- Payout mingguan
- Pengaturan sistem
### Tutor
- Login tutor
- Dashboard tutor
- Tambah presensi
- Riwayat presensi
- Pengaturan akun tutor

---

## Database
Project ini menggunakan PostgreSQL dengan Prisma ORM.
Model utama yang digunakan:
- User
- Tutor
- Student
- Level
- Subject
- Attendance
- Finance
Enum utama:
- Role
  - admin
  - tutor
- AttendanceStatus
  - tertunda
  - disetujui
  - ditolak
  - diselesaikan
  - selesai

 ---
 
## Cara Menjalankan Project
1. Clone repository
   ```txt
   git clone https://github.com/tegardns/PresensiBimbel.git
   cd PresensiBimbel
   ```
3. Pindah ke branch development
   ```txt
   git checkout development
   ```
   Jika branch belum tersedia di lokal:
   ``` txt
   git fetch origin
   git checkout -b development origin/development
   ```
   
 ---
 
 ### Menjalankan Frontend
 Pastikan berada di folder root project:
 ```txt
 npm install
npm run dev
```
Frontend akan berjalan di:
```txt
http://localhost:5173
```

---
### Menjalankan Backend
Masuk ke folder backend:
```txt
cd bimbel-backend
```
Install dependencies:
```txt
npm install
```
Buat file .env berdasarkan konfigurasi database masing-masing.
Contoh:
```txt
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your_jwt_secret"
PORT=4000
```
Generate Prisma Client:
```txt
npx prisma generate
```
Jalankan migration:
```txt
npx prisma migrate dev
```
Jalankan seed:
```txt
npm run seed
```
Jalankan backend:
```txt
npm run dev
```
Backend akan berjalan di:
```txt
http://localhost:4000
```

---

## Endpoint API Utama
Beberapa endpoint yang tersedia:
```txt
GET    /api/levels
GET    /api/subjects
GET    /api/students
GET    /api/tutors
GET    /api/attendances
GET    /api/finance
POST   /api/auth/login
```
Endpoint dapat bertambah sesuai pengembangan fitur.
 
---

## Script Frontend
Dijalankan dari root project:
```txt
npm run dev
npm run build
```

---

## Script Backend
Dijalankan dari folder bimbel-backend:
```txt
npm run dev
npm run build
npm run start
npm run seed
```

---

## Catatan Development
Project ini dikembangkan pada branch:
```txt
development
```
Branch main digunakan untuk versi stabil.
Gunakan branch development untuk eksperimen, integrasi fitur, refactor, dan perbaikan bug sebelum digabungkan ke main.

---

## Alur Git yang Disarankan
Sebelum mulai coding:
```txt
git checkout development
git pull origin development
```
Setelah melakukan perubahan:
```txt
git status
git add .
git commit -m "update dokumentasi project"
git push origin development
```

---

## Catatan Keamanan
File berikut tidak boleh di-push ke GitHub:
```txt
.env
node_modules/
dist/
backup.sql
schema.sql
```
Gunakan .env.example jika ingin membagikan contoh konfigurasi environment tanpa membocorkan credential asli.

---

## Status Project
Project masih dalam tahap development.
Beberapa fitur sudah terhubung dengan database Supabase, terutama bagian:
- Login
- Dashboard
- Master data

Yang masih belum:
- Presensi
- Keuangan

Pengembangan berikutnya ialah penghubungan fitur Presensi dan Keuangan dengan database Supabase. Kemudian nanti akan difokuskan pada stabilisasi fitur, validasi data, error handling, dan perapian struktur folder.


---

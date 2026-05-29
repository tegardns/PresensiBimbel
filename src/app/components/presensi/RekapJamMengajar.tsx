import { useState } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

interface TutorRekap {
  tutorId: string;
  tutorNama: string;
  totalSesi: number;
  totalDurasi: number;
  totalPendapatan: number;
  rank: number;
}

const mockRekap: TutorRekap[] = [
  {
    tutorId: 'TUT-001',
    tutorNama: 'Mellysa',
    totalSesi: 32,
    totalDurasi: 48,
    totalPendapatan: 1536000,
    rank: 1,
  },
  {
    tutorId: 'TUT-002',
    tutorNama: 'Budi Santoso',
    totalSesi: 28,
    totalDurasi: 42,
    totalPendapatan: 1344000,
    rank: 2,
  },
  {
    tutorId: 'TUT-003',
    tutorNama: 'Dedi Prasetyo',
    totalSesi: 24,
    totalDurasi: 36,
    totalPendapatan: 1152000,
    rank: 3,
  },
];

export function RekapJamMengajar() {
  const [periode, setPeriode] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">Rekap Produktivitas Tutor</h3>
            <p className="text-sm text-gray-500">
              Monitoring performa dan jam mengajar tutor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
          </select>

          <input
            type="month"
            defaultValue="2026-04"
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tutor Aktif</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Jam Mengajar</p>
              <p className="text-2xl font-bold">284 jam</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sesi</p>
              <p className="text-2xl font-bold">156 sesi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Ranking</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Nama Tutor</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Total Sesi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Total Durasi (Jam)</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Total Pendapatan</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Avg per Sesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockRekap.map((tutor) => (
                <tr
                  key={tutor.tutorId}
                  className={`hover:bg-gray-50 transition-colors ${
                    tutor.rank === 1 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {tutor.rank <= 3 ? (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                            tutor.rank === 1
                              ? 'bg-yellow-500'
                              : tutor.rank === 2
                              ? 'bg-gray-400'
                              : 'bg-orange-400'
                          }`}
                        >
                          {tutor.rank}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                          {tutor.rank}
                        </div>
                      )}
                      {tutor.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {tutor.tutorNama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{tutor.tutorNama}</p>
                        <p className="text-xs text-gray-500">{tutor.tutorId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{tutor.totalSesi} sesi</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{tutor.totalDurasi} jam</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-green-600">
                      {formatRupiah(tutor.totalPendapatan)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {formatRupiah(tutor.totalPendapatan / tutor.totalSesi)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Tips Evaluasi Performa</h4>
            <p className="text-sm text-blue-700">
              Gunakan data rekap ini untuk memberikan reward kepada tutor terbaik atau evaluasi tutor yang perlu peningkatan produktivitas. Anda dapat export data ini untuk laporan manajemen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

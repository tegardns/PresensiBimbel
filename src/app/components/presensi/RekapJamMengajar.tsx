import { useState, useEffect } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import api from '../../../services/api';

interface TutorRekap {
  tutorId: string;
  tutorNama: string;
  totalSesi: number;
  totalDurasi: number;
  totalPendapatan: number;
  rank: number;
}

interface RekapData {
  totalTutors: number;
  totalJam: number;
  totalSesi: number;
  rekapList: TutorRekap[];
}

export function RekapJamMengajar() {
  const [periode, setPeriode] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [rekap, setRekap] = useState<RekapData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRekap = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendances/rekap');
      setRekap(response.data);
    } catch (error) {
      console.error('Gagal mengambil data rekap jam mengajar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekap();
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500 font-medium bg-gray-50/50 rounded-2xl border border-gray-250/60">
        Memuat data rekap produktivitas tutor...
      </div>
    );
  }

  const data = rekap || {
    totalTutors: 0,
    totalJam: 0,
    totalSesi: 0,
    rekapList: []
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Rekap Jam Mengajar & Produktivitas Tutor</h3>
            <p className="text-sm text-gray-500 font-medium">
              Monitoring performa mengajar tutor secara real-time dari database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-gray-700"
          >
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
          </select>

          <input
            type="month"
            defaultValue="2026-06"
            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-gray-700 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-50 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Tutor Aktif</p>
              <p className="text-2xl font-extrabold text-gray-800">{data.totalTutors} tutor</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-50 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Jam Mengajar</p>
              <p className="text-2xl font-extrabold text-gray-800">{data.totalJam} jam</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-50 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Sesi Diajar</p>
              <p className="text-2xl font-extrabold text-gray-800">{data.totalSesi} sesi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ranking</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Nama Tutor</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Total Sesi</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Total Durasi</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Total Pendapatan</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Avg per Sesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.rekapList.map((tutor) => (
                <tr
                  key={tutor.tutorId}
                  className={`hover:bg-gray-50/50 transition-colors ${
                    tutor.rank === 1 ? 'bg-yellow-50/30' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {tutor.rank <= 3 ? (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            tutor.rank === 1
                              ? 'bg-yellow-500 shadow-xs'
                              : tutor.rank === 2
                              ? 'bg-gray-400'
                              : 'bg-orange-400'
                          }`}
                        >
                          {tutor.rank}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-bold">
                          {tutor.rank}
                        </div>
                      )}
                      {tutor.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-xs">
                        {tutor.tutorNama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{tutor.tutorNama}</p>
                        <p className="text-xs text-gray-500 font-medium font-mono">{tutor.tutorId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-700">{tutor.totalSesi} sesi</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-700">{tutor.totalDurasi} jam</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-extrabold text-green-600">
                      {formatRupiah(tutor.totalPendapatan)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-medium">
                      {formatRupiah(tutor.totalSesi > 0 ? tutor.totalPendapatan / tutor.totalSesi : 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.rekapList.length === 0 && (
          <div className="text-center py-16 text-gray-500 font-medium bg-gray-50/50">
            Belum ada aktivitas presensi mengajar yang disetujui
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 mb-1 text-sm">Tips Evaluasi Performa</h4>
            <p className="text-sm text-blue-700 leading-relaxed font-medium">
              Gunakan data rekap ini untuk memberikan reward kepada tutor terbaik atau evaluasi tutor yang perlu peningkatan produktivitas mengajar. Data ini dihitung dinamis dari presensi yang berstatus disetujui atau sudah selesai payout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

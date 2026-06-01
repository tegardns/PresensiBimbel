import { TrendingUp, DollarSign, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { id: 'month-jan', bulan: 'Jan', grossRevenue: 8400000, adminProfit: 840000 },
  { id: 'month-feb', bulan: 'Feb', grossRevenue: 9200000, adminProfit: 920000 },
  { id: 'month-mar', bulan: 'Mar', grossRevenue: 10100000, adminProfit: 1010000 },
  { id: 'month-apr', bulan: 'Apr', grossRevenue: 11200000, adminProfit: 1120000 },
];

const weeklyData = [
  { id: 'week-1', minggu: 'W1', gross: 2400000, profit: 240000 },
  { id: 'week-2', minggu: 'W2', gross: 2800000, profit: 280000 },
  { id: 'week-3', minggu: 'W3', gross: 3200000, profit: 320000 },
  { id: 'week-4', minggu: 'W4', gross: 2800000, profit: 280000 },
];

const topTutorRevenue = [
  { nama: 'Mellysa', totalGross: 3200000, adminShare: 320000, sessions: 32 },
  { nama: 'Budi Santoso', totalGross: 2800000, adminShare: 280000, sessions: 28 },
  { nama: 'Dedi Prasetyo', totalGross: 2400000, adminShare: 240000, sessions: 24 },
  { nama: 'Rina Putri', totalGross: 2000000, adminShare: 200000, sessions: 20 },
  { nama: 'Agus Wijaya', totalGross: 1600000, adminShare: 160000, sessions: 16 },
];

interface LaporanPendapatanProps {
  data?: {
    monthlyData: Array<{
      bulan: string;
      grossRevenue: number;
      adminProfit: number;
    }>;
    weeklyData: Array<{
      minggu: string;
      gross: number;
      profit: number;
    }>;
    topTutorRevenue: Array<{
      nama: string;
      totalGross: number;
      adminShare: number;
      sessions: number;
    }>;
  };
}

export function LaporanPendapatan({ data }: LaporanPendapatanProps = {}) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const activeMonthlyData = data?.monthlyData || [];
  const activeWeeklyData = data?.weeklyData || [];
  const activeTopTutorRevenue = data?.topTutorRevenue || [];

  const latestMonthData = activeMonthlyData[activeMonthlyData.length - 1] || { grossRevenue: 0, adminProfit: 0, bulan: '-' };
  const prevMonthData = activeMonthlyData[activeMonthlyData.length - 2] || { grossRevenue: 0, adminProfit: 0, bulan: '-' };

  const totalGrossApril = latestMonthData.grossRevenue;
  const totalProfitApril = latestMonthData.adminProfit;
  
  const growthRateVal = prevMonthData.adminProfit > 0 
    ? ((totalProfitApril - prevMonthData.adminProfit) / prevMonthData.adminProfit * 100)
    : 0.0;
  const growthRate = growthRateVal.toFixed(1);
  const growthText = parseFloat(growthRate) >= 0 ? `+${growthRate}%` : `${growthRate}%`;

  const latestMonthName = latestMonthData.bulan;

  const handleExport = (format: 'excel' | 'pdf') => {
    alert(`Exporting laporan pendapatan ke format ${format.toUpperCase()}...\n\nFungsi export akan diimplementasikan.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-green-100">Total Gross Revenue {latestMonthName}</p>
              <p className="text-3xl font-bold">{formatRupiah(totalGrossApril)}</p>
            </div>
          </div>
          <p className="text-sm text-green-100 mt-2">Dari semua transaksi bimbingan belajar</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-100">Profit Admin (10%) {latestMonthName}</p>
              <p className="text-3xl font-bold">{formatRupiah(totalProfitApril)}</p>
            </div>
          </div>
          <p className="text-sm text-blue-100 mt-2">Potongan dari setiap transaksi</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-purple-100">Pertumbuhan Bulan Ini</p>
              <p className="text-3xl font-bold">{growthText}</p>
            </div>
          </div>
          <p className="text-sm text-purple-100 mt-2">Dibandingkan bulan lalu</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Tren Pendapatan Bulanan</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold mb-4">Perbandingan Gross Revenue vs Admin Profit (Bulanan)</h4>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={activeMonthlyData} key="monthly-revenue-chart">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => formatRupiah(Number(value))}
              contentStyle={{ borderRadius: '8px' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="grossRevenue"
              stroke="#10B981"
              strokeWidth={3}
              name="Gross Revenue (100%)"
              dot={{ fill: '#10B981', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="adminProfit"
              stroke="#2563EB"
              strokeWidth={3}
              name="Admin Profit (10%)"
              dot={{ fill: '#2563EB', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold mb-4">Breakdown Mingguan {latestMonthName} 2026</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activeWeeklyData} key="weekly-breakdown-chart">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="minggu" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => formatRupiah(Number(value))}
              contentStyle={{ borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="gross" fill="#10B981" name="Gross Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="profit" fill="#2563EB" name="Admin Profit" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold mb-4">Top 5 Tutor Berdasarkan Revenue</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Ranking</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Nama Tutor</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Jumlah Sesi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Total Gross Revenue</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Admin Share (10%)</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Kontribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeTopTutorRevenue.map((tutor, index) => {
                const contribution = totalProfitApril > 0 ? ((tutor.adminShare / totalProfitApril) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {tutor.nama.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium">{tutor.nama}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium">{tutor.sessions} sesi</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-green-600">
                        {formatRupiah(tutor.totalGross)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-blue-600">
                        {formatRupiah(tutor.adminShare)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${contribution}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{contribution}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-semibold">Total:</td>
                <td className="px-6 py-4 font-bold text-green-600 text-lg">
                  {formatRupiah(activeTopTutorRevenue.reduce((sum, t) => sum + t.totalGross, 0))}
                </td>
                <td className="px-6 py-4 font-bold text-blue-600 text-lg">
                  {formatRupiah(activeTopTutorRevenue.reduce((sum, t) => sum + t.adminShare, 0))}
                </td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
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
            <h4 className="font-medium text-blue-900 mb-1">Catatan Perhitungan</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>Gross Revenue:</strong> Total pembayaran dari siswa untuk semua sesi bimbingan</li>
              <li><strong>Fee Tutor:</strong> 90% dari gross revenue yang dibayarkan kepada tutor</li>
              <li><strong>Admin Profit:</strong> 10% dari gross revenue sebagai potongan admin</li>
              <li>Payout dilakukan setiap minggu dengan periode Minggu - Sabtu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

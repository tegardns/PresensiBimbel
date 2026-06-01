import { useState, useEffect } from 'react';
import { PayoutMingguan } from './keuangan/PayoutMingguan';
import { RiwayatPembayaran } from './keuangan/RiwayatPembayaran';
import { LaporanPendapatan } from './keuangan/LaporanPendapatan';
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import api from '../../services/api';

interface SummaryData {
  totalReadyToPay: number;
  totalTutorsWaiting: number;
  estimatedProfitThisMonth: number;
  profitGrowthRate: number;
}

export function Keuangan() {
  const [activeTab, setActiveTab] = useState('payout');
  const [summary, setSummary] = useState<SummaryData>({
    totalReadyToPay: 0,
    totalTutorsWaiting: 0,
    estimatedProfitThisMonth: 0,
    profitGrowthRate: 12.0
  });
  const [payoutList, setPayoutList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any>({
    monthlyData: [],
    weeklyData: [],
    topTutorRevenue: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'payout', label: 'Payout Mingguan' },
    { id: 'riwayat', label: 'Riwayat Pembayaran' },
    { id: 'laporan', label: 'Laporan Pendapatan' },
  ];

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/finance');
      setSummary(res.data.summary);
      setPayoutList(res.data.payout);
      setHistoryList(res.data.history);
      setReportsData(res.data.reports);
    } catch (error) {
      console.error("Gagal memuat data keuangan dari database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px] text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="font-medium text-sm">Memuat data manajemen keuangan...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-3">Manajemen Keuangan & Payout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-blue-100 font-medium">Total Saldo Siap Bayar</p>
                <p className="text-3xl font-bold">{formatRupiah(summary.totalReadyToPay)}</p>
              </div>
            </div>
            <p className="text-sm text-blue-100 mt-3 font-medium">
              {summary.totalTutorsWaiting} tutor menunggu pembayaran minggu ini
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-green-100 font-medium">Estimasi Profit Admin Bulan Ini</p>
                <p className="text-3xl font-bold">{formatRupiah(summary.estimatedProfitThisMonth)}</p>
              </div>
            </div>
            <p className="text-sm text-green-100 mt-3 font-medium">
              {summary.profitGrowthRate >= 0 ? `+${summary.profitGrowthRate}%` : `${summary.profitGrowthRate}%`} dibanding bulan lalu
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'payout' && (
        <PayoutMingguan data={payoutList} onPayoutSuccess={fetchFinance} />
      )}
      {activeTab === 'riwayat' && (
        <RiwayatPembayaran data={historyList} />
      )}
      {activeTab === 'laporan' && (
        <LaporanPendapatan data={reportsData} />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Settings, User } from 'lucide-react';

interface Session {
  id: string;
  date: string;
  sessionId: string;
  amount: number;
  status: 'diselesaikan' | 'tertunda' | 'disetujui' | 'selesai';
  student: string;
  subject: string;
  duration: number;
  notes?: string;
  photoUrl?: string;
}

interface PayoutTransaction {
  id: string;
  transactionId: string;
  date: string;
  amount: number;
  status: 'diproses' | 'sudah-payout';
}

interface HomePageProps {
  tutorName: string;
  tutorPhoto?: string;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

export default function HomePage({ tutorName, tutorPhoto, onNavigateToSettings, onLogout }: HomePageProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Mock data - Rate: Rp 32.000 per jam
  const sessions: Session[] = [
    { id: '1', date: '2026-04-18', sessionId: 'SES-20260418-001', amount: 48000, status: 'disetujui', student: 'Ahmad', subject: 'Matematika', duration: 90 },
    { id: '2', date: '2026-04-17', sessionId: 'SES-20260417-002', amount: 64000, status: 'disetujui', student: 'Budi', subject: 'Fisika', duration: 120 },
    { id: '3', date: '2026-04-16', sessionId: 'SES-20260416-003', amount: 48000, status: 'tertunda', student: 'Citra', subject: 'Matematika', duration: 90 },
    { id: '4', date: '2026-04-15', sessionId: 'SES-20260415-004', amount: 32000, status: 'diselesaikan', student: 'Dedi', subject: 'Fisika', duration: 60 },
  ];

  // Mock payout transactions
  const payoutTransactions: PayoutTransaction[] = [
    { id: '1', transactionId: 'TRX-20260420-W3', date: '2026-04-20', amount: 384000, status: 'diproses' },
    { id: '2', transactionId: 'TRX-20260413-W2', date: '2026-04-13', amount: 256000, status: 'sudah-payout' },
    { id: '3', transactionId: 'TRX-20260406-W1', date: '2026-04-06', amount: 512000, status: 'sudah-payout' },
    { id: '4', transactionId: 'TRX-20260330-W4', date: '2026-03-30', amount: 448000, status: 'sudah-payout' },
  ];

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const totalSessions = sessions.length;
  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
  const settledAmount = sessions.filter(s => s.status === 'diselesaikan').reduce((sum, s) => sum + s.amount, 0);
  const pendingAmount = 0; // No tertunda sessions
  const approvedAmount = sessions.filter(s => s.status === 'disetujui' || s.status === 'selesai').reduce((sum, s) => sum + s.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'diproses':
        return 'bg-blue-500/10 text-blue-600';
      case 'sudah-payout':
        return 'bg-green-500/10 text-green-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getTransactionStatusLabel = (status: string) => {
    switch (status) {
      case 'diproses':
        return 'Diproses';
      case 'sudah-payout':
        return 'Sudah Payout';
      default:
        return status;
    }
  };

  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const today = new Date();
    const next = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1);
    // Don't allow navigating beyond current month
    if (next <= today) {
      setSelectedMonth(next);
    }
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return selectedMonth.getMonth() === today.getMonth() &&
           selectedMonth.getFullYear() === today.getFullYear();
  };

  const formatCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const day = days[currentDateTime.getDay()];
    const date = currentDateTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${day}, ${date}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-5 pt-5 pb-3 text-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tight">
            BimbelMelly
          </h1>
        </div>
        <div className="px-5 pb-4 flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="size-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white overflow-hidden"
            >
              {tutorPhoto ? (
                <img src={tutorPhoto} alt={tutorName} className="size-full object-cover" />
              ) : (
                <User className="size-5" />
              )}
            </button>
            {showDropdown && (
              <div className="absolute top-12 left-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-w-[160px] z-20">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onNavigateToSettings();
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left"
                >
                  <Settings className="size-4 text-gray-600" />
                  <span className="text-sm">Pengaturan</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left border-t border-gray-100"
                >
                  <LogOut className="size-4 text-red-600" />
                  <span className="text-sm text-red-600">Keluar</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-base text-gray-900">{tutorName}</h2>
            <p className="text-xs text-gray-500">Tentor</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-900 font-medium">{formatCurrentDate()}</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white border-b border-gray-100 px-5 py-3">
        <div className="flex items-center justify-between">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <ChevronLeft className="size-5 text-gray-600" />
          </button>
          <h2 className="font-semibold text-gray-900">
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth()}
            className="p-2 hover:bg-gray-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="size-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-5 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Total Sesi</p>
          <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Total Jam</p>
          <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="px-5 py-2">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Pendapatan</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center opacity-50">
              <span className="text-sm text-gray-600">Diselesaikan</span>
              <span className="font-semibold text-gray-900">{formatCurrency(settledAmount)}</span>
            </div>
            <div className="flex justify-between items-center opacity-50">
              <span className="text-sm text-gray-600">Tertunda</span>
              <span className="font-semibold text-gray-900">{formatCurrency(pendingAmount)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Disetujui</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(approvedAmount)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              Saldo yang <span className="font-semibold">"Disetujui"</span> akan ditransfer per minggu pada hari <span className="font-semibold">Minggu</span>
            </p>
          </div>
        </div>
      </div>

      {/* Payout Transactions */}
      <div className="px-5 py-4">
        <h3 className="font-bold text-gray-900 mb-3">Riwayat Transaksi</h3>
        <div className="space-y-3">
          {payoutTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">ID Transaksi</p>
                  <p className="text-sm font-mono text-gray-900 mt-0.5">{transaction.transactionId}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                  {getTransactionStatusLabel(transaction.status)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Tanggal</p>
                  <p className="text-sm text-gray-900 mt-0.5">{formatDate(transaction.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Jumlah</p>
                  <p className="font-bold text-gray-900 mt-0.5">{formatCurrency(transaction.amount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

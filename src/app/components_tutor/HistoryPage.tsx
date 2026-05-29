import { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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

export default function HistoryPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Mock data - Rate: Rp 32.000 per jam (Filter out tertunda sessions)
  const allSessions: Session[] = [
    { id: '1', date: '2026-04-18', sessionId: 'SES-20260418-001', amount: 48000, status: 'diselesaikan', student: 'Ahmad Rizki', subject: 'Matematika', duration: 90, notes: 'Membahas integral dan diferensial' },
    { id: '2', date: '2026-04-17', sessionId: 'SES-20260417-002', amount: 64000, status: 'diselesaikan', student: 'Budi Santoso', subject: 'Fisika', duration: 120, notes: 'Latihan soal gerak parabola' },
    { id: '4', date: '2026-04-15', sessionId: 'SES-20260415-004', amount: 32000, status: 'disetujui', student: 'Dedi Prasetyo', subject: 'Fisika', duration: 60 },
    { id: '5', date: '2026-04-14', sessionId: 'SES-20260414-005', amount: 48000, status: 'disetujui', student: 'Ahmad Rizki', subject: 'Fisika', duration: 90 },
    { id: '7', date: '2026-04-12', sessionId: 'SES-20260412-007', amount: 48000, status: 'selesai', student: 'Citra Dewi', subject: 'Kimia', duration: 90 },
    { id: '8', date: '2026-04-11', sessionId: 'SES-20260411-008', amount: 32000, status: 'selesai', student: 'Dedi Prasetyo', subject: 'Matematika', duration: 60 },
  ];

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  // Sort sessions: Diselesaikan (newest) -> Disetujui -> Selesai
  const getStatusPriority = (status: string) => {
    switch (status) {
      case 'diselesaikan': return 1;
      case 'disetujui': return 2;
      case 'selesai': return 3;
      default: return 4;
    }
  };

  const sortedSessions = [...allSessions].sort((a, b) => {
    const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
    if (priorityDiff !== 0) return priorityDiff;
    // If same status, sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredSessions = sortedSessions.filter(session => {
    if (selectedStatus === 'all') return true;
    return session.status === selectedStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disetujui':
        return 'bg-green-500/10 text-green-600';
      case 'selesai':
        return 'bg-blue-500/10 text-blue-600';
      case 'tertunda':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'diselesaikan':
        return 'bg-gray-500/10 text-gray-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disetujui':
        return 'Disetujui';
      case 'tertunda':
        return 'Tertunda';
      case 'diselesaikan':
        return 'Diselesaikan';
      case 'selesai':
        return 'Selesai';
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

  const statusCounts = {
    all: allSessions.length,
    diselesaikan: allSessions.filter(s => s.status === 'diselesaikan').length,
    disetujui: allSessions.filter(s => s.status === 'disetujui').length,
    tertunda: 0,
    selesai: allSessions.filter(s => s.status === 'selesai').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-5 pt-5 pb-3 text-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tight">
            BimbelMelly
          </h1>
        </div>
        <div className="px-5 pb-4">
          <h2 className="font-bold text-gray-900">Riwayat Sesi</h2>
          <p className="text-xs text-gray-500 mt-0.5">Semua riwayat presensi dan payout</p>
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

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua ({statusCounts.all})
          </button>
          <button
            onClick={() => setSelectedStatus('diselesaikan')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStatus === 'diselesaikan'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Diselesaikan ({statusCounts.diselesaikan})
          </button>
          <button
            onClick={() => setSelectedStatus('disetujui')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStatus === 'disetujui'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Disetujui ({statusCounts.disetujui})
          </button>
          <button
            onClick={() => setSelectedStatus('tertunda')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStatus === 'tertunda'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tertunda ({statusCounts.tertunda})
          </button>
          <button
            onClick={() => setSelectedStatus('selesai')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStatus === 'selesai'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Selesai ({statusCounts.selesai})
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="px-5 py-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="size-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Tidak ada sesi dengan status ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const isSelesai = session.status === 'selesai';
              return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm ${isSelesai ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-600">{formatDate(session.date)}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{session.sessionId}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {getStatusLabel(session.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Siswa</span>
                    <span className="text-sm font-medium text-gray-900">{session.student}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Mata Pelajaran</span>
                    <span className="text-sm font-medium text-gray-900">{session.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Durasi</span>
                    <span className="text-sm font-medium text-gray-900">{session.duration} menit</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <p className="font-bold text-gray-900">{formatCurrency(session.amount)}</p>
                  <button
                    onClick={() => setSelectedSession(session)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedSession(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-gray-900">Detail Sesi</h3>
              <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600 text-xl">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">ID Sesi</p>
                <p className="text-sm font-mono text-gray-900">{selectedSession.sessionId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                <p className="text-sm text-gray-900">{formatDate(selectedSession.date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Siswa</p>
                <p className="text-sm font-medium text-gray-900">{selectedSession.student}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Mata Pelajaran</p>
                <p className="text-sm font-medium text-gray-900">{selectedSession.subject}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Durasi</p>
                <p className="text-sm font-medium text-gray-900">{selectedSession.duration} menit</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Nominal</p>
                <p className="font-bold text-gray-900">{formatCurrency(selectedSession.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status Payout</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                  {getStatusLabel(selectedSession.status)}
                </span>
              </div>
              {selectedSession.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Catatan</p>
                  <p className="text-sm text-gray-900">{selectedSession.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

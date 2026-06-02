import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Edit2, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../services/api';
import { useConfirm } from "../../context/ConfirmContext";

interface SessionDetail {
  tanggal: string;
  siswa: string;
  mapel: string;
  durasi: number;
  fee: number;
}

interface PayoutData {
  id: string;
  tutorId: string;
  tutorKode: string;
  tutorNama: string;
  namaBank: string;
  noRekening: string;
  jumlahSesi: number;
  totalNominal: number;
  status: 'disetujui' | 'diproses' | 'sudah-payout';
  periodeStart: string;
  periodeEnd: string;
  sessions?: SessionDetail[];
}

interface PayoutMingguanProps {
  data: PayoutData[];
  onPayoutSuccess: () => void;
}

export function PayoutMingguan({ data, onPayoutSuccess }: PayoutMingguanProps) {
  const confirm = useConfirm();
  const [payoutList, setPayoutList] = useState<PayoutData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [selectedPayout, setSelectedPayout] = useState<PayoutData | null>(null);
  const [tutorsMap, setTutorsMap] = useState<Record<string, string>>({});

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    setPayoutList(data);
  }, [data]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await api.get('/tutors');
        const map: Record<string, string> = {};
        res.data.forEach((t: any) => {
          map[t.id] = t.kode;
        });
        setTutorsMap(map);
      } catch (error) {
        console.error("Gagal memuat mapping tutor:", error);
      }
    };
    fetchTutors();
  }, []);

  const getCyclePeriod = (startStr: string, endStr: string) => {
    if (!startStr) return "-";

    const startDate = new Date(startStr);
    const startDay = startDate.getDay();
    // Sunday of start date's week
    const sunday = new Date(startDate);
    sunday.setDate(startDate.getDate() - startDay);

    const endDate = endStr ? new Date(endStr) : startDate;
    const endDay = endDate.getDay();
    // Saturday of end date's week
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    return `${formatDate(sunday.toISOString().split('T')[0])} - ${formatDate(saturday.toISOString().split('T')[0])}`;
  };

  const getCurrentCycle = () => {
    const today = new Date();
    const day = today.getDay();

    // Sunday of current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - day);

    // Saturday of current week
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    return `${formatDate(sunday.toISOString().split('T')[0])} - ${formatDate(saturday.toISOString().split('T')[0])}`;
  };

  const isPayoutOverdue = (payout: PayoutData) => {
    if (payout.status === 'sudah-payout') return false;

    const endDateStr = payout.periodeEnd || payout.periodeStart;
    if (!endDateStr) return false;

    const endDate = new Date(endDateStr);
    const endDay = endDate.getDay();
    // Saturday of end date's week
    const saturdayDiff = endDay === 0 ? -1 : 6 - endDay;
    const saturday = new Date(endDate);
    saturday.setDate(endDate.getDate() + saturdayDiff);

    // Sunday of that week is Saturday + 1 day
    const Sunday = new Date(saturday);
    Sunday.setDate(saturday.getDate() + 1);

    // Set Sunday time to end of day (23:59:59)
    Sunday.setHours(23, 59, 59, 999);

    const today = new Date();
    return today > Sunday;
  };

  const handleViewRekap = async (payout: PayoutData) => {
    try {
      const res = await api.get("/attendances");
      const sessions = res.data
        .filter((item: any) => item.tutorId === payout.tutorId && item.status === "disetujui")
        .map((item: any) => ({
          tanggal: item.createdAt || item.tanggal,
          siswa: item.student?.fullName || item.siswaNama || "-",
          mapel: item.subjectName || item.mapelNama || "-",
          durasi: Number(item.durationMin || item.durasi || 60),
          fee: Number(item.feeNet || item.feeBersih || 0),
        }));

      setSelectedPayout({
        ...payout,
        sessions
      });
    } catch (error) {
      console.error("Gagal memuat rekap sesi:", error);
      setSelectedPayout({
        ...payout,
        sessions: payout.sessions || []
      });
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleProsesPayout = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Proses Payout",
      description: 'Proses payout untuk transaksi ini?\n\nStatus akan berubah menjadi "Diproses" dan tutor akan menerima notifikasi.',
      variant: "info",
      confirmText: "Ya, Proses"
    });

    if (isConfirmed) {
      setPayoutList(payoutList.map(p =>
        p.id === id ? { ...p, status: 'diproses' as const } : p
      ));
      toast.success('Status berhasil diubah menjadi "Diproses"');
    }
  };

  const handleSudahPayout = async (id: string, tutorId: string) => {
    const isConfirmed = await confirm({
      title: "Konfirmasi Transfer",
      description: 'Konfirmasi bahwa transfer sudah dilakukan secara manual?\n\nPastikan Anda sudah mentransfer dana ke rekening tutor.',
      variant: "success",
      confirmText: "Selesai Payout"
    });

    if (isConfirmed) {
      try {
        await api.post('/finance/payout', { tutorId });
        toast.success('Transfer gaji tutor berhasil dikonfirmasi dan dicatat ke sistem!');
        onPayoutSuccess();
      } catch (error) {
        console.error("Gagal mengirim payout:", error);
        toast.error("Gagal memproses payout di database.");
      }
    }
  };

  const handleEditNominal = (payout: PayoutData) => {
    setEditingId(payout.id);
    setEditValue(payout.totalNominal);
  };

  const handleSaveEdit = (id: string) => {
    setPayoutList(payoutList.map(p =>
      p.id === id ? { ...p, totalNominal: editValue } : p
    ));
    setEditingId(null);
    toast.success(`Nominal berhasil diupdate menjadi ${formatRupiah(editValue)}`);
  };

  const totalDiproses = payoutList.filter(p => p.status === 'diproses').length;
  const totalMenunggu = payoutList.filter(p => p.status === 'disetujui').length;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Siklus Payout Mingguan</h4>
            <p className="text-sm text-blue-700">
              Periode: <strong>{getCurrentCycle()}</strong> (Minggu - Sabtu)<br />
              Sesi yang dilakukan pada hari Minggu akan masuk ke siklus minggu berikutnya.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            <strong>{totalMenunggu} Transaksi</strong> menunggu diproses
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>{totalDiproses} Transaksi</strong> sedang diproses
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">ID Transaksi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Nama Tutor</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Rekening</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Jumlah Sesi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Total Nominal</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payoutList.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-500 font-mono">{payout.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {payout.tutorNama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{payout.tutorNama}</p>
                        <p className="text-xs text-blue-600 font-mono font-medium">{tutorsMap[payout.tutorId] || payout.tutorKode || payout.tutorId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-medium">{payout.namaBank}</p>
                      <p className="text-xs text-gray-500 font-mono">{payout.noRekening}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium">{payout.jumlahSesi} sesi</span>
                  </td>
                  <td className="px-6 py-5">
                    {editingId === payout.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value))}
                          className="w-32 px-3 py-1 border border-blue-500 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSaveEdit(payout.id)}
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                          title="Simpan"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Batal"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          {formatRupiah(payout.totalNominal)}
                        </span>
                        {payout.status === 'disetujui' && (
                          <button
                            onClick={() => handleEditNominal(payout)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Edit Nominal"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {isPayoutOverdue(payout) ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 font-semibold animate-pulse">
                        <Clock className="w-3 h-3 text-red-600" />
                        Terlambat
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${payout.status === 'sudah-payout'
                            ? 'bg-green-100 text-green-700'
                            : payout.status === 'diproses'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {payout.status === 'sudah-payout' && <CheckCircle className="w-3 h-3" />}
                        {payout.status === 'diproses' && <Clock className="w-3 h-3" />}
                        {payout.status === 'sudah-payout' ? 'Sudah Payout' :
                          payout.status === 'diproses' ? 'Diproses' : 'Disetujui'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewRekap(payout)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Lihat Rekap Sesi"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      {payout.status === 'disetujui' && (
                        <button
                          onClick={() => handleProsesPayout(payout.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Send className="w-4 h-4" />
                          Proses
                        </button>
                      )}
                      {payout.status === 'diproses' && (
                        <button
                          onClick={() => handleSudahPayout(payout.id, payout.tutorId)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Sudah Payout
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payoutList.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada transaksi payout untuk periode ini
          </div>
        )}
      </div>

      {selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPayout(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Rekap Sesi Disetujui</h3>
                <p className="text-sm text-gray-500">{selectedPayout.id}</p>
              </div>
              <button
                onClick={() => setSelectedPayout(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nama Tutor</p>
                  <p className="font-medium">{selectedPayout.tutorNama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID Tutor</p>
                  <p className="font-medium font-mono text-blue-600">{tutorsMap[selectedPayout.tutorId] || selectedPayout.tutorKode || selectedPayout.tutorId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rekening Tujuan</p>
                  <p className="font-medium">{selectedPayout.namaBank} - {selectedPayout.noRekening}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Periode Sesi</p>
                  <p className="font-medium">{getCyclePeriod(selectedPayout.periodeStart, selectedPayout.periodeEnd)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status Pembayaran</p>
                  {isPayoutOverdue(selectedPayout) ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs bg-red-100 text-red-700 font-semibold animate-pulse">
                      <Clock className="w-3 h-3 text-red-600" />
                      Terlambat (Belum Transfer)
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs ${selectedPayout.status === 'sudah-payout'
                          ? 'bg-green-100 text-green-700'
                          : selectedPayout.status === 'diproses'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                    >
                      {selectedPayout.status === 'sudah-payout' ? 'Sudah Payout' :
                        selectedPayout.status === 'diproses' ? 'Diproses' : 'Disetujui'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Rincian Sesi ({selectedPayout.jumlahSesi} sesi)</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">Tanggal</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">Siswa</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">Mata Pelajaran</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">Durasi</th>
                        <th className="text-right px-4 py-3 text-sm text-gray-600">Fee Bersih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(selectedPayout.sessions || []).map((session, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{formatDate(session.tanggal)}</td>
                          <td className="px-4 py-3 text-sm">{session.siswa}</td>
                          <td className="px-4 py-3 text-sm">{session.mapel}</td>
                          <td className="px-4 py-3 text-sm">{session.durasi} menit</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{formatRupiah(session.fee)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-semibold">Total Transfer Payout:</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                          {formatRupiah(selectedPayout.totalNominal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

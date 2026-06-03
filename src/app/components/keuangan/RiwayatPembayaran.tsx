import { useState, useEffect } from 'react';
import { FileText, Eye, Download, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../services/api';

interface SessionDetail {
  tanggal: string;
  siswa: string;
  mapel: string;
  durasi: number;
  fee: number;
}

interface PayoutHistory {
  id: string;
  tutorId: string;
  tutorKode: string;
  tutorNama: string;
  namaBank: string;
  noRekening: string;
  jumlahSesi: number;
  totalNominal: number;
  status: 'sudah-payout';
  periodeStart: string;
  periodeEnd: string;
  tanggalTransfer: string;
  sessions: SessionDetail[];
  pdfUrl?: string | null;
}

interface RiwayatPembayaranProps {
  data: PayoutHistory[];
}

export function RiwayatPembayaran({ data }: RiwayatPembayaranProps) {
  const [selectedPayout, setSelectedPayout] = useState<PayoutHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [tutorsMap, setTutorsMap] = useState<Record<string, string>>({});

  // Custom settings states for printed payroll template
  const [namaBimbel, setNamaBimbel] = useState('BimbelMelly');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [komisiAdmin, setKomisiAdmin] = useState(10);

  useEffect(() => {
    const fetchTutorsAndSettings = async () => {
      try {
        const [tutorsRes, settingsRes] = await Promise.all([
          api.get('/tutors'),
          api.get('/admin/settings')
        ]);

        const map: Record<string, string> = {};
        tutorsRes.data.forEach((t: any) => {
          map[t.id] = t.kode;
        });
        setTutorsMap(map);

        if (settingsRes.data) {
          setNamaBimbel(settingsRes.data.namaBimbel || 'BimbelMelly');
          setLogoUrl(settingsRes.data.logoUrl || null);
          setKomisiAdmin(settingsRes.data.komisiAdmin !== undefined ? settingsRes.data.komisiAdmin : 10);
        }
      } catch (error) {
        console.error("Gagal memuat mapping tutor atau settings:", error);
      }
    };
    fetchTutorsAndSettings();
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace("Rp", "Rp ");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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

  const handleKirimWA = async (payout: PayoutHistory) => {
    try {
      await api.post('/finance/send-whatsapp', {
        tutorId: payout.tutorId,
        payoutId: payout.id,
        tutorNama: payout.tutorNama,
        tutorKode: payout.tutorKode,
        periodeStart: payout.periodeStart,
        periodeEnd: payout.periodeEnd,
        tanggalTransfer: payout.tanggalTransfer,
        totalNominal: payout.totalNominal,
        namaBank: payout.namaBank,
        noRekening: payout.noRekening,
        sessions: payout.sessions
      });
      toast.success('Slip gaji berhasil dikirim ke nomor WhatsApp tutor via Fonnte!');
    } catch (error: any) {
      console.error("Gagal mengirim WhatsApp:", error);
      toast.error(error.response?.data?.message || "Gagal mengirim WhatsApp slip gaji.");
    }
  };

  const handleCetakSlip = (payout: PayoutHistory) => {
    if (payout.pdfUrl) {
      window.open(payout.pdfUrl, '_blank');
    } else {
      toast.error('File PDF slip gaji belum diunggah ke Supabase atau URL tidak tersedia. Anda bisa klik Send untuk memicu pengunggahan kembali.');
    }
  };


  const filteredHistory = data.filter(h => {
    const matchSearch = h.tutorNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMonth = filterMonth === 'all' || h.periodeStart.startsWith(filterMonth);
    return matchSearch && matchMonth;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama tutor atau ID transaksi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Periode</option>
          <option value="2026-04">April 2026</option>
          <option value="2026-03">Maret 2026</option>
          <option value="2026-02">Februari 2026</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">ID Transaksi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Nama Tutor</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Periode</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Jumlah Sesi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Total Nominal</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Tanggal Transfer</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((payout) => (
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
                    <span className="text-sm font-medium">{getCyclePeriod(payout.periodeStart, payout.periodeEnd)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium">{payout.jumlahSesi} sesi</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-lg font-bold text-green-600">
                      {formatRupiah(payout.totalNominal)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-600">{formatDate(payout.tanggalTransfer)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPayout(payout)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleKirimWA(payout)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                      <button
                        onClick={() => handleCetakSlip(payout)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada riwayat pembayaran ditemukan
          </div>
        )}
      </div>

      {selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPayout(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Detail Pembayaran</h3>
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
                  <p className="text-sm text-gray-500">Rekening</p>
                  <p className="font-medium">{selectedPayout.namaBank} - {selectedPayout.noRekening}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Periode</p>
                  <p className="font-medium">{getCyclePeriod(selectedPayout.periodeStart, selectedPayout.periodeEnd)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Transfer</p>
                  <p className="font-medium">{formatDate(selectedPayout.tanggalTransfer)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Breakdown Sesi ({selectedPayout.jumlahSesi} sesi)</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">Tanggal</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">Siswa</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">Mata Pelajaran</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">Durasi</th>
                        <th className="text-right px-4 py-3 text-sm text-gray-600">Fee Tutor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedPayout.sessions.map((session, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{formatDate(session.tanggal)}</td>
                          <td className="px-4 py-3 text-sm">{session.siswa}</td>
                          <td className="px-4 py-3 text-sm">{session.mapel}</td>
                          <td className="px-4 py-3 text-sm">{session.durasi} menit</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{formatRupiah(session.fee)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-semibold">Total Fee Tutor ({100 - komisiAdmin}%):</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                          {formatRupiah(selectedPayout.totalNominal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Catatan:</strong> Fee tutor adalah {100 - komisiAdmin}% dari total pembayaran siswa. {komisiAdmin}% sisanya menjadi profit admin.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleKirimWA(selectedPayout)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Kirim WA
                </button>
                <button
                  onClick={() => handleCetakSlip(selectedPayout)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

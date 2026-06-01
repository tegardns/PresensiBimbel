import { useState, useEffect } from 'react';
import { FileText, Eye, Download } from 'lucide-react';
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
}

interface RiwayatPembayaranProps {
  data: PayoutHistory[];
}

export function RiwayatPembayaran({ data }: RiwayatPembayaranProps) {
  const [selectedPayout, setSelectedPayout] = useState<PayoutHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [tutorsMap, setTutorsMap] = useState<Record<string, string>>({});

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

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleCetakSlip = (payout: PayoutHistory) => {
    alert(`Generating salary slip for ${payout.tutorNama}\n\nPeriode: ${formatDate(payout.periodeStart)} - ${formatDate(payout.periodeEnd)}\nTotal: ${formatRupiah(payout.totalNominal)}\n\nFungsi cetak PDF akan diimplementasikan.`);
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
                <th className="text-left px-6 py-4 text-sm text-gray-600">Rekening</th>
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
                    <div>
                      <p className="text-sm font-medium">{payout.namaBank}</p>
                      <p className="text-xs text-gray-500 font-mono">{payout.noRekening}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm">
                      <p>{formatDate(payout.periodeStart)}</p>
                      <p className="text-gray-500">s/d {formatDate(payout.periodeEnd)}</p>
                    </div>
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
                        onClick={() => handleCetakSlip(payout)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Cetak Slip
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
                  <p className="font-medium">{formatDate(selectedPayout.periodeStart)} - {formatDate(selectedPayout.periodeEnd)}</p>
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
                        <td colSpan={4} className="px-4 py-3 text-right font-semibold">Total Fee Tutor (90%):</td>
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
                  <strong>Catatan:</strong> Fee tutor adalah 90% dari total pembayaran siswa. 10% sisanya menjadi profit admin.
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
                  onClick={() => handleCetakSlip(selectedPayout)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Cetak Slip Gaji
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Search, Eye, Printer, CheckCircle, X } from 'lucide-react';

interface SesiDetail {
  id: string;
  siswaNama: string;
  mapelNama: string;
  tanggal: string;
  durasi: number;
  feeBersih: number;
}

interface Keuangan {
  id: string;
  tutorId: string;
  tutorNama: string;
  namaBank: string;
  noRekening: string;
  totalNominal: number;
  tanggalPayout: string;
  status: 'diproses' | 'sudah-payout';
  sesiList: SesiDetail[];
}

const mockKeuangan: Keuangan[] = [
  {
    id: 'TRX-20260420-W3',
    tutorId: 'TUT-001',
    tutorNama: 'Mellysa',
    namaBank: 'BCA',
    noRekening: '1234567890',
    totalNominal: 384000,
    tanggalPayout: '2026-04-20',
    status: 'diproses',
    sesiList: [
      { id: 'SES-001', siswaNama: 'Ahmad Rizki', mapelNama: 'Matematika', tanggal: '2026-04-14', durasi: 90, feeBersih: 48000 },
      { id: 'SES-002', siswaNama: 'Budi Santoso', mapelNama: 'Fisika', tanggal: '2026-04-15', durasi: 120, feeBersih: 64000 },
      { id: 'SES-003', siswaNama: 'Ahmad Rizki', mapelNama: 'Matematika', tanggal: '2026-04-16', durasi: 90, feeBersih: 48000 },
      { id: 'SES-004', siswaNama: 'Dedi Prasetyo', mapelNama: 'Fisika', tanggal: '2026-04-17', durasi: 90, feeBersih: 48000 },
      { id: 'SES-005', siswaNama: 'Ahmad Rizki', mapelNama: 'Matematika', tanggal: '2026-04-18', durasi: 90, feeBersih: 48000 },
      { id: 'SES-006', siswaNama: 'Budi Santoso', mapelNama: 'Fisika', tanggal: '2026-04-19', durasi: 90, feeBersih: 48000 },
      { id: 'SES-007', siswaNama: 'Dedi Prasetyo', mapelNama: 'Fisika', tanggal: '2026-04-19', durasi: 90, feeBersih: 48000 },
      { id: 'SES-008', siswaNama: 'Ahmad Rizki', mapelNama: 'Matematika', tanggal: '2026-04-20', durasi: 60, feeBersih: 32000 },
    ],
  },
  {
    id: 'TRX-20260413-W2',
    tutorId: 'TUT-001',
    tutorNama: 'Mellysa',
    namaBank: 'BCA',
    noRekening: '1234567890',
    totalNominal: 256000,
    tanggalPayout: '2026-04-13',
    status: 'sudah-payout',
    sesiList: [
      { id: 'SES-009', siswaNama: 'Ahmad Rizki', mapelNama: 'Matematika', tanggal: '2026-04-07', durasi: 90, feeBersih: 48000 },
      { id: 'SES-010', siswaNama: 'Budi Santoso', mapelNama: 'Fisika', tanggal: '2026-04-08', durasi: 120, feeBersih: 64000 },
      { id: 'SES-011', siswaNama: 'Ahmad Rizki', mapelNama: 'Matematika', tanggal: '2026-04-10', durasi: 90, feeBersih: 48000 },
      { id: 'SES-012', siswaNama: 'Dedi Prasetyo', mapelNama: 'Fisika', tanggal: '2026-04-12', durasi: 90, feeBersih: 48000 },
      { id: 'SES-013', siswaNama: 'Ahmad Rizki', mapelNama: 'Matematika', tanggal: '2026-04-13', durasi: 90, feeBersih: 48000 },
    ],
  },
  {
    id: 'TRX-20260420-W3-B',
    tutorId: 'TUT-002',
    tutorNama: 'Budi Santoso',
    namaBank: 'Mandiri',
    noRekening: '0987654321',
    totalNominal: 320000,
    tanggalPayout: '2026-04-20',
    status: 'diproses',
    sesiList: [
      { id: 'SES-014', siswaNama: 'Eka Putri', mapelNama: 'Kimia', tanggal: '2026-04-14', durasi: 120, feeBersih: 64000 },
      { id: 'SES-015', siswaNama: 'Fahmi Rahman', mapelNama: 'Fisika', tanggal: '2026-04-15', durasi: 120, feeBersih: 64000 },
      { id: 'SES-016', siswaNama: 'Eka Putri', mapelNama: 'Kimia', tanggal: '2026-04-17', durasi: 120, feeBersih: 64000 },
      { id: 'SES-017', siswaNama: 'Fahmi Rahman', mapelNama: 'Fisika', tanggal: '2026-04-18', durasi: 120, feeBersih: 64000 },
      { id: 'SES-018', siswaNama: 'Eka Putri', mapelNama: 'Kimia', tanggal: '2026-04-19', durasi: 120, feeBersih: 64000 },
    ],
  },
];

interface DataKeuanganProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DataKeuangan({ searchQuery, setSearchQuery }: DataKeuanganProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'diproses' | 'sudah-payout'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Keuangan | null>(null);
  const [selectedForUpdate, setSelectedForUpdate] = useState<string[]>([]);

  const filteredKeuangan = mockKeuangan.filter((keuangan) => {
    const matchesSearch = keuangan.tutorNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         keuangan.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || keuangan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSelectForUpdate = (id: string) => {
    if (selectedForUpdate.includes(id)) {
      setSelectedForUpdate(selectedForUpdate.filter(i => i !== id));
    } else {
      setSelectedForUpdate([...selectedForUpdate, id]);
    }
  };

  const handleBulkUpdateStatus = () => {
    if (selectedForUpdate.length === 0) {
      alert('Pilih minimal 1 transaksi untuk diupdate');
      return;
    }
    alert(`${selectedForUpdate.length} transaksi akan diupdate statusnya menjadi "Sudah Payout"`);
    setSelectedForUpdate([]);
  };

  const diprosesCount = filteredKeuangan.filter(k => k.status === 'diproses').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari transaksi atau tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="diproses">Diproses</option>
            <option value="sudah-payout">Sudah Payout</option>
          </select>
        </div>

        {selectedForUpdate.length > 0 && (
          <button
            onClick={handleBulkUpdateStatus}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Update Status ({selectedForUpdate.length})
          </button>
        )}
      </div>

      {diprosesCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-orange-900">
                <strong>{diprosesCount} transaksi</strong> sedang dalam status <strong>Diproses</strong> dan menunggu untuk diselesaikan
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const diprosesIds = filteredKeuangan
                          .filter(k => k.status === 'diproses')
                          .map(k => k.id);
                        setSelectedForUpdate(diprosesIds);
                      } else {
                        setSelectedForUpdate([]);
                      }
                    }}
                    checked={selectedForUpdate.length > 0 && selectedForUpdate.length === filteredKeuangan.filter(k => k.status === 'diproses').length}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">ID Transaksi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Nama Tutor</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Rekening</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Total Nominal</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Tanggal Payout</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Jumlah Sesi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredKeuangan.map((keuangan) => (
                <tr key={keuangan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {keuangan.status === 'diproses' && (
                      <input
                        type="checkbox"
                        checked={selectedForUpdate.includes(keuangan.id)}
                        onChange={() => handleSelectForUpdate(keuangan.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 font-mono">{keuangan.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                        {keuangan.tutorNama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{keuangan.tutorNama}</p>
                        <p className="text-xs text-gray-500">{keuangan.tutorId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">{keuangan.namaBank}</p>
                      <p className="text-xs text-gray-500 font-mono">{keuangan.noRekening}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-green-600">
                      {formatRupiah(keuangan.totalNominal)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{formatDate(keuangan.tanggalPayout)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{keuangan.sesiList.length} sesi</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                        keuangan.status === 'diproses'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {keuangan.status === 'diproses' ? 'Diproses' : 'Sudah Payout'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTransaction(keuangan)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Lihat Detail Sesi"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => alert(`Cetak bukti untuk ${keuangan.id}`)}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Cetak Bukti"
                      >
                        <Printer className="w-4 h-4 text-purple-600" />
                      </button>
                      {keuangan.status === 'diproses' && (
                        <button
                          onClick={() => alert(`Update status ${keuangan.id} menjadi Sudah Payout`)}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title="Tandai Sudah Payout"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredKeuangan.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data transaksi yang ditemukan
          </div>
        )}
      </div>

      {selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl">Detail Transaksi</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedTransaction.id}</p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Tutor</p>
                  <p className="font-medium">{selectedTransaction.tutorNama}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedTransaction.tutorId}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Rekening Tujuan</p>
                  <p className="font-medium">{selectedTransaction.namaBank}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedTransaction.noRekening}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Nominal</p>
                  <p className="font-bold text-green-600">{formatRupiah(selectedTransaction.totalNominal)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Tanggal Payout</p>
                  <p className="font-medium">{formatDate(selectedTransaction.tanggalPayout)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Jumlah Sesi</p>
                  <p className="font-medium">{selectedTransaction.sesiList.length} sesi</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                      selectedTransaction.status === 'diproses'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {selectedTransaction.status === 'diproses' ? 'Diproses' : 'Sudah Payout'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Rincian Sesi ({selectedTransaction.sesiList.length})</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-600">ID Sesi</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-600">Tanggal</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-600">Siswa</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-600">Mata Pelajaran</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-600">Durasi</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-600">Fee Bersih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedTransaction.sesiList.map((sesi) => (
                        <tr key={sesi.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">{sesi.id}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(sesi.tanggal)}</td>
                          <td className="px-4 py-3 text-sm">{sesi.siswaNama}</td>
                          <td className="px-4 py-3 text-sm">{sesi.mapelNama}</td>
                          <td className="px-4 py-3 text-sm">{sesi.durasi} mnt</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                            {formatRupiah(sesi.feeBersih)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-sm font-medium text-right">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-right text-green-600">
                          {formatRupiah(selectedTransaction.totalNominal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => alert(`Cetak bukti untuk ${selectedTransaction.id}`)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-5 h-5" />
                Cetak Bukti
              </button>
              {selectedTransaction.status === 'diproses' && (
                <button
                  onClick={() => alert(`Update status ${selectedTransaction.id} menjadi Sudah Payout`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Tandai Sudah Payout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

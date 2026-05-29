import { useState } from 'react';
import { Search, Download, Filter, Eye, Edit2 } from 'lucide-react';
import { ModalEditRiwayat } from './ModalEditRiwayat';

interface Presensi {
  id: string;
  tutorNama: string;
  siswaNama: string;
  mapelNama: string;
  level: string;
  tanggal: string;
  durasi: number;
  feeBersih: number;
  status: 'disetujui' | 'ditolak' | 'selesai';
}

const mockRiwayat: Presensi[] = [
  {
    id: 'SES-20260420-001',
    tutorNama: 'Mellysa',
    siswaNama: 'Ahmad Rizki',
    mapelNama: 'Matematika',
    level: 'SD',
    tanggal: '2026-04-20',
    durasi: 90,
    feeBersih: 45000,
    status: 'selesai',
  },
  {
    id: 'SES-20260419-002',
    tutorNama: 'Budi Santoso',
    siswaNama: 'Dedi Prasetyo',
    mapelNama: 'Fisika',
    level: 'SMA',
    tanggal: '2026-04-19',
    durasi: 120,
    feeBersih: 63000,
    status: 'disetujui',
  },
  {
    id: 'SES-20260418-003',
    tutorNama: 'Mellysa',
    siswaNama: 'Budi Santoso',
    mapelNama: 'Fisika',
    level: 'SMP',
    tanggal: '2026-04-18',
    durasi: 90,
    feeBersih: 54000,
    status: 'ditolak',
  },
];

export function RiwayatPresensi() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'disetujui' | 'ditolak' | 'selesai'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Calistung' | 'SD' | 'SMP' | 'SMA'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [editingPresensi, setEditingPresensi] = useState<Presensi | null>(null);

  const filteredRiwayat = mockRiwayat.filter((presensi) => {
    const matchesSearch =
      presensi.tutorNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presensi.siswaNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presensi.mapelNama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || presensi.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || presensi.level === levelFilter;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      disetujui: 'bg-green-100 text-green-700',
      ditolak: 'bg-red-100 text-red-700',
      selesai: 'bg-blue-100 text-blue-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      disetujui: 'Disetujui',
      ditolak: 'Ditolak',
      selesai: 'Selesai (Payout)',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`Export data sebagai ${format.toUpperCase()}\n\nTotal: ${filteredRiwayat.length} data`);
  };

  const handleSaveEdit = (updated: Presensi) => {
    alert(`Presensi ${updated.id} berhasil diupdate!\nDurasi: ${updated.durasi} menit\nFee Baru: ${formatRupiah(updated.feeBersih)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tutor, siswa, atau mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilter
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filter
          </button>

          <div className="relative">
            <button
              onClick={() => {
                const format = confirm('Export sebagai PDF?\n\nKlik OK untuk PDF, Cancel untuk Excel');
                handleExport(format ? 'pdf' : 'excel');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {showFilter && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-medium mb-4">Filter Data</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Tanggal Mulai</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Tanggal Akhir</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="selesai">Selesai (Payout)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Level</option>
                <option value="Calistung">Calistung</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">ID Sesi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Tanggal</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Tutor</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Siswa</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Mapel</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Durasi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Fee Bersih</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRiwayat.map((presensi) => (
                <tr key={presensi.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 font-mono">{presensi.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {new Date(presensi.tanggal).toLocaleDateString('id-ID')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{presensi.tutorNama}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{presensi.siswaNama}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm">{presensi.mapelNama}</p>
                      <p className="text-xs text-gray-500">{presensi.level}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{presensi.durasi} menit</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-green-600">
                      {formatRupiah(presensi.feeBersih)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getStatusBadge(
                        presensi.status
                      )}`}
                    >
                      {getStatusLabel(presensi.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPresensi(presensi)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      {presensi.status !== 'selesai' && (
                        <button
                          onClick={() => setEditingPresensi(presensi)}
                          className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Edit Data"
                        >
                          <Edit2 className="w-4 h-4 text-purple-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRiwayat.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada riwayat presensi yang ditemukan
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>Menampilkan {filteredRiwayat.length} dari {mockRiwayat.length} data</p>
      </div>

      <ModalEditRiwayat
        isOpen={editingPresensi !== null}
        onClose={() => setEditingPresensi(null)}
        presensi={editingPresensi}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

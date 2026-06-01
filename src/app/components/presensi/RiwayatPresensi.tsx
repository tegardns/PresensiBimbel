import { useState, useEffect } from 'react';
import { Search, Download, Filter, Eye, Edit2, X } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ModalEditRiwayat } from './ModalEditRiwayat';
import api from '../../../services/api';

interface Presensi {
  id: string;
  tutorId: string;
  tutorNama: string;
  siswaId: string;
  siswaNama: string;
  mapelNama: string;
  level: string;
  tanggal: string;
  durasi: number;
  feeBersih: number;
  status: 'disetujui' | 'ditolak' | 'selesai';
  catatan: string;
  buktiUrl: string;
}

interface RiwayatPresensiProps {
  onRefresh: () => void;
}

export function RiwayatPresensi({ onRefresh }: RiwayatPresensiProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'disetujui' | 'ditolak' | 'selesai'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Calistung' | 'SD' | 'SMP' | 'SMA'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [editingPresensi, setEditingPresensi] = useState<Presensi | null>(null);
  const [viewingPresensi, setViewingPresensi] = useState<Presensi | null>(null);
  
  const [riwayat, setRiwayat] = useState<Presensi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendances');
      // Filter out only approved, rejected, and payout completed statuses
      const filtered = response.data.filter((item: any) => 
        item.status === 'disetujui' || item.status === 'ditolak' || item.status === 'selesai'
      );
      setRiwayat(filtered);
    } catch (error) {
      console.error('Gagal mengambil riwayat presensi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const filteredRiwayat = riwayat.filter((presensi) => {
    const matchesSearch =
      presensi.tutorNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presensi.siswaNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presensi.mapelNama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || presensi.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || presensi.level.toUpperCase().includes(levelFilter.toUpperCase());
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
      disetujui: 'bg-green-100 text-green-700 font-semibold',
      ditolak: 'bg-red-100 text-red-700 font-semibold',
      selesai: 'bg-blue-100 text-blue-700 font-semibold',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700 font-semibold';
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

  const handleSaveEdit = async (updated: Presensi) => {
    try {
      await api.put(`/attendances/${updated.id}`, {
        mapelNama: updated.mapelNama,
        durasi: updated.durasi,
        feeBersih: updated.feeBersih,
        catatan: updated.catatan,
        tanggal: updated.tanggal,
        status: updated.status,
      });
      alert(`Presensi berhasil diperbarui!`);
      setEditingPresensi(null);
      fetchRiwayat();
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal memperbarui riwayat presensi');
    }
  };

  const getBuktiImage = (url: string) => {
    if (
      !url ||
      url.includes('placeholder') ||
      url.includes('via.placeholder.com') ||
      url.includes('dummy') ||
      url.includes('dummy.com')
    ) {
      return 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60';
    }
    return url;
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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors font-medium text-sm ${
              showFilter
                ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filter
          </button>

          <button
            onClick={() => {
              const format = confirm('Export sebagai PDF?\n\nKlik OK untuk PDF, Cancel untuk Excel');
              handleExport(format ? 'pdf' : 'excel');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm shadow-xs"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs animate-in fade-in duration-200">
          <h4 className="font-bold text-gray-800 mb-4">Filter Data</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Tanggal Mulai</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Tanggal Akhir</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="selesai">Selesai (Payout)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-500 font-medium bg-gray-50/50">
              Memuat data riwayat...
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">ID Sesi</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tanggal</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tutor</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Siswa</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Mapel</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Durasi</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Fee Bersih</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRiwayat.map((presensi) => (
                  <tr key={presensi.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 font-mono font-medium">
                        {presensi.id.includes("-") && presensi.id.length > 8
                          ? `SES-${presensi.id.split("-")[0].toUpperCase()}`
                          : presensi.id.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {new Date(presensi.tanggal).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{presensi.tutorNama}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{presensi.siswaNama}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-800 font-medium">{presensi.mapelNama}</p>
                        <p className="text-xs text-gray-500 font-medium">{presensi.level}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{presensi.durasi} menit</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-green-600">
                        {formatRupiah(presensi.feeBersih)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(
                          presensi.status
                        )}`}
                      >
                        {getStatusLabel(presensi.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingPresensi(presensi)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {presensi.status !== 'selesai' && (
                          <button
                            onClick={() => setEditingPresensi(presensi)}
                            className="p-2 hover:bg-purple-50 text-purple-600 rounded-xl transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredRiwayat.length === 0 && (
          <div className="text-center py-16 text-gray-500 font-medium bg-gray-50/50">
            Tidak ada riwayat presensi yang ditemukan
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 font-medium px-2">
        <p>Menampilkan {filteredRiwayat.length} dari {riwayat.length} data</p>
      </div>

      {viewingPresensi && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setViewingPresensi(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-150 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">Detail Riwayat Presensi</h3>
              <button
                onClick={() => setViewingPresensi(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Tutor</p>
                  <p className="font-bold text-gray-800">{viewingPresensi.tutorNama}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Siswa</p>
                  <p className="font-bold text-gray-800">{viewingPresensi.siswaNama}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Mata Pelajaran</p>
                  <p className="font-bold text-gray-800">{viewingPresensi.mapelNama}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{viewingPresensi.level}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Tanggal & Waktu</p>
                  <p className="font-bold text-gray-800">
                    {new Date(viewingPresensi.tanggal).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{viewingPresensi.waktuMulai || '12:00'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Durasi</p>
                  <p className="font-bold text-gray-800">{viewingPresensi.durasi} menit</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Fee Bersih</p>
                  <p className="font-extrabold text-lg text-green-600">{formatRupiah(viewingPresensi.feeBersih)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Catatan</h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{viewingPresensi.catatan || 'Tidak ada catatan.'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Bukti Pembelajaran</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-gray-50 flex items-center justify-center p-2">
                  <ImageWithFallback
                    src={getBuktiImage(viewingPresensi.buktiUrl)}
                    alt="Bukti Pembelajaran"
                    className="max-h-[450px] object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-150 flex sticky bottom-0 bg-white z-10">
              <button
                onClick={() => setViewingPresensi(null)}
                className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-700 font-semibold rounded-xl transition-colors text-sm shadow-xs"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalEditRiwayat
        isOpen={editingPresensi !== null}
        onClose={() => setEditingPresensi(null)}
        presensi={editingPresensi}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

import { useState } from 'react';
import { Check, X, Eye, Edit2, AlertTriangle } from 'lucide-react';
import { ModalEditPresensi } from './ModalEditPresensi';
import {
  presensis,
  getTutorById,
  getSiswaById,
  getMapelById,
  getLevelById
} from '../../data/mockData';

interface PresensiPending {
  id: string;
  tutorId: string;
  tutorNama: string;
  siswaId: string;
  siswaNama: string;
  mapelId: string;
  mapelNama: string;
  tanggal: string;
  waktuMulai: string;
  durasi: number;
  level: string;
  buktiUrl: string;
  catatan: string;
  feeBersih: number;
  status: 'diselesaikan' | 'tertunda';
  tertundaReason?: string;
  tutorRekeningLengkap: boolean;
}

// Transform data dari central mockData
const mockPending: PresensiPending[] = presensis
  .filter(p => p.status === 'pending')
  .map(p => {
    const tutor = getTutorById(p.tutorId);
    const siswa = getSiswaById(p.siswaId);
    const mapel = getMapelById(p.mapelId);
    const level = siswa ? getLevelById(siswa.levelId) : null;

    return {
      id: p.id,
      tutorId: p.tutorId,
      tutorNama: tutor?.nama || '',
      siswaId: p.siswaId,
      siswaNama: siswa?.nama || '',
      mapelId: p.mapelId,
      mapelNama: mapel?.nama || '',
      tanggal: p.tanggal,
      waktuMulai: p.waktuMulai,
      durasi: p.durasi,
      level: level?.nama || '',
      buktiUrl: p.buktiUrl,
      catatan: p.catatan,
      feeBersih: p.feeBersih,
      status: p.tertundaReason ? 'tertunda' : 'diselesaikan',
      tertundaReason: p.tertundaReason,
      tutorRekeningLengkap: !!(tutor?.noRek && tutor?.namaBank),
    };
  });

export function AntreanPersetujuan() {
  const [presensiList, setPresensiList] = useState(mockPending);
  const [selectedPresensi, setSelectedPresensi] = useState<PresensiPending | null>(null);
  const [editingPresensi, setEditingPresensi] = useState<PresensiPending | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; presensi: PresensiPending | null }>({
    open: false,
    presensi: null,
  });
  const [alasanPenolakan, setAlasanPenolakan] = useState('');

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSetujui = (presensi: PresensiPending) => {
    if (!presensi.tutorRekeningLengkap) {
      alert('Tidak dapat menyetujui! Tutor belum melengkapi nomor rekening.');
      return;
    }
    if (confirm(`Setujui presensi ${presensi.id}?\n\nNominal ${formatRupiah(presensi.feeBersih)} akan masuk ke saldo tutor.`)) {
      alert(`Presensi berhasil disetujui!\nSaldo tutor ${presensi.tutorNama} bertambah ${formatRupiah(presensi.feeBersih)}`);
      setPresensiList(presensiList.filter(p => p.id !== presensi.id));
    }
  };

  const handleTolak = () => {
    if (!alasanPenolakan.trim()) {
      alert('Mohon isi alasan penolakan');
      return;
    }
    alert(`Presensi ditolak!\nAlasan akan dikirim ke tutor: ${alasanPenolakan}`);
    setPresensiList(presensiList.filter(p => p.id !== rejectModal.presensi?.id));
    setRejectModal({ open: false, presensi: null });
    setAlasanPenolakan('');
  };

  const handleSaveEdit = (updated: PresensiPending) => {
    setPresensiList(presensiList.map(p => p.id === updated.id ? updated : p));
    alert(`Presensi ${updated.id} berhasil diupdate!\nDurasi: ${updated.durasi} menit\nFee Baru: ${formatRupiah(updated.feeBersih)}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">ID Sesi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Tutor</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Siswa</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Mapel</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Tanggal & Waktu</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Durasi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Fee</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {presensiList.map((presensi) => (
                <tr
                  key={presensi.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedPresensi(presensi)}
                >
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 font-mono">{presensi.id}</span>
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
                    <div>
                      <p className="text-sm">{new Date(presensi.tanggal).toLocaleDateString('id-ID')}</p>
                      <p className="text-xs text-gray-500">{presensi.waktuMulai}</p>
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
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                        presensi.status === 'tertunda'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {presensi.status === 'tertunda' && <AlertTriangle className="w-3 h-3" />}
                      {presensi.status === 'tertunda' ? 'Tertunda' : 'Diselesaikan'}
                    </span>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPresensi(presensi)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Lihat Detail & Bukti"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => setEditingPresensi(presensi)}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Edit Data"
                      >
                        <Edit2 className="w-4 h-4 text-purple-600" />
                      </button>
                      <button
                        onClick={() => handleSetujui(presensi)}
                        disabled={!presensi.tutorRekeningLengkap}
                        className={`p-2 rounded-lg transition-colors ${
                          presensi.tutorRekeningLengkap
                            ? 'hover:bg-green-100'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        title={presensi.tutorRekeningLengkap ? 'Setujui' : 'Rekening belum lengkap'}
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => setRejectModal({ open: true, presensi })}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Tolak"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {presensiList.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada presensi yang menunggu persetujuan
          </div>
        )}
      </div>

      {selectedPresensi && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPresensi(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl">Detail Presensi - {selectedPresensi.id}</h3>
              <button
                onClick={() => setSelectedPresensi(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Tutor</p>
                  <p className="font-medium">{selectedPresensi.tutorNama}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Siswa</p>
                  <p className="font-medium">{selectedPresensi.siswaNama}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Mata Pelajaran</p>
                  <p className="font-medium">{selectedPresensi.mapelNama}</p>
                  <p className="text-xs text-gray-500">{selectedPresensi.level}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Tanggal & Waktu</p>
                  <p className="font-medium">
                    {new Date(selectedPresensi.tanggal).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">{selectedPresensi.waktuMulai}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Durasi</p>
                  <p className="font-medium">{selectedPresensi.durasi} menit</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Fee Bersih</p>
                  <p className="font-bold text-green-600">{formatRupiah(selectedPresensi.feeBersih)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Catatan Materi</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedPresensi.catatan}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Bukti Foto Pembelajaran</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedPresensi.buktiUrl}
                    alt="Bukti Pembelajaran"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setSelectedPresensi(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleSetujui(selectedPresensi);
                  setSelectedPresensi(null);
                }}
                disabled={!selectedPresensi.tutorRekeningLengkap}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${
                  selectedPresensi.tutorRekeningLengkap
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                Setujui Presensi
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal.open && rejectModal.presensi && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setRejectModal({ open: false, presensi: null })}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl">Tolak Presensi</h3>
              <p className="text-sm text-gray-500 mt-1">{rejectModal.presensi.id}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Alasan Penolakan *
                </label>
                <textarea
                  value={alasanPenolakan}
                  onChange={(e) => setAlasanPenolakan(e.target.value)}
                  placeholder="Berikan instruksi revisi yang jelas kepada tutor..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alasan ini akan dikirim sebagai notifikasi ke tutor
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setRejectModal({ open: false, presensi: null });
                  setAlasanPenolakan('');
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleTolak}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Tolak Presensi
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalEditPresensi
        isOpen={editingPresensi !== null}
        onClose={() => setEditingPresensi(null)}
        presensi={editingPresensi}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

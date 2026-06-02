import { useState, useEffect } from 'react';
import { Check, X, Eye, Edit2, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ModalEditPresensi } from './ModalEditPresensi';
import api from '../../../services/api';
import { useConfirm } from "../../context/ConfirmContext";

interface PresensiPending {
  id: string;
  tutorId: string;
  tutorNama: string;
  siswaId: string;
  siswaNama: string;
  mapelNama: string;
  tanggal: string;
  waktuMulai: string;
  durasi: number;
  level: string;
  buktiUrl: string;
  catatan: string;
  feeBersih: number;
  status: 'diselesaikan' | 'tertunda' | 'disetujui' | 'ditolak' | 'selesai';
  tutorRekeningLengkap: boolean;
}

interface AntreanPersetujuanProps {
  initialData: any[];
  onRefresh: () => void;
}

export function AntreanPersetujuan({ initialData, onRefresh }: AntreanPersetujuanProps) {
  const [presensiList, setPresensiList] = useState<PresensiPending[]>([]);
  const [selectedPresensi, setSelectedPresensi] = useState<PresensiPending | null>(null);
  const [editingPresensi, setEditingPresensi] = useState<PresensiPending | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; presensi: PresensiPending | null }>({
    open: false,
    presensi: null,
  });
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const confirm = useConfirm();

  // Sync state with prop
  useEffect(() => {
    if (initialData) {
      setPresensiList(initialData);
    }
  }, [initialData]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSetujui = async (presensi: PresensiPending) => {
    if (!presensi.tutorRekeningLengkap) {
      toast.warning('Tidak dapat menyetujui! Tutor belum melengkapi nomor rekening.');
      return;
    }
    
    const isConfirmed = await confirm({
      title: "Setujui Presensi",
      description: `Setujui presensi ${presensi.id}?\n\nNominal ${formatRupiah(presensi.feeBersih)} akan masuk ke saldo pendapatan tutor.`,
      variant: "success",
      confirmText: "Ya, Setujui"
    });

    if (isConfirmed) {
      try {
        await api.post(`/attendances/${presensi.id}/approve`);
        toast.success(`Presensi berhasil disetujui!\nSaldo tutor ${presensi.tutorNama} bertambah ${formatRupiah(presensi.feeBersih)}`);
        onRefresh();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal menyetujui presensi');
      }
    }
  };

  const handleTolak = async () => {
    if (!alasanPenolakan.trim()) {
      toast.warning('Mohon isi alasan penolakan');
      return;
    }
    const presensi = rejectModal.presensi;
    if (!presensi) return;

    try {
      await api.post(`/attendances/${presensi.id}/decline`, {
        reason: alasanPenolakan,
      });
      toast.success(`Presensi berhasil ditolak!\nAlasan dikirim ke tutor.`);
      setRejectModal({ open: false, presensi: null });
      setAlasanPenolakan('');
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menolak presensi');
    }
  };

  const handleSaveEdit = async (updated: PresensiPending) => {
    try {
      await api.put(`/attendances/${updated.id}`, {
        mapelNama: updated.mapelNama,
        durasi: updated.durasi,
        feeBersih: updated.feeBersih,
        catatan: updated.catatan,
        tanggal: updated.tanggal,
      });
      toast.success(`Presensi berhasil diperbarui!`);
      setEditingPresensi(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui presensi');
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">ID Sesi</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tutor</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Siswa</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Mapel</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tanggal & Waktu</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Durasi</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Fee</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {presensiList.map((presensi) => (
                <tr
                  key={presensi.id}
                  className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedPresensi(presensi)}
                >
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 font-mono font-medium">
                      {presensi.id.includes("-") && presensi.id.length > 8
                        ? `SES-${presensi.id.split("-")[0].toUpperCase()}`
                        : presensi.id.toUpperCase()}
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
                    <div>
                      <p className="text-sm text-gray-700">{new Date(presensi.tanggal).toLocaleDateString('id-ID')}</p>
                      <p className="text-xs text-gray-500 font-mono font-medium">{presensi.waktuMulai}</p>
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
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        !presensi.tutorRekeningLengkap
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {!presensi.tutorRekeningLengkap && <AlertTriangle className="w-3.5 h-3.5" />}
                      {!presensi.tutorRekeningLengkap ? 'Tertunda' : 'Diselesaikan'}
                    </span>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedPresensi(presensi)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                        title="Lihat Detail & Bukti"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingPresensi(presensi)}
                        className="p-2 hover:bg-purple-50 text-purple-600 rounded-xl transition-colors"
                        title="Edit Data"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSetujui(presensi)}
                        disabled={!presensi.tutorRekeningLengkap}
                        className={`p-2 rounded-xl transition-colors ${
                          presensi.tutorRekeningLengkap
                            ? 'hover:bg-green-50 text-green-600'
                            : 'opacity-40 cursor-not-allowed text-gray-400'
                        }`}
                        title={presensi.tutorRekeningLengkap ? 'Setujui' : 'Rekening belum lengkap'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRejectModal({ open: true, presensi })}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                        title="Tolak"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {presensiList.length === 0 && (
          <div className="text-center py-16 text-gray-500 font-medium bg-gray-50/50">
            Tidak ada presensi yang menunggu persetujuan
          </div>
        )}
      </div>

      {selectedPresensi && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPresensi(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-150 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">Detail Presensi - {selectedPresensi.id.substring(0, 8)}...</h3>
              <button
                onClick={() => setSelectedPresensi(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Tutor</p>
                  <p className="font-bold text-gray-800">{selectedPresensi.tutorNama}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Siswa</p>
                  <p className="font-bold text-gray-800">{selectedPresensi.siswaNama}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Mata Pelajaran</p>
                  <p className="font-bold text-gray-800">{selectedPresensi.mapelNama}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{selectedPresensi.level}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Tanggal & Waktu</p>
                  <p className="font-bold text-gray-800">
                    {new Date(selectedPresensi.tanggal).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedPresensi.waktuMulai}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Durasi</p>
                  <p className="font-bold text-gray-800">{selectedPresensi.durasi} menit</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Fee Bersih</p>
                  <p className="font-extrabold text-lg text-green-600">{formatRupiah(selectedPresensi.feeBersih)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Catatan Materi</h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selectedPresensi.catatan || 'Tidak ada catatan.'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Bukti Foto Pembelajaran</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-gray-50 flex items-center justify-center p-2">
                  <ImageWithFallback
                    src={getBuktiImage(selectedPresensi.buktiUrl)}
                    alt="Bukti Pembelajaran"
                    className="max-h-[500px] object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-150 flex gap-3 sticky bottom-0 bg-white z-10">
              <button
                onClick={() => setSelectedPresensi(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleSetujui(selectedPresensi);
                  setSelectedPresensi(null);
                }}
                disabled={!selectedPresensi.tutorRekeningLengkap}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${
                  selectedPresensi.tutorRekeningLengkap
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setRejectModal({ open: false, presensi: null })}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-150">
              <h3 className="text-xl font-bold text-gray-800">Tolak Presensi</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">ID: {rejectModal.presensi.id.substring(0, 8)}...</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alasan Penolakan *
                </label>
                <textarea
                  value={alasanPenolakan}
                  onChange={(e) => setAlasanPenolakan(e.target.value)}
                  placeholder="Berikan instruksi revisi yang jelas kepada tutor..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm leading-relaxed"
                />
                <p className="text-xs text-gray-500 mt-1.5 font-medium">
                  Alasan ini akan dikirim sebagai notifikasi ke tutor
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-150 flex gap-3">
              <button
                onClick={() => {
                  setRejectModal({ open: false, presensi: null });
                  setAlasanPenolakan('');
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleTolak}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-colors text-sm"
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

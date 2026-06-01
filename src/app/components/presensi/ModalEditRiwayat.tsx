// PRIVATE_FIXED/src/app/components/presensi/ModalEditRiwayat.tsx
import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface ModalEditRiwayatProps {
  isOpen: boolean;
  onClose: () => void;
  presensi: Presensi | null;
  onSave: (updated: Presensi) => void;
}

const levelPricing = {
  'Calistung': { harga: 40000, durasi: [60, 90, 120] },
  'SD': { harga: 50000, durasi: [60, 90, 120] },
  'SMP': { harga: 60000, durasi: [60, 90, 120, 150, 180] },
  'SMA': { harga: 70000, durasi: [60, 90, 120, 150, 180] },
};

export function ModalEditRiwayat({ isOpen, onClose, presensi, onSave }: ModalEditRiwayatProps) {
  const [formData, setFormData] = useState<Presensi | null>(null);

  useEffect(() => {
    if (presensi) {
      setFormData(presensi);
    }
  }, [presensi]);

  if (!isOpen || !presensi || !formData) return null;

  // Cek apakah status sudah "Selesai" (tidak bisa diedit)
  const isLocked = presensi.status === 'selesai';

  const calculateFee = (level: string, durasi: number) => {
    const pricing = levelPricing[level as keyof typeof levelPricing];
    if (!pricing) return 0;
    const hargaPerMenit = pricing.harga / 60;
    const total = hargaPerMenit * durasi;
    return Math.round(total * 0.9); // Potong 10%
  };

  const handleDurasiChange = (durasi: number) => {
    const feeBersih = calculateFee(formData.level, durasi);
    setFormData({ ...formData, durasi, feeBersih });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl">{isLocked ? 'Detail Presensi' : 'Edit Presensi'}</h2>
            <p className="text-sm text-gray-500 mt-1">{presensi.id}</p>
            {isLocked && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Data sudah Selesai (Payout) dan tidak dapat diedit
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Perhatian:</strong> Presensi dengan status "Selesai (Payout)" tidak dapat diedit karena pembayaran sudah dilakukan.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Tutor</label>
              <input
                type="text"
                value={formData.tutorNama}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Siswa</label>
              <input
                type="text"
                value={formData.siswaNama}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Mata Pelajaran</label>
              <select
                value={formData.mapelNama}
                onChange={(e) => setFormData({ ...formData, mapelNama: e.target.value })}
                disabled={isLocked}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              >
                <option value="Matematika">Matematika</option>
                <option value="Fisika">Fisika</option>
                <option value="Kimia">Kimia</option>
                <option value="Bahasa Inggris">Bahasa Inggris</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Level</label>
              <input
                type="text"
                value={formData.level}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Tanggal</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                disabled={isLocked}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'disetujui' | 'ditolak' | 'selesai' })}
                disabled={isLocked}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              >
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="selesai">Selesai (Payout)</option>
              </select>
              {!isLocked && (
                <p className="text-xs text-gray-500 mt-1">
                  Ubah status presensi sesuai kebutuhan
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-2">Durasi (menit)</label>
              <div className="grid grid-cols-5 gap-2">
                {levelPricing[formData.level as keyof typeof levelPricing]?.durasi.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => !isLocked && handleDurasiChange(dur)}
                    disabled={isLocked}
                    className={`py-3 px-4 rounded-lg border-2 transition-all disabled:cursor-not-allowed ${formData.durasi === dur
                        ? 'border-blue-600 bg-blue-50 text-blue-600 font-medium'
                        : 'border-gray-200 hover:border-blue-300'
                      } ${isLocked ? 'opacity-50' : ''}`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Fee Tutor (setelah potong 10%)</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Dihitung otomatis: {formData.durasi} menit × Level {formData.level}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatRupiah(formData.feeBersih)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isLocked ? 'Tutup' : 'Batal'}
          </button>
          {!isLocked && (
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Simpan Perubahan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface ModalEditPresensiProps {
  isOpen: boolean;
  onClose: () => void;
  presensi: PresensiPending | null;
  onSave: (updated: PresensiPending) => void;
}

const levelPricing = {
  'Calistung': { harga: 40000, durasi: [60, 90, 120] },
  'SD': { harga: 50000, durasi: [60, 90, 120] },
  'SMP': { harga: 60000, durasi: [60, 90, 120, 150, 180] },
  'SMA': { harga: 70000, durasi: [60, 90, 120, 150, 180] },
};

export function ModalEditPresensi({ isOpen, onClose, presensi, onSave }: ModalEditPresensiProps) {
  const [formData, setFormData] = useState<PresensiPending | null>(null);

  useEffect(() => {
    if (presensi) {
      setFormData(presensi);
    }
  }, [presensi]);

  if (!isOpen || !presensi || !formData) return null;

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
      className="fixed inset-0 bg-black/50 flex items-center justify-end z-50"
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-full max-w-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl">Edit Presensi</h2>
            <p className="text-sm text-gray-500 mt-1">{presensi.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-medium">Perhatian</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Perubahan data akan otomatis menghitung ulang fee tutor berdasarkan durasi dan level yang dipilih.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-2">ID Sesi</label>
              <input
                type="text"
                value={formData.id}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

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
              <label className="block text-sm text-gray-600 mb-2">Mata Pelajaran *</label>
              <select
                value={formData.mapelId}
                onChange={(e) => {
                  const selectedMapel = e.target.value;
                  setFormData({
                    ...formData,
                    mapelId: selectedMapel,
                    mapelNama: e.target.options[e.target.selectedIndex].text,
                  });
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MAP-001">Matematika</option>
                <option value="MAP-004">Fisika</option>
                <option value="MAP-005">Kimia</option>
                <option value="MAP-007">Bahasa Inggris</option>
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
              <label className="block text-sm text-gray-600 mb-2">Tanggal *</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Waktu Mulai *</label>
              <input
                type="time"
                value={formData.waktuMulai}
                onChange={(e) => setFormData({ ...formData, waktuMulai: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'diselesaikan' | 'tertunda' })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="diselesaikan">Diselesaikan</option>
                <option value="tertunda">Tertunda</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Ubah status presensi sesuai kebutuhan
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-2">Durasi (menit) *</label>
              <div className="grid grid-cols-5 gap-2">
                {levelPricing[formData.level as keyof typeof levelPricing]?.durasi.map((dur) => (
                  <button
                    key={dur}
                    onClick={() => handleDurasiChange(dur)}
                    className={`py-3 px-4 rounded-lg border-2 transition-all ${
                      formData.durasi === dur
                        ? 'border-blue-600 bg-blue-50 text-blue-600 font-medium'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-2">Catatan Materi</label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tulis catatan materi yang diajarkan..."
              />
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

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium mb-2">Preview Bukti Foto</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={formData.buktiUrl}
                alt="Bukti Pembelajaran"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

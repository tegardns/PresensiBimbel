// PRIVATE_FIXED/src/app/components/presensi/ModalEditRiwayat.tsx
import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../../services/api';

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
  catatan: string;
  buktiUrl: string;
}

interface ModalEditRiwayatProps {
  isOpen: boolean;
  onClose: () => void;
  presensi: Presensi | null;
  onSave: (updated: Presensi) => void;
}

interface SubjectItem {
  id: string;
  code: string;
  nama: string;
}

interface LevelItem {
  id: string;
  code: string;
  name: string;
  hargaJual: number;
  durasiMenit: number;
  potonganAdmin: number;
}

const levelPricing = {
  'Calistung': { harga: 35000, durasi: [75] },
  'SD': { harga: 50000, durasi: [90, 120] },
  'SMP': { harga: 60000, durasi: [90, 120, 150, 180] },
  'SMA': { harga: 70000, durasi: [90, 120, 150, 180] },
};

export function ModalEditRiwayat({ isOpen, onClose, presensi, onSave }: ModalEditRiwayatProps) {
  const [formData, setFormData] = useState<Presensi | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [levels, setLevels] = useState<LevelItem[]>([]);

  const calculateFee = (levelName: string, durasi: number) => {
    let cleanLevel = 'SD';
    if (levelName.toUpperCase().includes('CALISTUNG')) cleanLevel = 'Calistung';
    else if (levelName.toUpperCase().includes('SD')) cleanLevel = 'SD';
    else if (levelName.toUpperCase().includes('SMP')) cleanLevel = 'SMP';
    else if (levelName.toUpperCase().includes('SMA')) cleanLevel = 'SMA';

    const dbLevel = levels.find((l) => l.name.toUpperCase() === cleanLevel.toUpperCase());

    if (!dbLevel) {
      const pricing = levelPricing[cleanLevel as keyof typeof levelPricing] || levelPricing['SD'];
      const potongan = cleanLevel === 'Calistung' ? 20 : 10;
      const baseDurasi = cleanLevel === 'Calistung' ? 75 : 60;
      const hargaPerMenit = pricing.harga / baseDurasi;
      const total = hargaPerMenit * durasi;
      return Math.round(total * ((100 - potongan) / 100));
    }

    const hargaPerMenit = dbLevel.hargaJual / dbLevel.durasiMenit;
    const total = hargaPerMenit * durasi;
    return Math.round(total * ((100 - dbLevel.potonganAdmin) / 100));
  };

  const getPotonganAdmin = (levelName: string) => {
    let cleanLevel = 'SD';
    if (levelName.toUpperCase().includes('CALISTUNG')) cleanLevel = 'Calistung';
    else if (levelName.toUpperCase().includes('SD')) cleanLevel = 'SD';
    else if (levelName.toUpperCase().includes('SMP')) cleanLevel = 'SMP';
    else if (levelName.toUpperCase().includes('SMA')) cleanLevel = 'SMA';

    const dbLevel = levels.find((l) => l.name.toUpperCase() === cleanLevel.toUpperCase());
    return dbLevel ? dbLevel.potonganAdmin : (cleanLevel === 'Calistung' ? 20 : 10);
  };

  // Fetch levels and subjects in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lvlRes, subRes] = await Promise.all([
          api.get('/levels'),
          api.get('/subjects')
        ]);
        setLevels(lvlRes.data);
        setSubjects(subRes.data);
      } catch (error) {
        console.error('Gagal mengambil data master level & mapel:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (presensi) {
      // Format ISO date to YYYY-MM-DD
      let formattedDate = '';
      try {
        formattedDate = new Date(presensi.tanggal).toISOString().split('T')[0];
      } catch (e) {
        formattedDate = presensi.tanggal;
      }

      const isCalistung = presensi.level.toUpperCase().includes('CALISTUNG');
      const finalDurasi = isCalistung ? 75 : presensi.durasi;

      setFormData({
        ...presensi,
        tanggal: formattedDate,
        durasi: finalDurasi,
        feeBersih: calculateFee(presensi.level, finalDurasi),
      });
    }
  }, [presensi, levels]);

  if (!isOpen || !presensi || !formData) return null;

  const isLocked = presensi.status === 'selesai';

  const handleDurasiChange = (durasi: number) => {
    const feeBersih = calculateFee(formData.level, durasi);
    setFormData({ ...formData, durasi, feeBersih });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDurasiOptions = () => {
    let cleanLevel = 'SD';
    if (formData.level.toUpperCase().includes('CALISTUNG')) cleanLevel = 'Calistung';
    else if (formData.level.toUpperCase().includes('SD')) cleanLevel = 'SD';
    else if (formData.level.toUpperCase().includes('SMP')) cleanLevel = 'SMP';
    else if (formData.level.toUpperCase().includes('SMA')) cleanLevel = 'SMA';

    return levelPricing[cleanLevel as keyof typeof levelPricing]?.durasi || [60, 90, 120];
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-150 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{isLocked ? 'Detail Riwayat Presensi' : 'Edit Riwayat Presensi'}</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              ID Sesi: {presensi.id.includes("-") && presensi.id.length > 8
                ? `SES-${presensi.id.split("-")[0].toUpperCase()}`
                : presensi.id}
            </p>
            {isLocked && (
              <p className="text-xs text-red-500 font-semibold mt-1">
                ⚠️ Data sudah berstatus Selesai (Payout) dan tidak dapat diubah.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {isLocked && (
            <div className="bg-red-50 border border-red-250 rounded-xl p-4">
              <p className="text-sm text-red-800 font-medium leading-relaxed">
                <strong>Informasi Keamanan Keuangan:</strong> Presensi dengan status "Selesai (Payout)" terkunci secara otomatis karena dana pembayaran sudah berhasil ditransfer/di-payout ke tutor.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tutor</label>
              <input
                type="text"
                value={formData.tutorNama}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Siswa</label>
              <input
                type="text"
                value={formData.siswaNama}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran *</label>
              <select
                value={formData.mapelNama}
                onChange={(e) => setFormData({ ...formData, mapelNama: e.target.value })}
                disabled={isLocked}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm font-medium"
              >
                {subjects.length > 0 ? (
                  subjects.map((subj) => (
                    <option key={subj.id} value={subj.nama}>
                      {subj.nama} ({subj.level})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Matematika">Matematika</option>
                    <option value="Fisika">Fisika</option>
                    <option value="Kimia">Kimia</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
              <input
                type="text"
                value={formData.level}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal *</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                disabled={isLocked}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                disabled={isLocked}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm font-medium"
              >
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="diselesaikan">Diselesaikan (Kembalikan ke Antrean)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Durasi (menit) *</label>
              <div className="grid grid-cols-4 gap-2">
                {getDurasiOptions().map((dur) => {
                  const isCalistung = formData.level.toUpperCase().includes('CALISTUNG');
                  const isDisabled = isLocked || isCalistung;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => !isDisabled && handleDurasiChange(dur)}
                      disabled={isDisabled}
                      className={`py-3 px-4 rounded-xl border-2 transition-all text-sm disabled:cursor-not-allowed ${
                        formData.durasi === dur
                          ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 font-medium'
                      } ${isDisabled ? 'opacity-70 bg-gray-50 cursor-not-allowed text-gray-500 border-gray-200' : ''}`}
                    >
                      {dur} menit
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan</label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                disabled={isLocked}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm leading-relaxed"
                placeholder="Tulis catatan..."
              />
            </div>

            <div className="col-span-2">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Fee Bersih Tutor (Potongan {getPotonganAdmin(formData.level)}%)
                    </p>
                    <p className="text-xs text-green-600 mt-0.5 font-medium">
                      Perhitungan: {formData.durasi} menit × tarif level {formData.level}
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-green-700">
                    {formatRupiah(formData.feeBersih)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-150 p-6 flex gap-3 z-10">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-colors text-sm"
          >
            {isLocked ? 'Tutup' : 'Batal'}
          </button>
          {!isLocked && (
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
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

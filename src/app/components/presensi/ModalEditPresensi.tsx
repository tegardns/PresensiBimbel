// PRIVATE_FIXED/src/app/components/presensi/ModalEditPresensi.tsx
import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import api from '../../../services/api';

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

interface ModalEditPresensiProps {
  isOpen: boolean;
  onClose: () => void;
  presensi: PresensiPending | null;
  onSave: (updated: PresensiPending) => void;
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

export function ModalEditPresensi({ isOpen, onClose, presensi, onSave }: ModalEditPresensiProps) {
  const [formData, setFormData] = useState<PresensiPending | null>(null);
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

  // Fetch levels and subjects in parallel from database
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
      // Ensure ISO date is formatted for date input (YYYY-MM-DD)
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

  // Get dynamic duration array based on level
  const getDurasiOptions = () => {
    let cleanLevel = 'SD';
    if (formData.level.toUpperCase().includes('CALISTUNG')) cleanLevel = 'Calistung';
    else if (formData.level.toUpperCase().includes('SD')) cleanLevel = 'SD';
    else if (formData.level.toUpperCase().includes('SMP')) cleanLevel = 'SMP';
    else if (formData.level.toUpperCase().includes('SMA')) cleanLevel = 'SMA';

    return levelPricing[cleanLevel as keyof typeof levelPricing]?.durasi || [60, 90, 120];
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
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-end z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-full max-w-2xl overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-150 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Presensi</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              ID Sesi: {presensi.id.includes("-") && presensi.id.length > 8
                ? `SES-${presensi.id.split("-")[0].toUpperCase()}`
                : presensi.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-semibold">Perhatian</p>
                <p className="text-xs text-yellow-700 mt-1 font-medium leading-relaxed">
                  Perubahan data akan otomatis menghitung ulang fee bersih tutor berdasarkan durasi mengajar dan level jenjang siswa.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID Sesi</label>
              <input
                type="text"
                value={formData.id}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 font-mono text-sm text-gray-500"
              />
            </div>

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
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    mapelNama: e.target.value,
                  });
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                {subjects.length > 0 ? (
                  // Map dynamic list of subjects from DB!
                  subjects.map((subj) => (
                    <option key={subj.id} value={subj.nama}>
                      {subj.nama} ({subj.level})
                    </option>
                  ))
                ) : (
                  // Fallbacks in case loading
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Level Jenjang</label>
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Waktu Mulai *</label>
              <input
                type="time"
                value={formData.waktuMulai}
                onChange={(e) => setFormData({ ...formData, waktuMulai: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono font-medium"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="diselesaikan">Diselesaikan</option>
                <option value="tertunda">Tertunda</option>
              </select>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">
                Ubah status antrean persetujuan presensi
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Durasi (menit) *</label>
              <div className="grid grid-cols-4 gap-2">
                {getDurasiOptions().map((dur) => {
                  const isCalistung = formData.level.toUpperCase().includes('CALISTUNG');
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => !isCalistung && handleDurasiChange(dur)}
                      disabled={isCalistung}
                      className={`py-3 px-4 rounded-xl border-2 transition-all text-sm ${
                        formData.durasi === dur
                          ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 font-medium'
                      } ${isCalistung ? 'opacity-70 bg-gray-50 cursor-not-allowed text-gray-500 border-gray-200' : ''}`}
                    >
                      {dur} menit
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Materi</label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                placeholder="Tulis catatan materi yang diajarkan..."
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

          <div className="border-t border-gray-150 pt-6">
            <h4 className="font-bold text-gray-800 mb-2">Preview Bukti Foto</h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2">
              <ImageWithFallback
                src={getBuktiImage(formData.buktiUrl)}
                alt="Bukti Pembelajaran"
                className="max-h-[300px] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-150 p-6 flex gap-3 z-10">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition-colors text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Save className="w-5 h-5" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

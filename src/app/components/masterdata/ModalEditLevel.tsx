import { X, Save } from 'lucide-react';

interface Level {
  id: string;
  nama: string;
  hargaJual: number;
  durasiMenit: number;
  potonganAdmin: number;
  color: string;
  icon: string;
}

interface ModalEditLevelProps {
  isOpen: boolean;
  onClose: () => void;
  level: Level | null;
}

export function ModalEditLevel({ isOpen, onClose, level }: ModalEditLevelProps) {
  if (!isOpen || !level) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    alert(`Update Level ${level.nama} berhasil!\n\nData: ${JSON.stringify(data, null, 2)}`);
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
        className="bg-white rounded-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl">Edit Harga Level {level.nama}</h2>
            <p className="text-sm text-gray-500 mt-1">{level.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <span className="text-6xl">{level.icon}</span>
            <p className="text-lg font-medium mt-2">{level.nama}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Harga Jual per Sesi *
            </label>
            <input
              type="number"
              name="hargaJual"
              defaultValue={level.hargaJual}
              min="0"
              step="1000"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Harga per sesi untuk level {level.nama}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Durasi Standar (menit) *
            </label>
            <select
              name="durasiMenit"
              defaultValue={level.durasiMenit}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="60">60 menit</option>
              <option value="90">90 menit</option>
              <option value="120">120 menit</option>
              <option value="150">150 menit</option>
              <option value="180">180 menit</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Durasi standar untuk satu sesi
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Potongan Admin (%)
            </label>
            <input
              type="number"
              name="potonganAdmin"
              defaultValue={level.potonganAdmin}
              min="0"
              max="100"
              step="1"
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Persentase potongan untuk admin (default 10%)
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-900">Fee Tutor:</p>
              <p className="font-bold text-blue-600">
                {formatRupiah(level.hargaJual * 0.9)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-900">Pendapatan Admin:</p>
              <p className="font-bold text-blue-600">
                {formatRupiah(level.hargaJual * 0.1)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

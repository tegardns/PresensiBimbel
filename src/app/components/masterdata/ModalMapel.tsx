import { X } from 'lucide-react';

interface Mapel {
  id: string;
  nama: string;
  level: 'Calistung' | 'SD' | 'SMP' | 'SMA';
  status: 'aktif' | 'nonaktif';
}

interface ModalMapelProps {
  isOpen: boolean;
  onClose: () => void;
  mapel: Mapel | null;
}

export function ModalMapel({ isOpen, onClose, mapel }: ModalMapelProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    alert(`${mapel ? 'Update' : 'Tambah'} Mata Pelajaran berhasil!\n\nData: ${JSON.stringify(data, null, 2)}`);
    onClose();
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
          <h2 className="text-xl">{mapel ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">ID Mapel</label>
            <input
              type="text"
              name="id"
              defaultValue={mapel?.id || 'Auto Generated'}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Nama Mata Pelajaran *</label>
            <input
              type="text"
              name="nama"
              defaultValue={mapel?.nama}
              placeholder="Contoh: Matematika"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Level Mapel *</label>
            <select
              name="level"
              defaultValue={mapel?.level || ''}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Level</option>
              <option value="Calistung">Calistung</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Status</label>
            <select
              name="status"
              defaultValue={mapel?.status || 'aktif'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
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
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mapel ? 'Simpan Perubahan' : 'Tambah Mapel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

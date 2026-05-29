import { X } from 'lucide-react';
import { useState } from 'react';

interface Siswa {
  id: string;
  nama: string;
  level: 'Calistung' | 'SD' | 'SMP' | 'SMA';
  alamat: string;
  asalSekolah: string;
  namaOrtu: string;
  noOrtu: string;
  status: 'aktif' | 'nonaktif';
}

interface ModalSiswaProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: Siswa | null;
}

export function ModalSiswa({ isOpen, onClose, siswa }: ModalSiswaProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    alert(`${siswa ? 'Update' : 'Tambah'} Siswa berhasil!\n\nData: ${JSON.stringify(data, null, 2)}`);
    onClose();
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
          <h2 className="text-2xl">{siswa ? 'Edit Siswa' : 'Tambah Siswa'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">ID Siswa</label>
              <input
                type="text"
                name="id"
                defaultValue={siswa?.id || 'Auto Generated'}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Status</label>
              <select
                name="status"
                defaultValue={siswa?.status || 'aktif'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Nama Lengkap Siswa *</label>
            <input
              type="text"
              name="nama"
              defaultValue={siswa?.nama}
              placeholder="Masukkan nama lengkap siswa"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Level Siswa *</label>
            <select
              name="level"
              defaultValue={siswa?.level || ''}
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
            <label className="block text-sm text-gray-600 mb-2">Asal Sekolah *</label>
            <input
              type="text"
              name="asalSekolah"
              defaultValue={siswa?.asalSekolah}
              placeholder="Contoh: SDN 01 Jakarta Pusat"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Alamat</label>
            <textarea
              name="alamat"
              defaultValue={siswa?.alamat}
              placeholder="Masukkan alamat lengkap"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Nama Orang Tua *</label>
            <input
              type="text"
              name="namaOrtu"
              defaultValue={siswa?.namaOrtu}
              placeholder="Masukkan nama orang tua/wali"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">No. WhatsApp Orang Tua *</label>
            <input
              type="text"
              name="noOrtu"
              defaultValue={siswa?.noOrtu}
              placeholder="08xxxxxxxxxx"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-6 sticky bottom-0 bg-white border-t border-gray-200 -mx-6 -mb-6 px-6 py-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {siswa ? 'Simpan Perubahan' : 'Tambah Siswa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

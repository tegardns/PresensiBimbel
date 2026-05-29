import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tutor, siswas, getLevelById } from '../../data/mockData';

interface ModalTutorProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor | null;
  onSave: (tutorData: Tutor) => void;
}

const allSiswa = siswas.map(s => ({
  id: s.id,
  nama: s.nama,
  level: getLevelById(s.levelId)?.nama || '',
}));

export function ModalTutor({ isOpen, onClose, tutor, onSave }: ModalTutorProps) {
  const [formData, setFormData] = useState<Tutor>({
    id: '',
    nama: '',
    email: '',
    posisi: '',
    noWa: '',
    alamat: '',
    namaBank: '',
    noRek: '',
    username: '',
    status: 'aktif',
  });
  const [password, setPassword] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState<string[]>(['SIS-001', 'SIS-002']);
  const [searchSiswa, setSearchSiswa] = useState('');

  useEffect(() => {
    if (tutor) {
      setFormData(tutor);
    } else {
      setFormData({
        id: '',
        nama: '',
        email: '',
        posisi: '',
        noWa: '',
        alamat: '',
        namaBank: '',
        noRek: '',
        username: '',
        status: 'aktif',
      });
      setPassword('');
    }
  }, [tutor]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.nama || !formData.email || !formData.posisi || !formData.noWa || !formData.username) {
      alert('Mohon lengkapi semua field yang wajib diisi (*)');
      return;
    }

    if (!tutor && !password) {
      alert('Password wajib diisi untuk tutor baru');
      return;
    }

    onSave(formData);
    onClose();
  };

  const availableSiswa = allSiswa.filter(s => !selectedSiswa.includes(s.id));
  const assignedSiswa = allSiswa.filter(s => selectedSiswa.includes(s.id));

  const filteredAvailable = availableSiswa.filter(s =>
    s.nama.toLowerCase().includes(searchSiswa.toLowerCase())
  );

  const addSiswa = (id: string) => {
    setSelectedSiswa([...selectedSiswa, id]);
  };

  const removeSiswa = (id: string) => {
    setSelectedSiswa(selectedSiswa.filter(s => s !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50" onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl">{tutor ? 'Edit Tutor' : 'Tambah Tutor'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">ID Tutor</label>
              <input
                type="text"
                value={tutor?.id || 'Auto Generated'}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Nama Lengkap *</label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Posisi *</label>
            <input
              type="text"
              value={formData.posisi}
              onChange={(e) => setFormData({ ...formData, posisi: e.target.value })}
              placeholder="Contoh: Tentor Matematika & Fisika"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Nomor WhatsApp *</label>
            <input
              type="text"
              value={formData.noWa}
              onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Alamat</label>
            <textarea
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Masukkan alamat lengkap"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Nama Bank</label>
              <select
                value={formData.namaBank}
                onChange={(e) => setFormData({ ...formData, namaBank: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white"
              >
                <option value="">Pilih Bank</option>
                <option value="BCA">BCA</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BNI">BNI</option>
                <option value="BRI">BRI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Nomor Rekening</label>
              <input
                type="text"
                value={formData.noRek}
                onChange={(e) => setFormData({ ...formData, noRek: e.target.value })}
                placeholder="xxxxxxxxxx"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="username"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Password {!tutor && '*'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tutor ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium mb-4">Pengaturan Siswa yang Diajar</h3>
            <p className="text-sm text-gray-500 mb-4">
              Pilih siswa yang akan diajar oleh tutor ini. Siswa yang dipilih akan muncul di aplikasi tutor saat melakukan presensi.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Siswa Tersedia</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari siswa..."
                    value={searchSiswa}
                    onChange={(e) => setSearchSiswa(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto">
                  {filteredAvailable.map((siswa) => (
                    <div
                      key={siswa.id}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => addSiswa(siswa.id)}
                    >
                      <p className="text-sm font-medium">{siswa.nama}</p>
                      <p className="text-xs text-gray-500">{siswa.level} • {siswa.id}</p>
                    </div>
                  ))}
                  {filteredAvailable.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Tidak ada siswa tersedia
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Siswa yang Diajar ({assignedSiswa.length})
                </label>
                <div className="border border-blue-200 rounded-lg h-64 overflow-y-auto mt-8 bg-blue-50">
                  {assignedSiswa.map((siswa) => (
                    <div
                      key={siswa.id}
                      className="p-3 border-b border-blue-100 hover:bg-blue-100 cursor-pointer flex items-center justify-between"
                      onClick={() => removeSiswa(siswa.id)}
                    >
                      <div>
                        <p className="text-sm font-medium">{siswa.nama}</p>
                        <p className="text-xs text-gray-500">{siswa.level} • {siswa.id}</p>
                      </div>
                      <X className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                  {assignedSiswa.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Belum ada siswa yang dipilih
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {tutor ? 'Simpan Perubahan' : 'Tambah Tutor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

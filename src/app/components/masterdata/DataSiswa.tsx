import { useState } from 'react';
import { Search, Plus, Edit2, Power, Eye, Trash2 } from 'lucide-react';
import { ModalSiswa } from './ModalSiswa';

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

const mockSiswa: Siswa[] = [
  {
    id: 'SIS-001',
    nama: 'Ahmad Rizki',
    level: 'SD',
    alamat: 'Jl. Melati No. 12, Jakarta',
    asalSekolah: 'SDN 01 Jakarta Pusat',
    namaOrtu: 'Bapak Ahmad',
    noOrtu: '081234567890',
    status: 'aktif',
  },
  {
    id: 'SIS-002',
    nama: 'Budi Santoso',
    level: 'SMP',
    alamat: 'Jl. Mawar No. 34, Jakarta',
    asalSekolah: 'SMPN 5 Jakarta Selatan',
    namaOrtu: 'Ibu Santi',
    noOrtu: '082345678901',
    status: 'aktif',
  },
  {
    id: 'SIS-003',
    nama: 'Dedi Prasetyo',
    level: 'SMA',
    alamat: 'Jl. Anggrek No. 56, Jakarta',
    asalSekolah: 'SMAN 3 Jakarta',
    namaOrtu: 'Bapak Prasetyo',
    noOrtu: '083456789012',
    status: 'aktif',
  },
];

interface DataSiswaProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DataSiswa({ searchQuery, setSearchQuery }: DataSiswaProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Calistung' | 'SD' | 'SMP' | 'SMA'>('all');
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);

  const filteredSiswa = mockSiswa.filter((siswa) => {
    const matchesSearch = siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         siswa.asalSekolah.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || siswa.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || siswa.level === levelFilter;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    const colors = {
      'Calistung': 'bg-yellow-100 text-yellow-700',
      'SD': 'bg-blue-100 text-blue-700',
      'SMP': 'bg-purple-100 text-purple-700',
      'SMA': 'bg-green-100 text-green-700',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Level</option>
            <option value="Calistung">Calistung</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'aktif' | 'nonaktif')}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingSiswa(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">ID Siswa</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Nama Siswa</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Level</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Asal Sekolah</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSiswa.map((siswa) => (
                <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{siswa.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                        {siswa.nama.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{siswa.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getLevelColor(siswa.level)}`}>
                      {siswa.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{siswa.asalSekolah}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                        siswa.status === 'aktif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {siswa.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSiswa(siswa)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingSiswa(siswa);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-orange-100 rounded-lg transition-colors" title="Nonaktifkan">
                        <Power className="w-4 h-4 text-orange-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus siswa "${siswa.nama}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
                            alert(`Siswa ${siswa.nama} berhasil dihapus`);
                          }
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSiswa.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data siswa yang ditemukan
          </div>
        )}
      </div>

      {selectedSiswa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSiswa(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl mb-4">Detail Siswa</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Nama Lengkap</label>
                <p className="font-medium">{selectedSiswa.nama}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Nama Orang Tua</label>
                <p className="font-medium">{selectedSiswa.namaOrtu}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">No. WA Orang Tua</label>
                <p className="font-medium">{selectedSiswa.noOrtu}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Alamat</label>
                <p className="font-medium">{selectedSiswa.alamat}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSiswa(null)}
              className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <ModalSiswa
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        siswa={editingSiswa}
      />
    </div>
  );
}

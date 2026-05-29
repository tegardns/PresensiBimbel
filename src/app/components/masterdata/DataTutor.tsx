import { useState } from 'react';
import { Search, Plus, Edit2, Power, LogIn, Trash2 } from 'lucide-react';
import { ModalTutor } from './ModalTutor';
import { tutors as initialTutors, Tutor } from '../../data/mockData';

interface DataTutorProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DataTutor({ searchQuery, setSearchQuery }: DataTutorProps) {
  const [tutors, setTutors] = useState<Tutor[]>(initialTutors);
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch = tutor.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.posisi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tutor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTutor(null);
    setIsModalOpen(true);
  };

  const handleSave = (tutorData: Tutor) => {
    if (selectedTutor) {
      // Edit existing tutor
      setTutors(tutors.map(t => t.id === selectedTutor.id ? tutorData : t));
      alert(`Data tutor ${tutorData.nama} berhasil diupdate!`);
    } else {
      // Add new tutor
      const newTutor = {
        ...tutorData,
        id: `TUT-${String(tutors.length + 1).padStart(3, '0')}`,
      };
      setTutors([...tutors, newTutor]);
      alert(`Tutor ${tutorData.nama} berhasil ditambahkan!\n\nID: ${newTutor.id}`);
    }
  };

  const handleLoginAs = (tutor: Tutor) => {
    alert(`Login sebagai ${tutor.nama}\n\nFitur ini akan membuka akun tutor di tab baru.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Tutor
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">ID Tutor</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Foto & Nama</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Posisi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">No. WhatsApp</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTutors.map((tutor) => (
                <tr key={tutor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{tutor.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {tutor.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{tutor.nama}</p>
                        <p className="text-sm text-gray-500">{tutor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{tutor.posisi}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{tutor.noWa}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                        tutor.status === 'aktif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tutor.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLoginAs(tutor)}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors group"
                        title="Login sebagai Tutor"
                      >
                        <LogIn className="w-4 h-4 text-purple-600" />
                      </button>
                      <button
                        onClick={() => handleEdit(tutor)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-orange-100 rounded-lg transition-colors group"
                        title={tutor.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <Power className="w-4 h-4 text-orange-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus tutor "${tutor.nama}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
                            alert(`Tutor ${tutor.nama} berhasil dihapus`);
                          }
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
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

        {filteredTutors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data tutor yang ditemukan
          </div>
        )}
      </div>

      <ModalTutor
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tutor={selectedTutor}
        onSave={handleSave}
      />
    </div>
  );
}

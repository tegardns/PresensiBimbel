// PRIVATE_FIXED/src/app/components/masterdata/DataSiswa.tsx
import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Power, Eye, Trash2 } from "lucide-react";
import api from "../../../services/api";
import { ModalSiswa } from "./ModalSiswa";

interface Siswa {
  id: string;
  kode: string;
  fullName: string;
  levelId: string;
  levelName: string;
  address: string;
  schoolName: string;
  parentName: string;
  parentPhone: string;
  isActive: boolean;
}

interface DataSiswaProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DataSiswa({ searchQuery, setSearchQuery }: DataSiswaProps) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "aktif" | "nonaktif"
  >("all");
  const [levelFilter, setLevelFilter] = useState<
    "all" | "Calistung" | "SD" | "SMP" | "SMA"
  >("all");
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [students, setStudents] = useState<Siswa[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      const data = res.data;

      const mapped: Siswa[] = data.map((item: any) => ({
        id: item.id,
        kode: item.kode,
        fullName: item.fullName,
        levelId: item.levelId,
        levelName: item.level?.name || "-",
        address: item.address || "-",
        schoolName: item.schoolName || "-",
        parentName: item.parentName || "-",
        parentPhone: item.parentPhone || "-",
        isActive: item.isActive,
      }));

      setStudents(mapped);
    } catch (error) {
      console.error("Gagal ambil data siswa:", error);
    }
  };

  const filteredSiswa = students.filter((siswa) => {
    const matchesSearch =
      siswa.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      siswa.schoolName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "aktif" && siswa.isActive) ||
      (statusFilter === "nonaktif" && !siswa.isActive);

    const matchesLevel =
      levelFilter === "all" || siswa.levelName === levelFilter;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    const colors = {
      Calistung: "bg-yellow-100 text-yellow-700",
      SD: "bg-blue-100 text-blue-700",
      SMP: "bg-purple-100 text-purple-700",
      SMA: "bg-green-100 text-green-700",
    };

    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus siswa?")) return;

    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (error) {
      console.error("Gagal hapus siswa:", error);
      alert("Gagal hapus siswa");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/students/${id}/status`);
      fetchStudents();
    } catch (error) {
      console.error("Gagal update status siswa:", error);
      alert("Gagal update status");
    }
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
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white"
          >
            <option value="all">Semua Level</option>
            <option value="Calistung">Calistung</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white"
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
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg"
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
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  ID Siswa
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Nama Siswa
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Level
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Asal Sekolah
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredSiswa.map((siswa) => (
                <tr key={siswa.kode}>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {siswa.kode}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                        {siswa.fullName.charAt(0)}
                      </div>
                      <span className="font-medium">{siswa.fullName}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getLevelColor(siswa.levelName)}`}
                    >
                      {siswa.levelName}
                    </span>
                  </td>

                  <td className="px-6 py-4">{siswa.schoolName}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${siswa.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {siswa.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSiswa(siswa)}
                        className="p-2 hover:bg-blue-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingSiswa(siswa);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>

                      <button className="p-2 hover:bg-orange-100 rounded-lg">
                        <Power className="w-4 h-4 text-orange-600" />
                      </button>

                      <button
                        onClick={() => handleDelete(siswa.id)}
                        className="p-2 hover:bg-red-100 rounded-lg"
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
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedSiswa(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl mb-4">Detail Siswa</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Nama Lengkap</label>
                <p className="font-medium">{selectedSiswa.fullName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Nama Orang Tua</label>
                <p className="font-medium">{selectedSiswa.parentName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">No WA Orang Tua</label>
                <p className="font-medium">{selectedSiswa.parentPhone}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Alamat</label>
                <p className="font-medium">{selectedSiswa.address}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSiswa(null)}
              className="mt-6 w-full py-2 bg-gray-100 rounded-lg"
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
        onSave={fetchStudents}
      />
    </div>
  );
}

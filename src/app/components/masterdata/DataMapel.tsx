// PRIVATE_FIXED/src/app/components/masterdata/DataMapel.tsx
import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../../services/api";
import { ModalMapel } from "./ModalMapel";
import { useConfirm } from "../../context/ConfirmContext";

export interface Mapel {
  id: string;
  code: string;
  nama: string;
  levelId: string;
  level: "Calistung" | "SD" | "SMP" | "SMA";
  status: "aktif" | "nonaktif";
  isActive: boolean;
}

interface DataMapelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DataMapel({ searchQuery, setSearchQuery }: DataMapelProps) {
  const [levelFilter, setLevelFilter] = useState<
    "all" | "Calistung" | "SD" | "SMP" | "SMA"
  >("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<Mapel | null>(null);
  const [mapels, setMapels] = useState<Mapel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const confirm = useConfirm();

  useEffect(() => {
    fetchMapel();
  }, []);

  const fetchMapel = async () => {
    try {
      setIsLoading(true);

      const res = await api.get("/subjects");
      setMapels(res.data);
    } catch (error) {
      console.error("Gagal ambil data mapel:", error);
      toast.error("Gagal ambil data mapel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/subjects/${id}/status`);
      fetchMapel();
      toast.success("Status mapel berhasil diubah");
    } catch (error) {
      console.error("Gagal mengubah status mapel:", error);
      toast.error("Gagal mengubah status mapel");
    }
  };

  const handleDelete = async (mapel: Mapel) => {
    const isConfirmed = await confirm({
      title: "Hapus Mata Pelajaran",
      description: `Apakah kamu yakin ingin menghapus mata pelajaran "${mapel.nama} (${mapel.level})"?\n\nData yang dihapus tidak dapat dikembalikan.`,
      variant: "danger",
      confirmText: "Hapus"
    });

    if (!isConfirmed) return;

    try {
      await api.delete(`/subjects/${mapel.id}`);
      fetchMapel();
      toast.success("Mapel berhasil dihapus");
    } catch (error) {
      console.error("Gagal menghapus mapel:", error);
      toast.error("Gagal menghapus mapel");
    }
  };

  const filteredMapel = mapels.filter((mapel) => {
    const matchesSearch = mapel.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesLevel = levelFilter === "all" || mapel.level === levelFilter;

    return matchesSearch && matchesLevel;
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

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
        Memuat data mata pelajaran...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Cari mata pelajaran..."
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
        </div>

        <button
          onClick={() => {
            setEditingMapel(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Mapel
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  ID Mapel
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Nama Mata Pelajaran
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Level Mapel
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
              {filteredMapel.map((mapel) => (
                <tr
                  key={mapel.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{mapel.code}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-medium">{mapel.nama}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getLevelColor(
                        mapel.level
                      )}`}
                    >
                      {mapel.level}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${mapel.status === "aktif"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {mapel.status === "aktif" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingMapel(mapel);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(mapel.id)}
                        className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                        title="Aktifkan/Nonaktifkan"
                      >
                        <Power className="w-4 h-4 text-orange-600" />
                      </button>

                      <button
                        onClick={() => handleDelete(mapel)}
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

        {filteredMapel.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data mata pelajaran yang ditemukan
          </div>
        )}
      </div>

      <ModalMapel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mapel={editingMapel}
        onSave={fetchMapel}
      />
    </div>
  );
}
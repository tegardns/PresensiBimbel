// PRIVATE_FIXED/src/app/components/masterdata/ModalMapel.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../../../services/api";
import type { Mapel } from "./DataMapel";

interface Level {
  id: string;
  name: string;
}

interface ModalMapelProps {
  isOpen: boolean;
  onClose: () => void;
  mapel: Mapel | null;
  onSave: () => void;
}

export function ModalMapel({
  isOpen,
  onClose,
  mapel,
  onSave,
}: ModalMapelProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [nama, setNama] = useState("");
  const [levelId, setLevelId] = useState("");
  const [status, setStatus] = useState<"aktif" | "nonaktif">("aktif");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await api.get("/levels");
        setLevels(res.data);
      } catch (error) {
        console.error("Gagal ambil level:", error);
      }
    };

    fetchLevels();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (mapel) {
      setNama(mapel.nama);
      setLevelId(mapel.levelId);
      setStatus(mapel.status);
    } else {
      setNama("");
      setLevelId("");
      setStatus("aktif");
    }
  }, [isOpen, mapel]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const payload = {
        name: nama,
        levelId,
        isActive: status === "aktif",
      };

      if (mapel) {
        await api.put(`/subjects/${mapel.id}`, payload);
        alert("Mata pelajaran berhasil diupdate!");
      } else {
        await api.post("/subjects", payload);
        alert("Mata pelajaran berhasil ditambahkan!");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan mapel:", error);
      alert("Gagal menyimpan mata pelajaran");
    } finally {
      setIsSubmitting(false);
    }
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
          <h2 className="text-xl">
            {mapel ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
          </h2>

          <button
            onClick={onClose}
            type="button"
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
              value={mapel?.code || "Auto Generated"}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Nama Mata Pelajaran *
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Matematika"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Level Mapel *
            </label>
            <select
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Level</option>

              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "aktif" | "nonaktif")
              }
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
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSubmitting
                ? "Menyimpan..."
                : mapel
                  ? "Simpan Perubahan"
                  : "Tambah Mapel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// PRIVATE_FIXED/src/app/components/masterdata/ModalSiswa.tsx
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../../services/api";

interface Siswa {
  id?: string;
  kode?: string;
  fullName: string;
  levelId: string;
  schoolName: string;
  address: string;
  parentName: string;
  parentPhone: string;
  isActive: boolean;
}

interface Level {
  id: string;
  name: string;
}

interface ModalSiswaProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: Siswa | null;
  onSave: () => void;
}

export function ModalSiswa({
  isOpen,
  onClose,
  siswa,
  onSave,
}: ModalSiswaProps) {
  const [levels, setLevels] = useState<Level[]>([]);

  const emptyForm: Siswa = {
    fullName: "",
    levelId: "",
    schoolName: "",
    address: "",
    parentName: "",
    parentPhone: "",
    isActive: true,
  };

  const [formData, setFormData] = useState<Siswa>(emptyForm);

  // =========================
  // FETCH LEVEL
  // =========================
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await api.get("/levels");
        setLevels(res.data);
      } catch (error) {
        console.error("Gagal fetch level:", error);
      }
    };

    fetchLevels();
  }, []);

  // =========================
  // SET FORM
  // =========================
  useEffect(() => {
    if (!isOpen) return;

    if (siswa) {
      setFormData({
        ...siswa,
      });
    } else {
      setFormData(emptyForm);
    }
  }, [siswa, isOpen]);

  if (!isOpen) return null;

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (siswa?.id) {
        await api.put(`/students/${siswa.id}`, formData);
        alert("Data siswa berhasil diupdate!");
      } else {
        await api.post("/students", formData);
        alert("Siswa berhasil ditambahkan!");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan data siswa:", error);
      alert("Gagal menyimpan data siswa");
    }
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
          <h2 className="text-2xl">{siswa ? "Edit Siswa" : "Tambah Siswa"}</h2>

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
              <label className="block text-sm text-gray-600 mb-2">
                ID Siswa
              </label>

              <input
                type="text"
                value={siswa?.kode || "Auto Generated"}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Status</label>

              <select
                value={formData.isActive ? "aktif" : "nonaktif"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.value === "aktif",
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* NAMA */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Nama Lengkap Siswa *
            </label>

            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fullName: e.target.value,
                })
              }
              placeholder="Masukkan nama lengkap siswa"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* LEVEL */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Level Siswa *
            </label>

            <select
              value={formData.levelId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  levelId: e.target.value,
                })
              }
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

          {/* SEKOLAH */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Asal Sekolah *
            </label>

            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  schoolName: e.target.value,
                })
              }
              placeholder="Contoh: SDN 01 Jakarta Pusat"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ALAMAT */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Alamat</label>

            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
              placeholder="Masukkan alamat lengkap"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ORTU */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Nama Orang Tua *
            </label>

            <input
              type="text"
              value={formData.parentName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentName: e.target.value,
                })
              }
              placeholder="Masukkan nama orang tua/wali"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* NO ORTU */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              No. WhatsApp Orang Tua *
            </label>

            <input
              type="text"
              value={formData.parentPhone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentPhone: e.target.value,
                })
              }
              placeholder="08xxxxxxxxxx"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* BUTTON */}
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
              {siswa ? "Simpan Perubahan" : "Tambah Siswa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

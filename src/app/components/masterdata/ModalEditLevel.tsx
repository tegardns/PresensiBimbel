// PRIVATE_FIXED/src/app/components/masterdata/ModalEditLevel.tsx
import { useState } from "react";
import { X, Save } from "lucide-react";
import api from "../../../services/api";
import type { Level } from "./DataLevel";

interface ModalEditLevelProps {
  isOpen: boolean;
  onClose: () => void;
  level: Level | null;
  onUpdated: () => void;
}

export function ModalEditLevel({
  isOpen,
  onClose,
  level,
  onUpdated,
}: ModalEditLevelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !level) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const formData = new FormData(e.target as HTMLFormElement);

      const payload = {
        hargaJual: Number(formData.get("hargaJual")),
        durasiMenit: level.name === "Calistung" ? 75 : Number(formData.get("durasiMenit")),
      };

      await api.put(`/levels/${level.id}`, payload);

      onUpdated();
      onClose();
    } catch (error) {
      console.error("Gagal update level:", error);
      setErrorMessage("Gagal menyimpan perubahan level.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const tutorFee = level.hargaJual * ((100 - level.potonganAdmin) / 100);
  const adminFee = level.hargaJual * (level.potonganAdmin / 100);

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
            <h2 className="text-xl">Edit Harga Level {level.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{level.id}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <span className="text-6xl">{level.icon}</span>
            <p className="text-lg font-medium mt-2">{level.name}</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

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
              Harga per sesi untuk level {level.name}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Durasi Standar (menit) *
            </label>
            <select
              name="durasiMenit"
              defaultValue={level.name === "Calistung" ? 75 : level.durasiMenit}
              required
              disabled={level.name === "Calistung"}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
            >
              {level.name === "Calistung" ? (
                <option value="75">75 menit</option>
              ) : (
                <>
                  <option value="90">90 menit</option>
                  <option value="120">120 menit</option>
                  <option value="150">150 menit</option>
                  <option value="180">180 menit</option>
                </>
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {level.name === "Calistung" 
                ? "Durasi untuk level Calistung dikunci pada 75 menit" 
                : "Durasi standar untuk satu sesi"}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Potongan Admin (%)
            </label>
            <input
              type="number"
              name="potonganAdmin"
              value={level.potonganAdmin}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500 rounded-lg"
            />
            <p className="text-xs text-orange-600 mt-1">
              Diatur secara global di Pengaturan &gt; Konfigurasi Sistem
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-900">Fee Tutor:</p>
              <p className="font-bold text-blue-600">
                {formatRupiah(tutorFee)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-900">Pendapatan Admin:</p>
              <p className="font-bold text-blue-600">
                {formatRupiah(adminFee)}
              </p>
            </div>
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
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
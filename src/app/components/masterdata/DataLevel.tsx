// PRIVATE_FIXED/src/app/components/masterdata/DataLevel.tsx
import { useEffect, useState } from "react";
import { Edit2, Clock, DollarSign, Percent, RefreshCw } from "lucide-react";
import api from "../../../services/api";
import { ModalEditLevel } from "./ModalEditLevel";

export interface Level {
  id: string;
  code: string;
  name: string;
  hargaJual: number;
  durasiMenit: number;
  potonganAdmin: number;
  color: string;
  icon: string;
}

interface LevelApiResponse {
  id: string;
  code?: string;
  name?: string;
  nama?: string;
  hargaJual?: number;
  harga?: number;
  durasiMenit?: number;
  durasi?: number;
  potonganAdmin?: number;
}

export function DataLevel() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await api.get<LevelApiResponse[]>("/levels");

      const mapped: Level[] = res.data.map((item) => {
        const levelName = item.name ?? item.nama ?? "-";

        return {
          id: item.id,
          code: item.code ?? item.id,
          name: levelName,
          hargaJual: Number(item.hargaJual ?? item.harga ?? 0),
          durasiMenit: Number(item.durasiMenit ?? item.durasi ?? 60),
          potonganAdmin: Number(item.potonganAdmin ?? 10),
          color: getColor(levelName),
          icon: getIcon(levelName),
        };
      });

      setLevels(mapped);
    } catch (error) {
      console.error("Gagal ambil data level:", error);
      setErrorMessage("Gagal mengambil data level dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelUpdated = () => {
    fetchLevels();
  };

  const getColor = (name: string) => {
    if (name === "Calistung") return "from-yellow-500 to-orange-500";
    if (name === "SD") return "from-blue-500 to-cyan-500";
    if (name === "SMP") return "from-purple-500 to-pink-500";
    if (name === "SMA") return "from-green-500 to-emerald-500";
    return "from-gray-500 to-gray-600";
  };

  const getIcon = (name: string) => {
    if (name === "Calistung") return "✏️";
    if (name === "SD") return "📚";
    if (name === "SMP") return "📖";
    if (name === "SMA") return "🎓";
    return "📘";
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin text-blue-600" />
        <p className="text-gray-500">Memuat data level...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700">{errorMessage}</p>
        <button
          onClick={fetchLevels}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-500">
        Atur harga jual, durasi, dan potongan admin untuk setiap level siswa
      </p>

      {levels.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500">Belum ada data level.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((level) => (
            <div
              key={level.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                className={`h-32 bg-gradient-to-br ${level.color} flex items-center justify-center`}
              >
                <span className="text-6xl">{level.icon}</span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl">{level.name}</h3>
                  <span className="text-xs text-gray-500">{level.code}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Harga Jual</p>
                      <p className="font-bold text-green-600">
                        {formatRupiah(level.hargaJual)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Durasi Sesi</p>
                      <p className="font-bold text-blue-600">
                        {level.durasiMenit} menit
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg">
                      <Percent className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Potongan Admin</p>
                      <p className="font-bold text-orange-600">
                        {level.potonganAdmin}%
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingLevel(level);
                    setIsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Harga
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalEditLevel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        level={editingLevel}
        {...({ onUpdated: handleLevelUpdated } as any)}
      />
    </div>
  );
}
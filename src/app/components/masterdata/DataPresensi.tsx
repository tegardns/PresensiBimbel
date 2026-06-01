// PRIVATE_FIXED/src/app/components/masterdata/DataPresensi.tsx
import { useEffect, useState } from "react";
import { Search, Image as ImageIcon } from "lucide-react";
import api from "../../../services/api";

interface Presensi {
  id: string;
  tutorId: string;
  tutorNama: string;
  siswaId: string;
  siswaNama: string;
  mapelId: string;
  mapelNama: string;
  tanggal: string;
  durasi: number;
  buktiUrl: string;
  catatan: string;
  feeBersih: number;
}

interface DataPresensiProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DataPresensi({
  searchQuery,
  setSearchQuery,
}: DataPresensiProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [presensiData, setPresensiData] = useState<Presensi[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    fetchPresensi();
  }, []);

  const fetchPresensi = async () => {
    try {
      const res = await api.get("/attendances");
      const data = res.data;

      const mapped: Presensi[] = data.map((item: any, index: number) => ({
        id: item.id || `SES-${new Date().getFullYear()}${String(index + 1).padStart(3, "0")}`,
        tutorId: item.tutorId || "-",
        tutorNama: item.tutorNama || "-",
        siswaId: item.siswaId || "-",
        siswaNama: item.siswaNama || "-",
        mapelId: item.mapelId || `MAP-${String(index + 1).padStart(3, "0")}`,
        mapelNama: item.mapelNama || "-",
        tanggal: item.tanggal || item.createdAt,
        durasi: Number(item.durasi || item.durationMin || 60),
        buktiUrl: item.buktiUrl || "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&auto=format&fit=crop",
        catatan: item.catatan || item.notes || "-",
        feeBersih: Number(item.feeBersih || item.feeNet || 0),
      }));

      setPresensiData(mapped);
    } catch (error) {
      console.log("Gagal ambil data presensi:", error);
    }
  };

  const filteredPresensi = presensiData.filter((presensi) => {
    const matchesSearch =
      presensi.tutorNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presensi.siswaNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presensi.mapelNama.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = !dateFilter || new Date(presensi.tanggal).toISOString().startsWith(dateFilter);

    return matchesSearch && matchesDate;
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Cari presensi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  ID Sesi
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Tanggal
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Tutor
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Siswa
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Mata Pelajaran
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Durasi
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Bukti Foto
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Fee Bersih
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredPresensi.map((presensi) => (
                <tr
                  key={presensi.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 font-mono font-medium">
                      {presensi.id.includes("-") && presensi.id.length > 8
                        ? `SES-${presensi.id.split("-")[0].toUpperCase()}`
                        : presensi.id}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {formatDate(presensi.tanggal)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm">{presensi.tutorNama}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm">{presensi.siswaNama}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm">{presensi.mapelNama}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm">{presensi.durasi} menit</span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedImage(presensi.buktiUrl)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Lihat bukti foto"
                    >
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-green-600">
                      {formatRupiah(presensi.feeBersih)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPresensi.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data presensi yang ditemukan
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full">
            <img
              src={selectedImage}
              alt="Bukti Presensi"
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={() => setSelectedImage(null)}
              className="mt-4 w-full py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

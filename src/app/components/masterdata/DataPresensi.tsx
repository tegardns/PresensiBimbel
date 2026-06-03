// PRIVATE_FIXED/src/app/components/masterdata/DataPresensi.tsx
import { useEffect, useState } from "react";
import { Search, Image as ImageIcon, Trash2, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../services/api";
import { toast } from "sonner";
import JSZip from "jszip";

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
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPresensi();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, monthFilter]);

  const fetchPresensi = async () => {
    try {
      setIsLoading(true);
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
      toast.error("Gagal mengambil data presensi");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPresensi = presensiData.filter((presensi) => {
    const matchesSearch =
      presensi.tutorNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presensi.siswaNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presensi.mapelNama.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMonth = !monthFilter || (() => {
      const date = new Date(presensi.tanggal);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}` === monthFilter;
    })();

    return matchesSearch && matchesMonth;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredPresensi.length / itemsPerPage) || 1;
  const paginatedPresensi = filteredPresensi.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedPresensi.map((p) => p.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    } else {
      const pageIds = paginatedPresensi.map((p) => p.id);
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Yakin ingin menghapus ${selectedIds.length} presensi terpilih?\n\nTindakan ini akan menghapus data di database serta bukti foto di Supabase secara permanen!`)) {
      return;
    }
    try {
      await api.post("/attendances/bulk-delete", { ids: selectedIds });
      toast.success(`${selectedIds.length} data presensi berhasil dihapus`);
      setSelectedIds([]);
      fetchPresensi();
    } catch (err) {
      console.error("Gagal bulk delete presensi:", err);
      toast.error("Gagal menghapus data presensi");
    }
  };

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) return;
    
    const toastId = toast.loading("Sedang menyiapkan file ZIP...");
    
    try {
      const selectedItems = presensiData.filter((p) => selectedIds.includes(p.id));
      
      // 1. Create CSV
      const headers = ["ID Sesi", "Tanggal", "Tutor", "Siswa", "Mata Pelajaran", "Durasi (menit)", "Fee Bersih", "Catatan"];
      const csvRows = [headers.join(",")];
      selectedItems.forEach(item => {
        const row = [
          item.id,
          new Date(item.tanggal).toLocaleDateString(),
          `"${item.tutorNama.replace(/"/g, '""')}"`,
          `"${item.siswaNama.replace(/"/g, '""')}"`,
          `"${item.mapelNama.replace(/"/g, '""')}"`,
          item.durasi,
          item.feeBersih,
          `"${item.catatan.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(","));
      });
      const csvContent = csvRows.join("\n");
      
      const zip = new JSZip();
      zip.file("presensi.csv", csvContent);
      
      const imgFolder = zip.folder("foto_presensi");
      
      // 2. Fetch images as blobs and add to zip
      for (const item of selectedItems) {
        if (item.buktiUrl && !item.buktiUrl.includes("unsplash.com")) {
          try {
            const res = await fetch(item.buktiUrl);
            if (res.ok) {
              const blob = await res.blob();
              const ext = item.buktiUrl.split(".").pop()?.split("?")[0] || "jpg";
              imgFolder?.file(`${item.id}.${ext}`, blob);
            }
          } catch (err) {
            console.error(`Gagal mengunduh foto presensi ID ${item.id}:`, err);
          }
        }
      }
      
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `presensi_bulk_${new Date().toISOString().split("T")[0]}.zip`;
      link.click();
      
      toast.dismiss(toastId);
      toast.success("File ZIP berhasil diunduh!");
    } catch (error) {
      console.error("Gagal membuat zip:", error);
      toast.dismiss(toastId);
      toast.error("Gagal membuat file download");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 flex items-center gap-4 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari presensi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-900 font-medium px-2">
              {selectedIds.length} item terpilih
            </span>
            <button
              onClick={handleBulkDownload}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download ZIP
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Terpilih
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedPresensi.length > 0 &&
                      paginatedPresensi.every((p) => selectedIds.includes(p.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>

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
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-sm font-medium">sedang memuat data</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPresensi.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    Tidak ada data presensi yang ditemukan
                  </td>
                </tr>
              ) : (
                paginatedPresensi.map((presensi) => (
                  <tr
                    key={presensi.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(presensi.id)}
                        onChange={() => handleSelectRow(presensi.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>

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
                      <span className="text-sm font-medium">{presensi.tutorNama}</span>
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
                      <span className="text-sm font-semibold text-green-600">
                        {formatRupiah(presensi.feeBersih)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {!isLoading && filteredPresensi.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
            <div className="text-sm text-gray-500">
              Menampilkan {Math.min(filteredPresensi.length, (currentPage - 1) * itemsPerPage + 1)} -{" "}
              {Math.min(filteredPresensi.length, currentPage * itemsPerPage)} dari {filteredPresensi.length} data
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-medium text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
            <img
              src={selectedImage}
              alt="Bukti Presensi"
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={() => setSelectedImage(null)}
              className="mt-4 px-6 py-2.5 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

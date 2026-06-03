// PresensiBimbel/src/app/components/masterdata/DataKeuangan.tsx
import { useEffect, useState } from "react";
import { Search, Eye, Printer, CheckCircle, X, Download, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "../../../services/api";

interface SesiDetail {
  id: string;
  siswaNama: string;
  mapelNama: string;
  tanggal: string;
  durasi: number;
  feeBersih: number;
}

interface Keuangan {
  id: string;
  tutorId: string;
  tutorNama: string;
  tutorKode: string;
  namaBank: string;
  noRekening: string;
  totalNominal: number;
  tanggalPayout: string;
  periodeStart: string;
  periodeEnd: string;
  status: "diproses" | "sudah-payout";
  pdfUrl: string | null;
  sesiList: SesiDetail[];
}

interface DataKeuanganProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DataKeuangan({
  searchQuery,
  setSearchQuery,
}: DataKeuanganProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "diproses" | "sudah-payout">("all");
  const [monthFilter, setMonthFilter] = useState<string>(""); // YYYY-MM
  const [selectedTransaction, setSelectedTransaction] = useState<Keuangan | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Keuangan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFinance();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, statusFilter, monthFilter]);

  const fetchFinance = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/finance");
      const data = res.data;

      const payoutList = Array.isArray(data.payout) ? data.payout : [];
      const historyList = Array.isArray(data.history) ? data.history : [];
      const allTransactions = [...payoutList, ...historyList];

      const mapped: Keuangan[] = allTransactions.map((item: any) => ({
        id: item.id || "-",
        tutorId: item.tutorId || "-",
        tutorNama: item.tutorNama || item.tutorName || "-",
        tutorKode: item.tutorKode || "TUT-000",
        namaBank: item.namaBank || "-",
        noRekening: item.rekening || item.noRekening || "-",
        totalNominal: Number(item.totalNominal || 0),
        tanggalPayout: item.tanggalTransfer || item.tanggalPayout || "",
        periodeStart: item.periodeStart || "",
        periodeEnd: item.periodeEnd || "",
        status:
          item.status === "sudah-payout" || item.status === "selesai" || item.status === "paid"
            ? "sudah-payout"
            : "diproses",
        pdfUrl: item.pdfUrl || null,
        sesiList: Array.isArray(item.sessions)
          ? item.sessions.map((session: any, index: number) => ({
            id: session.id || `SES-${String(index + 1).padStart(3, "0")}`,
            siswaNama: session.siswa || session.siswaNama || "-",
            mapelNama: session.mapel || session.mapelNama || "-",
            tanggal: session.tanggal || "",
            durasi: Number(session.durasi || 0),
            feeBersih: Number(session.fee || session.feeBersih || 0),
          }))
          : [],
      }));

      setTransactions(mapped);
    } catch (error) {
      console.error("Gagal ambil data keuangan:", error);
      toast.error("Gagal mengambil data keuangan");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredKeuangan = transactions.filter((keuangan) => {
    const matchesSearch =
      keuangan.tutorNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      keuangan.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || keuangan.status === statusFilter;

    const matchesMonth = !monthFilter || (() => {
      const dateStr = keuangan.tanggalPayout || keuangan.periodeStart || "";
      if (!dateStr) return false;
      return dateStr.startsWith(monthFilter);
    })();

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredKeuangan.length / itemsPerPage) || 1;
  const paginatedKeuangan = filteredKeuangan.slice(
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
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedKeuangan.map((k) => k.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    } else {
      const pageIds = paginatedKeuangan.map((k) => k.id);
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    }
  };

  // Bulk Process Payout (mark as PAID)
  const handleBulkUpdateStatus = async () => {
    const selectedTutors = transactions.filter((k) => selectedIds.includes(k.id) && k.status === "diproses");
    if (selectedTutors.length === 0) {
      toast.warning("Pilih minimal 1 transaksi berstatus 'Diproses' untuk dipayout");
      return;
    }

    try {
      const tutorIds = selectedTutors.map((k) => k.tutorId);
      await api.post("/finance/payout/bulk", { tutorIds });
      toast.success(`${selectedTutors.length} payout berhasil diproses!`);
      setSelectedIds([]);
      fetchFinance();
    } catch (error) {
      toast.error("Gagal memproses bulk payout");
    }
  };

  // Bulk Delete Payout
  const handleBulkDelete = async () => {
    const selectedItems = transactions.filter((k) => selectedIds.includes(k.id));
    if (selectedItems.length === 0) return;

    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} transaksi terpilih?\n\nTindakan ini akan menghapus data di database serta bukti slip gaji di Supabase secara permanen!`)) {
      return;
    }

    try {
      const targets = selectedItems.map((k) => ({
        id: k.id,
        tutorId: k.tutorId,
        status: k.status,
      }));

      await api.post("/finance/payout/bulk-delete", { targets });
      toast.success(`${selectedItems.length} transaksi berhasil dihapus`);
      setSelectedIds([]);
      fetchFinance();
    } catch (error) {
      console.error("Gagal bulk delete payout:", error);
      toast.error("Gagal menghapus data payout");
    }
  };

  // Bulk Download CSV
  const handleBulkDownload = () => {
    const selectedItems = transactions.filter((k) => selectedIds.includes(k.id));
    if (selectedItems.length === 0) return;

    const headers = ["ID Transaksi", "ID Tutor", "Nama Tutor", "Bank", "Rekening", "Total Nominal", "Tanggal Payout", "Jumlah Sesi", "Status"];
    const csvRows = [headers.join(",")];

    selectedItems.forEach((item) => {
      const row = [
        item.id,
        item.tutorId,
        `"${item.tutorNama.replace(/"/g, '""')}"`,
        item.namaBank,
        `'${item.noRekening}`, // add prefix ' to prevent scientific format in Excel
        item.totalNominal,
        item.tanggalPayout ? new Date(item.tanggalPayout).toLocaleDateString() : "-",
        item.sesiList.length,
        item.status === "sudah-payout" ? "Sudah Payout" : "Diproses",
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_keuangan_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("File CSV berhasil diunduh!");
  };

  const diprosesCount = filteredKeuangan.filter(
    (k) => k.status === "diproses",
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 flex items-center gap-4 min-w-[320px] flex-wrap">
          <div className="relative flex-1 max-w-md min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari transaksi atau tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="diproses">Diproses</option>
            <option value="sudah-payout">Sudah Payout</option>
          </select>

          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.filter((id) => transactions.find((t) => t.id === id)?.status === "diproses").length > 0 && (
            <button
              onClick={handleBulkUpdateStatus}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Proses Payout ({selectedIds.filter((id) => transactions.find((t) => t.id === id)?.status === "diproses").length})
            </button>
          )}

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <button
                onClick={handleBulkDownload}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>
            </div>
          )}
        </div>
      </div>

      {diprosesCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-950">
            <strong>{diprosesCount} transaksi</strong> sedang menunggu payout
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedKeuangan.length > 0 &&
                      paginatedKeuangan.every((k) => selectedIds.includes(k.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  ID Transaksi
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Nama Tutor
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Total Nominal
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Tanggal Payout
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Jumlah Sesi
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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-sm font-medium">sedang memuat data</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedKeuangan.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    Tidak ada data transaksi yang ditemukan
                  </td>
                </tr>
              ) : (
                paginatedKeuangan.map((keuangan) => (
                  <tr key={keuangan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(keuangan.id)}
                        onChange={() => handleSelectRow(keuangan.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 font-mono font-medium">
                      {keuangan.id}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium">{keuangan.tutorNama}</p>
                      <p className="text-xs text-gray-500 font-mono">{keuangan.tutorKode}</p>
                    </td>

                    <td className="px-6 py-4 font-semibold text-green-600">
                      {formatRupiah(keuangan.totalNominal)}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {formatDate(keuangan.tanggalPayout)}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {keuangan.sesiList?.length || 0} sesi
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${keuangan.status === "diproses"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                          }`}
                      >
                        {keuangan.status === "diproses"
                          ? "Diproses"
                          : "Sudah Payout"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedTransaction(keuangan)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>

                        <button
                          onClick={() => {
                            if (keuangan.pdfUrl) {
                              window.open(keuangan.pdfUrl, "_blank");
                            } else {
                              toast.error("Slip PDF belum digenerate");
                            }
                          }}
                          disabled={keuangan.status !== "sudah-payout"}
                          className={`p-2 rounded-lg transition-colors ${
                            keuangan.status === "sudah-payout"
                              ? "hover:bg-purple-100 text-purple-600 cursor-pointer"
                              : "text-gray-300 cursor-not-allowed opacity-40"
                          }`}
                          title={
                            keuangan.status !== "sudah-payout"
                              ? "Print slip dinonaktifkan (belum payout selesai)"
                              : "Cetak Slip Gaji"
                          }
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {!isLoading && filteredKeuangan.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
            <div className="text-sm text-gray-500">
              Menampilkan {Math.min(filteredKeuangan.length, (currentPage - 1) * itemsPerPage + 1)} -{" "}
              {Math.min(filteredKeuangan.length, currentPage * itemsPerPage)} dari {filteredKeuangan.length} data
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

      {selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Detail Transaksi</h3>
                <p className="text-sm text-gray-500 font-mono mt-1">
                  {selectedTransaction.id}
                </p>
              </div>

              <button onClick={() => setSelectedTransaction(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Rincian Sesi</h4>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">ID</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Tanggal</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Siswa</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Mapel</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Durasi</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Fee</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {(selectedTransaction.sesiList || []).map((sesi) => (
                        <tr key={sesi.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-gray-500">{sesi.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatDate(sesi.tanggal)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {sesi.siswaNama}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {sesi.mapelNama}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {sesi.durasi} mnt
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                            {formatRupiah(sesi.feeBersih)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// PresensiBimbel/src/app/components/masterdata/DataKeuangan.tsx
import { useEffect, useState } from "react";
import { Search, Eye, Printer, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

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
  namaBank: string;
  noRekening: string;
  totalNominal: number;
  tanggalPayout: string;
  status: "diproses" | "sudah-payout";
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
  const [statusFilter, setStatusFilter] = useState<
    "all" | "diproses" | "sudah-payout"
  >("all");

  const [selectedTransaction, setSelectedTransaction] =
    useState<Keuangan | null>(null);

  const [selectedForUpdate, setSelectedForUpdate] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Keuangan[]>([]);

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/finance");
      const data = await res.json();

      const payoutList = Array.isArray(data)
        ? data
        : Array.isArray(data.payout)
          ? data.payout
          : [];

      const mapped: Keuangan[] = payoutList.map((item: any) => ({
        id: item.id || "-",
        tutorId: item.tutorId || "-",
        tutorNama: item.tutorName || item.tutorNama || "-",
        namaBank: item.namaBank || "-",
        noRekening: item.rekening || item.noRekening || "-",
        totalNominal: Number(item.totalNominal || 0),
        tanggalPayout: item.tanggalTransfer || item.tanggalPayout || "",
        status:
          item.status === "sudah-payout" || item.status === "paid"
            ? "sudah-payout"
            : "diproses",
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
      setTransactions([]);
    }
  };

  const filteredKeuangan = transactions.filter((keuangan) => {
    const matchesSearch =
      keuangan.tutorNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      keuangan.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || keuangan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const handleSelectForUpdate = (id: string) => {
    if (selectedForUpdate.includes(id)) {
      setSelectedForUpdate(selectedForUpdate.filter((i) => i !== id));
    } else {
      setSelectedForUpdate([...selectedForUpdate, id]);
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedForUpdate.length === 0) {
      toast.warning("Pilih minimal 1 transaksi");
      return;
    }

    try {
      await fetch("http://localhost:4000/api/finance/payout/bulk", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedForUpdate,
        }),
      });

      toast.success("Status payout berhasil diupdate");
      setSelectedForUpdate([]);
      fetchFinance();
    } catch (error) {
      toast.error("Gagal update status");
    }
  };

  const updateSingleStatus = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/finance/${id}/payout`, {
        method: "PATCH",
      });

      fetchFinance();
      setSelectedTransaction(null);
      toast.success("Status payout berhasil diupdate");
    } catch (error) {
      toast.error("Gagal update status");
    }
  };

  const diprosesCount = filteredKeuangan.filter(
    (k) => k.status === "diproses",
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari transaksi atau tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="diproses">Diproses</option>
            <option value="sudah-payout">Sudah Payout</option>
          </select>
        </div>

        {selectedForUpdate.length > 0 && (
          <button
            onClick={handleBulkUpdateStatus}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg"
          >
            <CheckCircle className="w-5 h-5" />
            Update Status ({selectedForUpdate.length})
          </button>
        )}
      </div>

      {diprosesCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-900">
            <strong>{diprosesCount} transaksi</strong> sedang menunggu payout
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedForUpdate.length > 0 &&
                      selectedForUpdate.length ===
                      filteredKeuangan.filter((k) => k.status === "diproses")
                        .length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const ids = filteredKeuangan
                          .filter((k) => k.status === "diproses")
                          .map((k) => k.id);

                        setSelectedForUpdate(ids);
                      } else {
                        setSelectedForUpdate([]);
                      }
                    }}
                  />
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  ID Transaksi
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Nama Tutor
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Rekening
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
              {filteredKeuangan.map((keuangan) => (
                <tr key={keuangan.id}>
                  <td className="px-6 py-4">
                    {keuangan.status === "diproses" && (
                      <input
                        type="checkbox"
                        checked={selectedForUpdate.includes(keuangan.id)}
                        onChange={() => handleSelectForUpdate(keuangan.id)}
                      />
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {keuangan.id}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-medium">{keuangan.tutorNama}</p>
                    <p className="text-xs text-gray-500">{keuangan.tutorId}</p>
                  </td>

                  <td className="px-6 py-4">
                    <p>{keuangan.namaBank}</p>
                    <p className="text-xs text-gray-500">
                      {keuangan.noRekening}
                    </p>
                  </td>

                  <td className="px-6 py-4 font-semibold text-green-600">
                    {formatRupiah(keuangan.totalNominal)}
                  </td>

                  <td className="px-6 py-4">
                    {formatDate(keuangan.tanggalPayout)}
                  </td>

                  <td className="px-6 py-4">
                    {keuangan.sesiList?.length || 0} sesi
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${keuangan.status === "diproses"
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
                    <div className="flex">
                      <button
                        onClick={() => setSelectedTransaction(keuangan)}
                        className="p-2 hover:bg-blue-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>

                      <button className="p-2 hover:bg-purple-100 rounded-lg">
                        <Printer className="w-4 h-4 text-purple-600" />
                      </button>

                      {keuangan.status === "diproses" && (
                        <button
                          onClick={() => updateSingleStatus(keuangan.id)}
                          className="p-2 hover:bg-green-100 rounded-lg"
                        >
                          {/* <CheckCircle className="w-4 h-4 text-green-600" /> */}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredKeuangan.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data transaksi yang ditemukan
          </div>
        )}
      </div>

      {selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl">Detail Transaksi</h3>
                <p className="text-sm text-gray-500">
                  {selectedTransaction.id}
                </p>
              </div>

              <button onClick={() => setSelectedTransaction(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h4 className="font-medium mb-3">Rincian Sesi</h4>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs">ID</th>
                        <th className="text-left px-4 py-3 text-xs">Tanggal</th>
                        <th className="text-left px-4 py-3 text-xs">Siswa</th>
                        <th className="text-left px-4 py-3 text-xs">Mapel</th>
                        <th className="text-left px-4 py-3 text-xs">Durasi</th>
                        <th className="text-right px-4 py-3 text-xs">Fee</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(selectedTransaction.sesiList || []).map((sesi) => (
                        <tr key={sesi.id}>
                          <td className="px-4 py-3 text-sm">{sesi.id}</td>
                          <td className="px-4 py-3 text-sm">
                            {formatDate(sesi.tanggal)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sesi.siswaNama}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sesi.mapelNama}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {sesi.durasi} mnt
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                            {formatRupiah(sesi.feeBersih)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              {selectedTransaction.status === "diproses" && (
                <button
                  onClick={() => updateSingleStatus(selectedTransaction.id)}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-lg"
                >
                  Tandai Sudah Payout
                </button>
              )}

              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex-1 py-2.5 bg-gray-100 rounded-lg"
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

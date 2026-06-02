import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Power, LogIn, Trash2, Eye } from "lucide-react";
import { ModalTutor } from "./ModalTutor";
import { Tutor } from "../../data/mockData";
import api from "../../../services/api";

interface DataTutorProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DataTutor({ searchQuery, setSearchQuery }: DataTutorProps) {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "aktif" | "nonaktif"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  // PREVIEW )
  const [previewTutor, setPreviewTutor] = useState<Tutor | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (tutor: Tutor) => {
    setPreviewTutor(tutor);
    setIsPreviewOpen(true);
  };

  // =========================
  // FETCH DATA (REAL DB)
  // =========================
  const fetchTutors = async () => {
    try {
      const res = await api.get("/tutors");
      const data = res.data;

      const mapped: Tutor[] = data.map((t: any) => ({
        id: t.id, // tetap simpan untuk kebutuhan API
        kode: t.kode, // <-- TAMBAHAN
        nama: t.nama || "",
        email: t.email || "",
        posisi: t.posisi || "",
        noWa: t.noWa || "",
        alamat: t.alamat || "",
        namaBank: t.namaBank || "",
        noRek: t.noRek || "",
        username: t.email || "",
        status: t.status ? "aktif" : "nonaktif",
        students: t.students || [],
        totalStudents: t.totalStudents || 0,
      }));

      setTutors(mapped);
    } catch (err) {
      console.error("Gagal fetch tutor", err);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  // =========================
  // FILTER (TETAP PUNYA LU)
  // =========================
  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.posisi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || tutor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================
  // ACTIONS
  // =========================
  const handleEdit = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTutor(null);
    setIsModalOpen(true);
  };

  // =========================
  // SAVE (API)
  // =========================
  const handleSave = async (tutorData: Tutor) => {
    try {
      if (selectedTutor) {
        // UPDATE
        await api.put(`/tutors/${selectedTutor.id}`, tutorData);
        alert(`Data tutor ${tutorData.nama} berhasil diupdate!`);
      } else {
        // CREATE
        await api.post(`/tutors`, tutorData);
        alert(`Tutor ${tutorData.nama} berhasil ditambahkan!`);
      }

      setIsModalOpen(false);
      setSelectedTutor(null);
      fetchTutors(); // reload data
    } catch (err: any) {
      console.error("Gagal menyimpan data tutor:", err);
      alert(err.response?.data?.message || "Gagal menyimpan data tutor");
    }
  };

  const handleLoginAs = (tutor: Tutor) => {
    alert(
      `Login sebagai ${tutor.nama}\n\nFitur ini akan membuka akun tutor di tab baru.`,
    );
  };

  const handleDelete = async (tutor: Tutor) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus tutor "${tutor.nama}"?\n\nData yang dihapus tidak dapat dikembalikan.`,
      )
    )
      return;

    try {
      const res = await api.delete(`/tutors/${tutor.id}`);
      alert(res.data?.message || `Tutor ${tutor.nama} berhasil dihapus`);
      fetchTutors();
    } catch (error: any) {
      console.error("Gagal hapus tutor:", error);
      alert(error.response?.data?.message || "Gagal hapus tutor");
    }
  };

  const handleToggleStatus = async (tutor: Tutor) => {
    try {
      await api.patch(`/tutors/${tutor.id}/status`);
      fetchTutors();
    } catch (error: any) {
      console.error("Gagal ubah status:", error);
      alert(error.response?.data?.message || "Gagal ubah status");
    }
  };


  // =========================
  // UI (100% PUNYA LU)
  // =========================
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "aktif" | "nonaktif")
            }
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Tutor
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  ID Tutor
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Nama Tutor
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Posisi
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  WhatsApp
                </th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">
                  Siswa
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
              {filteredTutors.map((tutor) => (
                <tr
                  key={tutor.kode || "-"}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {tutor.kode || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {tutor.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{tutor.nama}</p>
                        <p className="text-sm text-gray-500">{tutor.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm">{tutor.posisi}</td>
                  <td className="px-6 py-4 text-sm">{tutor.noWa}</td>

                  <td className="px-6 py-4 text-sm text-center">
                    {tutor.totalStudents || 0}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs rounded-full ${
                        tutor.status === "aktif"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tutor.status === "aktif" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(tutor)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>

                      <button
                        onClick={() => handleLoginAs(tutor)}
                        className="p-2 hover:bg-purple-100 rounded-lg"
                      >
                        <LogIn className="w-4 h-4 text-purple-600" />
                      </button>

                      <button
                        onClick={() => handleEdit(tutor)}
                        className="p-2 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(tutor)}
                        className="p-2 hover:bg-orange-100 rounded-lg"
                      >
                        <Power className="w-4 h-4 text-orange-600" />
                      </button>

                      <button
                        onClick={() => handleDelete(tutor)}
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

        {filteredTutors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data tutor yang ditemukan
          </div>
        )}
      </div>

      <ModalTutor
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tutor={selectedTutor}
        onSave={handleSave}
      />

      {/* ✅ MODAL PREVIEW (TIDAK SENTUH UI UTAMA) */}
      {isPreviewOpen && previewTutor && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Detail Tutor</h2>

            <div className="space-y-2 text-sm">
              <p>
                <b>Kode:</b> {previewTutor.kode}
              </p>
              <p>
                <b>Nama:</b> {previewTutor.nama}
              </p>
              <p>
                <b>Email:</b> {previewTutor.email}
              </p>
              <p>
                <b>Posisi:</b> {previewTutor.posisi}
              </p>
              <p>
                <b>No WA:</b> {previewTutor.noWa}
              </p>
              <p>
                <b>Alamat:</b> {previewTutor.alamat || "-"}
              </p>
              <p>
                <b>Bank:</b> {previewTutor.namaBank || "-"}
              </p>
              <p>
                <b>No Rek:</b> {previewTutor.noRek || "-"}
              </p>
              <p>
                <b>Status:</b> {previewTutor.status}
              </p>

              {/* SISWA */}
              <div className="mt-4">
                <p className="font-semibold mb-2">
                  <b>Siswa :</b>
                </p>

                {previewTutor.students && previewTutor.students.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-3 py-2 text-gray-600">
                            Nama
                          </th>
                          <th className="text-left px-3 py-2 text-gray-600">
                            Asal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewTutor.students.map((s: any) => (
                          <tr key={s.id} className="border-b last:border-0">
                            <td className="px-3 py-2">{s.fullName}</td>
                            <td className="px-3 py-2 text-gray-500">
                              {s.schoolName || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Belum ada siswa</p>
                )}
              </div>
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
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

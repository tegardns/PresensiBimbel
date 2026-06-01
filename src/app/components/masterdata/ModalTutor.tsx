import { X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Tutor, siswas, getLevelById } from "../../data/mockData";

interface ModalTutorProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor | null;
  onSave: (tutorData: any) => void;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

export function ModalTutor({
  isOpen,
  onClose,
  tutor,
  onSave,
}: ModalTutorProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<string[]>([]);
  const [searchSiswa, setSearchSiswa] = useState("");

  const emptyForm = {
    id: "",
    nama: "",
    email: "",
    posisi: "",
    noWa: "",
    alamat: "",
    namaBank: "",
    noRek: "",
    status: "aktif" as "aktif" | "nonaktif",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================
  // FETCH SISWA
  // =========================
  useEffect(() => {
    fetch("http://localhost:4000/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(() => console.log("Gagal ambil data siswa"));
  }, []);

  const allSiswa =
    students.length > 0
      ? students.map((s: any) => ({
          id: s.id,
          nama: s.fullName || "-",
          level: s.schoolName || "-", // ambil dari API lu
        }))
      : siswas.map((s) => ({
          id: s.id,
          nama: s.nama,
          level: getLevelById(s.levelId)?.nama || "-",
        }));

  // =========================
  // RESET FORM
  // =========================
  // useEffect(() => {
  //   if (!isOpen) return;

  //   if (tutor) {
  //     setFormData({ ...emptyForm, ...tutor });
  //   } else {
  //     setFormData(emptyForm);
  //   }

  //   setSelectedSiswa([]);
  //   setSearchSiswa("");
  // }, [isOpen, tutor]);

  useEffect(() => {
    if (!isOpen) return;

    if (tutor) {
      setFormData({ ...emptyForm, ...tutor });

      // 🔥 FIX: ambil dari relasi DB
      setSelectedSiswa(tutor.students?.map((s: any) => s.id) || []);
    } else {
      setFormData(emptyForm);
      setSelectedSiswa([]);
    }

    setSearchSiswa("");
  }, [isOpen, tutor]);

  if (!isOpen) return null;

  // =========================
  // GENERATE ID
  // =========================
  const generateId = () => {
    return `TUT-${Date.now().toString().slice(-4)}`;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = () => {
    if (
      !formData.nama ||
      !formData.email ||
      !formData.posisi ||
      !formData.noWa
    ) {
      alert("Mohon lengkapi field wajib (*)");
      return;
    }

    const finalData = {
      ...formData,
      id: tutor ? formData.id : generateId(),
      studentIds: selectedSiswa,
    };

    // onSave(finalData);
    onSave({
      ...formData,
      studentIds: selectedSiswa, // 🔥 ini key penting
    });
    onClose();
  };

  const availableSiswa = allSiswa.filter((s) => !selectedSiswa.includes(s.id));
  const assignedSiswa = allSiswa.filter((s) => selectedSiswa.includes(s.id));

  const filteredAvailable = availableSiswa.filter((s) =>
    s.nama.toLowerCase().includes(searchSiswa.toLowerCase()),
  );

  const addSiswa = (id: string) => {
    setSelectedSiswa((prev) => [...prev, id]);
  };

  const removeSiswa = (id: string) => {
    setSelectedSiswa((prev) => prev.filter((s) => s !== id));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-end z-50"
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-full max-w-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // ✅ FIX biar gak ke-close
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between">
          <h2 className="text-2xl">{tutor ? "Edit Tutor" : "Tambah Tutor"}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ID + STATUS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">ID Tutor</label>
              <input
                value={tutor?.id || "Auto Generate"}
                disabled
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "aktif" | "nonaktif",
                  })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <InputField
            label="Nama Lengkap *"
            value={formData.nama}
            onChange={(v) => setFormData({ ...formData, nama: v })}
          />

          <InputField
            label="Email *"
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
          />

          <InputField
            label="Posisi *"
            value={formData.posisi}
            onChange={(v) => setFormData({ ...formData, posisi: v })}
          />

          <InputField
            label="No WhatsApp *"
            value={formData.noWa}
            onChange={(v) => setFormData({ ...formData, noWa: v })}
          />

          <InputField
            label="Alamat"
            value={formData.alamat}
            onChange={(v) => setFormData({ ...formData, alamat: v })}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Nama Bank"
              value={formData.namaBank}
              onChange={(v) => setFormData({ ...formData, namaBank: v })}
            />

            <InputField
              label="No Rekening"
              value={formData.noRek}
              onChange={(v) => setFormData({ ...formData, noRek: v })}
            />
          </div>

          {/* SISWA */}
          <div>
            <h3 className="font-medium mb-3">Siswa</h3>

            <input
              placeholder="Cari siswa..."
              value={searchSiswa}
              onChange={(e) => setSearchSiswa(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="border h-48 overflow-auto">
                {filteredAvailable.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => addSiswa(s.id)}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                  >
                    <p className="font-medium">{s.nama}</p>
                    <p className="text-xs text-gray-500">{s.level}</p>
                  </div>
                ))}
              </div>

              <div className="border h-48 overflow-auto bg-blue-50">
                {assignedSiswa.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => removeSiswa(s.id)}
                    className="p-2 cursor-pointer hover:bg-blue-100 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{s.nama}</p>
                      <p className="text-xs text-gray-500">{s.level}</p>
                    </div>
                    <X size={14} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border py-2 rounded">
              Batal
            </button>

            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 rounded"
            >
              {tutor ? "Update" : "Tambah"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// COMPONENT INPUT
// =========================
function InputField({
  label,
  value,
  onChange,
  type = "text",
}: InputFieldProps) {
  return (
    <div>
      <label className="text-sm block mb-1">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}

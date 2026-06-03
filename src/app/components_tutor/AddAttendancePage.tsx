import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface AddAttendancePageProps {
  onBack: () => void;
  onSubmit: (data: AttendanceData) => void;
}

interface AttendanceData {
  sessionId: string;
  student: string;
  date: string;
  time: string;
  subject: string;
  duration: number;
  photo: File | null;
  notes: string;
}

export default function AddAttendancePage({ onBack, onSubmit }: AddAttendancePageProps) {
  const [sessionId] = useState(`SES-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`);
  const [student, setStudent] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - in real app, this would come from API based on tutor
  const students = [
    { id: '1', name: 'Ahmad Rizki', subjects: ['Matematika', 'Fisika'] },
    { id: '2', name: 'Budi Santoso', subjects: ['Matematika'] },
    { id: '3', name: 'Citra Dewi', subjects: ['Fisika', 'Kimia'] },
    { id: '4', name: 'Dedi Prasetyo', subjects: ['Matematika', 'Fisika'] },
  ];

  const durations = [60, 90, 120, 150, 180];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const selectedStudentData = students.find(s => s.name === student);
  const availableSubjects = selectedStudentData?.subjects || [];

  const isFormValid = student && date && time && subject && duration && photo;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In real app, would convert to WEBP here
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (isFormValid) {
      onSubmit({
        sessionId,
        student,
        date,
        time,
        subject,
        duration: duration as number,
        photo,
        notes,
      });
    }
  };

  useEffect(() => {
    // Reset subject if student changes and subject is no longer valid
    if (student && !availableSubjects.includes(subject)) {
      setSubject('');
    }
  }, [student, subject, availableSubjects]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-5 pt-5 pb-3 text-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tight">
            BimbelMelly
          </h1>
        </div>
        <div className="px-5 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-lg transition-colors">
            <ArrowLeft className="size-5 text-gray-600" />
          </button>
          <div>
            <h2 className="font-bold text-gray-900">Tambah Presensi</h2>
            <p className="text-xs text-gray-500 mt-0.5">Isi semua data sesi pembelajaran</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-5 py-6 space-y-5 pb-24">
        {/* Session ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ID Sesi</label>
          <div className="bg-gray-50 rounded-xl px-4 py-3 font-mono text-sm text-gray-900 border border-gray-200">
            {sessionId}
          </div>
        </div>

        {/* Student */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pilih Siswa <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={student || searchStudent}
              onChange={(e) => {
                setSearchStudent(e.target.value);
                setStudent('');
                setShowStudentDropdown(true);
              }}
              onFocus={() => setShowStudentDropdown(true)}
              placeholder="Cari siswa..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showStudentDropdown && filteredStudents.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-sm max-h-48 overflow-y-auto z-20">
                {filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setStudent(s.name);
                      setSearchStudent('');
                      setShowStudentDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Waktu Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mata Pelajaran <span className="text-red-500">*</span>
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={!student}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Pilih mata pelajaran</option>
            {availableSubjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
          {!student && (
            <p className="text-xs text-gray-500 mt-1">Pilih siswa terlebih dahulu</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Durasi (menit) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((dur) => (
              <button
                key={dur}
                onClick={() => setDuration(dur)}
                className={`py-3 rounded-xl border-2 transition-colors ${duration === dur
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upload Foto <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">Bukti jam dan siswa yang diajar (JPG/JPEG/PNG)</p>
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
              <button
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
            >
              <Upload className="size-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Klik untuk upload foto</p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Catatan/Materi <span className="text-gray-400">(Opsional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis catatan atau materi yang diajarkan..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        {isFormValid && (
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Simpan Presensi
          </button>
        )}

        {!isFormValid && (
          <div className="text-center py-4 text-sm text-gray-500">
            Lengkapi semua field yang wajib diisi untuk melanjutkan
          </div>
        )}
      </div>
    </div>
  );
}
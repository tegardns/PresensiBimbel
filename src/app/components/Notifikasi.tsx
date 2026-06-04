import { useState, useEffect } from "react";
import { 
  Bell, 
  Send, 
  Smartphone, 
  History, 
  Users, 
  Layers, 
  ArrowRight,
  Info,
  RefreshCw,
  Trash2,
  Sparkles
} from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";

interface Tutor {
  id: string;
  nama: string;
  kode: string;
  email: string;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  target: string;
  tutorId: string | null;
  status: string;
  createdAt: string;
}

interface DeviceStats {
  web: number;
  android: number;
  ios: number;
  total: number;
}

export function Notifikasi() {
  // Form states
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [actionLink, setActionLink] = useState<string>("/");
  
  // Data states
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({ web: 0, android: 0, ios: 0, total: 0 });
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [previewPlatform, setPreviewPlatform] = useState<"ios" | "android">("ios");
  const [timeString, setTimeString] = useState<string>("Baru Saja");

  // Load tutors, notification history and device stats
  const fetchData = async () => {
    setFetchingData(true);
    try {
      const [tutorsRes, notifRes, statsRes] = await Promise.all([
        api.get("/tutors"),
        api.get("/notifications"),
        api.get("/notifications/devices")
      ]);
      setTutors(tutorsRes.data || []);
      setNotifications(notifRes.data || []);
      setDeviceStats(statsRes.data || { web: 0, android: 0, ios: 0, total: 0 });
    } catch (error) {
      console.error("Gagal memuat data notifikasi:", error);
      toast.error("Gagal memuat beberapa data dari server");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Update live clock for lock screen
    const now = new Date();
    const formatted = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setTimeString(formatted);
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Judul dan pesan notifikasi tidak boleh kosong");
      return;
    }
    if (target === "specific" && !selectedTutorId) {
      toast.error("Pilih tutor penerima terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        body,
        target,
        tutorId: target === "specific" ? selectedTutorId : null,
        actionLink
      };

      const res = await api.post("/notifications/send", payload);
      toast.success(`Berhasil mengirim notifikasi ke ${res.data.recipientCount || 0} perangkat!`);
      
      // Reset form
      setTitle("");
      setBody("");
      
      // Reload stats & history
      fetchData();
    } catch (error: any) {
      console.error("Gagal mengirim notifikasi:", error);
      toast.error(error.response?.data?.message || "Gagal mengirim notifikasi");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get tutor name by ID
  const getTutorName = (id: string | null) => {
    if (!id) return "-";
    const found = tutors.find(t => t.id === id);
    return found ? found.nama : "Tutor Tidak Dikenal";
  };

  return (
    <div className="p-8 space-y-8 pb-32 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600 animate-pulse" />
            Push Notifikasi Tutor
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kirimkan pemberitahuan instan langsung ke sistem notifikasi HP (iOS & Android) tutor.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={fetchingData}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${fetchingData ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Form Pengiriman (Lg: 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card Form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Buat Notifikasi Baru
            </h2>
            
            <form onSubmit={handleSendNotification} className="space-y-5">
              {/* Target Penerima */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Penerima Notifikasi
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => { setTarget("all"); setSelectedTutorId(""); }}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      target === "all"
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    Semua Tutor ({tutors.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget("specific")}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      target === "specific"
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    Tutor Tertentu
                  </button>
                </div>
              </div>

              {/* Dropdown Pilihan Tutor */}
              {target === "specific" && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Tutor Penerima
                  </label>
                  <select
                    value={selectedTutorId}
                    onChange={(e) => setSelectedTutorId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    required
                  >
                    <option value="">-- Pilih Tutor dari Daftar --</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.nama} ({tutor.kode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Judul Notifikasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Notifikasi
                </label>
                <input
                  type="text"
                  placeholder="Misal: Info Validasi Presensi Baru"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  maxLength={50}
                  required
                />
              </div>

              {/* Isi Pesan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Isi Pesan Notifikasi
                </label>
                <textarea
                  rows={4}
                  placeholder="Ketik pesan notifikasi di sini... Pastikan singkat, padat, dan jelas agar muat di tray ponsel."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                  maxLength={150}
                  required
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Maksimal 150 karakter</span>
                  <span>{body.length}/150</span>
                </div>
              </div>

              {/* Tautan Tindakan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tautan Aksi saat Notifikasi Diklik (Opsional)
                </label>
                <select
                  value={actionLink}
                  onChange={(e) => setActionLink(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="/">Beranda Dashboard Tutor</option>
                  <option value="/history">Halaman Riwayat Presensi</option>
                  <option value="/add-attendance">Form Tambah Presensi Baru</option>
                  <option value="/settings">Halaman Pengaturan Akun</option>
                </select>
              </div>

              {/* Tombol Kirim */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Memproses Kirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Kirim Push Notifikasi Sekarang
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Panduan Sistem Notifikasi */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 text-sm">Bagaimana Notifikasi Muncul di HP Tutor?</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                Aplikasi Tutor menggunakan teknologi PWA Web Push. Agar Tutor dapat menerima notifikasi ini:
              </p>
              <ul className="list-disc pl-4 text-xs text-gray-500 space-y-1 mt-1">
                <li>
                  <strong>Android</strong>: Tutor harus menekan tombol <strong>"Aktifkan Notifikasi HP"</strong> yang ada di halaman utama dasbor tutor mereka lalu mengizinkan browser mengirim notifikasi.
                </li>
                <li>
                  <strong>iOS / iPhone</strong>: Tutor harus membuka web bimbel di Safari, menekan tombol Share, lalu pilih <strong>"Add to Home Screen"</strong>. Setelah itu, buka aplikasi dari layar utama dan aktifkan notifikasi.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Statistik & Simulator Pratinjau (Lg: 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Statistik */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-gray-500" />
              Perangkat Tutor Terdaftar
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-center">
                <span className="block text-xs text-gray-400 font-medium mb-1">Web Chrome</span>
                <span className="text-xl font-bold text-slate-800">{deviceStats.web}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-center">
                <span className="block text-xs text-emerald-600 font-medium mb-1">Android OS</span>
                <span className="text-xl font-bold text-emerald-800">{deviceStats.android}</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-center">
                <span className="block text-xs text-indigo-600 font-medium mb-1">Apple iOS</span>
                <span className="text-xl font-bold text-indigo-800">{deviceStats.ios}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center text-xs font-semibold text-gray-600 px-4">
              <span>Total Jangkauan Aktif:</span>
              <span className="text-blue-600 text-sm font-bold">{deviceStats.total} Perangkat</span>
            </div>
          </div>

          {/* Simulator HP */}
          <div className="bg-slate-900 rounded-[2.5rem] border-[12px] border-slate-800 shadow-2xl relative overflow-hidden aspect-[9/18] flex flex-col justify-between max-w-sm mx-auto h-[480px]">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-3 h-3 bg-slate-800 rounded-full absolute right-4"></div>
            </div>

            {/* Lock Screen Header */}
            <div className="p-6 pt-10 text-center text-white z-10">
              <div className="text-4xl font-light tracking-tight">{timeString}</div>
              <div className="text-xs font-medium text-slate-300 mt-1">Kamis, 4 Juni</div>
            </div>

            {/* Notification Bubble Area */}
            <div className="flex-1 px-4 py-2 z-10 flex flex-col justify-start gap-3">
              
              {/* Notification Bubble */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 transition-all animate-pulse">
                {/* Platform specific header */}
                <div className="flex justify-between items-center mb-1 text-[10px] font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-white text-[8px] font-bold">
                      🏢
                    </div>
                    <span>{previewPlatform === "ios" ? "BimbelMelly Tutor" : "BIMBELMELLY"}</span>
                  </div>
                  <span>baru saja</span>
                </div>
                
                {/* Content */}
                <h4 className="text-xs font-bold text-gray-800 line-clamp-1">
                  {title || "Contoh Judul Notifikasi"}
                </h4>
                <p className="text-[11px] text-gray-600 leading-normal mt-0.5 line-clamp-2">
                  {body || "Ketik pesan di form sebelah kiri untuk melihat simulasi tampilan notifikasi di tray ponsel."}
                </p>
                
                {/* Action Indicator */}
                {actionLink !== "/" && (
                  <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[9px] text-blue-600 font-semibold">
                    <span>Tindakan: Buka Halaman {actionLink}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Bar Controls */}
            <div className="p-4 pt-0 z-10 flex flex-col items-center gap-3">
              {/* Device Selector Switch */}
              <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-full p-1 flex items-center gap-1">
                <button
                  onClick={() => setPreviewPlatform("ios")}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                    previewPlatform === "ios"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  iOS Preview
                </button>
                <button
                  onClick={() => setPreviewPlatform("android")}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                    previewPlatform === "android"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Android Preview
                </button>
              </div>
              
              {/* Home Indicator */}
              <div className="w-32 h-1 bg-white/40 rounded-full mb-1"></div>
            </div>

            {/* Phone Lockscreen Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-900 z-0 opacity-90"></div>
          </div>
          
        </div>
      </div>

      {/* Bagian Bawah: Riwayat Notifikasi */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            Riwayat Notifikasi Terkirim
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">
            {notifications.length} Terkirim
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
              <Bell className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-gray-700 text-base">Belum Ada Riwayat Notifikasi</h4>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Notifikasi yang Anda buat dan kirimkan ke tutor akan tercatat di tabel riwayat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                  <th className="p-4 pl-6">Tanggal Kirim</th>
                  <th className="p-4">Judul Notifikasi</th>
                  <th className="p-4">Isi Pesan</th>
                  <th className="p-4">Target Penerima</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })} WIB
                    </td>
                    <td className="p-4 font-bold text-gray-900">{notif.title}</td>
                    <td className="p-4 max-w-sm truncate">{notif.body}</td>
                    <td className="p-4 whitespace-nowrap">
                      {notif.target === "all" ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <Users className="w-3.5 h-3.5" />
                          Semua Tutor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <Layers className="w-3.5 h-3.5" />
                          {getTutorName(notif.tutorId)}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        {notif.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

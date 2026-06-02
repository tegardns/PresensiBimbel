import { useState, useEffect } from 'react';
import { UserPlus, Key, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../services/api';
import { useConfirm } from "../../context/ConfirmContext";

interface TutorAccount {
  id: string; // Sequential short ID ACC-001, ACC-002, etc.
  userId: string; // Database User UUID
  tutorId: string;
  tutorKode: string;
  nama: string;
  email: string;
  status: 'aktif' | 'nonaktif';
  lastLogin?: string;
}

export function KeamananAkun() {
  const [tutorAccounts, setTutorAccounts] = useState<TutorAccount[]>([]);
  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TutorAccount | null>(null);
  const [viewingAccount, setViewingAccount] = useState<TutorAccount | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const confirm = useConfirm();

  // Form state for add/edit tutor account
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [accountPassword, setAccountPassword] = useState('tutor123'); // Default password prefilled
  const [accountStatus, setAccountStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [showPassword, setShowPassword] = useState(false);

  // Form state for admin password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const [accRes, tutRes] = await Promise.all([
        api.get("/admin/tutor-accounts"),
        api.get("/admin/tutors-without-accounts")
      ]);
      setTutorAccounts(accRes.data);
      setAvailableTutors(tutRes.data);
    } catch (error) {
      console.error("Gagal mengambil data akun tutor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async () => {
    if (!selectedTutorId) {
      toast.warning('Mohon pilih tutor');
      return;
    }

    try {
      await api.post("/admin/tutor-accounts", {
        tutorId: selectedTutorId,
        status: accountStatus,
        password: accountPassword,
      });

      toast.success(`Akun tutor berhasil ditambahkan!\nPassword default: ${accountPassword}`);
      setShowAddModal(false);
      setSelectedTutorId('');
      setAccountPassword('tutor123');
      setAccountStatus('aktif');
      fetchAccounts();
    } catch (error: any) {
      console.error("Gagal menambahkan akun tutor:", error);
      toast.error(error.response?.data?.message || "Gagal menambahkan akun tutor");
    }
  };

  const handleEditAccount = async () => {
    if (!editingAccount) return;

    try {
      await api.put(`/admin/tutor-accounts/${editingAccount.userId}`, {
        status: accountStatus,
        password: accountPassword !== 'tutor123' && accountPassword ? accountPassword : undefined,
      });

      toast.success(`Akun ${editingAccount.nama} berhasil diperbarui!`);
      setShowEditModal(false);
      setEditingAccount(null);
      setAccountPassword('tutor123');
      fetchAccounts();
    } catch (error: any) {
      console.error("Gagal memperbarui akun tutor:", error);
      toast.error(error.response?.data?.message || "Gagal memperbarui akun tutor");
    }
  };

  const handleDeleteAccount = async (account: TutorAccount) => {
    const isConfirmed = await confirm({
      title: "Hapus Akun Tutor",
      description: `Hapus akun tutor "${account.nama}"?\n\nTutor tidak akan bisa login lagi setelah akun dihapus.`,
      variant: "danger",
      confirmText: "Hapus Akun"
    });

    if (isConfirmed) {
      try {
        await api.delete(`/admin/tutor-accounts/${account.userId}`);
        toast.success(`Akun ${account.nama} berhasil dihapus!`);
        fetchAccounts();
      } catch (error: any) {
        console.error("Gagal menghapus akun tutor:", error);
        toast.error(error.response?.data?.message || "Gagal menghapus akun tutor");
      }
    }
  };

  const handleChangeAdminPassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warning('Mohon lengkapi semua field password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

    if (newPassword.length < 8) {
      toast.warning('Password baru minimal 8 karakter!');
      return;
    }

    const isConfirmed = await confirm({
      title: "Ubah Password Admin",
      description: 'Ubah password admin?\n\nAnda akan otomatis logout setelah password diubah.',
      variant: "warning",
      confirmText: "Ya, Ubah Password"
    });

    if (isConfirmed) {
      try {
        await api.post("/admin/change-password", {
          oldPassword,
          newPassword,
        });

        toast.success('Password admin berhasil diubah!\n\nAnda akan dialihkan ke halaman login...');
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.reload();
      } catch (error: any) {
        console.error("Gagal ubah password admin:", error);
        toast.error(error.response?.data?.message || "Gagal mengubah password admin");
      }
    }
  };

  const filteredAccounts = tutorAccounts.filter(acc =>
    acc.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.tutorKode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (account: TutorAccount) => {
    setEditingAccount(account);
    setAccountStatus(account.status);
    setAccountPassword(''); // clear password field for editing
    setShowEditModal(true);
  };

  const handleViewClick = (account: TutorAccount) => {
    setViewingAccount(account);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Manajemen Akun Tutor</h2>
          </div>
          <button
            onClick={() => {
              setAccountPassword('tutor123');
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Akun Tutor
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari akun tutor berdasarkan nama, email, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ID Akun</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ID Tutor</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nama Tutor</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Last Login</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{account.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{account.tutorKode}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-medium uppercase">
                        {account.nama.charAt(0)}
                      </div>
                      <span className="font-medium">{account.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{account.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                      account.status === 'aktif'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {account.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    {account.lastLogin || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewClick(account)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Akun"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleEditClick(account)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Akun & Password"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Hapus Akun"
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

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {isLoading ? 'Memuat data...' : searchQuery ? 'Tidak ada akun tutor yang ditemukan' : 'Belum ada akun tutor yang terdaftar'}
          </div>
        )}

        {filteredAccounts.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Menampilkan {filteredAccounts.length} dari {tutorAccounts.length} akun
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-semibold">Ubah Password Admin</h2>
        </div>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Key className="w-5 h-5" />
          Ubah Password Admin
        </button>

        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            <strong>Penting:</strong> Setelah mengubah password, Anda akan otomatis logout dan harus login kembali dengan password baru.
          </p>
        </div>
      </div>

      {/* Modal View Detail Akun Tutor */}
      {showViewModal && viewingAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Detail Akun Tutor</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">ID Akun</span>
                <span className="col-span-2 font-mono text-gray-800">{viewingAccount.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">ID Tutor</span>
                <span className="col-span-2 font-mono text-gray-800">{viewingAccount.tutorKode}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">Nama Tutor</span>
                <span className="col-span-2 text-gray-800 font-semibold">{viewingAccount.nama}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="col-span-2 text-gray-800">{viewingAccount.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    viewingAccount.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {viewingAccount.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500 font-medium">Last Login</span>
                <span className="col-span-2 text-gray-800">{viewingAccount.lastLogin || '-'}</span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Akun Tutor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Tambah Akun Tutor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Tutor *
                </label>
                <select
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Pilih Tutor --</option>
                  {availableTutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.nama} ({tutor.kode})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hanya menampilkan tutor dari Master Data yang belum memiliki akun
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Akun *
                </label>
                <select
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="aktif">Aktif (Bisa Login)</option>
                  <option value="nonaktif">Nonaktif (Tidak Bisa Login)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Default *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan password untuk tutor"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedTutorId('');
                  setAccountPassword('tutor123');
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddAccount}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tambah Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Password Tutor */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Edit Akun Tutor</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Tutor & Email
                </label>
                <input
                  type="text"
                  value={`${editingAccount.nama} (${editingAccount.email})`}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Akun
                </label>
                <select
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="aktif">Aktif (Bisa Login)</option>
                  <option value="nonaktif">Nonaktif (Tidak Bisa Login)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru (Opsional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Isi hanya jika ingin memperbarui password tutor
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAccount(null);
                  setAccountPassword('tutor123');
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEditAccount}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah Password Admin */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Ubah Password Admin</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Lama *
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan password lama"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ulangi Password Baru *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ketik ulang password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleChangeAdminPassword}
                className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Simpan & Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { UserPlus, Key, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { tutors, getTutorById } from '../../data/mockData';
import { tutorLoginAccounts } from '../../data/authData';

interface TutorAccount {
  id: string;
  tutorId: string;
  nama: string;
  email: string;
  password: string;
  status: 'aktif' | 'nonaktif';
  lastLogin?: string;
}

// Transform tutors from authData - data akun login yang sinkron
const mockTutorAccounts: TutorAccount[] = tutorLoginAccounts.map((acc, i) => ({
  id: acc.id,
  tutorId: acc.tutorId,
  nama: acc.nama,
  email: acc.email,
  password: '********',
  status: acc.status,
  lastLogin: i === 0 ? '2026-04-22 14:30' : i === 1 ? '2026-04-21 16:45' : undefined,
}));

export function KeamananAkun() {
  const [tutorAccounts, setTutorAccounts] = useState(mockTutorAccounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TutorAccount | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form state for add/edit tutor account
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountStatus, setAccountStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [showPassword, setShowPassword] = useState(false);

  // Form state for admin password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAddAccount = () => {
    if (!selectedTutorId || !accountPassword) {
      alert('Mohon lengkapi semua data');
      return;
    }

    const selectedTutor = getTutorById(selectedTutorId);
    if (!selectedTutor) return;

    const newAccount: TutorAccount = {
      id: `ACC-${String(tutorAccounts.length + 1).padStart(3, '0')}`,
      tutorId: selectedTutor.id,
      nama: selectedTutor.nama,
      email: selectedTutor.email,
      password: '********',
      status: accountStatus,
    };

    setTutorAccounts([...tutorAccounts, newAccount]);
    setShowAddModal(false);
    setSelectedTutorId('');
    setAccountPassword('');
    setAccountStatus('aktif');
    alert(`Akun tutor berhasil ditambahkan!\n\nID: ${newAccount.id}\nNama: ${newAccount.nama}\nEmail: ${newAccount.email}\nStatus: ${newAccount.status}`);
  };

  const handleEditAccount = () => {
    if (!editingAccount) {
      return;
    }

    if (!accountPassword && accountStatus === editingAccount.status) {
      alert('Tidak ada perubahan yang dilakukan');
      return;
    }

    setTutorAccounts(tutorAccounts.map(acc =>
      acc.id === editingAccount.id ? { ...acc, password: accountPassword ? '********' : acc.password, status: accountStatus } : acc
    ));
    setShowEditModal(false);
    setEditingAccount(null);
    setAccountPassword('');

    const changes = [];
    if (accountPassword) changes.push('Password diupdate');
    if (accountStatus !== editingAccount.status) changes.push(`Status diubah menjadi ${accountStatus}`);

    alert(`Akun ${editingAccount.nama} berhasil diupdate!\n\n${changes.join('\n')}`);
  };

  // Filter accounts by search query
  const filteredAccounts = tutorAccounts.filter(acc =>
    acc.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.tutorId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (account: TutorAccount) => {
    setEditingAccount(account);
    setAccountStatus(account.status);
    setAccountPassword('');
    setShowEditModal(true);
  };

  const handleDeleteAccount = (account: TutorAccount) => {
    if (confirm(`Hapus akun tutor "${account.nama}"?\n\nTutor tidak akan bisa login lagi setelah akun dihapus.`)) {
      setTutorAccounts(tutorAccounts.filter(acc => acc.id !== account.id));
      alert(`Akun ${account.nama} berhasil dihapus!`);
    }
  };

  const handleChangeAdminPassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Mohon lengkapi semua field password');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password baru minimal 8 karakter!');
      return;
    }

    if (confirm('Ubah password admin?\n\nAnda akan otomatis logout setelah password diubah.')) {
      alert('Password admin berhasil diubah!\n\nAnda akan dialihkan ke halaman login...');
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Simulasi logout
      setTimeout(() => {
        alert('Logout berhasil!');
      }, 500);
    }
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
            onClick={() => setShowAddModal(true)}
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
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{account.tutorId}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-medium">
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
            {searchQuery ? 'Tidak ada akun tutor yang ditemukan' : 'Belum ada akun tutor yang terdaftar'}
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

      {/* Modal Tambah Akun Tutor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Tambah Akun Tutor</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Tutor *
                </label>
                <select
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Tutor --</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.nama} ({tutor.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Data tutor diambil dari Master Data
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Akun *
                </label>
                <select
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="aktif">Aktif (Bisa Login)</option>
                  <option value="nonaktif">Nonaktif (Tidak Bisa Login)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Akun nonaktif tidak dapat login ke sistem
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
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
                  setAccountPassword('');
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
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Edit Akun Tutor</h3>
              <p className="text-sm text-gray-500 mt-1">{editingAccount.nama}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="text"
                  value={editingAccount.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Data email diambil dari Master Data Tutor
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Akun
                </label>
                <select
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="aktif">Aktif (Bisa Login)</option>
                  <option value="nonaktif">Nonaktif (Tidak Bisa Login)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Ubah menjadi Nonaktif untuk menonaktifkan akses login tutor
                </p>
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
                  Isi hanya jika ingin mengubah password
                </p>
              </div>

              {accountStatus === 'nonaktif' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-700">
                    <strong>Perhatian:</strong> Akun dengan status Nonaktif tidak dapat login ke sistem. Tutor tidak akan bisa melakukan presensi.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAccount(null);
                  setAccountPassword('');
                  setAccountStatus('aktif');
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
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Ubah Password Admin</h3>
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
                    placeholder="Masukkan password lama untuk autentifikasi"
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

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700">
                  <strong>Perhatian:</strong> Setelah password diubah, Anda akan otomatis logout dari sistem.
                </p>
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
                className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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

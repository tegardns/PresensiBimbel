import { useState, useRef } from 'react';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBankConfirm, setShowBankConfirm] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // User data (non-editable by tutor)
  const [email] = useState('mellysa.tutor@example.com');
  const [position] = useState('Tentor Matematika & Fisika');

  // Editable user data
  const [fullName, setFullName] = useState('Mellysa');
  const [whatsapp, setWhatsapp] = useState('081234567890');
  const [address, setAddress] = useState('Jl. Merdeka No. 123, Jakarta');

  // Temp states for editing
  const [tempFullName, setTempFullName] = useState(fullName);
  const [tempWhatsapp, setTempWhatsapp] = useState(whatsapp);
  const [tempAddress, setTempAddress] = useState(address);

  // Bank account data
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('1234567890');

  // Temp states for bank editing
  const [tempBankName, setTempBankName] = useState(bankName);
  const [tempAccountNumber, setTempAccountNumber] = useState(accountNumber);

  // Password data
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const banks = ['BCA', 'BNI', 'BRI', 'BSI', 'BTN', 'DANA', 'JAGO', 'MANDIRI', 'SEA BANK'];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInfo = () => {
    setFullName(tempFullName);
    setWhatsapp(tempWhatsapp);
    setAddress(tempAddress);
    setIsEditingInfo(false);
  };

  const handleCancelInfo = () => {
    setTempFullName(fullName);
    setTempWhatsapp(whatsapp);
    setTempAddress(address);
    setIsEditingInfo(false);
  };

  const handleEditBank = () => {
    setIsEditingBank(true);
  };

  const handleSaveBank = () => {
    setShowBankConfirm(true);
  };

  const handleConfirmBank = () => {
    setBankName(tempBankName);
    setAccountNumber(tempAccountNumber);
    setIsEditingBank(false);
    setShowBankConfirm(false);
  };

  const handleCancelBank = () => {
    setTempBankName(bankName);
    setTempAccountNumber(accountNumber);
    setIsEditingBank(false);
  };

  const isPasswordValid = () => {
    if (!oldPassword || !newPassword || !confirmPassword) return false;
    if (newPassword.length < 6) return false;
    if (newPassword !== confirmPassword) return false;
    if (!/[A-Z]/.test(newPassword)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return false;
    return true;
  };

  const handlePasswordSubmit = () => {
    if (isPasswordValid()) {
      setShowPasswordConfirm(true);
    }
  };

  const handleConfirmPasswordChange = () => {
    // In real app, would call API to change password and logout
    setShowPasswordConfirm(false);
    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password berhasil diubah. Silakan login kembali.');
  };

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
            <h2 className="font-bold text-gray-900">Edit Profil</h2>
            <p className="text-xs text-gray-500 mt-0.5">Lengkapi data diri dan rekening payout</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-5 pb-24">
        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="size-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="size-full object-cover" />
              ) : (
                <span>{fullName.charAt(0)}</span>
              )}
            </div>
            <button
              onClick={() => photoInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">Klik ikon kamera untuk mengubah foto</p>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Informasi</h3>
            {!isEditingInfo ? (
              <button
                onClick={() => setIsEditingInfo(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit Informasi
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelInfo}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                >
                  Batalkan
                </button>
                <button
                  onClick={handleSaveInfo}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Simpan
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Posisi</label>
              <input
                type="text"
                value={position}
                disabled
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={isEditingInfo ? tempFullName : fullName}
                onChange={(e) => setTempFullName(e.target.value)}
                disabled={!isEditingInfo}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Nomor WhatsApp</label>
              <input
                type="tel"
                value={isEditingInfo ? tempWhatsapp : whatsapp}
                onChange={(e) => setTempWhatsapp(e.target.value)}
                disabled={!isEditingInfo}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Alamat (Opsional)</label>
              <textarea
                value={isEditingInfo ? tempAddress : address}
                onChange={(e) => setTempAddress(e.target.value)}
                disabled={!isEditingInfo}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Bank Account */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Rekening Payout</h3>
            {!isEditingBank ? (
              <button
                onClick={handleEditBank}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit Rekening
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelBank}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                >
                  Batalkan
                </button>
                <button
                  onClick={handleSaveBank}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Simpan
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Pastikan nomor rekening benar dan aktif. Payout tentor akan dikirimkan admin ke rekening tersebut.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2">Bank</label>
              <select
                value={isEditingBank ? tempBankName : bankName}
                onChange={(e) => setTempBankName(e.target.value)}
                disabled={!isEditingBank}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {banks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Nomor Rekening</label>
              <input
                type="text"
                value={isEditingBank ? tempAccountNumber : accountNumber}
                onChange={(e) => setTempAccountNumber(e.target.value.replace(/\D/g, ''))}
                disabled={!isEditingBank}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">Ganti Password</h3>
          <p className="text-xs text-gray-500 mb-4">
            Perbarui password Anda secara berkala untuk keamanan akun
          </p>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-sm"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Bank Confirmation Modal */}
      {showBankConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-2">Konfirmasi Perubahan</h3>
            <p className="text-sm text-gray-600 mb-6">
              Pastikan nomor rekening tertulis dengan benar. Payout tentor akan dikirimkan ke nomor rekening tertera per minggu.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBankConfirm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                Batalkan
              </button>
              <button
                onClick={handleConfirmBank}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-gray-900">Ganti Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Password Lama</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Minimal 6 karakter dengan kombinasi uppercase dan simbol
                </p>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Batalkan
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!isPasswordValid()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Confirmation Modal */}
      {showPasswordConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-2">Konfirmasi Perubahan Password</h3>
            <p className="text-sm text-gray-600 mb-6">
              Password akan diganti dan anda akan keluar dari akun. Silakan login kembali dengan password baru.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordConfirm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                Batalkan
              </button>
              <button
                onClick={handleConfirmPasswordChange}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Settings, Percent, Calendar, Database, Trash2, AlertTriangle } from 'lucide-react';

interface KonfigurasiSistemProps {
  komisiAdmin: number;
  setKomisiAdmin: (val: number) => void;
  infoPayout: string;
  setInfoPayout: (val: string) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: (val: boolean) => void;
  onChangeDetected: () => void;
}

export function KonfigurasiSistem({
  komisiAdmin,
  setKomisiAdmin,
  infoPayout,
  setInfoPayout,
  maintenanceMode,
  setMaintenanceMode,
  onChangeDetected,
}: KonfigurasiSistemProps) {


  const handleBackupData = () => {
    alert('Memulai backup data...\n\nBackup akan di-download dalam format .xlsx\n\nData yang di-backup:\n- Siswa\n- Tutor\n- Transaksi\n- Presensi\n- Payout\n\nProses backup akan memakan waktu beberapa detik.');
  };

  const handleDeleteOldLogs = () => {
    if (confirm('Hapus log aktivitas yang lebih dari 1 tahun?\n\nData yang dihapus tidak dapat dikembalikan.\n\nProses ini akan meningkatkan performa database.')) {
      alert('Menghapus log lama...\n\n42 log aktivitas telah dihapus.');
    }
  };

  const handleResetDatabase = () => {
    alert('⚠️ PERINGATAN BAHAYA ⚠️\n\nFitur ini akan menghapus SEMUA data dari sistem.\n\nUntuk keamanan, fitur ini dinonaktifkan di versi demo.\n\nJika Anda benar-benar perlu mereset database, hubungi developer.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Percent className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">Besaran Komisi (Revenue Share)</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Persentase Komisi Admin
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={komisiAdmin}
                  onChange={(e) => {
                    setKomisiAdmin(parseFloat(e.target.value));
                    onChangeDetected();
                  }}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  %
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Fee Tutor: <strong className="text-green-600">{(100 - komisiAdmin).toFixed(1)}%</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Komisi Admin: <strong className="text-blue-600">{komisiAdmin}%</strong>
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Perubahan ini akan berlaku untuk semua presensi baru yang diinput setelah disimpan
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-orange-800 font-medium mb-1">Dampak Perubahan</p>
                <p className="text-xs text-orange-700">
                  Mengubah komisi akan mempengaruhi perhitungan fee tutor secara otomatis. Pastikan Anda mengkomunikasikan perubahan ini kepada semua tutor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Informasi Waktu Payout</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kebijakan Pembayaran
            </label>
            <textarea
              value={infoPayout}
              onChange={(e) => {
                setInfoPayout(e.target.value);
                onChangeDetected();
              }}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tuliskan informasi tentang jadwal dan kebijakan pembayaran..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Teks ini akan ditampilkan di dashboard tutor pada bagian informasi saldo
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Data Management</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Backup Data Lengkap</p>
              <p className="text-sm text-gray-600">
                Download semua data (Siswa, Tutor, Transaksi) dalam format Excel
              </p>
            </div>
            <button
              onClick={handleBackupData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Backup Sekarang
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Data Retention</p>
              <p className="text-sm text-gray-600">
                Hapus log aktivitas lebih dari 1 tahun untuk meningkatkan kecepatan database
              </p>
            </div>
            <button
              onClick={handleDeleteOldLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Log Lama
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold">Pengaturan Sistem Lainnya</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Mode Maintenance</p>
              <p className="text-sm text-gray-600">
                Nonaktifkan akses sementara untuk semua pengguna kecuali admin
              </p>
            </div>
            <button
              onClick={() => {
                setMaintenanceMode(!maintenanceMode);
                onChangeDetected();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                maintenanceMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div className="flex-1">
              <p className="font-medium text-red-900 mb-1">Reset Database</p>
              <p className="text-sm text-red-700">
                Hapus SEMUA data dari sistem. Tindakan ini tidak dapat dibatalkan!
              </p>
            </div>
            <button
              onClick={handleResetDatabase}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Reset Database
            </button>
          </div>

          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-xs text-red-800">
              <strong>Peringatan:</strong> Fitur-fitur di Danger Zone bersifat permanen dan dapat menyebabkan kehilangan data. Gunakan dengan sangat hati-hati.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

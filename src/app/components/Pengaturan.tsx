import { useState } from 'react';
import { ProfilInstansi } from './pengaturan/ProfilInstansi';
import { KeamananAkun } from './pengaturan/KeamananAkun';
import { KonfigurasiSistem } from './pengaturan/KonfigurasiSistem';
import { Database, Save } from 'lucide-react';

export function Pengaturan() {
  const [activeTab, setActiveTab] = useState('profil');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastBackup] = useState('21 April 2026, 23:45 WIB');

  const tabs = [
    { id: 'profil', label: 'Profil Instansi', icon: '🏢' },
    { id: 'keamanan', label: 'Keamanan & Akun', icon: '🔒' },
    { id: 'sistem', label: 'Konfigurasi Sistem', icon: '⚙️' },
  ];

  const handleSaveChanges = () => {
    alert('Menyimpan perubahan...\n\nSemua pengaturan telah berhasil disimpan.');
    setHasChanges(false);
  };

  const handleDiscardChanges = () => {
    if (confirm('Batalkan semua perubahan yang belum disimpan?')) {
      setHasChanges(false);
    }
  };

  return (
    <div className="p-8 space-y-6 pb-32">
      <div>
        <h1 className="text-3xl mb-2">Konfigurasi Sistem & Keamanan</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Database className="w-4 h-4" />
          <span>Backup terakhir: <strong>{lastBackup}</strong></span>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2 sticky top-6">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'profil' && <ProfilInstansi onChangeDetected={() => setHasChanges(true)} />}
          {activeTab === 'keamanan' && <KeamananAkun />}
          {activeTab === 'sistem' && <KonfigurasiSistem onChangeDetected={() => setHasChanges(true)} />}
        </div>
      </div>

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-700">
                Anda memiliki perubahan yang belum disimpan
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscardChanges}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

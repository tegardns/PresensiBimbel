import { useState, useEffect } from 'react';
import { ProfilInstansi } from './pengaturan/ProfilInstansi';
import { KeamananAkun } from './pengaturan/KeamananAkun';
import { KonfigurasiSistem } from './pengaturan/KonfigurasiSistem';
import { Database, Save } from 'lucide-react';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import api from '../../services/api';

export function Pengaturan() {
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('profil');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastBackup] = useState('21 April 2026, 23:45 WIB');

  // Profil Instansi states
  const [namaBimbel, setNamaBimbel] = useState('BimbelMelly Pusat');
  const [whatsapp, setWhatsapp] = useState('+62 812-3456-7890');
  const [alamat, setAlamat] = useState('Jl. Pendidikan No. 123, Jakarta Selatan 12345');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Konfigurasi Sistem states
  const [komisiAdmin, setKomisiAdmin] = useState(10);
  const [infoPayout, setInfoPayout] = useState('Transfer dilakukan setiap hari Minggu pukul 18:00 WIB. Pastikan data rekening Anda sudah lengkap dan benar.');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const tabs = [
    { id: 'profil', label: 'Profil Instansi', icon: '🏢' },
    { id: 'keamanan', label: 'Keamanan & Akun', icon: '🔒' },
    { id: 'sistem', label: 'Konfigurasi Sistem', icon: '⚙️' },
  ];

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      const data = res.data;
      if (data) {
        setNamaBimbel(data.namaBimbel || 'BimbelMelly Pusat');
        setWhatsapp(data.whatsapp || '+62 812-3456-7890');
        setAlamat(data.alamat || 'Jl. Pendidikan No. 123, Jakarta Selatan 12345');
        setLogoPreview(data.logoUrl || null);
        setKomisiAdmin(data.komisiAdmin !== undefined ? data.komisiAdmin : 10);
        setInfoPayout(data.infoPayout || 'Transfer dilakukan setiap hari Minggu pukul 18:00 WIB. Pastikan data rekening Anda sudah lengkap dan benar.');
        setMaintenanceMode(!!data.maintenance);
      }
    } catch (error) {
      console.error('Gagal mengambil pengaturan instansi:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveChanges = async () => {
    try {
      await api.put('/admin/settings', {
        namaBimbel,
        whatsapp,
        alamat,
        logoUrl: logoPreview,
        komisiAdmin,
        infoPayout,
        maintenance: maintenanceMode,
      });

      setHasChanges(false);
      toast.success('Berhasil!\n\nSemua pengaturan telah berhasil disimpan ke database.');
      
      // Notify sidebar to reload agency info
      window.dispatchEvent(new Event('settingsChanged'));
    } catch (error: any) {
      console.error("Gagal menyimpan pengaturan:", error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan');
    }
  };

  const handleDiscardChanges = async () => {
    const isConfirmed = await confirm({
      title: "Batalkan Perubahan",
      description: "Batalkan semua perubahan yang belum disimpan?",
      variant: "warning",
      confirmText: "Ya, Batalkan"
    });
    
    if (isConfirmed) {
      fetchSettings();
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
          {activeTab === 'profil' && (
            <ProfilInstansi
              namaBimbel={namaBimbel}
              setNamaBimbel={setNamaBimbel}
              whatsapp={whatsapp}
              setWhatsapp={setWhatsapp}
              alamat={alamat}
              setAlamat={setAlamat}
              logoPreview={logoPreview}
              setLogoPreview={setLogoPreview}
              onChangeDetected={() => setHasChanges(true)}
            />
          )}
          {activeTab === 'keamanan' && <KeamananAkun />}
          {activeTab === 'sistem' && (
            <KonfigurasiSistem
              komisiAdmin={komisiAdmin}
              setKomisiAdmin={setKomisiAdmin}
              infoPayout={infoPayout}
              setInfoPayout={setInfoPayout}
              maintenanceMode={maintenanceMode}
              setMaintenanceMode={setMaintenanceMode}
              onChangeDetected={() => setHasChanges(true)}
            />
          )}
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

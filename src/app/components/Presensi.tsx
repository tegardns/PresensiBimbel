import { useState, useEffect } from 'react';
import { AntreanPersetujuan } from './presensi/AntreanPersetujuan';
import { RiwayatPresensi } from './presensi/RiwayatPresensi';
import { RekapJamMengajar } from './presensi/RekapJamMengajar';
import api from '../../services/api';

interface PresensiItem {
  id: string;
  status: string;
  tutorRekeningLengkap: boolean;
}

export function Presensi() {
  const [activeTab, setActiveTab] = useState('antrean');
  const [attendances, setAttendances] = useState<PresensiItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendances = async () => {
    try {
      const response = await api.get('/attendances');
      setAttendances(response.data);
    } catch (error) {
      console.error('Gagal mengambil data untuk rekap presensi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, []);

  // Filter antrean pending
  const pendingList = attendances.filter(
    (p) => p.status === 'tertunda' || p.status === 'diselesaikan'
  );

  // 1. Menunggu Persetujuan: rekening lengkap & status bukan approved/declined/done
  const approveQueueCount = pendingList.filter((p) => p.tutorRekeningLengkap).length;

  // 2. Tertunda (rekening belum lengkap)
  const pendingRekeningCount = pendingList.filter((p) => !p.tutorRekeningLengkap).length;

  const tabs = [
    { id: 'antrean', label: 'Antrean Persetujuan', count: pendingList.length },
    { id: 'riwayat', label: 'Riwayat Presensi', count: null },
    { id: 'rekap', label: 'Rekap Jam Mengajar', count: null },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2 font-bold text-gray-800">Manajemen Presensi & Absensi</h1>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-xl shadow-xs">
            <p className="text-sm text-orange-700">
              <strong>{approveQueueCount} Presensi</strong> menunggu persetujuan
            </p>
          </div>
          <div className="px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl shadow-xs">
            <p className="text-sm text-yellow-700">
              <strong>{pendingRekeningCount} Presensi</strong> tertunda (rekening belum lengkap)
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Memuat data presensi...</div>
      ) : (
        <>
          {activeTab === 'antrean' && (
            <AntreanPersetujuan 
              initialData={pendingList} 
              onRefresh={fetchAttendances} 
            />
          )}
          {activeTab === 'riwayat' && (
            <RiwayatPresensi 
              onRefresh={fetchAttendances} 
            />
          )}
          {activeTab === 'rekap' && <RekapJamMengajar />}
        </>
      )}
    </div>
  );
}

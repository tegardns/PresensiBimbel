import { useState } from 'react';
import { AntreanPersetujuan } from './presensi/AntreanPersetujuan';
import { RiwayatPresensi } from './presensi/RiwayatPresensi';
import { RekapJamMengajar } from './presensi/RekapJamMengajar';

export function Presensi() {
  const [activeTab, setActiveTab] = useState('antrean');

  const tabs = [
    { id: 'antrean', label: 'Antrean Persetujuan', count: 15 },
    { id: 'riwayat', label: 'Riwayat Presensi', count: null },
    { id: 'rekap', label: 'Rekap Jam Mengajar', count: null },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Manajemen Presensi & Absensi</h1>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>15 Presensi</strong> menunggu persetujuan
            </p>
          </div>
          <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              <strong>3 Presensi</strong> tertunda (rekening belum lengkap)
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
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'antrean' && <AntreanPersetujuan />}
      {activeTab === 'riwayat' && <RiwayatPresensi />}
      {activeTab === 'rekap' && <RekapJamMengajar />}
    </div>
  );
}

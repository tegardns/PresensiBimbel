// PRIVATE_FIXED/src/app/components/MasterData.tsx
import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { DataTutor } from './masterdata/DataTutor';
import { DataSiswa } from './masterdata/DataSiswa';
import { DataMapel } from './masterdata/DataMapel';
import { DataLevel } from './masterdata/DataLevel';
import { DataPresensi } from './masterdata/DataPresensi';
import { DataKeuangan } from './masterdata/DataKeuangan';

export function MasterData() {
  const [activeTab, setActiveTab] = useState('tutor');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'tutor', label: 'Data Tutor' },
    { id: 'siswa', label: 'Data Siswa' },
    { id: 'mapel', label: 'Mata Pelajaran' },
    { id: 'level', label: 'Data Level' },
    { id: 'presensi', label: 'Data Presensi' },
    { id: 'keuangan', label: 'Data Keuangan' },
  ];

  const getTitle = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab?.label || 'Master Data';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Master Data</h1>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`pb-4 px-2 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'tutor' && <DataTutor searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {activeTab === 'siswa' && <DataSiswa searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {activeTab === 'mapel' && <DataMapel searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {activeTab === 'level' && <DataLevel />}
      {activeTab === 'presensi' && <DataPresensi searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {activeTab === 'keuangan' && <DataKeuangan searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
    </div>
  );
}

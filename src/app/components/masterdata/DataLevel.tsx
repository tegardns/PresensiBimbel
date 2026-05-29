import { useState } from 'react';
import { Edit2, Clock, DollarSign, Percent } from 'lucide-react';
import { ModalEditLevel } from './ModalEditLevel';

interface Level {
  id: string;
  nama: string;
  hargaJual: number;
  durasiMenit: number;
  potonganAdmin: number;
  color: string;
  icon: string;
}

const levels: Level[] = [
  {
    id: 'LVL-001',
    nama: 'Calistung',
    hargaJual: 40000,
    durasiMenit: 60,
    potonganAdmin: 10,
    color: 'from-yellow-500 to-orange-500',
    icon: '✏️',
  },
  {
    id: 'LVL-002',
    nama: 'SD',
    hargaJual: 50000,
    durasiMenit: 90,
    potonganAdmin: 10,
    color: 'from-blue-500 to-cyan-500',
    icon: '📚',
  },
  {
    id: 'LVL-003',
    nama: 'SMP',
    hargaJual: 60000,
    durasiMenit: 90,
    potonganAdmin: 10,
    color: 'from-purple-500 to-pink-500',
    icon: '📖',
  },
  {
    id: 'LVL-004',
    nama: 'SMA',
    hargaJual: 70000,
    durasiMenit: 120,
    potonganAdmin: 10,
    color: 'from-green-500 to-emerald-500',
    icon: '🎓',
  },
];

export function DataLevel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500">
          Atur harga jual, durasi, dan potongan admin untuk setiap level siswa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {levels.map((level) => (
          <div
            key={level.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className={`h-32 bg-gradient-to-br ${level.color} flex items-center justify-center`}>
              <span className="text-6xl">{level.icon}</span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl">{level.nama}</h3>
                <span className="text-xs text-gray-500">{level.id}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Harga Jual</p>
                    <p className="font-bold text-green-600">{formatRupiah(level.hargaJual)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Durasi Sesi</p>
                    <p className="font-bold text-blue-600">{level.durasiMenit} menit</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <Percent className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Potongan Admin</p>
                    <p className="font-bold text-orange-600">{level.potonganAdmin}%</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingLevel(level);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Harga
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Informasi Perhitungan Fee</h4>
            <p className="text-sm text-blue-700">
              Fee tutor dihitung otomatis: <strong>Harga Jual - (Harga Jual × Potongan Admin)</strong>
              <br />
              Contoh untuk SMA: Rp 70.000 - (Rp 70.000 × 10%) = <strong>Rp 63.000</strong> untuk tutor
            </p>
          </div>
        </div>
      </div>

      <ModalEditLevel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        level={editingLevel}
      />
    </div>
  );
}

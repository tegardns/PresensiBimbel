import { useState } from 'react';
import { CheckCircle, Clock, Edit2, Send } from 'lucide-react';
import { payouts, getTutorById } from '../../data/mockData';

interface PayoutData {
  id: string;
  tutorId: string;
  tutorNama: string;
  namaBank: string;
  noRekening: string;
  jumlahSesi: number;
  totalNominal: number;
  status: 'disetujui' | 'diproses' | 'sudah-payout';
  periodeStart: string;
  periodeEnd: string;
}

// Transform data dari central mockData
const mockPayout: PayoutData[] = payouts
  .filter(p => p.status !== 'sudah-payout')
  .map(p => {
    const tutor = getTutorById(p.tutorId);
    return {
      id: p.id,
      tutorId: p.tutorId,
      tutorNama: tutor?.nama || '',
      namaBank: tutor?.namaBank || '',
      noRekening: tutor?.noRek || '',
      jumlahSesi: p.jumlahSesi,
      totalNominal: p.totalNominal,
      status: p.status,
      periodeStart: p.periodeStart,
      periodeEnd: p.periodeEnd,
    };
  });

export function PayoutMingguan() {
  const [payoutList, setPayoutList] = useState(mockPayout);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleProsesPayout = (id: string) => {
    if (confirm('Proses payout untuk transaksi ini?\n\nStatus akan berubah menjadi "Diproses" dan tutor akan menerima notifikasi.')) {
      setPayoutList(payoutList.map(p =>
        p.id === id ? { ...p, status: 'diproses' as const } : p
      ));
      alert('Status berhasil diubah menjadi "Diproses"');
    }
  };

  const handleSudahPayout = (id: string) => {
    if (confirm('Konfirmasi bahwa transfer sudah dilakukan?\n\nPastikan Anda sudah mentransfer dana ke rekening tutor.')) {
      setPayoutList(payoutList.map(p =>
        p.id === id ? { ...p, status: 'sudah-payout' as const } : p
      ));
      alert('Status berhasil diubah menjadi "Sudah Payout"');
    }
  };

  const handleEditNominal = (payout: PayoutData) => {
    setEditingId(payout.id);
    setEditValue(payout.totalNominal);
  };

  const handleSaveEdit = (id: string) => {
    setPayoutList(payoutList.map(p =>
      p.id === id ? { ...p, totalNominal: editValue } : p
    ));
    setEditingId(null);
    alert(`Nominal berhasil diupdate menjadi ${formatRupiah(editValue)}`);
  };

  const totalDiproses = payoutList.filter(p => p.status === 'diproses').length;
  const totalMenunggu = payoutList.filter(p => p.status === 'disetujui').length;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Siklus Payout Mingguan</h4>
            <p className="text-sm text-blue-700">
              Periode: <strong>14 Apr - 20 Apr 2026</strong> (Minggu - Sabtu)<br />
              Sesi yang dilakukan pada hari Minggu akan masuk ke siklus minggu berikutnya.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            <strong>{totalMenunggu} Transaksi</strong> menunggu diproses
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>{totalDiproses} Transaksi</strong> sedang diproses
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600">ID Transaksi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Nama Tutor</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Rekening</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Jumlah Sesi</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Total Nominal</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payoutList.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-500 font-mono">{payout.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {payout.tutorNama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{payout.tutorNama}</p>
                        <p className="text-xs text-gray-500">{payout.tutorId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-medium">{payout.namaBank}</p>
                      <p className="text-xs text-gray-500 font-mono">{payout.noRekening}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium">{payout.jumlahSesi} sesi</span>
                  </td>
                  <td className="px-6 py-5">
                    {editingId === payout.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value))}
                          className="w-32 px-3 py-1 border border-blue-500 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSaveEdit(payout.id)}
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                          title="Simpan"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Batal"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          {formatRupiah(payout.totalNominal)}
                        </span>
                        {payout.status === 'disetujui' && (
                          <button
                            onClick={() => handleEditNominal(payout)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Edit Nominal"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                        payout.status === 'sudah-payout'
                          ? 'bg-green-100 text-green-700'
                          : payout.status === 'diproses'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {payout.status === 'sudah-payout' && <CheckCircle className="w-3 h-3" />}
                      {payout.status === 'diproses' && <Clock className="w-3 h-3" />}
                      {payout.status === 'sudah-payout' ? 'Sudah Payout' :
                       payout.status === 'diproses' ? 'Diproses' : 'Disetujui'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {payout.status === 'disetujui' && (
                        <button
                          onClick={() => handleProsesPayout(payout.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Send className="w-4 h-4" />
                          Proses
                        </button>
                      )}
                      {payout.status === 'diproses' && (
                        <button
                          onClick={() => handleSudahPayout(payout.id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Sudah Payout
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payoutList.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada transaksi payout untuk periode ini
          </div>
        )}
      </div>
    </div>
  );
}

import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'approval' | 'payout' | 'alert';
  message: string;
  time: string;
  status?: 'success' | 'pending' | 'warning';
}

const mockActivities: Activity[] = [
  { id: '1', type: 'approval', message: 'Mellysa baru saja mengirim presensi untuk Ahmad Rizki', time: '2 menit lalu', status: 'pending' },
  { id: '2', type: 'payout', message: 'Transfer untuk 10 Tutor Berhasil - Rp 2.400.000', time: '1 jam lalu', status: 'success' },
  { id: '3', type: 'approval', message: 'Budi Santoso mengirim presensi untuk Dedi Prasetyo', time: '3 jam lalu', status: 'pending' },
  { id: '4', type: 'alert', message: 'Reminder: 5 presensi menunggu persetujuan', time: '5 jam lalu', status: 'warning' },
];

export function ActivityFeed() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Aktivitas Terbaru</h3>
        <button className="text-sm text-blue-600 hover:underline">Lihat Semua</button>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              activity.status === 'success' ? 'bg-green-100' :
              activity.status === 'warning' ? 'bg-yellow-100' :
              'bg-blue-100'
            }`}>
              {activity.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {activity.status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
              {activity.status === 'pending' && <Clock className="w-4 h-4 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

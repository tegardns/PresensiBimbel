import {
  Users,
  BookOpen,
  DollarSign,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { ActivityFeed } from "./ActivityFeed";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getStatistics } from "../data/mockData";

const sessionData = [
  { id: "day-minggu", day: "Minggu", sesi: 8 },
  { id: "day-senin", day: "Senin", sesi: 15 },
  { id: "day-selasa", day: "Selasa", sesi: 12 },
  { id: "day-rabu", day: "Rabu", sesi: 18 },
  { id: "day-kamis", day: "Kamis", sesi: 14 },
  { id: "day-jumat", day: "Jumat", sesi: 16 },
  { id: "day-sabtu", day: "Sabtu", sesi: 10 },
];

const levelData = [
  { id: "level-sd", name: "SD", value: 40, color: "#3B82F6" },
  { id: "level-smp", name: "SMP", value: 30, color: "#8B5CF6" },
  { id: "level-sma", name: "SMA", value: 20, color: "#10B981" },
  { id: "level-calistung", name: "Calistung", value: 10, color: "#F59E0B" },
];

const topSubjects = [
  { subject: "Matematika", count: 45 },
  { subject: "Fisika", count: 32 },
  { subject: "Kimia", count: 28 },
  { subject: "Bahasa Inggris", count: 25 },
  { subject: "Biologi", count: 20 },
];

const topTutors = [
  { rank: 1, name: "Mellysa", hours: 48, sessions: 32 },
  { rank: 2, name: "Budi Santoso", hours: 42, sessions: 28 },
  { rank: 3, name: "Dedi Prasetyo", hours: 36, sessions: 24 },
];

export function Dashboard() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currentMonth = today.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const stats = getStatistics();
  const formatRupiah = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    }
    return `Rp ${(amount / 1000).toFixed(0)}rb`;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-1">Dashboard</h1>
          <p className="text-gray-500">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white">
            <option>{currentMonth}</option>
            <option>Maret 2026</option>
            <option>Februari 2026</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Presensi Hari Ini"
          value={String(stats.todayPresensis)}
          subtitle="Sesi aktif"
          icon={Clock}
          iconColor="bg-blue-100 text-blue-600"
          trend={{ value: "+8%", isPositive: true }}
        />
        <StatCard
          title="Tutor Aktif"
          value={String(stats.activeTutors)}
          subtitle="Bulan ini"
          icon={Users}
          iconColor="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Siswa Terdaftar"
          value={String(stats.activeSiswas)}
          subtitle="Total siswa"
          icon={BookOpen}
          iconColor="bg-green-100 text-green-600"
        />
        <StatCard
          title="Revenue Bimbel"
          value={formatRupiah(stats.monthRevenue)}
          subtitle="Potongan 10% bulan ini"
          icon={DollarSign}
          iconColor="bg-orange-100 text-orange-600"
          trend={{ value: "+12%", isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Grafik Sesi Mingguan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionData} key="weekly-session-chart">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="sesi" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Distribusi Level Siswa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart key="level-distribution-chart">
              <Pie
                data={levelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                dataKey="value"
              >
                {levelData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Mata Pelajaran Terpopuler</h3>
          <div className="space-y-3">
            {topSubjects.map((subject, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{subject.subject}</p>
                  <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(subject.count / 45) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {subject.count} sesi
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Leaderboard Tutor Terajin</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {topTutors.map((tutor) => (
              <div
                key={tutor.rank}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  tutor.rank === 1
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    tutor.rank === 1
                      ? "bg-yellow-500"
                      : tutor.rank === 2
                        ? "bg-gray-400"
                        : "bg-orange-400"
                  }`}
                >
                  {tutor.rank}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{tutor.name}</p>
                  <p className="text-sm text-gray-500">
                    {tutor.sessions} sesi • {tutor.hours} jam
                  </p>
                </div>
                {tutor.rank === 1 && <span className="text-2xl">🏆</span>}
              </div>
            ))}
          </div>
        </div>

        {/* <ActivityFeed /> */}
      </div>
    </div>
  );
}

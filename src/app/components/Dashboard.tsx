// PRIVATE_FIXED/src/app/components/Dashboard.tsx

import { useEffect, useState } from "react";
import { Users, BookOpen, DollarSign, Clock, Award } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { StatCard } from "./StatCard";
import api from "../../services/api";

type Student = {
  id: string;
  fullName: string;
  isActive: boolean;
  levelId: string;
  level?: {
    id: string;
    name: string;
  };
};

type Tutor = {
  id: string;
  kode?: string;
  nama?: string;
  email?: string;
  status: boolean;
};

type Attendance = {
  id: string;
  attendanceId?: string;

  tutorId?: string;
  tutor?: string;

  siswaId?: string;
  siswa?: string;
  level?: string;
  mapel?: string;
  durasi?: number;
  fee?: number;
  status: string;
  tanggal?: string;

  subjectName?: string;
  durationMin?: number;
  feeNet?: number;
  createdAt?: string;
};

type Finance = {
  id: string;
  tutorId: string;
  amount: number;
  type: string;
  note?: string;
  createdAt?: string;
};

type DashboardStats = {
  todayPresensis: number;
  activeTutors: number;
  activeSiswas: number;
  monthRevenue: number;
};

type SessionChartItem = {
  id: string;
  day: string;
  sesi: number;
};

type LevelChartItem = {
  id: string;
  name: string;
  value: number;
  color: string;
};

type TopSubjectItem = {
  subject: string;
  count: number;
};

type TopTutorItem = {
  rank: number;
  name: string;
  hours: number;
  sessions: number;
};

const initialStats: DashboardStats = {
  todayPresensis: 0,
  activeTutors: 0,
  activeSiswas: 0,
  monthRevenue: 0,
};

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const pieColors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  if (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: T[] }).data;
  }

  return [];
}

function getDateValue(item: { createdAt?: string; tanggal?: string }) {
  return item.createdAt || item.tanggal || "";
}

function isSameDay(dateString: string, targetDate: Date) {
  if (!dateString) return false;

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return false;

  return date.toDateString() === targetDate.toDateString();
}

function isSameMonth(dateString: string, targetDate: Date) {
  if (!dateString) return false;

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getMonth() === targetDate.getMonth() &&
    date.getFullYear() === targetDate.getFullYear()
  );
}

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function isCurrentWeek(dateString: string, today: Date) {
  if (!dateString) return false;

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return false;

  const start = getStartOfWeek(today);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [sessionData, setSessionData] = useState<SessionChartItem[]>([]);
  const [levelData, setLevelData] = useState<LevelChartItem[]>([]);
  const [topSubjects, setTopSubjects] = useState<TopSubjectItem[]>([]);
  const [topTutors, setTopTutors] = useState<TopTutorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const formatRupiah = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    }

    return `Rp ${(amount / 1000).toFixed(0)}rb`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [studentsRes, tutorsRes, attendancesRes, financeRes] =
          await Promise.all([
            api.get("/students"),
            api.get("/tutors"),
            api.get("/attendances"),
            api.get("/finance"),
          ]);

        const students = toArray<Student>(studentsRes.data);
        const tutors = toArray<Tutor>(tutorsRes.data);
        const attendances = toArray<Attendance>(attendancesRes.data);
        const finances = toArray<Finance>(financeRes.data);

        const activeTutors = tutors.filter((tutor) => tutor.status).length;
        const activeSiswas = students.filter((student) => student.isActive).length;

        const todayPresensis = attendances.filter((attendance) =>
          isSameDay(getDateValue(attendance), today),
        ).length;

        const monthRevenue = attendances
          .filter((attendance) => isSameMonth(getDateValue(attendance), today))
          .reduce((total, attendance) => {
            const fee = Number(attendance.feeNet ?? attendance.fee ?? 0);
            return total + fee;
          }, 0);

        setStats({
          todayPresensis,
          activeTutors,
          activeSiswas,
          monthRevenue,
        });

        const weeklySessions: SessionChartItem[] = dayNames.map((day, index) => {
          const count = attendances.filter((attendance) => {
            const dateString = getDateValue(attendance);
            const date = new Date(dateString);

            if (Number.isNaN(date.getTime())) return false;

            return isCurrentWeek(dateString, today) && date.getDay() === index;
          }).length;

          return {
            id: `day-${index}`,
            day,
            sesi: count,
          };
        });

        setSessionData(weeklySessions);

        const levelCounts = new Map<string, number>();

        students.forEach((student) => {
          const levelName = student.level?.name || "Tanpa Level";
          levelCounts.set(levelName, (levelCounts.get(levelName) || 0) + 1);
        });

        const levelChartData: LevelChartItem[] = Array.from(levelCounts.entries()).map(
          ([name, value], index) => ({
            id: `level-${name}`,
            name,
            value,
            color: pieColors[index % pieColors.length],
          }),
        );

        setLevelData(levelChartData);

        const subjectCounts = new Map<string, number>();

        attendances.forEach((attendance) => {
          const subjectName =
            attendance.subjectName ||
            attendance.mapel ||
            "Tanpa Mapel";

          subjectCounts.set(
            subjectName,
            (subjectCounts.get(subjectName) || 0) + 1,
          );
        });

        const subjectChartData: TopSubjectItem[] = Array.from(
          subjectCounts.entries(),
        )
          .map(([subject, count]) => ({
            subject,
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopSubjects(subjectChartData);

        const tutorStatsMap = new Map<
          string,
          {
            name: string;
            sessions: number;
            minutes: number;
          }
        >();

        attendances.forEach((attendance) => {
          const tutorKey = attendance.tutorId || attendance.tutor;

          if (!tutorKey) return;

          const duration = Number(attendance.durationMin ?? attendance.durasi ?? 0);

          const current = tutorStatsMap.get(tutorKey) || {
            name: attendance.tutor || "Tutor",
            sessions: 0,
            minutes: 0,
          };

          tutorStatsMap.set(tutorKey, {
            name: current.name,
            sessions: current.sessions + 1,
            minutes: current.minutes + duration,
          });
        });

        const tutorLeaderboard: TopTutorItem[] = Array.from(tutorStatsMap.values())
          .sort((a, b) => b.sessions - a.sessions)
          .map((item, index) => ({
            rank: index + 1,
            name: item.name,
            sessions: item.sessions,
            hours: Math.round(item.minutes / 60),
          }))
          .slice(0, 3);

        setTopTutors(tutorLeaderboard);
      } catch (err) {
        console.error(err);
        setError("Gagal mengambil data dashboard dari server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8">Memuat dashboard...</div>;
  }

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
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Presensi Hari Ini"
          value={String(stats.todayPresensis)}
          subtitle="Sesi aktif"
          icon={Clock}
          iconColor="bg-blue-100 text-blue-600"
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
          subtitle="Pemasukan bulan ini"
          icon={DollarSign}
          iconColor="bg-orange-100 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Grafik Sesi Mingguan</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionData} key="weekly-session-chart">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="sesi" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Distribusi Level Siswa</h3>

          {levelData.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada data level siswa.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key="level-distribution-chart">
                <Pie
                  data={levelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
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
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Mata Pelajaran Terpopuler</h3>

          {topSubjects.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada data presensi mata pelajaran.
            </p>
          ) : (
            <div className="space-y-3">
              {topSubjects.map((subject, index) => {
                const maxCount = topSubjects[0]?.count || 1;

                return (
                  <div key={subject.subject} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm">{subject.subject}</p>
                      <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${(subject.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-sm text-gray-500">
                      {subject.count} sesi
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Leaderboard Tutor Terajin</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>

          {topTutors.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada data presensi tutor.
            </p>
          ) : (
            <div className="space-y-3">
              {topTutors.map((tutor) => (
                <div
                  key={tutor.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg ${tutor.rank === 1
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-gray-50"
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${tutor.rank === 1
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
          )}
        </div>
      </div>
    </div>
  );
}
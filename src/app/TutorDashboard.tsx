import { useState } from "react";
import { Plus, Home, Clock } from "lucide-react";
import HomePage from "./components_tutor/HomePage";
import AddAttendancePage from "./components_tutor/AddAttendancePage";
import SettingsPage from "./components_tutor/SettingsPage";
import HistoryPage from "./components_tutor/HistoryPage";
import { TutorLoginAccount, UserAccount } from "./data/authData";

type Page = "home" | "add-attendance" | "settings" | "history";

interface TutorDashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
}

export default function TutorDashboard({
  currentUser,
  onLogout,
}: TutorDashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmitAttendance = (data: any) => {
    console.log("Submitting attendance:", data);
    setShowSuccessToast(true);
    setCurrentPage("home");
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      console.log("Logging out...");
      onLogout();
    }
  };

  const showBottomNav = currentPage === "home" || currentPage === "history";

  return (
    <div className="size-full bg-gray-50 max-w-md mx-auto relative">
      {/* Pages */}
      {currentPage === "home" && (
        <HomePage
          tutorName={currentUser.nama}
          onNavigateToSettings={() => setCurrentPage("settings")}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "history" && <HistoryPage />}

      {currentPage === "add-attendance" && (
        <AddAttendancePage
          onBack={() => setCurrentPage("home")}
          onSubmit={handleSubmitAttendance}
        />
      )}

      {currentPage === "settings" && (
        <SettingsPage onBack={() => setCurrentPage("home")} />
      )}

      {/* Bottom Navigation */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 max-w-md mx-auto">
          <div className="flex items-center justify-around px-6 py-2">
            {/* Beranda */}
            <button
              onClick={() => setCurrentPage("home")}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                currentPage === "home"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Home className="size-6" />
              <span className="text-xs font-medium">Beranda</span>
            </button>

            {/* Add Button - Centered and elevated */}
            <button
              onClick={() => setCurrentPage("add-attendance")}
              className="size-14 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 flex items-center justify-center -mt-7 hover:scale-105 transition-transform"
            >
              <Plus className="size-7" />
            </button>

            {/* Riwayat */}
            <button
              onClick={() => setCurrentPage("history")}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                currentPage === "history"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Clock className="size-6" />
              <span className="text-xs font-medium">Riwayat</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ Presensi berhasil disimpan
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

// ADMIN COMPONENTS
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { MasterData } from "./components/MasterData";
import { Presensi } from "./components/Presensi";
import { Keuangan } from "./components/Keuangan";
import { Pengaturan } from "./components/Pengaturan";
import { Login } from "./components/Login";

// TUTOR COMPONENT
import TutorDashboard from "./TutorDashboard";

// DATA (MOCK SEMENTARA)
import { authenticateUser, UserAccount } from "./data/authData";

export default function App() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loginError, setLoginError] = useState("");

  const handleLogin = (username: string, password: string) => {
    const user = authenticateUser(username, password);

    if (!user) {
      setLoginError("Username atau password salah!");
      return;
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    setLoginError("");
  };

  const handleLogout = () => {
    console.log("handleLogout called");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveMenu("dashboard");
  };

  // 🔐 LOGIN PAGE
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  // 👨‍🏫 TUTOR VIEW
  if (currentUser?.role === "tutor") {
    return <TutorDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 🧑‍💼 ADMIN VIEW
  return (
    <div className="size-full flex bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        onMenuClick={setActiveMenu}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <div className="flex-1 overflow-auto">
        {activeMenu === "dashboard" && <Dashboard />}
        {activeMenu === "master-data" && <MasterData />}
        {activeMenu === "presensi" && <Presensi />}
        {activeMenu === "keuangan" && <Keuangan />}
        {activeMenu === "pengaturan" && <Pengaturan />}
      </div>
    </div>
  );
}

// PRIVATE_FIXED/src/app/App.tsx
import { useEffect, useRef, useState } from "react";

import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { MasterData } from "./components/MasterData";
import { Presensi } from "./components/Presensi";
import { Keuangan } from "./components/Keuangan";
import { Pengaturan } from "./components/Pengaturan";
import { Notifikasi } from "./components/Notifikasi";
import { Login } from "./components/Login";
import TutorDashboard from "./TutorDashboard";
import { UserAccount } from "./data/authData";
import { ConfirmProvider } from "./context/ConfirmContext";
import { Toaster, toast } from "sonner";

const PAGE_URLS: Record<string, string> = {
  login: "/login",
  dashboard: "/",
  "master-data": "/master-data",
  presensi: "/presensi",
  keuangan: "/keuangan",
  notifikasi: "/notifikasi",
  pengaturan: "/pengaturan",
};

const URL_PAGES: Record<string, string> = {
  "/login": "login",
  "/": "dashboard",
  "/master-data": "master-data",
  "/presensi": "presensi",
  "/keuangan": "keuangan",
  "/notifikasi": "notifikasi",
  "/pengaturan": "pengaturan",
};

function AppContent() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(true);

  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const AUTO_LOGOUT_TIME = 60 * 60 * 1000; // 1 hour

  const navigate = (newPage: string, replace = false) => {
    const url = PAGE_URLS[newPage] || "/";
    if (replace) {
      window.history.replaceState({ page: newPage }, "", url);
    } else {
      window.history.pushState({ page: newPage }, "", url);
    }
    setActiveMenu(newPage);
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");

    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }

    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate("login", true);
  };

  // =========================
  // CEK LOGIN SAAT REFRESH
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const lastActivity = localStorage.getItem("lastActivity");
    const path = window.location.pathname;
    const initialPage = URL_PAGES[path] || "dashboard";

    if (token && savedUser) {
      const now = Date.now();

      if (lastActivity && now - Number(lastActivity) >= AUTO_LOGOUT_TIME) {
        handleLogout();
      } else {
        try {
          setCurrentUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          if (initialPage === "login") {
            navigate("dashboard", true);
          } else {
            navigate(initialPage, true);
          }
        } catch (e) {
          console.error("Failed to parse saved user, clearing storage.");
          handleLogout();
        }
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
      navigate("login", true);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.page) {
        setActiveMenu(state.page);
      } else {
        const path = window.location.pathname;
        const page = URL_PAGES[path] || "dashboard";
        setActiveMenu(page);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // =========================
  // TIMER AUTO LOGOUT
  // =========================
  useEffect(() => {
    if (!isAuthenticated) return;

    const startTimer = () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }

      logoutTimer.current = setTimeout(() => {
        toast.warning("Session habis karena tidak ada aktivitas.");
        handleLogout();
      }, AUTO_LOGOUT_TIME);
    };

    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
      startTimer();
    };

    const events = ["click", "keydown", "scroll", "touchstart", "mousedown"];

    events.forEach((event) => window.addEventListener(event, updateActivity));

    updateActivity();

    const checker = setInterval(() => {
      const last = Number(localStorage.getItem("lastActivity") || 0);

      if (Date.now() - last >= AUTO_LOGOUT_TIME) {
        handleLogout();
      }
    }, 1000);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity),
      );

      clearInterval(checker);

      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
    };
  }, [isAuthenticated]);

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (username: string, password: string) => {
    try {
      setLoginError("");

      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "Login gagal");
        return;
      }

      const role = data.user?.role;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      const userData: UserAccount = {
        id: data.user?.id,
        username: username,
        password: "",
        nama: data.user?.email || "User",
        email: data.user?.email || "",
        role: role,
        status: "aktif",
      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("lastActivity", Date.now().toString());

      setCurrentUser(userData);
      setIsAuthenticated(true);
      navigate("dashboard", true);
    } catch (error) {
      setLoginError("Tidak bisa terhubung ke server");
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // =========================
  // LOGIN PAGE
  // =========================
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  if (!currentUser) return null;

  // =========================
  // TUTOR
  // =========================
  if (currentUser.role === "tutor") {
    return <TutorDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // =========================
  // ADMIN
  // =========================
  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        onMenuClick={(menu) => navigate(menu)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <div className="flex-1 overflow-auto">
        {activeMenu === "dashboard" && <Dashboard />}
        {activeMenu === "master-data" && <MasterData />}
        {activeMenu === "presensi" && <Presensi />}
        {activeMenu === "keuangan" && <Keuangan />}
        {activeMenu === "notifikasi" && <Notifikasi />}
        {activeMenu === "pengaturan" && <Pengaturan />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ConfirmProvider>
      <Toaster position="top-right" richColors closeButton />
      <AppContent />
    </ConfirmProvider>
  );
}

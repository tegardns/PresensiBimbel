import { useState } from "react";
import { Eye, EyeOff, Lock, User, LogIn } from "lucide-react";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

export function Login({ onLogin, error }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-blue-600">B</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">BimbelMelly</h1>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Masuk ke Sistem
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Masuk
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-2">
              Demo Login:
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>
                <strong>Admin:</strong>
              </p>
              <p className="ml-2">
                Username:{" "}
                <code className="bg-blue-100 px-1 rounded">admin</code>
              </p>
              <p className="ml-2">
                Password:{" "}
                <code className="bg-blue-100 px-1 rounded">admin123</code>
              </p>
              <p className="mt-2">
                <strong>Tutor:</strong>
              </p>
              <p className="ml-2">
                Username:{" "}
                <code className="bg-blue-100 px-1 rounded">mellysa</code>
              </p>
              <p className="ml-2">
                Password:{" "}
                <code className="bg-blue-100 px-1 rounded">mellysa123</code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2026 BimbelMelly. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

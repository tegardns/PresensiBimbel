import { Home, Database, ClipboardCheck, Wallet, Settings, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { UserAccount } from '../data/authData';

interface SidebarProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  onLogout: () => void;
  currentUser: UserAccount | null;
}

export function Sidebar({ activeMenu, onMenuClick, onLogout, currentUser }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?\n\nAnda akan keluar dari sistem admin.')) {
      setShowProfileMenu(false);
      onLogout();
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'master-data', label: 'Master Data', icon: Database },
    { id: 'presensi', label: 'Presensi', icon: ClipboardCheck },
    { id: 'keuangan', label: 'Keuangan', icon: Wallet },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col`}>
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && <h1 className="font-bold text-blue-600">BimbelMelly</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeMenu === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 relative" ref={profileMenuRef}>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {currentUser?.nama.charAt(0).toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{currentUser?.nama || 'Admin'}</p>
              <p className="text-xs text-gray-500">{currentUser?.email || 'admin@bimbelmelly.com'}</p>
            </div>
          )}
        </button>

        {showProfileMenu && !collapsed && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-medium">{currentUser?.nama || 'Admin Utama'}</p>
              <p className="text-xs text-gray-500">{currentUser?.email || 'admin@bimbelmelly.com'}</p>
              <p className="text-xs text-blue-600 mt-1 font-medium uppercase">{currentUser?.role || 'admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}

        {showProfileMenu && collapsed && (
          <div className="absolute bottom-full left-full ml-2 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden w-64">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-medium">{currentUser?.nama || 'Admin Utama'}</p>
              <p className="text-xs text-gray-500">{currentUser?.email || 'admin@bimbelmelly.com'}</p>
              <p className="text-xs text-blue-600 mt-1 font-medium uppercase">{currentUser?.role || 'admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

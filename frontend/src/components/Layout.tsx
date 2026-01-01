import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, FolderKanban, Users, User, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineStore } from '@/lib/offline';

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isOnline = useOfflineStore((state) => state.isOnline);

  const navigation = [
    { name: 'Início', href: '/home', icon: Home },
    { name: 'Casos', href: '/cases', icon: FolderKanban },
    { name: 'Grupos', href: '/groups', icon: Users },
    { name: 'Perfil', href: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary-600">VITAS</h1>
            {!isOnline && (
              <div className="flex items-center gap-1 text-sm text-amber-600">
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Modo Offline</span>
              </div>
            )}
            {isOnline && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Wifi className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 hidden sm:block">{user?.nomeCompleto}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="hidden w-64 border-r border-gray-200 bg-white sm:block">
          <div className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="border-t border-gray-200 bg-white sm:hidden">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                  isActive ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                <Icon className="h-6 w-6" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

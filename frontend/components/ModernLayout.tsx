'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ModernLayoutProps {
  children: React.ReactNode;
}

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  profile_photo_path?: string;
}

export default function ModernLayout({ children }: ModernLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur parsing user:', error);
        router.push('/login/employee');
      }
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-32 bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPhotoUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL}/${path}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header moderne */}
      <header className="sticky top-0 z-50 border-b border-slate-700/50 backdrop-blur-md bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <span className="text-white font-bold">AT</span>
              </div>
              <span className="hidden sm:inline font-bold text-lg bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                AutoTerr
              </span>
            </Link>

            {/* Menu principal */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/locations" className="text-slate-300 hover:text-white transition-colors font-medium text-sm">
                Mes Locations
              </Link>
              <Link href="/profile" className="text-slate-300 hover:text-white transition-colors font-medium text-sm">
                Profil
              </Link>
            </nav>

            {/* User Profile - Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
              >
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
                  {user?.profile_photo_path ? (
                    <Image
                      src={getPhotoUrl(user.profile_photo_path) || ''}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-bold">
                      {getInitials(user?.name || 'U')}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.role}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Paramètres
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Mon Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors border-t border-slate-700"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}


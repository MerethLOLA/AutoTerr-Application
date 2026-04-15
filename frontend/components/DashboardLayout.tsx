'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { label: 'Tableau de bord', href: '/dashboard' },
  { label: 'Vehicules', href: '/voitures' },
  { label: 'Clients', href: '/clients' },
  { label: 'Fournisseurs', href: '/fournisseurs' },
  { label: 'Nouvelle vente', href: '/ventes' },
  { label: 'Historique ventes', href: '/ventes/historique' },
  { label: 'Facturation', href: '/facturations' },
  { label: 'Paiements', href: '/paiements' },
  { label: 'Garanties', href: '/garanties' },
  { label: 'Documents', href: '/documents' },
  { label: 'Locations', href: '/locations' },
  { label: 'SAV', href: '/sav' },
  { label: 'Atelier', href: '/atelier' },
  { label: 'Stock', href: '/stock' },
  { label: 'Reporting', href: '/reporting' },
  { label: 'Espace client', href: '/espace-client' },
  { label: 'Parametres', href: '/settings' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 lg:hidden"
            >
              Menu
            </button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-sm font-black text-white">
                SP
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">SunuPark</p>
                <p className="text-xs text-slate-500">Next.js + Laravel API</p>
              </div>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
          >
            Deconnexion
          </button>
        </div>
      </nav>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} min-h-[calc(100vh-73px)] w-72 shrink-0 border-r border-slate-200 bg-white lg:block`}>
          <div className="p-5">
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Modules cahier</p>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

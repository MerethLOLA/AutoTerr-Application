'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient, getNotifications, NotificationItem } from '@/lib/api';
import { AUTH_CHANGED_EVENT } from '@/lib/auth-storage';
import { useTranslation } from '@/lib/i18n';
import NextImage from 'next/image';
import { useNotificationBadges } from '@/lib/useNotificationBadges';
import { useRole } from '@/lib/useRole';
import Link from 'next/link';
import { useEffect, useId, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  menuVariant?: 'admin' | 'client' | 'employee';
  guestRedirect?: string;
  allowGuest?: boolean;
}

// ── Icônes SVG (chemin unique 24×24) ─────────────────────────────────────────

const IC = {
  home:      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  car:       'M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5M5 11H3a1 1 0 00-1 1v1a1 1 0 001 1h2m14-2h2a1 1 0 011 1v1a1 1 0 01-1 1h-2',
  box:       'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  truck:     'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16H7v-4h10l-1.5-3H7V6h3',
  users:     'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  cart:      'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  key:       'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
  invoice:   'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  card:      'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  support:   'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
  sliders:   'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  shield:    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  document:  'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  chart:     'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  person:    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  chevronL:  'M15 19l-7-7 7-7',
  chevronR:  'M9 5l7 7-7 7',
  
  fuel:      'M3 10h2m0 0V6a1 1 0 011-1h8a1 1 0 011 1v12a1 1 0 001 1h1a1 1 0 001-1V9.5a.5.5 0 00-.5-.5H18m-13 1v7m0 0h8m-8 0V10m8 0V6m0 11h1',
  wrench:    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  bell:      'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  exclamation: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  clip:      'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13',
};

function NavIcon({ d, size = 17 }: { d: string; size?: number }) {
  return (
    <svg
      className="shrink-0"
      style={{ width: size, height: size }}
      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
    </svg>
  );
}


const clientMenuItems = [
  { lk: 'nav.items.mySpace', href: '/espace-client', icon: IC.person },
];

const navGroups = [
  {
    lk: 'nav.groups.fleet',
    items: [
      { lk: 'nav.items.vehicles',  href: '/voitures',    badgeKey: null as string | null, icon: IC.car },
      { lk: 'nav.items.parts',     href: '/stock',        badgeKey: 'alertes_stock',       icon: IC.box },
      { lk: 'nav.items.suppliers', href: '/fournisseurs', badgeKey: null,                  icon: IC.truck },
    ],
  },
  {
    lk: 'nav.groups.commercial',
    items: [
      { lk: 'nav.items.clients',   href: '/clients',      badgeKey: null,                  icon: IC.users },
      { lk: 'nav.items.sales',     href: '/ventes',       badgeKey: null,                  icon: IC.cart },
      { lk: 'nav.items.rentals',   href: '/locations',    badgeKey: 'reservations',        icon: IC.key },
      { lk: 'nav.items.requests',  href: '/demandes',     badgeKey: 'demandes_en_attente', icon: IC.support },
      { lk: 'nav.items.billing',   href: '/facturations', badgeKey: 'factures_impayees',   icon: IC.invoice },
      { lk: 'nav.items.payments',  href: '/payments',     badgeKey: null,                  icon: IC.card },
    ],
  },
  {
    lk: 'nav.groups.afterSales',
    items: [
      { lk: 'nav.items.support',     href: '/sav',       badgeKey: 'tickets_ouverts', icon: IC.support },
      { lk: 'nav.items.workshop',    href: '/atelier',   badgeKey: 'ordres_ouverts',  icon: IC.sliders },
      { lk: 'nav.items.planning',    href: '/planning',  badgeKey: null,              icon: IC.calendar },
      { lk: 'nav.items.maintenance', href: '/entretiens',badgeKey: null,              icon: IC.wrench },
      { lk: 'nav.items.warranties',  href: '/garanties', badgeKey: null,              icon: IC.shield },
    ],
  },
  {
    lk: 'nav.groups.compliance',
    items: [
      { lk: 'nav.items.insurance',   href: '/assurances',           badgeKey: null, icon: IC.shield },
      { lk: 'nav.items.techChecks',  href: '/controles-techniques', badgeKey: null, icon: IC.clip },
      { lk: 'nav.items.claims',      href: '/sinistres',            badgeKey: null, icon: IC.exclamation },
      { lk: 'nav.items.fuel',        href: '/carburant',            badgeKey: null, icon: IC.fuel },
      { lk: 'nav.items.alerts',      href: '/alertes',              badgeKey: null, icon: IC.bell },
    ],
  },
  {
    lk: 'nav.groups.management',
    items: [
      { lk: 'nav.items.employees',  href: '/employes',  badgeKey: null, icon: IC.person },
      { lk: 'nav.items.documents',  href: '/documents', badgeKey: null, icon: IC.document },
      { lk: 'nav.items.reporting',  href: '/reporting', badgeKey: null, icon: IC.chart },
    ],
  },
];

const quickActions = [
  { lk: 'nav.quickActions.addVehicle', href: '/voitures/new', variant: 'primary' as const },
  { lk: 'nav.quickActions.addSale',    href: '/ventes',       variant: 'primary' as const },
  { lk: 'nav.quickActions.clients',    href: '/clients',      variant: 'secondary' as const },
  { lk: 'nav.quickActions.stock',      href: '/stock',        variant: 'secondary' as const },
];

const employeeRoles = ['admin', 'super_admin', 'commercial', 'agent_location', 'sav', 'atelier', 'stock'];

// ── Couleurs de la barre (violet sombre HubSpot) ─────────────────────────────
const SIDEBAR_BG   = '#2d1b3d';
const SIDEBAR_BDR  = 'rgba(255,255,255,0.08)';

// ── Composant ─────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
  allowedRoles = employeeRoles,
  menuVariant = 'employee',
  guestRedirect = '/login/employee',
  allowGuest = false,
}: DashboardLayoutProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const notifBtnId  = useId();
  const userMenuId  = useId();
  const { t }       = useTranslation();

  const { role: currentUserRole, canAccessRoute } = useRole();

  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [searchOpen,       setSearchOpen]       = useState(false);
  const [currentUserName,  setCurrentUserName]  = useState('Utilisateur');
  const [currentPhotoUrl,  setCurrentPhotoUrl]  = useState<string | null>(null);
  const [currentTime,      setCurrentTime]      = useState('');
  const [userMenuOpen,     setUserMenuOpen]      = useState(false);
  const [notifMenuOpen,    setNotifMenuOpen]     = useState(false);
  const [notifItems,       setNotifItems]        = useState<NotificationItem[]>([]);

  const { counts, loading: notifLoading } = useNotificationBadges();

  const activeItem = useMemo(() => {
    if (menuVariant === 'client') {
      return clientMenuItems.find((item) => pathname.startsWith(item.href))?.href ?? pathname;
    }
    if (pathname.startsWith('/dashboard')) return '/dashboard';
    if (pathname.startsWith('/settings'))  return '/settings';
    const all = navGroups.flatMap((g) => g.items);
    return all.find((item) => pathname.startsWith(item.href))?.href ?? pathname;
  }, [menuVariant, pathname]);

  const totalNotifs =
    (counts.tickets_ouverts     ?? 0) +
    (counts.ordres_ouverts      ?? 0) +
    (counts.factures_impayees   ?? 0) +
    (counts.reservations        ?? 0) +
    (counts.alertes_stock       ?? 0) +
    (counts.demandes_en_attente ?? 0);

  useEffect(() => {
    function syncUserFromStorage() {
      try {
        const raw = sessionStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          setCurrentUserName(u?.name || u?.username || 'Utilisateur');
          setCurrentPhotoUrl(u?.profile_photo_url || null);
        }
      } catch { /* ignore */ }
    }

    syncUserFromStorage();
    window.addEventListener(AUTH_CHANGED_EVENT, syncUserFromStorage);

    const tick = () =>
      setCurrentTime(new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date()));
    tick();
    const iv = window.setInterval(tick, 60_000);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUserFromStorage);
      window.clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    if (!notifMenuOpen) return;
    let mounted = true;
    getNotifications(8).then((items) => { if (mounted) setNotifItems(items); });
    return () => { mounted = false; };
  }, [notifMenuOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setNotifMenuOpen(false);
        setSidebarOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { setSidebarOpen(false); setSearchOpen(false); }, [pathname]);

  function getInitials(name: string) {
    return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  }

  async function logout() {
    try { await apiClient.logout(); } catch { /* ignore */ }
    router.push('/');
  }

  async function handleNotifClick(item: NotificationItem) {
    try { await apiClient.patch(`/notifications/${item.id}/read`, {}); } catch { /* ignore */ }
    setNotifItems((prev) =>
      prev.map((n) => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)
    );
    setNotifMenuOpen(false);
    if (!item.url) return;
    const url = item.url.startsWith('/') || item.url.startsWith('http') ? item.url : `/${item.url}`;
    router.push(url);
  }

  // ── Sidebar content ───────────────────────────────────────────────────────────

  const filteredNavGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((item) => canAccessRoute(item.href)) }))
    .filter((g) => g.items.length > 0);

  const filteredQuickActions = quickActions.filter((a) => canAccessRoute(a.href));

  const collapsed = sidebarCollapsed; // shorthand

  const sidebarContent = (
    <div className="flex min-h-full flex-col">

      {/* Bouton de repli — desktop uniquement */}
      <div className={`hidden lg:flex ${collapsed ? 'justify-center' : 'justify-end'} px-2 py-2`}>
        <button
          type="button"
          aria-label={collapsed ? t('nav.sidebar.open') : t('nav.sidebar.collapse')}
          onClick={() => setSidebarCollapsed((v) => !v)}
          title={collapsed ? t('nav.sidebar.open') : t('nav.sidebar.collapse')}
          className="flex h-7 w-7 items-center justify-center rounded text-[#8a6da0] transition hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <NavIcon d={collapsed ? IC.chevronR : IC.chevronL} size={14} />
        </button>
      </div>

      {/* Navigation client */}
      {menuVariant === 'client' ? (
        <nav aria-label="Menu client" className="flex-1 px-2">
          <ul className="space-y-0.5" role="list">
            {clientMenuItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? t(item.lk) : undefined}
                    className={`flex items-center rounded py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                      ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}
                      ${active
                        ? 'bg-white/[0.15] text-white'
                        : 'text-[#c4a8d8] hover:bg-white/[0.08] hover:text-white'
                      }`}
                  >
                    <NavIcon d={item.icon} />
                    {!collapsed && t(item.lk)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <nav aria-label="Menu principal" className="flex flex-1 flex-col px-2 pb-2">

          {/* Dashboard */}
          <Link
            href="/dashboard"
            aria-current={activeItem === '/dashboard' ? 'page' : undefined}
            title={collapsed ? t('nav.dashboard') : undefined}
            className={`mb-1 flex items-center rounded py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
              ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}
              ${activeItem === '/dashboard'
                ? 'bg-white/[0.15] text-white'
                : 'text-[#c4a8d8] hover:bg-white/[0.08] hover:text-white'
              }`}
          >
            <NavIcon d={IC.home} />
            {!collapsed && t('nav.dashboard')}
          </Link>

          {/* Actions rapides — masquées si réduit */}
          {!collapsed && (
            <section aria-label={t('nav.quickActions.title')} className="mb-4 mt-2">
              <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a6da0]">
                {t('nav.quickActions.title')}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {filteredQuickActions.map((action) => (
                  <Link
                    key={action.href + action.lk}
                    href={action.href}
                    className={`rounded px-2 py-1.5 text-center text-[11px] font-semibold leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                      ${action.variant === 'primary'
                        ? 'bg-white/[0.15] text-white hover:bg-white/[0.25] focus-visible:ring-white/20 active:scale-95'
                        : 'bg-white/[0.07] text-[#c4a8d8] hover:bg-white/[0.13] hover:text-white focus-visible:ring-white/20'
                      }`}
                  >
                    {t(action.lk)}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Séparateur si réduit */}
          {collapsed && <div className="mx-2 mb-2 border-t" style={{ borderColor: SIDEBAR_BDR }} />}

          {/* Navigation groupée */}
          <div className="flex-1 space-y-4 overflow-y-auto">
            {filteredNavGroups.map((group) => (
              <section key={group.lk} aria-label={t(group.lk)}>
                {!collapsed && (
                  <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a6da0]">
                    {t(group.lk)}
                  </p>
                )}
                <ul className="space-y-0.5" role="list">
                  {group.items.map((item) => {
                    const active = activeItem === item.href;
                    const badge = item.badgeKey
                      ? (counts[item.badgeKey as keyof typeof counts] ?? 0)
                      : 0;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          title={collapsed ? t(item.lk) : undefined}
                          className={`relative flex items-center rounded py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                            ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}
                            ${active
                              ? 'bg-white/[0.12] font-semibold text-white'
                              : 'font-medium text-[#c4a8d8] hover:bg-white/[0.08] hover:text-white'
                            }`}
                        >
                          <NavIcon d={item.icon} />
                          {!collapsed && <span className="flex-1">{t(item.lk)}</span>}
                          {badge > 0 && !collapsed && (
                            <span
                              aria-label={`${badge} élément${badge > 1 ? 's' : ''}`}
                              className={`flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                                ${active ? 'bg-white/[0.25] text-white' : 'bg-white/80 text-[#2d1b3d]'}`}
                            >
                              {badge}
                            </span>
                          )}
                          {badge > 0 && collapsed && (
                            <span
                              aria-hidden="true"
                              className="absolute right-1 top-1 h-2 w-2 rounded-full bg-white/70"
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>
      )}

      {/* ── Menu utilisateur ─────────────────────────────────────────────────── */}
      <div className="relative mt-auto px-2 pb-3 pt-2" style={{ borderTop: `1px solid ${SIDEBAR_BDR}` }}>
        {userMenuOpen && (
          <div
            id={userMenuId}
            role="menu"
            aria-label="Menu utilisateur"
            className="absolute bottom-full left-2 right-2 mb-2 overflow-hidden rounded border border-[#dfe3eb] bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
          >
            <Link
              href="/settings"
              role="menuitem"
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-[#111827] transition hover:bg-[#f5f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#33475b]/30 dark:text-slate-200 dark:hover:bg-slate-700 ${
                pathname.startsWith('/settings') ? 'bg-[#f5f8fa] dark:bg-slate-700' : ''
              }`}
              onClick={() => setUserMenuOpen(false)}
            >
              <NavIcon d={IC.sliders} size={16} />
              {t('user.settings')}
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2.5 border-t border-[#dfe3eb] px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('user.logout')}
            </button>
          </div>
        )}

        <button
          type="button"
          aria-label={`Menu de ${currentUserName}`}
          aria-expanded={userMenuOpen}
          aria-controls={userMenuId}
          aria-haspopup="menu"
          title={collapsed ? currentUserName : undefined}
          onClick={() => { setUserMenuOpen((v) => !v); setNotifMenuOpen(false); }}
          className={`flex w-full items-center rounded py-2 text-left transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
            ${collapsed ? 'justify-center px-1' : 'gap-3 px-2'}`}
        >
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt={currentUserName}
              aria-hidden="true"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#516f90] text-xs font-black text-white"
            >
              {getInitials(currentUserName)}
            </div>
          )}
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{currentUserName}</p>
                <p className="truncate text-xs text-[#8a6da0]">{currentUserRole || 'Utilisateur'}</p>
              </div>
              <svg
                aria-hidden="true"
                className={`h-3.5 w-3.5 shrink-0 text-[#8a6da0] transition ${userMenuOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ── JSX ───────────────────────────────────────────────────────────────────────

  const content = (
    <div className="min-h-screen bg-[#f5f8fa] text-slate-900 dark:bg-slate-900 dark:text-slate-100">

      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      {/* ── Topbar ──────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: SIDEBAR_BG, borderColor: SIDEBAR_BDR }}
      >
        <div className="flex h-[52px] items-center justify-between px-4 sm:px-5">

          {/* Gauche : hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={sidebarOpen ? t('nav.sidebar.closeMenu') : t('nav.sidebar.openMenu')}
              aria-expanded={sidebarOpen}
              aria-controls="sidebar-nav"
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded text-[#c4a8d8] transition hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 lg:hidden"
            >
              {sidebarOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              <NextImage src="/logo.png" alt="SunuPark" width={36} height={36} className="h-9 w-9 object-contain opacity-95" />
              <div className="hidden sm:block">
                <p className="text-sm font-black text-white leading-tight">SunuPark</p>
                <p className="text-[10px] leading-tight" style={{ color: '#8a6da0' }}>Parc automobile</p>
              </div>
            </Link>
          </div>

          {/* Centre : recherche (desktop) */}
          <div className="mx-6 hidden max-w-md flex-1 lg:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: '#8a6da0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder={t('nav.search.placeholder')}
                aria-label={t('nav.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/voitures?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                  }
                }}
                className="h-8 w-full rounded pl-9 pr-4 text-xs outline-none transition focus:ring-1 focus:ring-white/20"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2d4f0',
                }}
              />
            </div>
          </div>

          {/* Droite : heure + notifs */}
          <div className="flex items-center gap-1.5">
            <div className="hidden text-right sm:block mr-1" aria-live="polite" aria-atomic="true">
              <p className="text-sm font-semibold text-white leading-tight">{t('nav.greeting')} {currentUserName}</p>
              <p className="text-[11px] leading-tight" style={{ color: '#8a6da0' }}>{currentTime || '--:--'}</p>
            </div>

            {/* Bouton recherche mobile */}
            <button
              type="button"
              aria-label={searchOpen ? t('nav.search.close') : t('nav.search.open')}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded text-[#c4a8d8] transition hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cloche notifications */}
            <div className="relative">
              <button
                id={notifBtnId}
                type="button"
                aria-label={`Notifications${totalNotifs > 0 ? ` (${totalNotifs} non lues)` : ''}`}
                aria-expanded={notifMenuOpen}
                aria-haspopup="true"
                onClick={() => { setNotifMenuOpen((v) => !v); setUserMenuOpen(false); }}
                className="relative flex h-9 w-9 items-center justify-center rounded text-[#c4a8d8] transition hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {(notifLoading || totalNotifs > 0) && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#516f90] px-1 text-[10px] font-bold text-white"
                  >
                    {notifLoading ? '·' : totalNotifs}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <div
                  role="dialog"
                  aria-label="Panneau de notifications"
                  className="absolute right-0 mt-2 w-[min(360px,90vw)] overflow-hidden rounded border border-[#dfe3eb] bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="border-b border-[#dfe3eb] px-4 py-3 dark:border-slate-700">
                    <p className="text-sm font-bold text-[#111827] dark:text-slate-100">{t('notif.title')}</p>
                    <p className="mt-0.5 text-xs text-[#6b7280] dark:text-slate-400">{t('notif.subtitle')}</p>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto" role="list">
                    {notifItems.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-[#6b7280]">{t('notif.empty')}</p>
                    ) : notifItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="listitem"
                        onClick={() => handleNotifClick(item)}
                        className={`block w-full border-b border-[#dfe3eb] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#f5f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#33475b]/20 dark:border-slate-700 dark:hover:bg-slate-700 ${
                          item.read_at ? 'bg-white dark:bg-slate-800' : 'bg-[#f5f8fa] dark:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">{item.title}</p>
                            <p className="mt-0.5 text-xs text-[#6b7280] dark:text-slate-400">{item.message}</p>
                          </div>
                          {!item.read_at && (
                            <span aria-label="Non lue" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#516f90]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        {searchOpen && (
          <div className="border-t px-4 py-2 lg:hidden" style={{ borderColor: SIDEBAR_BDR }}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: '#8a6da0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                autoFocus
                placeholder={t('nav.search.mobile')}
                aria-label={t('nav.search.mobile')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/voitures?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                    setSearchOpen(false);
                  }
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
                className="h-9 w-full rounded pl-9 pr-4 text-sm outline-none transition focus:ring-1 focus:ring-white/20"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2d4f0',
                }}
              />
            </div>
          </div>
        )}
      </header>

      <div className="relative flex">

        {/* Backdrop mobile */}
        {sidebarOpen && (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          id="sidebar-nav"
          aria-label="Navigation principale"
          className={[
            // mobile : fixed overlay pleine largeur
            'fixed inset-y-0 left-0 z-40 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out',
            'w-64',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            // desktop : sidebar collée, largeur dynamique
            'lg:sticky lg:top-[52px] lg:z-auto lg:h-[calc(100vh-52px)] lg:translate-x-0 lg:border-r',
            collapsed ? 'lg:w-[56px]' : 'lg:w-60',
          ].join(' ')}
          style={{ background: SIDEBAR_BG, borderColor: SIDEBAR_BDR }}
        >
          {sidebarContent}
        </aside>

        {/* ── Contenu principal ─────────────────────────────────────────── */}
        <main
          id="main-content"
          className="min-w-0 flex-1 p-4 sm:p-5 lg:p-6 bg-[#f5f8fa] dark:bg-slate-900"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );

  if (allowGuest) return content;

  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      guestRedirect={guestRedirect}
      unauthorizedRedirect={menuVariant === 'client' ? '/dashboard' : '/espace-client'}
    >
      {content}
    </ProtectedRoute>
  );
}


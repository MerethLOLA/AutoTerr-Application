'use client';

import ChatbotWidget from '@/components/ChatbotWidget';
import { useTranslation, setLocale, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAVY = '#185FA5';
const LOCALES: { code: Locale; flag: string }[] = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'es', flag: '🇪🇸' },
];

/* ── Icons SVG inline ─────────────────────────────────────────────────────── */
const NAV_LINKS = [
  {
    label: 'Accueil',
    href: '/',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Catalogue',
    href: '/catalogue',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
      </svg>
    ),
  },
  {
    label: 'Services',
    href: '/#services',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'À propos',
    href: '/apropos',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    href: '/#contact',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark,   setIsDark]   = useState(false);
  const { locale } = useTranslation();

  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.classList.contains('dark'));
    const obs = new MutationObserver(() => setIsDark(html.classList.contains('dark')));
    obs.observe(html, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    const next = html.classList.contains('dark') ? 'light' : 'dark';
    html.classList.toggle('dark', next === 'dark');
    try { document.cookie = `sp_theme=${next};path=/;max-age=31536000`; } catch {}
  }

  function cycleLocale() {
    const idx  = LOCALES.findIndex(l => l.code === locale);
    const next = LOCALES[(idx + 1) % LOCALES.length].code;
    setLocale(next);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]) && href !== '/';

  const accent = isDark ? '#4A9FE0' : NAVY;
  const bg     = isDark ? '#071626' : '#ffffff';
  const bgSub  = isDark ? '#0C1F33' : '#f5f8fa';
  const border = isDark ? '#1A3450' : '#dbeafe';
  const txtPri = isDark ? '#DEE9F5' : '#111827';
  const txtSec = isDark ? '#7BA4C8' : '#6b7280';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, color: txtPri, transition: 'background .2s, color .2s' }}>

      <ChatbotWidget />

      {/* ── Navbar ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b transition-all duration-300 backdrop-blur-md"
        style={{ borderColor: scrolled ? border : 'transparent', background: scrolled ? (isDark ? 'rgba(7,22,38,0.98)' : 'rgba(255,255,255,0.98)') : (isDark ? 'rgba(7,22,38,0.95)' : 'rgba(255,255,255,0.95)'), boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.08)' : 'none' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3 sm:gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div style={{ position: 'relative', width: '160px', height: '56px', overflow: 'hidden', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/LOgo2.png" alt="AutoTerr" style={{
                  position: 'absolute', width: '160px', height: 'auto',
                  top: '50%', transform: 'translateY(-57%)',
                }} />
              </div>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden items-center lg:flex">
              {NAV_LINKS.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link key={l.href} href={l.href}
                    className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors rounded-lg mx-0.5"
                    style={{ color: active ? accent : txtSec }}>
                    <span style={{ color: active ? accent : (isDark ? '#4A9FE040' : '#9ca3af') }}>{l.icon}</span>
                    {l.label}
                    {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full" style={{ backgroundColor: accent }} />}
                  </Link>
                );
              })}
            </nav>

            {/* Thème + Langue */}
            <div className="hidden items-center gap-1 lg:flex shrink-0">
              <button onClick={toggleTheme} title={isDark ? 'Mode clair' : 'Mode sombre'}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:32, height:32, borderRadius:'50%', border:`1px solid ${border}`, color: accent, background: 'transparent', cursor:'pointer', transition:'background .15s' }}>
                {isDark
                  ? <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  : <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                }
              </button>
              <button onClick={cycleLocale} title="Changer de langue"
                style={{ display:'flex', alignItems:'center', gap:4, height:32, borderRadius:16, border:`1px solid ${border}`, padding:'0 10px', fontSize:11, fontWeight:700, color: accent, background:'transparent', cursor:'pointer', transition:'background .15s' }}>
                <span>{LOCALES.find(l => l.code === locale)?.flag}</span>
                <span>{locale.toUpperCase()}</span>
              </button>
            </div>

            {/* CTA desktop */}
            <div className="hidden items-center gap-2 lg:flex shrink-0">
              <Link href="/login/client"
                className="flex items-center gap-1.5 rounded-full border border-[#dbeafe] px-4 py-2 text-sm font-bold text-[#185FA5] transition hover:border-[#185FA5]/30">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Connexion
              </Link>
              <Link href="/inscription"
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 hover:shadow-md"
                style={{ backgroundColor: NAVY }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                S&apos;inscrire
              </Link>
            </div>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu"
              className="flex flex-col justify-center gap-1.5 rounded-lg p-2 transition hover:bg-[#eff6ff] lg:hidden">
              <span className={`block h-0.5 w-6 rounded-full bg-[#185FA5] transition-all ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-6 rounded-full bg-[#185FA5] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 rounded-full bg-[#185FA5] transition-all ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`overflow-hidden transition-all duration-300 lg:hidden ${menuOpen ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-[#dbeafe] bg-white/95 px-4 pb-5 shadow-sm">
            <nav className="flex flex-col gap-1 pt-3">
              {NAV_LINKS.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? 'text-[#185FA5] font-bold'
                        : 'text-[#6b7280] hover:text-[#185FA5]'
                    }`}>
                    <span className={active ? 'text-[#1d6fb8]' : 'text-[#9ca3af]'}>{l.icon}</span>
                    {l.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 flex flex-col gap-2.5 border-t border-[#dbeafe] pt-4">
              <Link href="/login/client" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full border border-[#dbeafe] px-4 py-3 text-sm font-bold text-[#185FA5] transition hover:border-[#185FA5]/30">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Se connecter
              </Link>
              <Link href="/inscription" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: NAVY }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Créer mon compte
              </Link>
              <div className="flex items-center justify-end pt-1">
                <div className="flex gap-1.5">
                  <button onClick={toggleTheme}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dbeafe] text-[#185FA5]">
                    {isDark
                      ? <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    }
                  </button>
                  <button onClick={cycleLocale}
                    className="flex h-8 items-center gap-1 rounded-full border border-[#dbeafe] px-2.5 text-xs font-bold text-[#185FA5]">
                    <span>{LOCALES.find(l => l.code === locale)?.flag}</span>
                    <span>{locale.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenu ────────────────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer style={{ background: bgSub, borderTop: `0.5px solid ${border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', width: '110px', height: '40px', overflow: 'hidden', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/LOgo2.png" alt="AutoTerr" style={{ position: 'absolute', width: '110px', height: 'auto', top: '50%', transform: 'translateY(-57%)' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: txtSec, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/" style={{ color: txtSec, textDecoration: 'none' }}>Accueil</Link>
          <Link href="/catalogue" style={{ color: txtSec, textDecoration: 'none' }}>Catalogue</Link>
          <Link href="/apropos" style={{ color: txtSec, textDecoration: 'none' }}>À propos</Link>
          <span style={{ cursor: 'pointer', color: txtSec }}>CGU</span>
          <span style={{ cursor: 'pointer', color: txtSec }}>Confidentialité</span>
          <span style={{ cursor: 'pointer', color: txtSec }}>Aide</span>
        </div>
        <div style={{ fontSize: 12, color: txtSec }}>
          © {new Date().getFullYear()} AutoTerr Sénégal
        </div>
      </footer>
    </div>
  );
}

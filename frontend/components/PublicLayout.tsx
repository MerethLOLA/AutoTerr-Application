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

const SOCIAL_LINKS = [
  {
    label: 'Facebook', href: 'https://facebook.com', color: '#1877f2',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8.615v-6.96h-2.338v-2.725h2.338v-2c0-2.325 1.42-3.592 3.5-3.592.699-.002 1.399.034 2.095.107v2.42h-1.435c-1.128 0-1.348.538-1.348 1.325v1.735h2.697l-.35 2.725h-2.348V21H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/></svg>,
  },
  {
    label: 'TikTok', href: 'https://tiktok.com', color: '#010101',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/></svg>,
  },
  {
    label: 'X', href: 'https://x.com', color: '#14171a',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    label: 'Instagram', href: 'https://instagram.com', color: '#e1306c',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
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

      {/* ── Barre sociale flottante (desktop) ─────────────────────────────────── */}
      <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-px">
        {SOCIAL_LINKS.map(({ label, href, color, icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
            className="group flex h-10 w-10 hover:w-36 items-center overflow-hidden rounded-r-xl text-white transition-[width] duration-200 ease-out"
            style={{ backgroundColor: color }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">{icon}</span>
            <span className="whitespace-nowrap pr-3 text-xs font-bold">{label}</span>
          </a>
        ))}
      </aside>

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
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2">
                  {SOCIAL_LINKS.map(({ label, href, color, icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition hover:scale-110"
                      style={{ backgroundColor: color }}>
                      {icon}
                    </a>
                  ))}
                </div>
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

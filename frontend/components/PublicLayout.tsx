'use client';

import ChatbotWidget from '@/components/ChatbotWidget';
import { useTranslation, setLocale, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const LOCALES: { code: Locale; flag: string }[] = [
  { code: 'fr', flag: '/drapeau-fr.jpg' },
  { code: 'en', flag: '/drapeau-en.jpg' },
  { code: 'es', flag: '/drapeau-es.jpg' },
];

/* ── Icons SVG inline ─────────────────────────────────────────────────────── */
const NAV_LINKS = [
  {
    labelKey: 'public.nav.home',
    href: '/',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    labelKey: 'public.nav.sale',
    href: '/catalogue/vente',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
      </svg>
    ),
  },
  {
    labelKey: 'public.nav.rental',
    href: '/catalogue/location',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15h.01M16 15h.01" />
      </svg>
    ),
  },
  {
    labelKey: 'public.nav.services',
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
    labelKey: 'public.nav.about',
    href: '/apropos',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    labelKey: 'public.nav.contact',
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
  const { t, locale } = useTranslation();

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

  // Résolus via les variables CSS de globals.css : le thème est déjà appliqué
  // au <html> avant le premier rendu, ces valeurs s'adaptent automatiquement.
  const accent = 'var(--color-accent)';
  const bg     = 'var(--color-background-primary)';
  const bgSub  = 'var(--color-background-secondary)';
  const border = 'var(--color-border-tertiary)';
  const txtPri = 'var(--color-text-primary)';
  const txtSec = 'var(--color-text-secondary)';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, color: txtPri, transition: 'background .2s, color .2s' }}>

      <ChatbotWidget />

      {/* ── Navbar ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b transition-all duration-300 backdrop-blur-md"
        style={{ borderColor: scrolled ? border : 'transparent', background: bg, boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.08)' : 'none' }}>
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
                    className="relative px-4 py-2 text-sm font-semibold transition-colors rounded-lg mx-0.5"
                    style={{ color: active ? accent : txtSec }}>
                    {t(l.labelKey)}
                    {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full" style={{ backgroundColor: accent }} />}
                  </Link>
                );
              })}
            </nav>

            {/* Thème + Langue */}
            <div className="hidden items-center gap-1 lg:flex shrink-0">
              <button onClick={toggleTheme} title={isDark ? t('public.theme.toLight') : t('public.theme.toDark')}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:32, height:32, borderRadius:'50%', border:`1px solid ${border}`, color: accent, background: 'transparent', cursor:'pointer', transition:'background .15s' }}>
                {isDark
                  ? <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  : <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                }
              </button>
              <button onClick={cycleLocale} title={t('public.langSwitch')}
                style={{ display:'flex', alignItems:'center', gap:4, height:32, borderRadius:16, border:`1px solid ${border}`, padding:'0 10px', fontSize:11, fontWeight:700, color: accent, background:'transparent', cursor:'pointer', transition:'background .15s' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOCALES.find(l => l.code === locale)?.flag} alt="" style={{ height: 14, width: 20, borderRadius: 2, objectFit: 'cover' }} />
                <span>{locale.toUpperCase()}</span>
              </button>
            </div>

            {/* CTA desktop */}
            <div className="hidden items-center gap-2 lg:flex shrink-0">
              <Link href="/login/client"
                className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-tertiary)] px-4 py-2 text-sm font-bold text-[var(--color-accent)] transition hover:border-[var(--color-accent-ring)]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('public.auth.login')}
              </Link>
              <Link href="/inscription"
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 hover:shadow-md"
                style={{ backgroundColor: 'var(--color-secondary)' }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t('public.auth.register')}
              </Link>
            </div>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen((v) => !v)} aria-label={t('public.menu')}
              className="flex flex-col justify-center gap-1.5 rounded-lg p-2 transition hover:bg-[var(--color-accent-light)] lg:hidden">
              <span className={`block h-0.5 w-6 rounded-full bg-[var(--color-accent)] transition-all ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-6 rounded-full bg-[var(--color-accent)] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 rounded-full bg-[var(--color-accent)] transition-all ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`overflow-hidden transition-all duration-300 lg:hidden ${menuOpen ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-4 pb-5 shadow-sm">
            <nav className="flex flex-col gap-1 pt-3">
              {NAV_LINKS.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? 'text-[var(--color-accent)] font-bold'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]'
                    }`}>
                    <span className={active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}>{l.icon}</span>
                    {t(l.labelKey)}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 flex flex-col gap-2.5 border-t border-[var(--color-border-tertiary)] pt-4">
              <Link href="/login/client" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-border-tertiary)] px-4 py-3 text-sm font-bold text-[var(--color-accent)] transition hover:border-[var(--color-accent-ring)]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('public.auth.loginMobile')}
              </Link>
              <Link href="/inscription" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--color-secondary)' }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t('public.auth.registerMobile')}
              </Link>
              <div className="flex items-center justify-end pt-1">
                <div className="flex gap-1.5">
                  <button onClick={toggleTheme}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border-tertiary)] text-[var(--color-accent)]">
                    {isDark
                      ? <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    }
                  </button>
                  <button onClick={cycleLocale}
                    className="flex h-8 items-center gap-1 rounded-full border border-[var(--color-border-tertiary)] px-2.5 text-xs font-bold text-[var(--color-accent)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={LOCALES.find(l => l.code === locale)?.flag} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />
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
      {/* Fond volontairement sombre quel que soit le thème du site (scope `.dark`) — même logique que le hero/CTA. */}
      <footer className="dark" style={{ background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)' }}>
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* Marque */}
            <div>
              <div className="mb-4 inline-flex rounded-lg bg-white p-2.5">
                <div style={{ position: 'relative', width: '110px', height: '38px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/LOgo2.png" alt="AutoTerr" style={{ position: 'absolute', width: '110px', height: 'auto', top: '50%', transform: 'translateY(-57%)' }} />
                </div>
              </div>
              <p className="text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                Location et vente de véhicules de qualité à Dakar. Votre partenaire de confiance pour la mobilité au Sénégal.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-primary)' }}>Navigation</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/" className="transition hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>{t('public.nav.home')}</Link></li>
                <li><Link href="/catalogue/vente" className="transition hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>{t('public.nav.sale')}</Link></li>
                <li><Link href="/catalogue/location" className="transition hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>{t('public.nav.rental')}</Link></li>
                <li><Link href="/apropos" className="transition hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>{t('public.nav.about')}</Link></li>
                <li><Link href="/#contact" className="transition hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>{t('public.nav.contact')}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-primary)' }}>Contact</h3>
              <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <li>Route de la Corniche Ouest<br />Dakar, Sénégal</li>
                <li>+221 77 758 82 95<br /><span className="text-xs">Lun – Sam : 8h – 18h</span></li>
                <li>contact@autoterr.sn<br /><span className="text-xs">Réponse sous 24h</span></li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-primary)' }}>Informations</h3>
              <ul className="space-y-2.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <li className="cursor-pointer transition hover:opacity-80">{t('public.footer.terms')}</li>
                <li className="cursor-pointer transition hover:opacity-80">{t('public.footer.privacy')}</li>
                <li className="cursor-pointer transition hover:opacity-80">{t('public.footer.help')}</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-6 text-center text-xs" style={{ borderColor: 'var(--color-border-tertiary)', color: 'var(--color-text-secondary)' }}>
            © {new Date().getFullYear()} {t('public.footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
}

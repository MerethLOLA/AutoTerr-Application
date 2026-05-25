'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const VIOLET = '#2d1b3d';

const NAV_LINKS = [
  { label: 'Accueil',   href: '/' },
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Services',  href: '/#services' },
  { label: 'Contact',   href: '/#contact' },
];

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    color: '#1877f2',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8.615v-6.96h-2.338v-2.725h2.338v-2c0-2.325 1.42-3.592 3.5-3.592.699-.002 1.399.034 2.095.107v2.42h-1.435c-1.128 0-1.348.538-1.348 1.325v1.735h2.697l-.35 2.725h-2.348V21H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com',
    color: '#010101',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/>
      </svg>
    ),
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com',
    color: '#14171a',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    color: '#e1306c',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
];

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Menu" className="flex flex-col justify-center gap-1.5 p-2 lg:hidden">
      <span className={`block h-0.5 w-6 bg-[#2d1b3d] transition-all ${open ? 'translate-y-2 rotate-45' : ''}`} />
      <span className={`block h-0.5 w-6 bg-[#2d1b3d] transition-all ${open ? 'opacity-0' : ''}`} />
      <span className={`block h-0.5 w-6 bg-[#2d1b3d] transition-all ${open ? '-translate-y-2 -rotate-45' : ''}`} />
    </button>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Barre sociale flottante (desktop) ── */}
      <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-px">
        {SOCIAL_LINKS.map(({ label, href, color, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className="group flex h-10 w-10 hover:w-36 items-center overflow-hidden rounded-r-xl text-white transition-[width] duration-200 ease-out"
            style={{ backgroundColor: color }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">{icon}</span>
            <span className="whitespace-nowrap pr-3 text-xs font-bold">{label}</span>
          </a>
        ))}
      </aside>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-[#ede8f4] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: VIOLET }}>
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 2C8 2 5 5.5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.5-3-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" strokeWidth={1.8} />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight" style={{ color: VIOLET }}>SunuPark</span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden items-center gap-6 lg:flex">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}
                  className={`text-sm font-semibold transition-colors ${pathname === l.href ? 'text-[#2d1b3d]' : 'text-[#516f90] hover:text-[#2d1b3d]'}`}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* CTA desktop */}
            <div className="hidden items-center gap-2 lg:flex">
              <Link href="/login/client"
                className="rounded px-4 py-2 text-sm font-bold text-[#2d1b3d] transition hover:bg-[#f3f0f7]">
                Se connecter
              </Link>
              <Link href="/inscription"
                className="rounded px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: VIOLET }}>
                S&apos;inscrire
              </Link>
            </div>

            <Hamburger open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-[#ede8f4] bg-white px-4 pb-4 lg:hidden">
            <nav className="flex flex-col gap-1 pt-3">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  className="rounded px-3 py-2.5 text-sm font-semibold text-[#516f90] hover:bg-[#f3f0f7] hover:text-[#2d1b3d]">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-[#ede8f4] pt-3">
              <Link href="/login/client" onClick={() => setMenuOpen(false)}
                className="rounded border border-[#2d1b3d] px-4 py-2.5 text-center text-sm font-bold text-[#2d1b3d]">
                Se connecter
              </Link>
              <Link href="/inscription" onClick={() => setMenuOpen(false)}
                className="rounded px-4 py-2.5 text-center text-sm font-bold text-white"
                style={{ backgroundColor: VIOLET }}>
                S&apos;inscrire
              </Link>
              {/* Réseaux sociaux mobile */}
              <div className="flex justify-center gap-3 pt-2">
                {SOCIAL_LINKS.map(({ label, href, color, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: color }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Contenu ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer dark ── */}
      <footer className="bg-[#1a0f26] text-white">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand + socials */}
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c9a8e8]">
                  <svg className="h-5 w-5 text-[#2d1b3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 2C8 2 5 5.5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.5-3-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" strokeWidth={1.8} />
                  </svg>
                </div>
                <span className="text-xl font-black text-white">SunuPark</span>
              </div>
              <p className="mb-5 text-sm leading-6 text-white/50">
                Votre partenaire automobile au Sénégal. Vente, location et entretien de véhicules.
              </p>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#c9a8e8]">Suivez-nous</p>
              <div className="flex gap-2">
                {SOCIAL_LINKS.map(({ label, href, color, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:scale-110 hover:opacity-90"
                    style={{ backgroundColor: color }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#c9a8e8]">Navigation</p>
              <ul className="space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/50 transition hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Espace client */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#c9a8e8]">Espace client</p>
              <ul className="space-y-2.5">
                <li><Link href="/inscription" className="text-sm text-white/50 transition hover:text-white">Créer un compte</Link></li>
                <li><Link href="/login/client" className="text-sm text-white/50 transition hover:text-white">Se connecter</Link></li>
                <li><Link href="/espace-client" className="text-sm text-white/50 transition hover:text-white">Mon espace</Link></li>
                <li><Link href="/catalogue" className="text-sm text-white/50 transition hover:text-white">Catalogue véhicules</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#c9a8e8]">Contact</p>
              <div className="space-y-3 text-sm text-white/50">
                <p className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Dakar, Sénégal
                </p>
                <p className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-[#c9a8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +221 77 758 82 95
                </p>
                <p className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-[#c9a8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  lolasemerethrebecca@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/30 sm:flex-row">
            <p>© {new Date().getFullYear()} SunuPark — Tous droits réservés</p>
            <p>Fait avec ♥ au Sénégal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

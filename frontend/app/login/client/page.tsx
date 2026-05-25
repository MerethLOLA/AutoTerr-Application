'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { readStoredAuth } from '@/lib/auth-storage';

function EyeOpen() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7a3 3 0 0 0 4.2 4.2" />
      <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18.6 18.6 0 0 1-3 3.9" />
      <path d="M6.6 6.7C4.1 8.3 2.6 11 2 12c0 0 3.5 7 10 7a10.7 10.7 0 0 0 5-1.2" />
    </svg>
  );
}

const VIOLET = '#2d1b3d';
const ACCENT = '#5b2d8e';
const BG     = '#f3f0f7';

export default function LoginClient() {
  const router = useRouter();
  const { login, loading, isAuthenticated } = useAuth();

  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const isDisabled = useMemo(
    () => loading || !username.trim() || !password.trim(),
    [loading, username, password],
  );

  useEffect(() => {
    const { token, user } = readStoredAuth();
    if (token && user && isAuthenticated) {
      router.replace(user.role === 'client' ? '/espace-client' : '/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({ username: username.trim(), password });
      router.push(res.user.role === 'client' ? '/espace-client' : '/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Identifiants incorrects. Veuillez réessayer.');
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    borderRadius: 3,
    border: '1px solid #dfe3eb',
    backgroundColor: '#f5f8fa',
    color: '#33475b',
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color .15s, background-color .15s',
  };

  function focusInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor     = ACCENT;
    e.target.style.backgroundColor = '#fff';
    e.target.style.boxShadow       = `0 0 0 3px ${ACCENT}22`;
  }
  function blurInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor     = '#dfe3eb';
    e.target.style.backgroundColor = '#f5f8fa';
    e.target.style.boxShadow       = 'none';
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: BG }}>

      {/* Formes décoratives */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rotate-45 rounded-3xl opacity-30"
        style={{ backgroundColor: '#c9a8e8' }} />
      <div className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rotate-45 rounded-2xl opacity-20"
        style={{ backgroundColor: '#a87fd4' }} />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rotate-12 rounded-3xl opacity-20"
        style={{ backgroundColor: '#c9a8e8' }} />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">

        {/* Logo + Titre */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: VIOLET }}>
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 2C8 2 5 5.5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.5-3-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" strokeWidth={1.8} />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight" style={{ color: VIOLET }}>
            SunuPark
          </span>
          <span className="rounded-full px-3 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: `${VIOLET}18`, color: VIOLET }}>
            Espace Client
          </span>
        </div>

        {/* Carte */}
        <div className="w-full max-w-md rounded-sm bg-white px-8 py-8 shadow-[0_4px_24px_rgba(45,27,61,0.12)]">

          <h1 className="mb-1 text-lg font-black" style={{ color: '#111827' }}>Connexion</h1>
          <p className="mb-6 text-sm" style={{ color: '#6b7280' }}>
            Accédez à vos locations, factures et documents.
          </p>

          {error && (
            <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-1.5 block text-sm font-bold" style={{ color: '#33475b' }}>
                Nom d&apos;utilisateur
              </label>
              <input
                type="text"
                autoComplete="username"
                placeholder="votre_identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={focusInput}
                onBlur={blurInput}
                required
                style={inputBase}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold" style={{ color: '#33475b' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  required
                  style={{ ...inputBase, paddingRight: 44 }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center transition"
                  style={{ color: showPassword ? ACCENT : '#516f90' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = showPassword ? ACCENT : '#516f90')}
                >
                  {showPassword ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full rounded-sm py-2.5 text-sm font-bold transition"
              style={{
                backgroundColor: isDisabled ? '#dfe3eb' : VIOLET,
                color:           isDisabled ? '#516f90' : '#fff',
                cursor:          isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Connexion…' : 'Accéder à mon espace'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: '#dfe3eb' }} />
            <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>ou</span>
            <div className="h-px flex-1" style={{ backgroundColor: '#dfe3eb' }} />
          </div>

          <p className="text-center text-xs leading-5" style={{ color: '#6b7280' }}>
            Pas encore de compte ?{' '}
            <Link href="/inscription"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: VIOLET }}>
              Créer un compte
            </Link>
          </p>
          <p className="mt-2 text-center text-xs" style={{ color: '#6b7280' }}>
            Vous êtes un employé ?{' '}
            <Link href="/login/employee"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: VIOLET }}>
              Connexion équipe
            </Link>
          </p>
        </div>

        <p className="mt-6 text-xs" style={{ color: '#6b7280' }}>
          © {new Date().getFullYear()} SunuPark — Tous droits réservés
        </p>
      </div>
    </div>
  );
}

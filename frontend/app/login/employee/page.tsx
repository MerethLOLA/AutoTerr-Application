'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';

export default function LoginEmployee() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const isDisabled = useMemo(
    () => loading || !username.trim() || !password.trim(),
    [loading, username, password],
  );

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const role = (session.user as any)?.role;
      router.replace(role === 'client' ? '/espace-client' : '/dashboard');
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn('employee', {
        username: username.trim(),
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Identifiants incorrects. Veuillez réessayer.');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px',
    border: '0.5px solid #e8ecf0', borderRadius: 6,
    fontSize: 13, color: '#111827', background: '#fff', outline: 'none',
  };
  const focusIn  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#185FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(24,95,165,0.10)'; };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#e8ecf0'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'var(--font-sans)' }}>

      {/* Nav mini */}
      <div style={{ width: '100%', maxWidth: 400, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', border: '0.5px solid #e8ecf0', borderRadius: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/LOgo2.png" alt="AutoTerr" style={{ height: 28, objectFit: 'contain' }} />
        <Link href="/" style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          ← Retour à l&apos;accueil
        </Link>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', border: '0.5px solid #e8ecf0', borderRadius: 8, padding: 28 }}>

        {/* Icône + titre */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <svg width={20} height={20} fill="none" stroke="#185FA5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 16, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>Connexion équipe</h1>
          <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Accédez à votre espace AutoTerr</p>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ marginBottom: 16, padding: '9px 12px', background: '#FCEBEB', border: '0.5px solid #f5c6c6', borderRadius: 6, fontSize: 12, color: '#A32D2D' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Identifiant */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 5 }}>
              Nom d&apos;utilisateur
            </label>
            <div style={{ position: 'relative' }}>
              <svg width={14} height={14} fill="none" stroke="#9ca3af" viewBox="0 0 24 24"
                style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                autoComplete="username"
                placeholder="votre_identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                style={{ ...inputStyle, paddingLeft: 30 }}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: 6 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 5 }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <svg width={14} height={14} fill="none" stroke="#9ca3af" viewBox="0 0 24 24"
                style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                style={{ ...inputStyle, paddingLeft: 30, paddingRight: 34 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 1 }}
              >
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={isDisabled}
            style={{
              width: '100%', padding: '9px', marginTop: 18, marginBottom: 16,
              background: isDisabled ? '#e8ecf0' : '#185FA5',
              color: isDisabled ? '#9ca3af' : '#E6F1FB',
              border: 'none', borderRadius: 6,
              fontSize: 13, fontWeight: 500, cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'background .15s',
            }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        {/* Séparateur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, height: '0.5px', background: '#e8ecf0' }} />
          <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>Espace client</span>
          <div style={{ flex: 1, height: '0.5px', background: '#e8ecf0' }} />
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
          Vous êtes un client ?{' '}
          <Link href="/login/client" style={{ color: '#185FA5', fontWeight: 500, textDecoration: 'none' }}>
            Connexion client
          </Link>
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 11, color: '#9ca3af' }}>
        © {new Date().getFullYear()} AutoTerr — Accès réservé au personnel autorisé
      </p>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import QRCode from 'qrcode';

export default function LoginClient() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [setupInfo, setSetupInfo] = useState<{ secretKey: string; qrDataUrl: string } | null>(null);

  const isDisabled = useMemo(
    () => loading || !email.trim() || !password.trim(),
    [loading, email, password],
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
      const result = await signIn('client', {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (result?.error?.startsWith('TWO_FACTOR_SETUP_REQUIRED:')) {
        const [, userId, secretKey, encodedOtpauth] = result.error.split(':');
        setTwoFactorUserId(userId);
        const qrDataUrl = await QRCode.toDataURL(decodeURIComponent(encodedOtpauth), { width: 200, margin: 1 });
        setSetupInfo({ secretKey, qrDataUrl });
        return;
      }
      if (result?.error?.startsWith('TWO_FACTOR_REQUIRED:')) {
        setTwoFactorUserId(result.error.split(':')[1]);
        return;
      }
      if (result?.error === 'TOO_MANY_ATTEMPTS') {
        setError('Trop de tentatives rapprochées. Le serveur peut être en train de démarrer (jusqu\'à 1 min après une période d\'inactivité) — patientez une minute puis réessayez une seule fois.');
        return;
      }
      if (result?.error) {
        setError('Email ou mot de passe incorrect. Veuillez réessayer.');
        return;
      }
      router.push('/espace-client');
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorUserId) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn('client', {
        twoFactorCode: code.trim(),
        twoFactorUserId,
        redirect: false,
      });
      if (result?.error) {
        setError('Code invalide ou expiré. Veuillez réessayer.');
        return;
      }
      router.push('/espace-client');
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #dfe3eb',
    borderRadius: 12,
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    transition: 'border-color .15s ease, box-shadow .15s ease',
  };
  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#185FA5';
    e.target.style.boxShadow = '0 0 0 3px rgba(24,95,165,0.10)';
  };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#dfe3eb';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="auth-shell" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="auth-nav">
        <Link href="/catalogue" className="auth-back-btn">
          <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="auth-back-label">Retour au catalogue</span>
        </Link>
        <div style={{ position: 'relative', width: 100, height: 37, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/LOgo2.png" alt="AutoTerr" style={{ position: 'absolute', width: 100, height: 'auto', top: '50%', transform: 'translateY(-57%)' }} />
        </div>
        <span aria-hidden="true" />
      </div>

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <svg width={20} height={20} fill="none" stroke="#185FA5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="auth-title">{setupInfo ? 'Configurer la double authentification' : twoFactorUserId ? 'Vérification' : 'Connexion'}</h1>
          <p className="auth-subtitle">
            {setupInfo
              ? 'Scannez ce QR code avec Google Authenticator, Authy ou une app équivalente'
              : twoFactorUserId ? 'Entrez le code affiché par votre application d\'authentification' : 'Accédez à votre espace AutoTerr'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {twoFactorUserId ? (
          <form onSubmit={handleVerifyCode}>
            {setupInfo && (
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={setupInfo.qrDataUrl} alt="QR code de configuration" width={180} height={180}
                  style={{ margin: '0 auto', borderRadius: 12, border: '1px solid #dfe3eb' }} />
                <p style={{ fontSize: 11, color: '#6b7280', marginTop: 10 }}>
                  Impossible de scanner ? Entrez cette clé manuellement :
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', letterSpacing: 1, wordBreak: 'break-all', marginTop: 2 }}>
                  {setupInfo.secretKey}
                </p>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
                Code de vérification
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                maxLength={6}
                required
                autoFocus
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: 4, fontSize: 18 }}
              />
            </div>
            <button type="submit" disabled={loading || code.trim().length < 6} className="auth-button" style={{ marginTop: 4, marginBottom: 12 }}>
              {loading ? 'Vérification…' : setupInfo ? 'Confirmer et se connecter' : 'Vérifier'}
            </button>
            <button
              type="button"
              onClick={() => { setTwoFactorUserId(null); setSetupInfo(null); setCode(''); setError(null); }}
              style={{ width: '100%', background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer', padding: '4px 0' }}
            >
              ← Retour à la connexion
            </button>
          </form>
        ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
              Adresse email
            </label>
            <div style={{ position: 'relative' }}>
              <svg width={14} height={14} fill="none" stroke="#9ca3af" viewBox="0 0 24 24"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 6 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                style={{ ...inputStyle, paddingRight: 34 }}
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

          <div style={{ textAlign: 'right', marginBottom: 16, marginTop: 6 }}>
            <Link href="/login/client/forgot-password" style={{ fontSize: 11, color: '#185FA5', textDecoration: 'none' }}>Mot de passe oublié ?</Link>
          </div>

          <button type="submit" disabled={isDisabled} className="auth-button" style={{ marginBottom: 16 }}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        )}

        {!twoFactorUserId && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1, height: '0.5px', background: '#e8ecf0' }} />
              <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>ou continuer avec</span>
              <div style={{ flex: 1, height: '0.5px', background: '#e8ecf0' }} />
            </div>

            <Link href="/inscription" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 12px', marginBottom: 12, background: 'transparent', border: '1px solid #dfe3eb', borderRadius: 12, fontSize: 13, color: '#374151', textDecoration: 'none', gap: 6, transition: 'background .15s' }}>
              <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Créer un compte
            </Link>

            <div style={{ textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
              Pas encore de compte ?{' '}
              <Link href="/inscription" style={{ color: '#185FA5', fontWeight: 500, textDecoration: 'none' }}>
                S&apos;inscrire
              </Link>
            </div>

            <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
              Vous êtes un employé ?{' '}
              <Link href="/login/employee" style={{ color: '#185FA5', fontWeight: 500, textDecoration: 'none' }}>
                Connexion équipe
              </Link>
            </div>
          </>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 11, color: '#9ca3af' }}>
        © {new Date().getFullYear()} AutoTerr — Tous droits réservés
      </p>
    </div>
  );
}

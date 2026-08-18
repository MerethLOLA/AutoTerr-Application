'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isDisabled = useMemo(
    () => loading || !password.trim() || !passwordConfirmation.trim() || !token || !email,
    [loading, password, passwordConfirmation, token, email],
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setDone(true);
      setTimeout(() => router.push('/login/employee'), 2500);
    } catch (err: any) {
      setError(err?.message || 'Ce lien de réinitialisation est invalide ou a expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="auth-nav">
        <Link href="/login/employee" className="auth-back-btn">
          <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="auth-back-label">Retour à la connexion</span>
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
          <h1 className="auth-title">Nouveau mot de passe</h1>
          <p className="auth-subtitle">
            {done ? 'Mot de passe mis à jour' : 'Choisissez un nouveau mot de passe'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {!token || !email ? (
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
            Ce lien de réinitialisation est incomplet ou invalide. Merci de refaire une demande depuis la page{' '}
            <Link href="/login/employee/forgot-password" style={{ color: '#185FA5' }}>mot de passe oublié</Link>.
          </p>
        ) : done ? (
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
            Votre mot de passe a été réinitialisé avec succès. Redirection vers la connexion…
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                autoFocus
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={isDisabled} className="auth-button" style={{ marginBottom: 12 }}>
              {loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 11, color: '#9ca3af' }}>
        © {new Date().getFullYear()} AutoTerr — Accès réservé au personnel autorisé
      </p>
    </div>
  );
}

export default function ResetPasswordEmployee() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

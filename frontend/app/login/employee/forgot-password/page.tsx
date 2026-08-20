'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordEmployee() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const isDisabled = useMemo(() => loading || !email.trim(), [loading, email]);

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
    setLoading(true);
    try {
      await apiClient.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'envoi. Veuillez réessayer.');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="auth-title">Mot de passe oublié</h1>
          <p className="auth-subtitle">
            {sent ? 'Vérifiez votre boîte mail' : 'Entrez votre adresse e-mail professionnelle'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {sent ? (
          <div>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 18 }}>
              Si un compte employé existe avec l&apos;adresse <strong>{email.trim()}</strong>, un e-mail contenant un lien de réinitialisation vient d&apos;être envoyé. Le lien expire dans 60 minutes.
            </p>
            <Link href="/login/employee" className="auth-button" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
                Adresse email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="vous@autoterr.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                autoFocus
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={isDisabled} className="auth-button" style={{ marginBottom: 12 }}>
              {loading ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 11, color: '#9ca3af' }}>
        © {new Date().getFullYear()} AutoTerr · Accès réservé au personnel autorisé
      </p>
    </div>
  );
}

'use client';

import { apiClient } from '@/lib/api';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function InscriptionPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', email: '', username: '',
    password: '', password_confirmation: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isDisabled = useMemo(
    () => loading || !form.name.trim() || !form.email.trim() || !form.username.trim() || !form.password || !form.password_confirmation,
    [loading, form],
  );

  const pwdStrength = useMemo(() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }, [form.password]);

  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][pwdStrength];
  const strengthColor = ['#e8ecf0', '#E24B4A', '#BA7517', '#3B6D11', '#3B6D11'][pwdStrength];

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

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((fe) => { const n = { ...fe }; delete n[field]; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (form.password !== form.password_confirmation) {
      setFieldErrors({ password_confirmation: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (form.password.length < 8) {
      setFieldErrors({ password: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    setLoading(true);
    try {
      await apiClient.register(form);
      await signIn('client', { email: form.email, password: form.password, redirect: false });
      router.push('/espace-client');
    } catch (err: any) {
      if (err?.details) {
        const fe: Record<string, string> = {};
        Object.entries(err.details as Record<string, string[]>).forEach(([k, v]) => {
          fe[k] = (v as string[])[0];
        });
        setFieldErrors(fe);
      } else {
        setError(err?.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }

  function FieldError({ field }: { field: string }) {
    if (!fieldErrors[field]) return null;
    return <p style={{ margin: '4px 0 0', fontSize: 11, color: '#A32D2D' }}>{fieldErrors[field]}</p>;
  }

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="auth-title">Créer un compte</h1>
          <p className="auth-subtitle">Rejoignez l&apos;espace client AutoTerr</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
              Nom complet *
            </label>
            <input
              type="text"
              autoComplete="name"
              placeholder="Prénom et nom"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              onFocus={focusIn}
              onBlur={focusOut}
              required
              style={{ ...inputStyle, borderColor: fieldErrors.name ? '#E24B4A' : '#dfe3eb' }}
            />
            <FieldError field="name" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
              Adresse e-mail *
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
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                style={{ ...inputStyle, paddingLeft: 34, borderColor: fieldErrors.email ? '#E24B4A' : '#dfe3eb' }}
              />
            </div>
            <FieldError field="email" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
              Nom d&apos;utilisateur *
            </label>
            <input
              type="text"
              autoComplete="username"
              placeholder="votre_identifiant"
              value={form.username}
              onChange={(e) => set('username', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              onFocus={focusIn}
              onBlur={focusOut}
              required
              style={{ ...inputStyle, borderColor: fieldErrors.username ? '#E24B4A' : '#dfe3eb' }}
            />
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>Lettres, chiffres et _ uniquement</p>
            <FieldError field="username" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
              Mot de passe *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Minimum 8 caractères"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                style={{ ...inputStyle, paddingRight: 34, borderColor: fieldErrors.password ? '#E24B4A' : '#dfe3eb' }}
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 1 }}>
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPwd
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                  }
                </svg>
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= pwdStrength ? strengthColor : '#e8ecf0', transition: 'background .2s' }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Force : {strengthLabel}</p>
              </div>
            )}
            <FieldError field="password" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>
              Confirmer le mot de passe *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Répétez le mot de passe"
                value={form.password_confirmation}
                onChange={(e) => set('password_confirmation', e.target.value)}
                onFocus={focusIn}
                onBlur={focusOut}
                required
                style={{ ...inputStyle, paddingRight: 34, borderColor: fieldErrors.password_confirmation ? '#E24B4A' : '#dfe3eb' }}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 1 }}>
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showConfirm
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                  }
                </svg>
              </button>
            </div>
            <FieldError field="password_confirmation" />
          </div>

          <button type="submit" disabled={isDisabled} className="auth-button" style={{ marginBottom: 16 }}>
            {loading ? 'Création du compte…' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, height: '0.5px', background: '#e8ecf0' }} />
          <span style={{ fontSize: 11, color: '#6b7280' }}>ou</span>
          <div style={{ flex: 1, height: '0.5px', background: '#e8ecf0' }} />
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
          Déjà un compte ?{' '}
          <Link href="/login/client" style={{ color: '#185FA5', fontWeight: 500, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 11, color: '#9ca3af' }}>
        © {new Date().getFullYear()} AutoTerr — Tous droits réservés
      </p>
    </div>
  );
}

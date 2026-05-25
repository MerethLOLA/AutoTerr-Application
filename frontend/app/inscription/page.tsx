'use client';

import { apiClient } from '@/lib/api';
import { writeStoredAuth } from '@/lib/auth-storage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const VIOLET = '#2d1b3d';
const ACCENT = '#5b2d8e';

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

export default function InscriptionPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', email: '', username: '',
    password: '', password_confirmation: '',
  });
  const [showPwd, setShowPwd]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});

  const isDisabled = useMemo(
    () => loading || !form.name.trim() || !form.email.trim() || !form.username.trim() || !form.password || !form.password_confirmation,
    [loading, form],
  );

  const inputBase: React.CSSProperties = {
    width: '100%', borderRadius: 6, border: '1px solid #dfe3eb',
    backgroundColor: '#f5f8fa', color: '#33475b',
    padding: '10px 12px', fontSize: 14, outline: 'none',
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
      const res = await apiClient.register(form) as any;
      if (res?.token && res?.user) {
        writeStoredAuth(res.token, res.user);
      }
      router.push('/espace-client');
    } catch (err: any) {
      if (err?.details) {
        const fe: Record<string, string> = {};
        Object.entries(err.details as Record<string, string[]>).forEach(([k, v]) => {
          fe[k] = v[0];
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
    return <p className="mt-1 text-xs text-red-600">{fieldErrors[field]}</p>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f0f7]">

      {/* Formes décoratives */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rotate-45 rounded-3xl opacity-30"
        style={{ backgroundColor: '#c9a8e8' }} />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rotate-12 rounded-3xl opacity-20"
        style={{ backgroundColor: '#c9a8e8' }} />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">

        {/* Logo */}
        <Link href="/" className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: VIOLET }}>
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 2C8 2 5 5.5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.5-3-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" strokeWidth={1.8} />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight" style={{ color: VIOLET }}>SunuPark</span>
        </Link>

        {/* Carte */}
        <div className="w-full max-w-md rounded-xl bg-white px-8 py-8 shadow-[0_4px_24px_rgba(45,27,61,0.12)]">

          <h1 className="mb-1 text-xl font-black text-[#111827]">Créer mon compte</h1>
          <p className="mb-6 text-sm text-[#6b7280]">
            Accédez à votre espace client en quelques secondes.
          </p>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nom complet */}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#33475b]">
                Nom complet *
              </label>
              <input type="text" autoComplete="name" placeholder="Prénom et nom"
                value={form.name} onChange={(e) => set('name', e.target.value)}
                onFocus={focusInput} onBlur={blurInput} required
                style={{ ...inputBase, borderColor: fieldErrors.name ? '#ef4444' : '#dfe3eb' }}
              />
              <FieldError field="name" />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#33475b]">
                Adresse e-mail *
              </label>
              <input type="email" autoComplete="email" placeholder="vous@exemple.com"
                value={form.email} onChange={(e) => set('email', e.target.value)}
                onFocus={focusInput} onBlur={blurInput} required
                style={{ ...inputBase, borderColor: fieldErrors.email ? '#ef4444' : '#dfe3eb' }}
              />
              <FieldError field="email" />
            </div>

            {/* Username */}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#33475b]">
                Nom d&apos;utilisateur *
              </label>
              <input type="text" autoComplete="username" placeholder="votre_identifiant"
                value={form.username} onChange={(e) => set('username', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                onFocus={focusInput} onBlur={blurInput} required
                style={{ ...inputBase, borderColor: fieldErrors.username ? '#ef4444' : '#dfe3eb' }}
              />
              <p className="mt-1 text-xs text-[#99acc2]">Lettres, chiffres et _ uniquement</p>
              <FieldError field="username" />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#33475b]">
                Mot de passe *
              </label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="Minimum 8 caractères"
                  value={form.password} onChange={(e) => set('password', e.target.value)}
                  onFocus={focusInput} onBlur={blurInput} required
                  style={{ ...inputBase, paddingRight: 44, borderColor: fieldErrors.password ? '#ef4444' : '#dfe3eb' }}
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center transition"
                  style={{ color: showPwd ? ACCENT : '#516f90' }}>
                  {showPwd ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
              <FieldError field="password" />
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#33475b]">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="Répétez le mot de passe"
                  value={form.password_confirmation} onChange={(e) => set('password_confirmation', e.target.value)}
                  onFocus={focusInput} onBlur={blurInput} required
                  style={{ ...inputBase, paddingRight: 44, borderColor: fieldErrors.password_confirmation ? '#ef4444' : '#dfe3eb' }}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center transition"
                  style={{ color: showConfirm ? ACCENT : '#516f90' }}>
                  {showConfirm ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
              <FieldError field="password_confirmation" />
            </div>

            <button type="submit" disabled={isDisabled}
              className="mt-2 w-full rounded-lg py-3 text-sm font-black transition"
              style={{
                backgroundColor: isDisabled ? '#dfe3eb' : VIOLET,
                color:           isDisabled ? '#516f90' : '#fff',
                cursor:          isDisabled ? 'not-allowed' : 'pointer',
              }}>
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#dfe3eb]" />
            <span className="text-xs font-semibold text-[#6b7280]">ou</span>
            <div className="h-px flex-1 bg-[#dfe3eb]" />
          </div>

          <p className="text-center text-xs text-[#6b7280]">
            Vous avez déjà un compte ?{' '}
            <Link href="/login/client" className="font-semibold hover:underline" style={{ color: VIOLET }}>
              Se connecter
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-[#6b7280]">
          <Link href="/catalogue" className="hover:underline">← Retour au catalogue</Link>
          <span className="mx-2">·</span>
          <span>© {new Date().getFullYear()} SunuPark</span>
        </div>
      </div>
    </div>
  );
}

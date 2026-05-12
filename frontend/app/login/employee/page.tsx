'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { readStoredAuth } from '@/lib/auth-storage';

function EyeIcon({ open }: { open: boolean }) {
    if (open) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.7a3 3 0 0 0 4.2 4.2" />
            <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18.6 18.6 0 0 1-3 3.9" />
            <path d="M6.6 6.7C4.1 8.3 2.6 11 2 12c0 0 3.5 7 10 7a10.7 10.7 0 0 0 5-1.2" />
        </svg>
    );
}

export default function LoginEmployee() {
    const router = useRouter();
    const { login, loading, isAuthenticated } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isDisabled = useMemo(() => loading || !username.trim() || !password.trim(), [loading, password, username]);

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
            const response = await login({ username: username.trim(), password });
            if (!remember) {
                sessionStorage.setItem('employee_session_only', '1');
            }

            router.push(response.user.role === 'client' ? '/espace-client' : '/dashboard');
        } catch (err: any) {
            setError(err?.message || 'Identifiants incorrects');
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,_#ffffff_0%,_#f1f5f9_50%,_#e2e8f0_100%)]" />
            <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-slate-200/20 blur-3xl" />
            <div className="absolute -right-24 bottom-20 h-96 w-96 rounded-full bg-slate-300/20 blur-3xl" />

            <div className="relative mx-auto flex max-w-6xl flex-col px-6 py-6">
                <div className="flex items-center gap-3">
                    <div>
                        <img src="/logo.png" alt="Logo" width="60" height="30" />
                    </div>
                    <p className="text-lg font-black text-[#002d54]">SunuPark</p>
                </div>
            </div>

            <div className="relative mx-auto flex min-h-[calc(100vh-100px)] max-w-6xl items-center px-6 py-10">
                <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="hidden lg:block">
                        <div className="max-w-xl">
                            <h1 className="max-w-lg text-5xl font-black tracking-tight text-slate-950">
                                Connectez-vous au back-office.
                            </h1>
                            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
                                Suivi commercial, locations, stock, SAV et reporting dans une interface.
                            </p>

                            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                {[
                                    { title: 'Acces securise', text: 'Authentification employee centralisee.' },
                                    { title: 'Vue unifiee', text: 'Modules metier alignes avec l API Laravel.' },
                                    { title: 'Pilotage rapide', text: 'Acces direct au dashboard et aux workflows.' },
                                    { title: 'Design epure', text: 'Palette minimaliste et professionnelle.' },
                                ].map((item) => (
                                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <p className="text-sm font-black text-slate-900">{item.title}</p>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto w-full max-w-xl">
                        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_8px_32px_rgba(0,45,84,0.08)] lg:p-10">
                            <div className="mb-8 text-center lg:text-left">
                                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#002d54]">SunuPark</p>
                                <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Bienvenue</h1>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Nom d&apos;utilisateur</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-[#002d54] focus:bg-white focus:ring-4 focus:ring-[#002d54]/10"
                                        placeholder="votre_username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pr-14 text-base text-slate-900 outline-none transition focus:border-[#002d54] focus:bg-white focus:ring-4 focus:ring-[#002d54]/10"
                                            placeholder="********"
                                        />
                                        <button
                                            type="button"
                                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="absolute inset-y-0 right-0 flex w-14 items-center justify-center text-slate-400 transition hover:text-[#002d54]"
                                        >
                                            <EyeIcon open={showPassword} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                                    <label className="inline-flex items-center gap-3 font-medium">
                                        <input
                                            type="checkbox"
                                            checked={remember}
                                            onChange={(e) => setRemember(e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 bg-white text-[#002d54] focus:ring-[#002d54]"
                                        />
                                        Se souvenir de moi
                                    </label>
                                    <span className="font-medium text-slate-400">Connexion securisee</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isDisabled}
                                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[#002d54] px-5 py-4 text-base font-black text-white shadow-lg shadow-[#002d54]/20 transition hover:bg-[#001a35] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                                >
                                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

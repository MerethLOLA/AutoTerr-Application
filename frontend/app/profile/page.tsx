'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { UserProfile } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';

type AccountSection = 'general' | 'compte' | 'confidentialite';

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

function sessionRows() {
  const now = new Date();

  return [
    {
      appareil: 'Chrome Windows',
      emplacement: 'Dakar, Dakar, SN',
      createdAt: formatDate(new Date(now.getTime() - 1000 * 60 * 45)),
      updatedAt: formatDate(new Date(now.getTime() - 1000 * 60 * 10)),
      current: true,
    },
    {
      appareil: 'Desktop App',
      emplacement: 'Dakar, Dakar, SN',
      createdAt: formatDate(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8)),
      updatedAt: formatDate(new Date(now.getTime() - 1000 * 60 * 60 * 3)),
      current: false,
    },
  ];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AccountSection>('compte');

  useEffect(() => {
    let mounted = true;
    apiClient.getMe()
      .then((response) => {
        if (mounted) setProfile(response.user);
      })
      .catch(() => {
        if (mounted) setError('Impossible de charger le compte');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const organizationId = useMemo(() => {
    if (!profile) return 'SP-0000-0000-0000';
    return `SP-${profile.id.toString().padStart(4, '0')}-${(profile.username || 'USER').slice(0, 4).toUpperCase()}-${(profile.role || 'ROLE').slice(0, 4).toUpperCase()}`;
  }, [profile]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="hero-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Compte
              </p>
              <h1 className="text-3xl font-black">Compte</h1>
            </div>
            <p className="text-sm text-slate-200">Gestion du compte, des sessions actives et des informations utilisateur.</p>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          <section className="surface-panel p-6 lg:p-8">
            {loading ? (
              <div className="space-y-4">
                <div className="h-8 w-40 animate-pulse rounded bg-slate-200"></div>
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
                <div className="h-64 animate-pulse rounded-2xl bg-slate-100"></div>
              </div>
            ) : activeSection === 'compte' ? (
              <div className="space-y-8">
                <div>
                  <p className="metric-label">Compte</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-900">Gestion du compte</h2>
                </div>

                <div className="space-y-0 overflow-hidden rounded-3xl border border-slate-200">
                  <div className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-6 py-5">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">Se deconnecter de tous les appareils</p>
                    </div>
                    <button className="btn-secondary" type="button">
                      Se deconnecter
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-6 py-5">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">Supprimer votre compte</p>
                    </div>
                    <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800" type="button">
                      Supprimer le compte
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-6 bg-white px-6 py-5">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">ID d organisation</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      {organizationId}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">Sessions actives</h3>
                  <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_40px] gap-4 border-b border-slate-200 px-6 py-4 text-sm font-bold text-slate-500">
                      <div>Appareil</div>
                      <div>Emplacement</div>
                      <div>Cree</div>
                      <div>Mis a jour</div>
                      <div></div>
                    </div>

                    {sessionRows().map((session) => (
                      <div key={`${session.appareil}-${session.createdAt}`} className="grid grid-cols-[1.3fr_1fr_1fr_1fr_40px] gap-4 border-b border-slate-100 px-6 py-5 text-sm last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="truncate font-semibold text-slate-900">{session.appareil}</span>
                          {session.current && (
                            <span className="rounded-xl bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">Actuel</span>
                          )}
                        </div>
                        <div className="text-slate-600">{session.emplacement}</div>
                        <div className="text-slate-600">{session.createdAt}</div>
                        <div className="text-slate-600">{session.updatedAt}</div>
                        <div className="text-right text-xl text-slate-400">⋮</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'Nom', value: profile?.name || '-' },
                    { label: 'Email', value: profile?.email || '-' },
                    { label: 'Role', value: profile?.role || '-' },
                    { label: 'Langue', value: profile?.locale || 'fr' },
                  ].map((item) => (
                    <div key={item.label} className="surface-muted p-4">
                      <p className="metric-label">{item.label}</p>
                      <p className="mt-2 text-lg font-black text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeSection === 'general' ? (
              <div className="space-y-4">
                <p className="metric-label">General</p>
                <h2 className="text-3xl font-black text-slate-900">General</h2>
                <div className="surface-muted p-6">
                  <p className="text-sm text-slate-600">Les reglages generaux sont centralises dans la page Parametres.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="metric-label">Confidentialite</p>
                <h2 className="text-3xl font-black text-slate-900">Confidentialite</h2>
                <div className="surface-muted p-6">
                  <p className="text-sm text-slate-600">Les options detaillees de confidentialite sont gerees dans Parametres.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

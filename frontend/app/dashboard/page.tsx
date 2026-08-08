'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { ReportingPayload } from '@/lib/types';
import { useNotificationBadges } from '@/lib/useNotificationBadges';
import { useRole } from '@/lib/useRole';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const BLUE  = '#185FA5';
const LIGHT = '#E6F1FB';
const BG    = '#f5f8fa';

function num(v?: number | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v || 0));
}
function money(v?: number | null) {
  return num(v) + ' XOF';
}
function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `Il y a ${diff}s`;
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div style={{ background: BG, borderRadius: 6, padding: '12px 14px' }} className="animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-7 w-7 rounded bg-slate-200" />
      </div>
      <div className="h-7 w-20 rounded bg-slate-200 mb-1" />
      <div className="h-3 w-16 rounded bg-slate-100" />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, delta, deltaPositive = true, icon, href }: {
  label: string; value: string | number; delta?: string;
  deltaPositive?: boolean; icon: React.ReactNode; href?: string;
}) {
  const inner = (
    <div style={{ background: BG, borderRadius: 6, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{label}</p>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: LIGHT, color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 22, fontWeight: 500, color: '#111827', marginBottom: 2, lineHeight: 1.1 }}>{value}</p>
      {delta && (
        <p style={{ fontSize: 11, color: deltaPositive ? '#3B6D11' : '#A32D2D' }}>{delta}</p>
      )}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : <>{inner}</>;
}

// ── Statut badge ──────────────────────────────────────────────────────────────

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    disponible:  { label: 'Active',     bg: '#EAF3DE', color: '#3B6D11' },
    reservee:    { label: 'En attente', bg: '#FAEEDA', color: '#854F0B' },
    vendue:      { label: 'Vendue',     bg: '#FCEBEB', color: '#A32D2D' },
    en_location: { label: 'En location', bg: '#E6F1FB', color: BLUE    },
    entretien:   { label: 'Entretien',  bg: '#F3F0FB', color: '#5B21B6' },
  };
  const s = map[statut] ?? { label: 'Expirée', bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ fontSize: 10, fontWeight: 600, background: s.bg, color: s.color, borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

// ── Barres horizontales ────────────────────────────────────────────────────────

function HorizBars({ data, color = BLUE }: { data: Array<{ label: string; pct: number }>; color?: string }) {
  const max = Math.max(...data.map((d) => d.pct), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: '#374151' }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{d.pct}%</span>
          </div>
          <div style={{ height: 6, background: '#e8ecf0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(d.pct / max) * 100}%`, background: color, borderRadius: 4, transition: 'width .4s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Activity icon ─────────────────────────────────────────────────────────────

function ActivityDot({ type }: { type: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    vente:    { bg: '#EAF3DE', color: '#3B6D11' },
    location: { bg: LIGHT,     color: BLUE       },
    demande:  { bg: '#FAEEDA', color: '#854F0B'  },
    user:     { bg: '#F3F0FB', color: '#5B21B6'  },
  };
  const c = colors[type] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: c.bg, flexShrink: 0 }} />
  );
}

// ── Avatar initiales ──────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: LIGHT, color: BLUE, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {initials || '?'}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

const REGIONS_STATIC = [
  { label: 'Dakar',       pct: 58 },
  { label: 'Thiès',       pct: 21 },
  { label: 'Saint-Louis', pct: 13 },
];

export default function DashboardPage() {
  const { role, canAccessRoute } = useRole();
  // Le reporting expose des données financières (salaires, commissions...) —
  // seuls les rôles ayant accès à la page /reporting doivent déclencher cet appel.
  const canSeeReporting = canAccessRoute('/reporting');
  const { counts: badgeCounts } = useNotificationBadges();

  const _init = apiClient.getCached<any>('/reporting');
  const [payload, setPayload] = useState<ReportingPayload | null>(_init?.data ?? _init);
  const [loading, setLoading] = useState(_init === null);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;
    if (!canSeeReporting) { setLoading(false); return; }
    let mounted = true;
    apiClient.get<any>('/reporting')
      .then((d) => { if (mounted) { setPayload((d as any)?.data ?? d); setLoading(false); } })
      .catch((e: any) => { if (mounted) { setError(e?.message || 'Erreur de chargement'); setLoading(false); } });
    return () => { mounted = false; };
  }, [role, canSeeReporting]);

  const ventesTotal  = payload?.salesMonthly?.reduce((s, m) => s + Number(m.count), 0) ?? 0;
  const currentMonth = new Date().getMonth();
  const prevMonth    = currentMonth > 0 ? currentMonth - 1 : 11;
  const ventesCurr   = payload?.salesMonthly?.[currentMonth]?.count ?? 0;
  const ventesPrev   = payload?.salesMonthly?.[prevMonth]?.count   ?? 0;
  const ventesDelta  = ventesPrev > 0 ? Math.round(((ventesCurr - ventesPrev) / ventesPrev) * 100) : 5;

  const dernieres = payload?.dernieresVoitures ?? [];
  const marques   = payload?.ventesParMarque   ?? [];
  const vendeurs  = payload?.topVendeurs       ?? [];
  const activites = payload?.activiteRecente   ?? [];
  const salaires  = payload?.salairesCommerciaux ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ── En-tête ─────────────────────────────────────────── */}
        <div className="page-header">
          <div>
            <h1 className="page-title mt-1">Vue d&apos;ensemble</h1>
            <p className="page-subtitle">Indicateurs clés et activité récente.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/voitures/new" className="btn-primary gap-2">
              <IconCar className="h-4 w-4" />
              Ajouter un véhicule
            </Link>
            {canSeeReporting && (
              <Link href="/reporting" className="btn-secondary gap-2">
                <IconChart className="h-4 w-4" />
                Rapport complet
              </Link>
            )}
          </div>
        </div>

        {/* ── Vue restreinte (rôles sans accès au reporting) ─────── */}
        {!canSeeReporting && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Tickets SAV ouverts',        value: badgeCounts.tickets_ouverts,  icon: <IconClock className="h-4 w-4" />, href: '/sav' },
              { label: 'Ordres de travail ouverts',  value: badgeCounts.ordres_ouverts,   icon: <IconChart className="h-4 w-4" />, href: '/atelier' },
              { label: 'Réservations',                value: badgeCounts.reservations,     icon: <IconUsers className="h-4 w-4" />, href: '/locations' },
            ]
              .filter((k) => canAccessRoute(k.href))
              .map((k) => (
                <KpiCard key={k.href} label={k.label} value={num(k.value)} icon={k.icon} href={k.href} />
              ))}
          </div>
        )}

        {/* ── Skeletons ────────────────────────────────────────── */}
        {canSeeReporting && loading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <KpiSkeleton key={i} />)}
          </div>
        )}
        {canSeeReporting && error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {canSeeReporting && !loading && !error && (
          <>
            {/* ── 4 KPIs ──────────────────────────────────────── */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Annonces actives"
                value={num(payload?.voituresDisponibles)}
                delta="+12% ce mois"
                icon={<IconCar className="h-4 w-4" />}
                href="/voitures"
              />
              <KpiCard
                label="Utilisateurs inscrits"
                value={num(payload?.utilisateursInscrits)}
                delta="+8% ce mois"
                icon={<IconUsers className="h-4 w-4" />}
                href="/clients"
              />
              <KpiCard
                label="Ventes réalisées"
                value={num(ventesTotal)}
                delta={`${ventesDelta >= 0 ? '+' : ''}${ventesDelta}% ce mois`}
                icon={<IconChart className="h-4 w-4" />}
                href="/ventes/historique"
              />
              <KpiCard
                label="En attente validation"
                value={num(payload?.enAttenteValidation)}
                delta={`+${payload?.locationStats?.reservations ?? 0} aujourd'hui`}
                deltaPositive={false}
                icon={<IconClock className="h-4 w-4" />}
                href="/demandes"
              />
            </div>

            {/* ── Dernières annonces + Ventes par marque/région ── */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 280px' }}>

              {/* Tableau annonces */}
              <div className="card">
                <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 className="section-title">Dernières annonces</h2>
                  <Link href="/voitures" style={{ fontSize: 12, color: BLUE }}>Voir tout →</Link>
                </div>
                <div className="overflow-x-auto">
                  {dernieres.length === 0 ? (
                    <p style={{ padding: '20px 16px', fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>Aucun véhicule enregistré</p>
                  ) : (
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '0.5px solid #e8ecf0' }}>
                          {['Véhicule', 'Vendeur', 'Prix', 'Statut', 'Actions'].map((h) => (
                            <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dernieres.map((v) => (
                          <tr key={v.id} style={{ borderBottom: '0.5px solid #f9fafb' }} className="hover:bg-[#fafafa]">
                            <td style={{ padding: '9px 12px' }}>
                              <p style={{ fontWeight: 500, color: '#111827', fontSize: 12 }}>{v.marque} {v.modele} {v.annee ?? ''}</p>
                              {v.energie && <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{v.energie}</p>}
                            </td>
                            <td style={{ padding: '9px 12px', color: '#374151', fontSize: 12 }}>{v.vendeur || '—'}</td>
                            <td style={{ padding: '9px 12px', color: BLUE, fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>
                              {num(v.prix_vente ?? v.prix ?? 0)}
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              <StatusBadge statut={v.statut} />
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              <Link href={`/voitures/${v.id}`} style={{ fontSize: 11, color: BLUE }}>Voir →</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Ventes par marque + région */}
              <div className="card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h2 className="section-title" style={{ marginBottom: 12 }}>Ventes par marque</h2>
                  {marques.length === 0 ? (
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>Aucune vente</p>
                  ) : (
                    <HorizBars data={marques.map((m) => ({ label: m.marque, pct: m.pct }))} color={BLUE} />
                  )}
                </div>
                <div style={{ borderTop: '0.5px solid #e8ecf0', paddingTop: 16 }}>
                  <h2 className="section-title" style={{ marginBottom: 12 }}>Ventes par région</h2>
                  <HorizBars data={REGIONS_STATIC} color="#3B6D11" />
                </div>
              </div>
            </div>

            {/* ── Top vendeurs + Activité récente ──────────────── */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

              {/* Top vendeurs */}
              <div className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 className="section-title">Top vendeurs</h2>
                  <Link href="/employes" style={{ fontSize: 12, color: BLUE }}>Voir tout →</Link>
                </div>
                {vendeurs.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingTop: 10 }}>Aucune donnée</p>
                ) : (
                  <div className="space-y-3">
                    {vendeurs.map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={`${v.prenom} ${v.nom}`} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.prenom} {v.nom}
                          </p>
                          <p style={{ fontSize: 11, color: '#9ca3af' }}>
                            {v.poste || 'Commercial'}{' · '}{money(Number(v.total))}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>{v.count} vente{v.count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activité récente */}
              <div className="card" style={{ padding: '12px 16px' }}>
                <h2 className="section-title" style={{ marginBottom: 14 }}>Activité récente</h2>
                {activites.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingTop: 10 }}>Aucune activité récente</p>
                ) : (
                  <div className="space-y-3">
                    {activites.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <ActivityDot type={a.type} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.label}
                          </p>
                          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                            {timeAgo(a.at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Salaires commerciaux (fixe + commission) ─────── */}
            {salaires.length > 0 && (
              <div className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 className="section-title">Salaires commerciaux · {payload?.salairesPeriode ?? new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
                  <Link href="/employes" style={{ fontSize: 12, color: BLUE }}>Voir tout →</Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#9ca3af', fontWeight: 500 }}>
                        <th style={{ padding: '6px 8px' }}>Employé</th>
                        <th style={{ padding: '6px 8px' }}>Salaire fixe</th>
                        <th style={{ padding: '6px 8px' }}>Ventes + locations</th>
                        <th style={{ padding: '6px 8px' }}>Taux</th>
                        <th style={{ padding: '6px 8px' }}>Commission</th>
                        <th style={{ padding: '6px 8px' }}>Total à verser</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaires.map((s) => (
                        <tr key={s.id} style={{ borderTop: '1px solid #f0f2f5' }}>
                          <td style={{ padding: '8px', fontWeight: 500, color: '#111827' }}>{s.nom}</td>
                          <td style={{ padding: '8px', color: '#374151' }}>{money(s.salaire_fixe)}</td>
                          <td style={{ padding: '8px', color: '#374151' }}>{money(s.total_ventes_mois + s.total_locations_mois)}</td>
                          <td style={{ padding: '8px', color: '#374151' }}>{s.taux_commission}%</td>
                          <td style={{ padding: '8px', color: BLUE, fontWeight: 500 }}>{money(s.commission_mois)}</td>
                          <td style={{ padding: '8px', fontWeight: 600, color: '#111827' }}>{money(s.salaire_total_mois)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Icônes ────────────────────────────────────────────────────────────────────

function IconCar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5M5 11H3a1 1 0 00-1 1v1a1 1 0 001 1h2m14-2h2a1 1 0 011 1v1a1 1 0 01-1 1h-2" />
    </svg>
  );
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

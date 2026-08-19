'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { ReportingPayload } from '@/lib/types';
import { useNotificationBadges } from '@/lib/useNotificationBadges';
import { useRole } from '@/lib/useRole';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '');
function imgUrl(p?: string | null) {
  return p ? `${STORAGE_URL}/storage/${p}` : null;
}

function num(v?: number | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v || 0));
}

function money(v?: number | null) {
  return `${num(v)} FCFA`;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `Il y a ${diff}s`;
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border p-5" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="h-3 w-24 rounded" style={{ background: 'var(--color-border-tertiary)' }} />
        <div className="h-9 w-9 rounded-lg" style={{ background: 'var(--color-background-secondary)' }} />
      </div>
      <div className="mb-2 h-7 w-20 rounded" style={{ background: 'var(--color-border-tertiary)' }} />
      <div className="h-3 w-16 rounded" style={{ background: 'var(--color-background-secondary)' }} />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  delta,
  deltaPositive = true,
  icon,
  iconBg,
  iconColor,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <div
      className="group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}
    >
      {accent && <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'var(--color-secondary)' }} />}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{value}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
            style={
              deltaPositive
                ? { background: 'var(--color-success-bg)', color: 'var(--color-success-text)' }
                : { background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' }
            }
          >
            {delta}
          </span>
        </div>
      )}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : <>{inner}</>;
}

// ── Statut badge (véhicule) ─────────────────────────────────────────────────

const STATUT_MAP: Record<string, { label: string; cls: string }> = {
  disponible:  { label: 'Disponible',   cls: 'badge-active' },
  reservee:    { label: 'Réservée',     cls: 'badge-pending' },
  vendue:      { label: 'Vendue',       cls: 'badge-info' },
  en_location: { label: 'En location',  cls: 'badge-pending' },
  entretien:   { label: 'En entretien', cls: 'badge-neutral' },
};

function StatusBadge({ statut }: { statut: string }) {
  const s = STATUT_MAP[statut] ?? { label: statut, cls: 'badge-neutral' };
  return <span className={`status-badge ${s.cls} font-bold uppercase tracking-wide`}>{s.label}</span>;
}

// ── Barres horizontales ────────────────────────────────────────────────────────

function HorizBars({ data }: { data: Array<{ label: string; pct: number }> }) {
  const max = Math.max(...data.map((d) => d.pct), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-xs font-medium">
            <span style={{ color: 'var(--color-text-secondary)' }}>{d.label}</span>
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{d.pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-background-secondary)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.pct / max) * 100}%`, background: 'var(--color-accent)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Graphique ventes mensuelles ─────────────────────────────────────────────

const SALES_CHART_BAR_MAX = 128; // px — hauteur max d'une barre

function SalesBarChart({ data }: { data: Array<{ label: string; count: number; amount: number }> }) {
  const max = Math.max(...data.map((d) => Number(d.amount)), 1);
  const currentIdx = data.length - 1;
  return (
    <div className="flex items-end gap-1.5 sm:gap-2.5" style={{ height: SALES_CHART_BAR_MAX + 28 }}>
      {data.map((d, i) => {
        const barHeight = Math.max((Number(d.amount) / max) * SALES_CHART_BAR_MAX, 3);
        const isCurrent = i === currentIdx;
        return (
          <div key={`${d.label}-${i}`} className="group relative flex flex-1 flex-col items-center justify-end gap-2">
            <div
              className="pointer-events-none absolute bottom-full z-10 mb-2 hidden w-36 rounded-lg border p-2 text-center shadow-lg group-hover:block"
              style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}
            >
              <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{d.label}</p>
              <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{d.count} vente{d.count !== 1 ? 's' : ''}</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{money(d.amount)}</p>
            </div>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{ height: barHeight, background: isCurrent ? 'var(--color-secondary)' : 'var(--color-accent)', opacity: isCurrent ? 1 : 0.7 }}
            />
            <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Répartition des locations (donut CSS) ───────────────────────────────────

function StatusDonut({ segments, centerLabel }: { segments: Array<{ label: string; value: number; color: string }>; centerLabel: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  const stops = segments
    .map((s) => {
      const start = total > 0 ? (acc / total) * 100 : 0;
      acc += s.value;
      const end = total > 0 ? (acc / total) * 100 : 0;
      return `${s.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{ background: total > 0 ? `conic-gradient(${stops})` : 'var(--color-border-tertiary)' }}
      >
        <div className="absolute inset-[18%] flex items-center justify-center rounded-full" style={{ background: 'var(--color-background-primary)' }}>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{total}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{centerLabel}</p>
          </div>
        </div>
      </div>
      <div className="w-full space-y-2.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>{s.label}</span>
            </span>
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {s.value}{total > 0 ? ` · ${Math.round((s.value / total) * 100)}%` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Activity icon ─────────────────────────────────────────────────────────────

function ActivityDot({ type }: { type: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    vente:    { bg: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
    location: { bg: 'var(--color-accent-light)', color: 'var(--color-accent)' },
    demande:  { bg: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' },
    user:     { bg: 'var(--color-secondary-light)', color: 'var(--color-secondary)' },
  };
  const c = colors[type] ?? { bg: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)' };
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: c.bg, color: c.color }}>
      <span className="h-2 w-2 rounded-full bg-current" />
    </div>
  );
}

// ── Avatar initiales ──────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
    >
      {initials || '?'}
    </div>
  );
}

// ── Vignette véhicule ──────────────────────────────────────────────────────

function VehicleThumb({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--color-background-secondary)' }}>
        <IconCar className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
      </div>
    );
  }
  return (
    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--color-border-tertiary)' }}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="64px" />
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role, canAccessRoute } = useRole();
  const canSeeReporting = canAccessRoute('/reporting');
  const { counts: badgeCounts } = useNotificationBadges();

  const _init = apiClient.getCached<any>('/reporting');
  const [payload, setPayload] = useState<ReportingPayload | null>(_init?.data ?? _init);
  const [loading, setLoading] = useState(_init === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;
    if (!canSeeReporting) { setLoading(false); return; }
    let mounted = true;
    apiClient.get<any>('/reporting')
      .then((d) => { if (mounted) { setPayload((d as any)?.data ?? d); setLoading(false); } })
      .catch((e: any) => { if (mounted) { setError(e?.message || 'Erreur de chargement'); setLoading(false); } });
    return () => { mounted = false; };
  }, [role, canSeeReporting]);

  const ventesTotal = payload?.salesMonthly?.reduce((s, m) => s + Number(m.count), 0) ?? 0;
  const currentMonth = new Date().getMonth();
  const prevMonth = currentMonth > 0 ? currentMonth - 1 : 11;
  const ventesCurr = payload?.salesMonthly?.[currentMonth]?.count ?? 0;
  const ventesPrev = payload?.salesMonthly?.[prevMonth]?.count ?? 0;
  const ventesDelta = ventesPrev > 0 ? Math.round(((ventesCurr - ventesPrev) / ventesPrev) * 100) : null;

  const dernieres = payload?.dernieresVoitures ?? [];
  const marques = payload?.ventesParMarque ?? [];
  const vendeurs = payload?.topVendeurs ?? [];
  const activites = payload?.activiteRecente ?? [];
  const salaires = payload?.salairesCommerciaux ?? [];
  const salesMonthly = payload?.salesMonthly?.filter((m) => m.count > 0 || m.amount > 0) ?? [];
  const locStats = payload?.locationStats;
  const locSegments = locStats
    ? [
        { label: 'En cours',   value: locStats.en_cours ?? 0,     color: 'var(--color-success-text)' },
        { label: 'Réservées',  value: locStats.reservations ?? 0, color: 'var(--color-warning-text)' },
        { label: 'En retard',  value: locStats.retards ?? 0,      color: 'var(--color-danger-text)' },
      ]
    : [];
  const hasLocSegments = locSegments.some((s) => s.value > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── En-tête ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Vue d'ensemble</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Indicateurs clés et activité récente du parc automobile.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/voitures/new"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-95"
              style={{ background: 'var(--color-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-secondary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-secondary)'; }}
            >
              <IconCar className="h-4 w-4" />
              Ajouter un véhicule
            </Link>
            {canSeeReporting && (
              <Link
                href="/reporting"
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold shadow-sm transition-all active:scale-95"
                style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)' }}
              >
                <IconChart className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                Rapport complet
              </Link>
            )}
          </div>
        </div>

        {/* ── Vue restreinte (rôles sans accès au reporting) ─────── */}
        {!canSeeReporting && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Tickets SAV ouverts', value: badgeCounts.tickets_ouverts, icon: <IconClock className="h-5 w-5" />, href: '/sav' },
              { label: 'Ordres de travail ouverts', value: badgeCounts.ordres_ouverts, icon: <IconChart className="h-5 w-5" />, href: '/atelier' },
              { label: 'Réservations', value: badgeCounts.reservations, icon: <IconUsers className="h-5 w-5" />, href: '/locations' },
            ]
              .filter((k) => canAccessRoute(k.href))
              .map((k) => (
                <KpiCard key={k.href} label={k.label} value={num(k.value)} icon={k.icon}
                  iconBg="var(--color-accent-light)" iconColor="var(--color-accent)" href={k.href} />
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
          <div className="rounded-lg border p-4 text-sm font-medium" style={{ borderColor: 'var(--color-danger-bg)', background: 'var(--color-danger-bg)', color: 'var(--color-danger-text)' }}>{error}</div>
        )}

        {canSeeReporting && !loading && !error && (
          <>
            {/* ── 4 KPIs ──────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Véhicules disponibles"
                value={num(payload?.voituresDisponibles)}
                icon={<IconCar className="h-5 w-5" />}
                iconBg="var(--color-accent-light)" iconColor="var(--color-accent)"
                href="/voitures"
              />
              <KpiCard
                label="Utilisateurs inscrits"
                value={num(payload?.utilisateursInscrits)}
                icon={<IconUsers className="h-5 w-5" />}
                iconBg="var(--color-success-bg)" iconColor="var(--color-success-text)"
                href="/clients"
              />
              <KpiCard
                label="Ventes réalisées"
                value={num(ventesTotal)}
                delta={ventesDelta === null ? undefined : `${ventesDelta >= 0 ? '+' : ''}${ventesDelta}% ce mois`}
                deltaPositive={ventesDelta === null ? true : ventesDelta >= 0}
                icon={<IconChart className="h-5 w-5" />}
                iconBg="var(--color-secondary-light)" iconColor="var(--color-secondary)"
                href="/ventes/historique"
                accent
              />
              <KpiCard
                label="En attente validation"
                value={num(payload?.enAttenteValidation)}
                delta={`${payload?.locationStats?.reservations ?? 0} réservation${(payload?.locationStats?.reservations ?? 0) > 1 ? 's' : ''} en attente`}
                deltaPositive={false}
                icon={<IconClock className="h-5 w-5" />}
                iconBg="var(--color-warning-bg)" iconColor="var(--color-warning-text)"
                href="/demandes"
              />
            </div>

            {/* ── Ventes mensuelles + Répartition locations ────── */}
            {(salesMonthly.length > 0 || hasLocSegments) && (
              <div className="grid gap-6 lg:grid-cols-3">
                {salesMonthly.length > 0 && (
                  <div className="rounded-xl border p-6 shadow-sm lg:col-span-2" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Ventes mensuelles</h2>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{payload?.year}</span>
                    </div>
                    <SalesBarChart data={salesMonthly} />
                  </div>
                )}
                {hasLocSegments && (
                  <div className="rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}>
                    <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>État des locations</h2>
                    <StatusDonut segments={locSegments} centerLabel="locations" />
                  </div>
                )}
              </div>
            )}

            {/* ── Dernières annonces + Ventes par marque ───────── */}
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Tableau annonces (2 Cols) */}
              <div className="overflow-hidden rounded-xl border shadow-sm lg:col-span-2" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}>
                <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--color-border-tertiary)' }}>
                  <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Dernières annonces</h2>
                  <Link href="/voitures" className="text-xs font-semibold transition-colors" style={{ color: 'var(--color-accent)' }}>
                    Voir tout →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  {dernieres.length === 0 ? (
                    <p className="py-8 text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>Aucun véhicule enregistré</p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b uppercase" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)' }}>
                          <th className="px-6 py-3 font-semibold">Photo</th>
                          <th className="px-6 py-3 font-semibold">Véhicule</th>
                          <th className="px-6 py-3 font-semibold">Vendeur</th>
                          <th className="px-6 py-3 font-semibold">Prix</th>
                          <th className="px-6 py-3 font-semibold">Statut</th>
                          <th className="px-6 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'var(--color-border-tertiary)' }}>
                        {dernieres.map((v, vi) => (
                          <tr key={v.id} className="transition-colors" style={{ borderColor: 'var(--color-border-tertiary)' }}>
                            <td className="px-6 py-3">
                              <VehicleThumb src={imgUrl(v.image_principale)} alt={`${v.marque} ${v.modele}`} />
                            </td>
                            <td className="px-6 py-3.5">
                              <p className="flex items-center gap-2 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                {v.marque} {v.modele} <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}>{v.annee ?? ''}</span>
                                {vi === 0 && (
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                                    style={{ background: 'var(--color-secondary)' }}
                                  >
                                    Nouveau
                                  </span>
                                )}
                              </p>
                              {v.energie && <p className="mt-0.5 text-[11px] capitalize" style={{ color: 'var(--color-text-secondary)' }}>{v.energie}</p>}
                            </td>
                            <td className="px-6 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{v.vendeur || '—'}</td>
                            <td className="px-6 py-3.5 whitespace-nowrap font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                              {money(v.prix_vente ?? v.prix ?? 0)}
                            </td>
                            <td className="px-6 py-3.5">
                              <StatusBadge statut={v.statut} />
                            </td>
                            <td className="px-6 py-3.5">
                              <Link href={`/voitures/${v.id}`} className="font-medium hover:underline" style={{ color: 'var(--color-accent)' }}>
                                Voir →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Ventes par marque (1 Col) */}
              <div className="rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}>
                <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Ventes par marque</h2>
                {marques.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Aucune vente enregistrée</p>
                ) : (
                  <HorizBars data={marques.map((m) => ({ label: m.marque, pct: m.pct }))} />
                )}
              </div>
            </div>

            {/* ── Top vendeurs + Activité récente ──────────────── */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* Top vendeurs */}
              <div className="rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Top vendeurs</h2>
                  <Link href="/employes" className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                    Voir tout →
                  </Link>
                </div>
                {vendeurs.length === 0 ? (
                  <p className="py-4 text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>Aucune donnée</p>
                ) : (
                  <div className="space-y-4">
                    {vendeurs.map((v, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Avatar name={`${v.prenom} ${v.nom}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{v.prenom} {v.nom}</p>
                          <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                            {v.poste || 'Commercial'} · <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{money(Number(v.total))}</span>
                          </p>
                        </div>
                        <span className="rounded-md px-2 py-1 text-xs font-bold" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                          {v.count} vente{v.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activité récente */}
              <div className="rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}>
                <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Activité récente</h2>
                {activites.length === 0 ? (
                  <p className="py-4 text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>Aucune activité récente</p>
                ) : (
                  <div className="space-y-4">
                    {activites.map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <ActivityDot type={a.type} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{a.label}</p>
                          <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{timeAgo(a.at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Salaires commerciaux (fixe + commission) ─────── */}
            {salaires.length > 0 && (
              <div className="overflow-hidden rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-primary)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Salaires commerciaux · <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}>{payload?.salairesPeriode ?? new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </h2>
                  <Link href="/employes" className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                    Voir tout →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b uppercase" style={{ borderColor: 'var(--color-border-tertiary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)' }}>
                        <th className="px-4 py-2.5 font-semibold">Employé</th>
                        <th className="px-4 py-2.5 font-semibold">Fixe</th>
                        <th className="px-4 py-2.5 font-semibold">Ventes & Loc.</th>
                        <th className="px-4 py-2.5 font-semibold">Taux</th>
                        <th className="px-4 py-2.5 font-semibold">Commission</th>
                        <th className="px-4 py-2.5 font-semibold">Total à verser</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--color-border-tertiary)' }}>
                      {salaires.map((s) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{s.nom}</td>
                          <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{money(s.salaire_fixe)}</td>
                          <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{money(s.total_ventes_mois + s.total_locations_mois)}</td>
                          <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{s.taux_commission}%</td>
                          <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-accent)' }}>{money(s.commission_mois)}</td>
                          <td className="px-4 py-3 font-bold" style={{ color: 'var(--color-text-primary)' }}>{money(s.salaire_total_mois)}</td>
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

function IconCar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
function IconChart({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

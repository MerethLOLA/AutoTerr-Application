'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { ReportingPayload } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function money(v?: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v || 0));
}

function KpiSkeleton() {
  return (
    <div className="metric-card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-9 w-9 rounded-xl bg-slate-200" />
      </div>
      <div className="mt-3 h-9 w-32 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon: React.ReactNode;
}

function KpiCard({ label, value, sub, href, variant = 'default', icon }: KpiCardProps) {
  const s = {
    default: { card: 'bg-white border-slate-200', value: 'text-[#111827]', icon: 'bg-[#002d54]/[0.07] text-[#111827]' },
    success: { card: 'bg-emerald-50 border-emerald-200', value: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600' },
    warning: { card: 'bg-amber-50 border-amber-200', value: 'text-amber-700', icon: 'bg-amber-100 text-amber-600' },
    danger: { card: 'bg-red-50 border-red-200', value: 'text-red-700', icon: 'bg-red-100 text-red-500' },
  }[variant];

  const inner = (
    <div className={`rounded-2xl border p-5 shadow-sm transition ${s.card} ${href ? 'hover:shadow-md hover:-translate-y-0.5' : ''}`}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.icon}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-[2rem] font-black leading-none ${s.value}`}>{value}</p>
      {sub && <p className="mt-2 text-xs text-slate-500">{sub}</p>}
    </div>
  );

  return href ? <Link href={href} className="block">{inner}</Link> : <>{inner}</>;
}

function MonthlyBars({ data }: { data: NonNullable<ReportingPayload['salesMonthly']> }) {
  const maxAmt = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex h-36 items-end gap-1.5">
      {data.map((d) => {
        const heightPct = d.amount > 0 ? Math.max((d.amount / maxAmt) * 100, 6) : 0;
        return (
          <div key={d.label} className="group relative flex flex-1 flex-col items-center gap-1.5">
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden w-max rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg group-hover:block z-10">
              <p className="font-black text-[#111827]">{d.count} vente{d.count !== 1 ? 's' : ''}</p>
              <p className="text-slate-500">{money(d.amount)} XOF</p>
            </div>
            <div
              className="w-full rounded-t-lg bg-[#002d54] transition-all duration-300 group-hover:bg-[#33475b]"
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-[9px] font-bold text-slate-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const _initDash = apiClient.getCached<ReportingPayload>('/reporting');
  const [payload, setPayload] = useState<ReportingPayload | null>(_initDash);
  const [loading, setLoading] = useState(_initDash === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiClient.get<ReportingPayload>('/reporting')
      .then((data) => { if (mounted) { setPayload(data); setLoading(false); } })
      .catch((err: any) => { if (mounted) { setError(err?.message || 'Impossible de charger le dashboard'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  const monthly = payload?.salesMonthly ?? [];
  const caAnnee = monthly.reduce((s, m) => s + Number(m.amount), 0);
  const ventesAnnee = monthly.reduce((s, m) => s + Number(m.count), 0);
  const currentMonthIdx = new Date().getMonth();
  const ventesMois = monthly[currentMonthIdx]?.count ?? 0;
  const caMois = monthly[currentMonthIdx]?.amount ?? 0;

  const fin = payload?.financeStats;
  const stk = payload?.stockStats;
  const sav = payload?.savStats;
  const loc = payload?.locationStats;
  const conf = payload?.conformiteStats;

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ── En-tête de page ─────────────────────────────── */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Dashboard — {payload?.year ?? new Date().getFullYear()}</p>
            <h1 className="page-title mt-1">Vue d&apos;ensemble</h1>
            <p className="page-subtitle">Indicateurs clés, alertes métier et suivi des opérations en temps réel.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/voitures/new" className="btn-primary gap-2">
              <IconCar className="h-4 w-4" />
              Ajouter un véhicule
            </Link>
            <Link href="/ventes" className="btn-secondary gap-2">
              <IconCart className="h-4 w-4" />
              Nouvelle vente
            </Link>
          </div>
        </div>

        {/* ── Skeletons ────────────────────────────────────── */}
        {loading && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <KpiSkeleton key={i} />)}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[5, 6, 7, 8].map((i) => <KpiSkeleton key={i} />)}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── KPIs — Parc & CA ─────────────────────────── */}
            <section>
              <p className="eyebrow mb-3">Parc automobile &amp; chiffre d&apos;affaires</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Véhicules disponibles"
                  value={payload?.voituresDisponibles ?? '—'}
                  sub="En stock, prêts à la vente"
                  href="/voitures"
                  variant="success"
                  icon={<IconCar className="h-5 w-5" />}
                />
                <KpiCard
                  label="CA de l'année"
                  value={`${money(caAnnee)} XOF`}
                  sub={`${ventesAnnee} vente${ventesAnnee !== 1 ? 's' : ''} finalisée${ventesAnnee !== 1 ? 's' : ''}`}
                  href="/ventes"
                  icon={<IconTrending className="h-5 w-5" />}
                />
                <KpiCard
                  label="Ventes ce mois"
                  value={ventesMois}
                  sub={`CA mensuel : ${money(caMois)} XOF`}
                  href="/ventes"
                  icon={<IconChart className="h-5 w-5" />}
                />
                <KpiCard
                  label="Encaissements du mois"
                  value={`${money(fin?.encaissements_mois)} XOF`}
                  sub="Paiements reçus ce mois"
                  href="/paiements"
                  icon={<IconMoney className="h-5 w-5" />}
                />
              </div>
            </section>

            {/* ── KPIs — Alertes ───────────────────────────── */}
            <section>
              <p className="eyebrow mb-3">Alertes &amp; opérationnel</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Factures impayées"
                  value={fin?.factures_impayees ?? 0}
                  sub={`Reste global : ${money(fin?.reste_global)} XOF`}
                  href="/facturations"
                  variant={(fin?.factures_impayees ?? 0) > 0 ? 'warning' : 'default'}
                  icon={<IconInvoice className="h-5 w-5" />}
                />
                <KpiCard
                  label="Véhicules en SAV"
                  value={sav?.tickets_ouverts ?? 0}
                  sub={`${sav?.ordres_ouverts ?? 0} ordre${(sav?.ordres_ouverts ?? 0) !== 1 ? 's' : ''} atelier ouvert${(sav?.ordres_ouverts ?? 0) !== 1 ? 's' : ''}`}
                  href="/sav"
                  variant={(sav?.tickets_ouverts ?? 0) > 0 ? 'warning' : 'default'}
                  icon={<IconWrench className="h-5 w-5" />}
                />
                <KpiCard
                  label="Locations en cours"
                  value={loc?.en_cours ?? 0}
                  sub={`${loc?.reservations ?? 0} réservation${(loc?.reservations ?? 0) !== 1 ? 's' : ''} en attente · ${loc?.retards ?? 0} retard${(loc?.retards ?? 0) !== 1 ? 's' : ''}`}
                  href="/locations"
                  variant={(loc?.retards ?? 0) > 0 ? 'warning' : 'default'}
                  icon={<IconKey className="h-5 w-5" />}
                />
                <KpiCard
                  label="Alertes stock"
                  value={stk?.alertes ?? 0}
                  sub={`Valeur du stock : ${money(stk?.valeur_stock)} XOF`}
                  href="/stock"
                  variant={(stk?.alertes ?? 0) > 0 ? 'danger' : 'default'}
                  icon={<IconBox className="h-5 w-5" />}
                />
              </div>
            </section>

            {/* ── KPIs — Conformité & coûts ───────────────── */}
            <section>
              <p className="eyebrow mb-3">Conformité &amp; coûts véhicules</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Assurances expirant (30j)"
                  value={(conf?.assurances_expirant ?? 0) + (conf?.assurances_expirees ?? 0)}
                  sub={`${conf?.assurances_expirees ?? 0} déjà expirée${(conf?.assurances_expirees ?? 0) !== 1 ? 's' : ''}`}
                  href="/assurances"
                  variant={(conf?.assurances_expirees ?? 0) > 0 ? 'danger' : (conf?.assurances_expirant ?? 0) > 0 ? 'warning' : 'default'}
                  icon={<IconShield className="h-5 w-5" />}
                />
                <KpiCard
                  label="Sinistres ouverts"
                  value={conf?.sinistres_ouverts ?? 0}
                  sub="Déclarations en cours de traitement"
                  href="/sinistres"
                  variant={(conf?.sinistres_ouverts ?? 0) > 0 ? 'warning' : 'default'}
                  icon={<IconAlert className="h-5 w-5" />}
                />
                <KpiCard
                  label="Coût entretiens (mois)"
                  value={`${money(conf?.cout_entretien_mois)} XOF`}
                  sub={`${conf?.entretiens_a_venir ?? 0} entretien${(conf?.entretiens_a_venir ?? 0) !== 1 ? 's' : ''} à venir (30j)`}
                  href="/entretiens"
                  icon={<IconWrench className="h-5 w-5" />}
                />
                <KpiCard
                  label="Coût carburant (mois)"
                  value={`${money(conf?.cout_carburant_mois)} XOF`}
                  sub="Total pleins du mois en cours"
                  href="/carburant"
                  icon={<IconFuel className="h-5 w-5" />}
                />
              </div>
            </section>

            {/* ── Graphe + Synthèse ────────────────────────── */}
            <section className="grid gap-6 lg:grid-cols-5">
              {/* Histogramme mensuel */}
              <div className="surface-panel p-6 lg:col-span-3">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="section-title">Ventes par mois</h2>
                    <p className="mt-1 text-xs text-slate-400">Année {payload?.year} — survol pour le détail</p>
                  </div>
                  <Link href="/reporting"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#111827] transition hover:bg-slate-50">
                    Rapport complet →
                  </Link>
                </div>
                {monthly.length > 0
                  ? <MonthlyBars data={monthly} />
                  : <p className="py-10 text-center text-sm text-slate-400">Aucune donnée de vente disponible.</p>
                }
              </div>

              {/* Synthèse opérationnelle */}
              <div className="surface-panel flex flex-col p-6 lg:col-span-2">
                <h2 className="section-title mb-5">Synthèse opérationnelle</h2>
                <div className="flex-1 space-y-1">
                  {([
                    { label: 'Locations en cours', value: loc?.en_cours ?? 0, href: '/locations' },
                    { label: 'Réservations en attente', value: loc?.reservations ?? 0, href: '/locations', warn: true },
                    { label: 'Retards de restitution', value: loc?.retards ?? 0, href: '/locations', alert: true },
                    { label: 'Tickets SAV ouverts', value: sav?.tickets_ouverts ?? 0, href: '/sav', warn: true },
                    { label: 'Ordres atelier ouverts', value: sav?.ordres_ouverts ?? 0, href: '/atelier', warn: true },
                    { label: 'Ordres en retard', value: sav?.ordres_en_retard ?? 0, href: '/atelier', alert: true },
                    { label: 'Factures en retard', value: fin?.factures_en_retard ?? 0, href: '/facturations', alert: true },
                    { label: 'Pièces en alerte stock', value: stk?.alertes ?? 0, href: '/stock', alert: true },
                    { label: 'Assurances expirées', value: conf?.assurances_expirees ?? 0, href: '/assurances', alert: true },
                    { label: 'Sinistres ouverts', value: conf?.sinistres_ouverts ?? 0, href: '/sinistres', warn: true },
                  ] as Array<{ label: string; value: number; href: string; warn?: boolean; alert?: boolean }>)
                    .map((row) => (
                      <Link key={row.label} href={row.href}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-slate-50">
                        <span className="text-slate-600">{row.label}</span>
                        <span className={`text-sm font-black ${
                          row.value > 0 && row.alert ? 'text-red-600'
                          : row.value > 0 && row.warn ? 'text-amber-600'
                          : row.value > 0 ? 'text-[#111827]'
                          : 'text-slate-300'
                        }`}>
                          {row.value}
                        </span>
                      </Link>
                    ))}
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Link href="/reporting"
                    className="block rounded-xl bg-slate-50 px-4 py-3 text-center text-xs font-bold text-[#111827] transition hover:bg-slate-100">
                    Voir le rapport complet →
                  </Link>
                </div>
              </div>
            </section>

            {/* ── Top alertes stock ────────────────────────── */}
            {(stk?.top_alerts?.length ?? 0) > 0 && (
              <section className="surface-panel p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="section-title">Pièces en rupture imminente</h2>
                    <p className="mt-1 text-xs text-slate-400">Stock inférieur ou égal au seuil d&apos;alerte</p>
                  </div>
                  <Link href="/stock"
                    className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100">
                    Gérer le stock →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left">
                        <th className="pb-3 pr-6 text-[11px] font-bold uppercase tracking-wide text-slate-400">Désignation</th>
                        <th className="pb-3 pr-6 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">En stock</th>
                        <th className="pb-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">Seuil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {stk!.top_alerts!.map((p) => (
                        <tr key={p.id} className="transition hover:bg-slate-50">
                          <td className="py-3 pr-6 font-semibold text-slate-800">{p.designation}</td>
                          <td className="py-3 pr-6 text-right">
                            <span className="rounded-lg bg-red-100 px-2 py-1 text-xs font-black text-red-700">
                              {p.quantite_stock}
                            </span>
                          </td>
                          <td className="py-3 text-right text-sm text-slate-400">{p.seuil_alerte}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Icônes inline ─────────────────────────────────────────────────────────────

function IconCar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5M5 11H3a1 1 0 00-1 1v1a1 1 0 001 1h2m14-2h2a1 1 0 011 1v1a1 1 0 01-1 1h-2" />
    </svg>
  );
}

function IconCart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function IconTrending({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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

function IconMoney({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function IconInvoice({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconWrench({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconKey({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function IconBox({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function IconFuel({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

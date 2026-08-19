'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { ReportingPayload } from '@/lib/types';
import { useEffect, useState } from 'react';

function money(value?: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}


function StatRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border-secondary)' }}>
      <div>
        <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
        {sub && <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{sub}</p>}
      </div>
      <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
    </div>
  );
}

export default function ReportingPage() {
  const _initRep = apiClient.getCached<any>('/reporting');
  const [payload, setPayload] = useState<ReportingPayload | null>(_initRep?.data ?? _initRep);
  const [loading, setLoading] = useState(_initRep === null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiClient.get<any>('/reporting')
      .then((data) => { if (mounted) { setPayload((data as any)?.data ?? data); setLoading(false); } })
      .catch(() => { if (mounted) { setError('Impossible de charger le reporting'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  async function exportCsv() {
    setExporting(true);
    try {
      await apiClient.download('/reporting/export', `rapport-${payload?.year ?? new Date().getFullYear()}.csv`);
    } catch {
      // silently ignore
    } finally {
      setExporting(false);
    }
  }

  const totalSales       = payload?.salesMonthly?.reduce((s, m) => s + Number(m.count  || 0), 0) ?? 0;
  const totalAmount      = payload?.salesMonthly?.reduce((s, m) => s + Number(m.amount || 0), 0) ?? 0;
  const totalLocations   = payload?.locationsMonthly?.reduce((s, m) => s + Number(m.count  || 0), 0) ?? 0;
  const totalLocAmount   = payload?.locationsMonthly?.reduce((s, m) => s + Number(m.amount || 0), 0) ?? 0;
  const fin  = payload?.financeStats;
  const sav  = payload?.savStats;
  const loc  = payload?.locationStats;
  const conf = payload?.conformiteStats;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="page-header">
          <div>
            <h1 className="page-title mt-0.5">Reporting</h1>
            <p className="page-subtitle">Analyse des performances ventes, finances, SAV et locations.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={exporting || loading}
              className="btn-secondary flex items-center gap-2 shrink-0"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
              </svg>
              {exporting ? 'Export…' : 'Exporter CSV'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded border" style={{ borderColor: 'var(--color-border-secondary)', background: 'var(--color-background-secondary)' }} />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded border px-4 py-3 text-sm" style={{ borderColor: 'var(--color-danger-bg)', background: 'var(--color-danger-bg)', color: 'var(--color-danger-text)' }}>{error}</div>
        )}

        {!loading && !error && payload && (
          <>
            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Ventes totales',        value: `${totalSales} vente${totalSales !== 1 ? 's' : ''}` },
                { label: 'CA Ventes',             value: `${money(totalAmount)} XOF` },
                { label: 'Locations facturées',   value: `${totalLocations} location${totalLocations !== 1 ? 's' : ''}` },
                { label: 'CA Locations',          value: `${money(totalLocAmount)} XOF` },
              ].map(({ label, value }) => (
                <div key={label} className="surface-panel p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
                  <p className="mt-2 text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Blocs opérationnels */}
            <div className="grid gap-5 lg:grid-cols-3">

              <div className="surface-panel p-5">
                <h2 className="section-title mb-2">Finance</h2>
                <StatRow label="Encaissements du mois" value={`${money(fin?.encaissements_mois)} XOF`} />
                <StatRow label="Factures impayées" value={fin?.factures_impayees ?? 0} />
                <StatRow label="Factures en retard" value={fin?.factures_en_retard ?? 0} />
                <StatRow label="Reste à encaisser" value={`${money(fin?.reste_global)} XOF`} />
              </div>

              <div className="surface-panel p-5">
                <h2 className="section-title mb-2">SAV</h2>
                <StatRow label="Tickets ouverts" value={sav?.tickets_ouverts ?? 0} />
                <StatRow label="Résolus ce mois" value={sav?.tickets_resolus_mois ?? 0} />
              </div>

              <div className="surface-panel p-5">
                <h2 className="section-title mb-2">Locations</h2>
                <StatRow label="En cours" value={loc?.en_cours ?? 0} />
                <StatRow label="Réservations en attente" value={loc?.reservations ?? 0} />
                <StatRow label="Retards de restitution" value={loc?.retards ?? 0} />
              </div>
            </div>

            {/* Blocs conformité */}
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="surface-panel p-5">
                <h2 className="section-title mb-2">Assurances</h2>
                <StatRow label="Assurances expirant (30j)" value={conf?.assurances_expirant ?? 0} />
                <StatRow label="Assurances expirées" value={conf?.assurances_expirees ?? 0} />
              </div>
              <div className="surface-panel p-5">
                <h2 className="section-title mb-2">Entretiens</h2>
                <StatRow label="Entretiens à venir (30j)" value={conf?.entretiens_a_venir ?? 0} />
              </div>
            </div>

            {/* Tableaux mensuels */}
            <div className="grid gap-5 lg:grid-cols-2">

              <section className="surface-panel">
                <div className="border-b px-5 py-4" style={{ borderColor: 'var(--color-border-secondary)' }}>
                  <h2 className="section-title">Ventes mensuelles {payload.year}</h2>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>Nombre de ventes et montant par mois.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="table-header pl-5">Mois</th>
                        <th className="table-header">Nb</th>
                        <th className="table-header">Montant</th>
                        <th className="table-header">Part</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(payload.salesMonthly ?? []).map((item) => {
                        const pct = totalAmount > 0 ? Math.round((Number(item.amount) / totalAmount) * 100) : 0;
                        return (
                          <tr key={item.label} className="table-row">
                            <td className="table-cell pl-5 font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</td>
                            <td className="table-cell">{item.count}</td>
                            <td className="table-cell tabular-nums">{money(item.amount)} XOF</td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: 'var(--color-border-secondary)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--color-text-secondary)' }} />
                                </div>
                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="border-t" style={{ borderColor: 'var(--color-border-secondary)', background: 'var(--color-background-secondary)' }}>
                        <td className="table-cell pl-5 font-bold" style={{ color: 'var(--color-text-primary)' }}>Total</td>
                        <td className="table-cell font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalSales}</td>
                        <td className="table-cell font-bold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>{money(totalAmount)} XOF</td>
                        <td className="table-cell" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="surface-panel">
                <div className="border-b px-5 py-4" style={{ borderColor: 'var(--color-border-secondary)' }}>
                  <h2 className="section-title">Locations mensuelles {payload.year}</h2>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>Nombre de locations facturées et montant TTC par mois.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="table-header pl-5">Mois</th>
                        <th className="table-header">Nb</th>
                        <th className="table-header">Montant TTC</th>
                        <th className="table-header">Part</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(payload.locationsMonthly ?? []).map((item) => {
                        const pct = totalLocAmount > 0 ? Math.round((Number(item.amount) / totalLocAmount) * 100) : 0;
                        return (
                          <tr key={item.label} className="table-row">
                            <td className="table-cell pl-5 font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</td>
                            <td className="table-cell">{item.count}</td>
                            <td className="table-cell tabular-nums">{money(item.amount)} XOF</td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: 'var(--color-border-secondary)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--color-text-secondary)' }} />
                                </div>
                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="border-t" style={{ borderColor: 'var(--color-border-secondary)', background: 'var(--color-background-secondary)' }}>
                        <td className="table-cell pl-5 font-bold" style={{ color: 'var(--color-text-primary)' }}>Total</td>
                        <td className="table-cell font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalLocations}</td>
                        <td className="table-cell font-bold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>{money(totalLocAmount)} XOF</td>
                        <td className="table-cell" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

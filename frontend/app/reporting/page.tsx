'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { ReportingPayload } from '@/lib/types';
import { useEffect, useState } from 'react';

function money(value?: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#dfe3eb] last:border-0">
      <div>
        <p className="text-sm text-[#33475b]">{label}</p>
        {sub && <p className="text-xs text-[#516f90]">{sub}</p>}
      </div>
      <p className="text-sm font-bold text-[#33475b] tabular-nums">{value}</p>
    </div>
  );
}

export default function ReportingPage() {
  const [payload, setPayload] = useState<ReportingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiClient.get<ReportingPayload>('/reporting')
      .then((data) => { if (mounted) setPayload(data); })
      .catch(() => { if (mounted) setError('Impossible de charger le reporting'); })
      .finally(() => { if (mounted) setLoading(false); });
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

  const totalSales  = payload?.salesMonthly?.reduce((s, m) => s + Number(m.count  || 0), 0) ?? 0;
  const totalAmount = payload?.salesMonthly?.reduce((s, m) => s + Number(m.amount || 0), 0) ?? 0;
  const fin = payload?.financeStats;
  const stk = payload?.stockStats;
  const sav = payload?.savStats;
  const loc = payload?.locationStats;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Exercice {payload?.year ?? new Date().getFullYear()}</p>
            <h1 className="page-title mt-0.5">Reporting</h1>
            <p className="page-subtitle">Analyse des performances — ventes, finances, stock, SAV et locations.</p>
          </div>
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

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded border border-[#dfe3eb] bg-[#f5f8fa]" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && payload && (
          <>
            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Ventes totales',        value: `${totalSales} vente${totalSales !== 1 ? 's' : ''}` },
                { label: "Chiffre d'affaires",    value: `${money(totalAmount)} XOF` },
                { label: 'Factures impayées',     value: `${fin?.factures_impayees ?? 0}` },
                { label: 'Reste à encaisser',     value: `${money(fin?.reste_global)} XOF` },
              ].map(({ label, value }) => (
                <div key={label} className="surface-panel p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#516f90]">{label}</p>
                  <p className="mt-2 text-xl font-black text-[#33475b]">{value}</p>
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
                <h2 className="section-title mb-2">Stock & SAV</h2>
                <StatRow label="Alertes stock" value={stk?.alertes ?? 0} />
                <StatRow label="Valeur du stock" value={`${money(stk?.valeur_stock)} XOF`} />
                <StatRow label="Tickets SAV ouverts" value={sav?.tickets_ouverts ?? 0} />
                <StatRow label="Ordres atelier ouverts" value={sav?.ordres_ouverts ?? 0} />
                <StatRow label="Ordres en retard" value={sav?.ordres_en_retard ?? 0} />
              </div>

              <div className="surface-panel p-5">
                <h2 className="section-title mb-2">Locations</h2>
                <StatRow label="En cours" value={loc?.en_cours ?? 0} />
                <StatRow label="Réservations en attente" value={loc?.reservations ?? 0} />
                <StatRow label="Retards de restitution" value={loc?.retards ?? 0} />
              </div>
            </div>

            {/* Tableau mensuel */}
            <section className="surface-panel">
              <div className="border-b border-[#dfe3eb] px-5 py-4">
                <h2 className="section-title">Ventes mensuelles — {payload.year}</h2>
                <p className="mt-0.5 text-xs text-[#516f90]">Nombre de ventes et montant encaissé par mois.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-header pl-5">Mois</th>
                      <th className="table-header">Ventes</th>
                      <th className="table-header">Montant</th>
                      <th className="table-header">Part du CA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(payload.salesMonthly ?? []).map((item) => {
                      const pct = totalAmount > 0 ? Math.round((Number(item.amount) / totalAmount) * 100) : 0;
                      return (
                        <tr key={item.label} className="table-row">
                          <td className="table-cell pl-5 font-medium text-[#33475b]">{item.label}</td>
                          <td className="table-cell">{item.count}</td>
                          <td className="table-cell tabular-nums">{money(item.amount)} XOF</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#dfe3eb]">
                                <div
                                  className="h-full rounded-full bg-[#ff6b35]"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-[#516f90]">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total */}
                    <tr className="border-t border-[#dfe3eb] bg-[#f5f8fa]">
                      <td className="table-cell pl-5 font-bold text-[#33475b]">Total</td>
                      <td className="table-cell font-bold text-[#33475b]">{totalSales}</td>
                      <td className="table-cell font-bold text-[#33475b] tabular-nums">{money(totalAmount)} XOF</td>
                      <td className="table-cell"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

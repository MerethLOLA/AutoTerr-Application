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
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#dfe3eb] last:border-0">
      <div>
        <p className="text-sm text-[#111827]">{label}</p>
        {sub && <p className="text-xs text-[#6b7280]">{sub}</p>}
      </div>
      <p className="text-sm font-bold text-[#111827] tabular-nums">{value}</p>
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
  const stk  = payload?.stockStats;
  const sav  = payload?.savStats;
  const loc  = payload?.locationStats;
  const conf = payload?.conformiteStats;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="page-header">
          <div>
            <h1 className="page-title mt-0.5">Reporting</h1>
            <p className="page-subtitle">Analyse des performances — ventes, finances, stock, SAV et locations.</p>
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
                { label: 'CA Ventes',             value: `${money(totalAmount)} XOF` },
                { label: 'Locations facturées',   value: `${totalLocations} location${totalLocations !== 1 ? 's' : ''}` },
                { label: 'CA Locations',          value: `${money(totalLocAmount)} XOF` },
              ].map(({ label, value }) => (
                <div key={label} className="surface-panel p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">{label}</p>
                  <p className="mt-2 text-xl font-black text-[#111827]">{value}</p>
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

            {/* Blocs conformité & coûts */}
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="surface-panel p-5">
                <h2 className="section-title mb-2">Assurances & Sinistres</h2>
                <StatRow label="Assurances expirant (30j)" value={conf?.assurances_expirant ?? 0} />
                <StatRow label="Assurances expirées" value={conf?.assurances_expirees ?? 0} />
                <StatRow label="Sinistres ouverts" value={conf?.sinistres_ouverts ?? 0} />
              </div>
              <div className="surface-panel p-5">
                <h2 className="section-title mb-2">Entretiens & Carburant</h2>
                <StatRow label="Entretiens à venir (30j)" value={conf?.entretiens_a_venir ?? 0} />
                <StatRow label="Coût entretiens (mois)" value={`${money(conf?.cout_entretien_mois)} XOF`} />
                <StatRow label="Coût carburant (mois)" value={`${money(conf?.cout_carburant_mois)} XOF`} />
              </div>
              <div className="surface-panel p-5">
                <h2 className="section-title mb-2">SAV & Atelier</h2>
                <StatRow label="Tickets SAV ouverts" value={sav?.tickets_ouverts ?? 0} />
                <StatRow label="Résolus ce mois" value={sav?.tickets_resolus_mois ?? 0} />
                <StatRow label="Ordres atelier ouverts" value={sav?.ordres_ouverts ?? 0} />
                <StatRow label="Ordres en retard" value={sav?.ordres_en_retard ?? 0} />
              </div>
            </div>

            {/* Alertes stock */}
            {(stk?.top_alerts?.length ?? 0) > 0 && (
              <div className="surface-panel">
                <div className="border-b border-[#dfe3eb] px-5 py-4">
                  <h2 className="section-title">Pièces en rupture imminente</h2>
                  <p className="mt-0.5 text-xs text-[#6b7280]">Stock inférieur ou égal au seuil d&apos;alerte</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="table-header pl-5">Désignation</th>
                        <th className="table-header text-right">En stock</th>
                        <th className="table-header text-right">Seuil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stk!.top_alerts!.map((p) => (
                        <tr key={p.id} className="table-row">
                          <td className="table-cell pl-5 font-medium text-[#111827]">{p.designation}</td>
                          <td className="table-cell text-right">
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{p.quantite_stock}</span>
                          </td>
                          <td className="table-cell text-right text-[#6b7280]">{p.seuil_alerte}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tableaux mensuels */}
            <div className="grid gap-5 lg:grid-cols-2">

              <section className="surface-panel">
                <div className="border-b border-[#dfe3eb] px-5 py-4">
                  <h2 className="section-title">Ventes mensuelles — {payload.year}</h2>
                  <p className="mt-0.5 text-xs text-[#6b7280]">Nombre de ventes et montant par mois.</p>
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
                            <td className="table-cell pl-5 font-medium text-[#111827]">{item.label}</td>
                            <td className="table-cell">{item.count}</td>
                            <td className="table-cell tabular-nums">{money(item.amount)} XOF</td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#dfe3eb]">
                                  <div className="h-full rounded-full bg-[#374151]" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-[#6b7280]">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="border-t border-[#dfe3eb] bg-[#f5f8fa]">
                        <td className="table-cell pl-5 font-bold text-[#111827]">Total</td>
                        <td className="table-cell font-bold text-[#111827]">{totalSales}</td>
                        <td className="table-cell font-bold text-[#111827] tabular-nums">{money(totalAmount)} XOF</td>
                        <td className="table-cell" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="surface-panel">
                <div className="border-b border-[#dfe3eb] px-5 py-4">
                  <h2 className="section-title">Locations mensuelles — {payload.year}</h2>
                  <p className="mt-0.5 text-xs text-[#6b7280]">Nombre de locations facturées et montant TTC par mois.</p>
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
                            <td className="table-cell pl-5 font-medium text-[#111827]">{item.label}</td>
                            <td className="table-cell">{item.count}</td>
                            <td className="table-cell tabular-nums">{money(item.amount)} XOF</td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#dfe3eb]">
                                  <div className="h-full rounded-full bg-[#7c3aed]" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-[#6b7280]">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="border-t border-[#dfe3eb] bg-[#f5f8fa]">
                        <td className="table-cell pl-5 font-bold text-[#111827]">Total</td>
                        <td className="table-cell font-bold text-[#111827]">{totalLocations}</td>
                        <td className="table-cell font-bold text-[#111827] tabular-nums">{money(totalLocAmount)} XOF</td>
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

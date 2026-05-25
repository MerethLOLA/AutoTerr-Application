'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { ReportingPayload } from '@/lib/types';
import { useEffect, useState } from 'react';

function money(v?: number | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v || 0));
}

const MONTH_SHORT = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];

function BarChart({ data }: { data: Array<{ label: string; count: number; amount: number }> }) {
  const maxAmount = Math.max(...data.map((d) => Number(d.amount)), 1);
  const maxCount  = Math.max(...data.map((d) => Number(d.count)), 1);
  return (
    <div className="flex h-48 items-end gap-1">
      {data.map((d, i) => {
        const hPct   = (Number(d.amount) / maxAmount) * 100;
        const cPct   = (Number(d.count)  / maxCount)  * 100;
        const label  = MONTH_SHORT[i] ?? d.label;
        return (
          <div key={d.label} className="group relative flex flex-1 flex-col items-center gap-1">
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full mb-2 hidden w-32 rounded border border-[#dfe3eb] bg-white px-2 py-1.5 text-center shadow-lg group-hover:block z-10">
              <p className="text-xs font-bold text-[#111827]">{label}</p>
              <p className="text-xs text-[#6b7280]">{d.count} vente{d.count !== 1 ? 's' : ''}</p>
              <p className="text-xs font-semibold text-[#111827]">{money(d.amount)} XOF</p>
            </div>
            {/* Barre montant */}
            <div className="relative flex w-full items-end justify-center gap-px" style={{ height: '100%' }}>
              <div
                className="w-3/5 rounded-t-sm bg-[#2d1b3d] transition-all duration-500"
                style={{ height: `${Math.max(hPct, 2)}%` }}
              />
              {/* Barre count (thin overlay) */}
              <div
                className="w-2/5 rounded-t-sm bg-[#dfe3eb] transition-all duration-500"
                style={{ height: `${Math.max(cPct, 2)}%` }}
              />
            </div>
            <span className="text-[10px] text-[#6b7280]">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MiniBar({ value, max, color = '#2d1b3d' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#dfe3eb]">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function AnalyticsPage() {
  const _initAn = apiClient.getCached<any>('/reporting');
  const [payload, setPayload] = useState<ReportingPayload | null>(_initAn?.data ?? _initAn ?? null);
  const [loading, setLoading] = useState(_initAn === null);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<any>('/reporting')
      .then((res) => { setPayload(res?.data ?? res); setLoading(false); })
      .catch(() => { setError('Impossible de charger les données'); setLoading(false); });
  }, []);

  const sales   = payload?.salesMonthly ?? [];
  const fin     = payload?.financeStats;
  const stk     = payload?.stockStats;
  const sav     = payload?.savStats;
  const loc     = payload?.locationStats;
  const conf    = payload?.conformiteStats;
  const modes   = payload?.paymentModes ?? [];

  const totalCA    = sales.reduce((s, m) => s + Number(m.amount), 0);
  const totalVentes = sales.reduce((s, m) => s + Number(m.count), 0);
  const maxMode    = Math.max(...modes.map((m) => Number(m.montant)), 1);

  const MODE_LABEL: Record<string, string> = {
    especes: 'Espèces', virement: 'Virement', cheque: 'Chèque',
    carte: 'Carte bancaire', mobile: 'Mobile Money',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Exercice {payload?.year ?? new Date().getFullYear()}</p>
            <h1 className="page-title mt-0.5">Analytics</h1>
            <p className="page-subtitle">Visualisation des performances commerciales et opérationnelles.</p>
          </div>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-24 animate-pulse rounded border border-[#dfe3eb] bg-[#f5f8fa]" />)}
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
                { label: "Chiffre d'affaires", value: `${money(totalCA)} XOF`, sub: `${totalVentes} ventes` },
                { label: 'Véhicules disponibles', value: payload.voituresDisponibles ?? 0, sub: 'en parc' },
                { label: 'Reste à encaisser', value: `${money(fin?.reste_global)} XOF`, sub: `${fin?.factures_impayees ?? 0} factures` },
                { label: 'Alertes stock', value: stk?.alertes ?? 0, sub: `${stk?.references ?? 0} références` },
              ].map(({ label, value, sub }) => (
                <div key={label} className="surface-panel p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">{label}</p>
                  <p className="mt-2 text-2xl font-black text-[#111827]">{value}</p>
                  {sub && <p className="mt-0.5 text-xs text-[#6b7280]">{sub}</p>}
                </div>
              ))}
            </div>

            {/* Graphique ventes mensuelles */}
            {sales.length > 0 && (
              <section className="surface-panel p-5">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="section-title">Ventes mensuelles</h2>
                    <p className="text-xs text-[#6b7280]">CA en XOF (violet) · nombre de ventes (gris)</p>
                  </div>
                  <p className="text-xl font-black text-[#111827]">{money(totalCA)} XOF</p>
                </div>
                <BarChart data={sales} />
                {/* Légende */}
                <div className="mt-3 flex items-center gap-5">
                  <span className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#2d1b3d]" />Montant (XOF)
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#dfe3eb]" />Nb ventes
                  </span>
                </div>
              </section>
            )}

            {/* Grille opérationnelle */}
            <div className="grid gap-5 lg:grid-cols-3">

              {/* Finance */}
              <div className="surface-panel p-5 space-y-3">
                <h2 className="section-title">Finance</h2>
                {[
                  { label: 'Encaissements du mois', value: `${money(fin?.encaissements_mois)} XOF` },
                  { label: 'Factures impayées',     value: fin?.factures_impayees ?? 0 },
                  { label: 'Factures en retard',    value: fin?.factures_en_retard ?? 0 },
                  { label: 'Reste à encaisser',     value: `${money(fin?.reste_global)} XOF` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1 border-b border-[#dfe3eb] last:border-0 text-sm">
                    <span className="text-[#6b7280]">{label}</span>
                    <span className="font-bold text-[#111827]">{value}</span>
                  </div>
                ))}
              </div>

              {/* SAV & Atelier */}
              <div className="surface-panel p-5 space-y-3">
                <h2 className="section-title">SAV & Atelier</h2>
                {[
                  { label: 'Tickets ouverts',      value: sav?.tickets_ouverts ?? 0 },
                  { label: 'Résolus ce mois',      value: sav?.tickets_resolus_mois ?? 0 },
                  { label: 'Ordres de travail',     value: sav?.ordres_ouverts ?? 0 },
                  { label: 'OT en retard',          value: sav?.ordres_en_retard ?? 0 },
                  { label: 'Locations en cours',    value: loc?.en_cours ?? 0 },
                  { label: 'Retards restitution',   value: loc?.retards ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1 border-b border-[#dfe3eb] last:border-0 text-sm">
                    <span className="text-[#6b7280]">{label}</span>
                    <span className="font-bold text-[#111827]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Conformité parc */}
              <div className="surface-panel p-5 space-y-3">
                <h2 className="section-title">Conformité parc</h2>
                {[
                  { label: 'Assurances expirant bientôt', value: conf?.assurances_expirant ?? 0, alert: (conf?.assurances_expirant ?? 0) > 0 },
                  { label: 'Assurances expirées',         value: conf?.assurances_expirees ?? 0, alert: (conf?.assurances_expirees ?? 0) > 0 },
                  { label: 'Sinistres ouverts',           value: conf?.sinistres_ouverts ?? 0 },
                  { label: 'Entretiens à venir',          value: conf?.entretiens_a_venir ?? 0 },
                  { label: 'Coût entretiens (mois)',       value: `${money(conf?.cout_entretien_mois)} XOF` },
                  { label: 'Coût carburant (mois)',        value: `${money(conf?.cout_carburant_mois)} XOF` },
                ].map(({ label, value, alert }) => (
                  <div key={label} className="flex items-center justify-between py-1 border-b border-[#dfe3eb] last:border-0 text-sm">
                    <span className="text-[#6b7280]">{label}</span>
                    <span className={`font-bold ${alert ? 'text-red-600' : 'text-[#111827]'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modes de paiement */}
            {modes.length > 0 && (
              <section className="surface-panel p-5">
                <h2 className="section-title mb-4">Répartition des modes de paiement</h2>
                <div className="space-y-3">
                  {modes.map((m) => (
                    <div key={m.mode_paiement}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-[#111827]">{MODE_LABEL[m.mode_paiement] ?? m.mode_paiement}</span>
                        <span className="font-bold text-[#111827]">
                          {money(m.montant)} XOF
                          <span className="ml-2 text-xs font-normal text-[#6b7280]">({m.total} pmt{m.total > 1 ? 's' : ''})</span>
                        </span>
                      </div>
                      <MiniBar value={Number(m.montant)} max={maxMode} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Top alertes stock */}
            {(stk?.top_alerts ?? []).length > 0 && (
              <section className="surface-panel">
                <div className="border-b border-[#dfe3eb] px-5 py-3">
                  <h2 className="section-title">Alertes stock critiques</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="table-header pl-5">Pièce</th>
                        <th className="table-header">Stock actuel</th>
                        <th className="table-header">Seuil d'alerte</th>
                        <th className="table-header">Niveau</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stk!.top_alerts!.map((a) => {
                        const pct = Math.min((a.quantite_stock / a.seuil_alerte) * 100, 100);
                        return (
                          <tr key={a.id} className="table-row">
                            <td className="table-cell pl-5 font-medium text-[#111827]">{a.designation}</td>
                            <td className="table-cell font-bold text-red-600">{a.quantite_stock}</td>
                            <td className="table-cell text-[#6b7280]">{a.seuil_alerte}</td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#dfe3eb]">
                                  <div className="h-full rounded-full bg-red-400" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-red-600">{Math.round(pct)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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

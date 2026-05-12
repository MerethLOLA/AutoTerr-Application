'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { ReportingPayload } from '@/lib/types';
import { useEffect, useState } from 'react';

function money(value?: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function ReportingPage() {
  const [payload, setPayload] = useState<ReportingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    apiClient.get<ReportingPayload>('/reporting')
      .then((data) => {
        if (mounted) setPayload(data);
      })
      .catch(() => {
        if (mounted) setError('Impossible de charger le reporting');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totalSales = payload?.salesMonthly?.reduce((sum, item) => sum + Number(item.count || 0), 0) ?? 0;
  const totalAmount = payload?.salesMonthly?.reduce((sum, item) => sum + Number(item.amount || 0), 0) ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="hero-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Reporting
              </p>
              <h1 className="text-3xl font-black">Analyse des performances</h1>
              <p className="mt-2 text-sm text-slate-200">
                Donnees chiffrees sur les ventes, le stock, le SAV et les operations de location.
              </p>
            </div>
            <a className="btn-secondary bg-white/95" href="/reporting/export">
              Exporter le CSV
            </a>
          </div>
        </section>

        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="metric-card animate-pulse p-6" />
            ))}
          </div>
        )}

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</div>}

        {!loading && !error && payload && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Ventes total', value: `${totalSales}` },
                { label: 'Chiffre d affaires', value: `${money(totalAmount)} XOF` },
                { label: 'Factures impayees', value: `${payload.financeStats?.factures_impayees || 0}` },
                { label: 'Reste a encaisser', value: `${money(payload.financeStats?.reste_global)} XOF` },
              ].map((card) => (
                <div key={card.label} className="metric-card">
                  <p className="metric-label">{card.label}</p>
                  <p className="mt-3 text-3xl font-black text-slate-900">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="surface-panel p-6">
                <h2 className="section-title">Stock</h2>
                <div className="mt-5 space-y-3 text-sm text-slate-700">
                  <p><strong>Alertes stock :</strong> {payload.stockStats?.alertes || 0}</p>
                  <p><strong>Valeur stock :</strong> {money(payload.stockStats?.valeur_stock)} XOF</p>
                  <p><strong>Annee analysee :</strong> {payload.year}</p>
                </div>
              </div>
              <div className="surface-panel p-6">
                <h2 className="section-title">SAV</h2>
                <div className="mt-5 space-y-3 text-sm text-slate-700">
                  <p><strong>Tickets ouverts :</strong> {payload.savStats?.tickets_ouverts || 0}</p>
                  <p><strong>Ordres ouverts :</strong> {payload.savStats?.ordres_ouverts || 0}</p>
                </div>
              </div>
              <div className="surface-panel p-6">
                <h2 className="section-title">Locations</h2>
                <div className="mt-5 space-y-3 text-sm text-slate-700">
                  <p><strong>En cours :</strong> {payload.locationStats?.en_cours || 0}</p>
                  <p><strong>Reservations :</strong> {payload.locationStats?.reservations || 0}</p>
                </div>
              </div>
            </section>

            <section className="surface-panel p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="section-title">Ventes mensuelles</h2>
                  <p className="mt-1 text-sm text-slate-500">Nombre de ventes et montant pour chaque mois.</p>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
                      <th className="py-3 pr-4">Mois</th>
                      <th className="py-3 pr-4">Ventes</th>
                      <th className="py-3 pr-4">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payload.salesMonthly?.map((item) => (
                      <tr key={item.label} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 pr-4">{item.label}</td>
                        <td className="py-3 pr-4">{item.count}</td>
                        <td className="py-3 pr-4">{money(item.amount)} XOF</td>
                      </tr>
                    ))}
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

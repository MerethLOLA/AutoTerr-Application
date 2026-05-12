'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Paiement {
  id: number;
  date: string;
  montant: number;
}

interface SaleDetail {
  id: number;
  reference_vente: string;
  date_vente: string;
  prix_final: number;
  statut: string;
  mode_paiement?: string;
  observations?: string;
  client?: { id: number; nom: string; prenom?: string };
  voiture?: { id: number; marque: string; modele: string };
  facturation?: { id: number; numero_facture: string; montant_ttc: number; statut: string };
  paiements?: Paiement[];
}

function money(v?: number | string | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0));
}

function fmtDate(d?: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function badge(statut: string) {
  const map: Record<string, string> = {
    termine:    'bg-emerald-100 text-emerald-800 border-emerald-200',
    en_cours:   'bg-blue-100 text-blue-800 border-blue-200',
    annule:     'bg-[#f5f8fa] text-[#516f90] border-[#dfe3eb]',
    en_attente: 'bg-amber-100 text-amber-800 border-amber-200',
    payee:      'bg-emerald-100 text-emerald-800 border-emerald-200',
    impayee:    'bg-red-100 text-red-700 border-red-200',
  };
  return `inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-semibold ${map[statut] ?? 'bg-[#f5f8fa] text-[#516f90] border-[#dfe3eb]'}`;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#dfe3eb] py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-semibold text-[#516f90]">{label}</span>
      <span className="text-right text-sm font-medium text-[#33475b]">{value ?? '-'}</span>
    </div>
  );
}

export default function SaleDetailPage({ saleId }: { saleId: string }) {
  const [sale, setSale]       = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<any>(`/ventes/${saleId}`)
      .then((res) => setSale(res?.data ?? res))
      .catch((err: any) => setError(err?.message || 'Vente introuvable'))
      .finally(() => setLoading(false));
  }, [saleId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-[#f5f8fa]" />
          <div className="grid gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded border border-[#dfe3eb] bg-[#f5f8fa]" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !sale) {
    return (
      <DashboardLayout>
        <div className="surface-panel py-16 text-center">
          <p className="text-sm font-semibold text-red-600">{error ?? 'Vente introuvable'}</p>
          <Link href="/ventes/historique" className="mt-4 inline-block text-sm font-bold text-[#ff6b35] hover:underline">
            ← Retour à l&apos;historique
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalPaye = (sale.paiements ?? []).reduce((s, p) => s + Number(p.montant), 0);
  const resteAPayer = Number(sale.prix_final) - totalPaye;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Fil d'ariane */}
        <nav className="flex items-center gap-2 text-sm text-[#516f90]">
          <Link href="/ventes/historique" className="font-semibold hover:text-[#33475b]">
            Historique des ventes
          </Link>
          <span>/</span>
          <span className="font-bold text-[#33475b]">{sale.reference_vente}</span>
        </nav>

        {/* En-tête */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Vente</p>
            <h1 className="page-title mt-0.5">{sale.reference_vente}</h1>
            <p className="page-subtitle">Créée le {fmtDate(sale.date_vente)}</p>
          </div>
          <span className={badge(sale.statut)}>{sale.statut.replace('_', ' ')}</span>
        </div>

        {/* Blocs d'information */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Client */}
          <div className="surface-panel p-5">
            <h2 className="section-title mb-3">Client</h2>
            <InfoRow label="Nom"    value={sale.client ? `${sale.client.nom}${sale.client.prenom ? ' ' + sale.client.prenom : ''}` : undefined} />
            {sale.client && (
              <div className="mt-3">
                <Link
                  href={`/clients`}
                  className="text-xs font-semibold text-[#ff6b35] hover:underline"
                >
                  Voir la fiche client →
                </Link>
              </div>
            )}
          </div>

          {/* Véhicule */}
          <div className="surface-panel p-5">
            <h2 className="section-title mb-3">Véhicule</h2>
            <InfoRow
              label="Modèle"
              value={sale.voiture ? `${sale.voiture.marque} ${sale.voiture.modele}` : undefined}
            />
            {sale.voiture && (
              <div className="mt-3">
                <Link
                  href={`/voitures/${sale.voiture.id}`}
                  className="text-xs font-semibold text-[#ff6b35] hover:underline"
                >
                  Voir la fiche véhicule →
                </Link>
              </div>
            )}
          </div>

          {/* Finances */}
          <div className="surface-panel p-5">
            <h2 className="section-title mb-3">Finances</h2>
            <InfoRow label="Prix final"     value={`${money(sale.prix_final)} XOF`} />
            <InfoRow label="Encaissé"       value={`${money(totalPaye)} XOF`} />
            <InfoRow label="Reste à payer"  value={`${money(resteAPayer > 0 ? resteAPayer : 0)} XOF`} />
            {sale.mode_paiement && <InfoRow label="Mode paiement" value={sale.mode_paiement} />}
          </div>
        </div>

        {/* Facture */}
        {sale.facturation && (
          <div className="surface-panel p-5">
            <h2 className="section-title mb-4">Facture associée</h2>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#33475b]">{sale.facturation.numero_facture}</p>
                <p className="text-xs text-[#516f90]">{money(sale.facturation.montant_ttc)} XOF TTC</p>
              </div>
              <span className={badge(sale.facturation.statut)}>{sale.facturation.statut.replace('_', ' ')}</span>
            </div>
          </div>
        )}

        {/* Paiements */}
        {(sale.paiements ?? []).length > 0 && (
          <section className="surface-panel">
            <div className="border-b border-[#dfe3eb] px-5 py-4">
              <h2 className="section-title">Historique des paiements</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="table-header pl-5">Date</th>
                    <th className="table-header">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.paiements!.map((p) => (
                    <tr key={p.id} className="table-row">
                      <td className="table-cell pl-5 text-[#33475b]">{fmtDate(p.date)}</td>
                      <td className="table-cell tabular-nums font-semibold text-[#33475b]">{money(p.montant)} XOF</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Observations */}
        {sale.observations && (
          <div className="surface-panel p-5">
            <h2 className="section-title mb-3">Observations</h2>
            <p className="text-sm leading-relaxed text-[#516f90]">{sale.observations}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/ventes/historique" className="btn-secondary">
            ← Retour
          </Link>
          {sale.facturation && (
            <Link href={`/facturations`} className="btn-secondary">
              Voir la facture
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SaleItem {
  id: number;
  reference_vente: string;
  date_vente: string;
  prix_final: number | string;
  statut: string;
  paiements_sum_montant?: number | string | null;
  client?: {
    nom?: string;
    prenom?: string;
  };
  voiture?: {
    marque?: string;
    modele?: string;
  };
  facturation?: {
    numero_facture?: string;
    montant_ttc?: number | string;
    statut?: string;
  };
}

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function fullName(person?: { nom?: string; prenom?: string }) {
  return [person?.nom, person?.prenom].filter(Boolean).join(' ') || '-';
}

function vehicleName(vehicle?: { marque?: string; modele?: string }) {
  return [vehicle?.marque, vehicle?.modele].filter(Boolean).join(' ') || '-';
}

function statusClass(status?: string) {
  if (status === 'payee' || status === 'finalisee') return 'bg-emerald-50 text-emerald-700';
  if (status === 'partiellement_payee') return 'bg-amber-50 text-amber-700';
  if (status === 'en_retard') return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-700';
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSales() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<any>('/ventes');
        if (mounted) setSales(Array.isArray(response) ? response : response?.data || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Impossible de charger les ventes');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSales();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cyan-100">
                Suivi commercial
              </p>
              <h1 className="text-4xl font-black tracking-tight">Historique des ventes</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200">
                Liste des ventes creees depuis l API Laravel avec facture, paiement et statut associes.
              </p>
            </div>
            <Link className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400" href="/ventes">
              Nouvelle vente
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-black text-slate-900">Ventes recentes</h2>
            <p className="mt-1 text-sm text-slate-500">Les montants sont affiches en XOF.</p>
          </div>

          <div className="p-6">
            {loading && <p className="text-sm text-slate-500">Chargement des ventes...</p>}
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
                      <th className="py-3 pr-4">Reference</th>
                      <th className="py-3 pr-4">Client</th>
                      <th className="py-3 pr-4">Vehicule</th>
                      <th className="py-3 pr-4">Facture</th>
                      <th className="py-3 pr-4">TTC</th>
                      <th className="py-3 pr-4">Paye</th>
                      <th className="py-3 pr-4">Statut facture</th>
                      <th className="py-3 pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.length === 0 ? (
                      <tr>
                        <td className="py-6 text-slate-500" colSpan={8}>Aucune vente pour le moment.</td>
                      </tr>
                    ) : (
                      sales.map((sale) => (
                        <tr key={sale.id} className="border-b border-slate-100">
                          <td className="py-3 pr-4 font-bold text-slate-900">{sale.reference_vente}</td>
                          <td className="py-3 pr-4 text-slate-700">{fullName(sale.client)}</td>
                          <td className="py-3 pr-4 text-slate-700">{vehicleName(sale.voiture)}</td>
                          <td className="py-3 pr-4 text-slate-700">{sale.facturation?.numero_facture || '-'}</td>
                          <td className="py-3 pr-4 text-slate-700">{money(sale.facturation?.montant_ttc)} XOF</td>
                          <td className="py-3 pr-4 text-slate-700">{money(sale.paiements_sum_montant)} XOF</td>
                          <td className="py-3 pr-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(sale.facturation?.statut)}`}>
                              {sale.facturation?.statut || sale.statut}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <Link className="font-bold text-cyan-700 hover:text-cyan-900" href={`/ventes/${sale.id}`}>
                              Voir
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Sale {
  id: number;
  reference_vente: string;
  date_vente: string;
  prix_final: number;
  statut: string;
  client?: { nom: string; prenom?: string };
  voiture?: { marque: string; modele: string };
}

function money(v?: number | string | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0));
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function badge(statut: string) {
  const map: Record<string, string> = {
    termine:    'bg-emerald-100 text-emerald-800',
    en_cours:   'bg-blue-100 text-blue-800',
    annule:     'bg-[#f5f8fa] text-[#516f90]',
    en_attente: 'bg-amber-100 text-amber-800',
  };
  return `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${map[statut] ?? 'bg-[#f5f8fa] text-[#516f90]'}`;
}

export default function SalesHistoryPage() {
  const [sales, setSales]       = useState<Sale[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page };
      if (search.trim()) params.search = search.trim();
      const res = await apiClient.get<any>('/ventes', params);
      setSales(res?.data ?? []);
      if (res?.meta) {
        setTotalPages(res.meta.last_page ?? 1);
        setTotal(res.meta.total ?? 0);
      }
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les ventes');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadSales(); }, [loadSales]);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Commercial</p>
            <h1 className="page-title mt-0.5">Historique des ventes</h1>
            <p className="page-subtitle">Consultez l&apos;ensemble des transactions réalisées.</p>
          </div>
          <Link href="/ventes" className="btn-primary shrink-0">
            Nouvelle vente
          </Link>
        </div>

        {/* Tableau */}
        <section className="surface-panel">
          <div className="flex flex-col gap-3 border-b border-[#dfe3eb] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="section-title">Ventes</h2>
              {total > 0 && (
                <p className="mt-0.5 text-xs text-[#516f90]">
                  {total} vente{total > 1 ? 's' : ''}
                </p>
              )}
            </div>
            {/* Recherche */}
            <div className="relative w-full max-w-xs">
              <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#516f90]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="field-control py-2 pl-9"
              />
            </div>
          </div>

          {loading && (
            <div className="space-y-2 p-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-[#f5f8fa]" />
              ))}
            </div>
          )}

          {error && (
            <div className="m-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="table-header pl-5">Référence</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Client</th>
                    <th className="table-header">Véhicule</th>
                    <th className="table-header">Montant</th>
                    <th className="table-header">Statut</th>
                    <th className="table-header">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-sm text-[#516f90]">
                        Aucune vente trouvée.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id} className="table-row">
                        <td className="table-cell pl-5 font-mono font-semibold text-[#33475b]">
                          {sale.reference_vente}
                        </td>
                        <td className="table-cell">{fmtDate(sale.date_vente)}</td>
                        <td className="table-cell">
                          {sale.client ? `${sale.client.nom}${sale.client.prenom ? ' ' + sale.client.prenom : ''}` : '-'}
                        </td>
                        <td className="table-cell">
                          {sale.voiture ? `${sale.voiture.marque} ${sale.voiture.modele}` : '-'}
                        </td>
                        <td className="table-cell tabular-nums">{money(sale.prix_final)} XOF</td>
                        <td className="table-cell">
                          <span className={badge(sale.statut)}>{sale.statut.replace('_', ' ')}</span>
                        </td>
                        <td className="table-cell">
                          <Link
                            href={`/ventes/${sale.id}`}
                            className="text-xs font-semibold text-[#33475b] hover:text-[#ff6b35] transition-colors"
                          >
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#dfe3eb] px-5 py-3">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-[#dfe3eb] px-3 py-1.5 text-xs font-medium text-[#33475b] transition hover:bg-[#f5f8fa] disabled:opacity-40"
              >
                ← Précédent
              </button>
              <span className="text-xs text-[#516f90]">Page {page} / {totalPages}</span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-[#dfe3eb] px-3 py-1.5 text-xs font-medium text-[#33475b] transition hover:bg-[#f5f8fa] disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

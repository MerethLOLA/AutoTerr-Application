'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
function imgUrl(p?: string | null) {
  return p ? `${API_URL}/storage/${p}` : null;
}
function money(v: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v);
}

interface Voiture {
  id: number;
  marque: string;
  modele: string;
  annee?: number;
  prix: number;
  kilometrage?: number;
  statut: string;
  energie?: string;
  image_principale?: string;
}

const STATUT: Record<string, { label: string; cls: string }> = {
  disponible:   { label: 'Disponible',   cls: 'bg-emerald-100 text-emerald-700' },
  vendu:        { label: 'Vendu',        cls: 'bg-red-100 text-red-700' },
  en_location:  { label: 'En location',  cls: 'bg-blue-100 text-blue-700' },
  reserve:      { label: 'Réservé',      cls: 'bg-amber-100 text-amber-700' },
  en_reparation:{ label: 'En réparation',cls: 'bg-purple-100 text-purple-700' },
};

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[4/3] rounded-t-2xl bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
        <div className="h-7 w-full rounded-xl bg-slate-200 mt-3" />
      </div>
    </div>
  );
}

export default function VoituresPage() {
  const [items, setItems] = useState<Voiture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dSearch, setDSearch] = useState('');
  const [energie, setEnergie] = useState('');
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setDSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params: Record<string, any> = { page };
    if (dSearch)  params.search  = dSearch;
    if (energie)  params.energie = energie;
    if (statut)   params.statut  = statut;

    apiClient.get<any>('/voitures', params)
      .then((res) => {
        if (!mounted) return;
        const data: Voiture[] = Array.isArray(res) ? res : (res?.data ?? []);
        setItems(data);
        setTotalPages(res?.meta?.last_page ?? 1);
        setTotal(res?.meta?.total ?? data.length);
      })
      .catch((err: any) => { if (mounted) setError(err?.message || 'Chargement impossible'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [dSearch, energie, statut, page]);

  const hasFilters = !!(search || energie || statut);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Parc automobile</p>
            <h1 className="page-title mt-1">Véhicules</h1>
            <p className="page-subtitle">
              {loading ? 'Chargement…' : `${total} véhicule${total !== 1 ? 's' : ''} dans le parc`}
            </p>
          </div>
          <Link href="/voitures/new" className="btn-primary shrink-0">
            + Ajouter un véhicule
          </Link>
        </div>

        {/* Filtres */}
        <div className="surface-panel p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Recherche */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par marque, modèle, châssis…"
                className="field-control py-2.5 pl-10 pr-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  ✕
                </button>
              )}
            </div>
            {/* Énergie */}
            <select className="field-control sm:w-44" value={energie}
              onChange={(e) => { setEnergie(e.target.value); setPage(1); }}>
              <option value="">Toutes énergies</option>
              {['essence', 'diesel', 'hybride', 'electrique'].map((e) => (
                <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
              ))}
            </select>
            {/* Statut */}
            <select className="field-control sm:w-44" value={statut}
              onChange={(e) => { setStatut(e.target.value); setPage(1); }}>
              <option value="">Tous statuts</option>
              {Object.entries(STATUT).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            {/* Reset */}
            {hasFilters && (
              <button onClick={() => { setSearch(''); setEnergie(''); setStatut(''); setPage(1); }}
                className="shrink-0 text-sm font-bold text-[#ff6b35] hover:underline">
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Grille de cards */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-panel py-20 text-center">
            <p className="text-2xl">🚗</p>
            <p className="mt-3 font-semibold text-slate-500">Aucun véhicule trouvé.</p>
            {hasFilters && (
              <button onClick={() => { setSearch(''); setEnergie(''); setStatut(''); }}
                className="mt-3 text-sm font-bold text-[#ff6b35] hover:underline">
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((v) => {
              const st = STATUT[v.statut] ?? { label: v.statut, cls: 'bg-slate-100 text-slate-600' };
              const photo = imgUrl(v.image_principale);
              const dispo = v.statut === 'disponible';
              return (
                <Link key={v.id} href={`/voitures/${v.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  {/* Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-slate-100">
                    {photo ? (
                      <img src={photo} alt={`${v.marque} ${v.modele}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <svg className="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                            d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5M5 11H3a1 1 0 00-1 1v1a1 1 0 001 1h2m14-2h2a1 1 0 011 1v1a1 1 0 01-1 1h-2" />
                        </svg>
                      </div>
                    )}
                    <span className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      {[v.annee, v.energie].filter(Boolean).join(' · ')}
                    </p>
                    <h3 className={`mt-1 text-base font-black transition-colors ${dispo ? 'text-[#002d54] group-hover:text-[#ff6b35]' : 'text-slate-600'}`}>
                      {v.marque} {v.modele}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {v.kilometrage != null ? `${money(v.kilometrage)} km` : 'Kilométrage N/D'}
                    </p>
                    <p className="mt-auto pt-3 text-xl font-black text-slate-900">
                      {money(v.prix)}{' '}
                      <span className="text-xs font-bold text-slate-400">XOF</span>
                    </p>
                    <div className={`mt-3 rounded-xl py-2 text-center text-xs font-bold transition ${
                      dispo
                        ? 'bg-[#ff6b35] text-white group-hover:bg-[#e85c29]'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {dispo ? 'Voir & créer une vente →' : 'Consulter →'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#002d54] transition hover:bg-slate-50 disabled:opacity-40">
              ← Précédent
            </button>
            <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#002d54] transition hover:bg-slate-50 disabled:opacity-40">
              Suivant →
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const STORAGE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '');
function imgUrl(p?: string | null) {
  return p ? `${STORAGE_URL}/storage/${p}` : null;
}
function money(v?: number | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0));
}
function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Voiture {
  id: number;
  marque: string;
  modele: string;
  annee?: number;
  prix?: number | null;
  prix_vente?: number | null;
  type_usage?: string;
  statut: string;
  energie?: string;
  image_principale?: string;
}
interface Fournisseur {
  id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  lien?: string;
  adresse_bureau?: string;
  pays_origine?: string;
  vehicule_fournis?: string;
  created_at: string;
  voitures?: Voiture[];
}

const STATUT: Record<string, { label: string; cls: string }> = {
  disponible:    { label: 'Disponible',    cls: 'bg-emerald-100 text-emerald-700' },
  vendu:         { label: 'Vendu',         cls: 'bg-slate-100 text-slate-600' },
  en_location:   { label: 'En location',   cls: 'bg-blue-100 text-blue-700' },
  reserve:       { label: 'Réservé',       cls: 'bg-amber-100 text-amber-700' },
  en_reparation: { label: 'En réparation', cls: 'bg-purple-100 text-purple-700' },
};

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800 break-all">{value}</span>
    </div>
  );
}

export default function FournisseurDetailPage() {
  const { id } = useParams();
  const _initFou = id ? apiClient.getCached<any>(`/fournisseurs/${id}`) : null;
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(_initFou?.data ?? _initFou ?? null);
  const [loading, setLoading] = useState(_initFou === null);

  useEffect(() => {
    if (!id) return;
    apiClient.get<any>(`/fournisseurs/${id}`)
      .then((res) => setFournisseur(res?.data ?? res))
      .catch(() => setFournisseur(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="grid gap-5 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl bg-slate-200" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!fournisseur) {
    return (
      <DashboardLayout>
        <div className="surface-panel py-20 text-center">
          <p className="text-sm font-semibold text-red-600">Fournisseur introuvable.</p>
          <Link href="/fournisseurs" className="mt-4 inline-block text-sm font-bold text-slate-800 hover:underline">← Retour aux fournisseurs</Link>
        </div>
      </DashboardLayout>
    );
  }

  const voitures = fournisseur.voitures ?? [];
  const disponibles = voitures.filter((v) => v.statut === 'disponible').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Fil d'ariane */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/fournisseurs" className="font-semibold hover:text-slate-800">Fournisseurs</Link>
          <span>/</span>
          <span className="font-bold text-slate-800">{fournisseur.nom}</span>
        </nav>

        {/* En-tête */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2d1b3d] text-xl font-black text-white">
              {(fournisseur.nom[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {fournisseur.pays_origine ?? 'Fournisseur'}
              </p>
              <h1 className="text-2xl font-black text-slate-900">{fournisseur.nom}</h1>
            </div>
          </div>
          <Link href={`/voitures/new?fournisseur_id=${fournisseur.id}`} className="btn-primary text-sm shrink-0">
            + Ajouter un véhicule
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Véhicules fournis</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{voitures.length}</p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Disponibles</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{disponibles}</p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Partenaire depuis</p>
            <p className="mt-2 text-lg font-black text-slate-900">{fmtDate(fournisseur.created_at)}</p>
          </div>
        </div>

        {/* Infos + Stock */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Fiche fournisseur */}
          <div className="surface-panel p-5">
            <h2 className="section-title mb-3">Coordonnées</h2>
            <Row label="Téléphone"      value={fournisseur.telephone} />
            <Row label="Email"          value={fournisseur.email} />
            <Row label="Adresse"        value={fournisseur.adresse} />
            <Row label="Adresse bureau" value={fournisseur.adresse_bureau} />
            <Row label="Pays d'origine" value={fournisseur.pays_origine} />
            {fournisseur.lien && (
              <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
                <span className="shrink-0 text-xs font-semibold text-slate-500">Site web</span>
                <a href={fournisseur.lien} target="_blank" rel="noopener noreferrer"
                  className="text-right text-xs font-semibold text-[#2d1b3d] hover:underline break-all">
                  {fournisseur.lien}
                </a>
              </div>
            )}
            {fournisseur.vehicule_fournis && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">Véhicules fournis</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">{fournisseur.vehicule_fournis}</p>
              </div>
            )}
          </div>

          {/* Stock véhicules */}
          <div className="lg:col-span-2 surface-panel">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="section-title">Stock véhicules ({voitures.length})</h2>
            </div>
            {voitures.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-400">Aucun véhicule enregistré pour ce fournisseur.</p>
            ) : (
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {voitures.map((v) => {
                  const st = STATUT[v.statut] ?? { label: v.statut, cls: 'bg-slate-100 text-slate-600' };
                  const thumb = imgUrl(v.image_principale);
                  return (
                    <Link
                      key={v.id}
                      href={`/voitures/${v.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-[#2d1b3d] hover:bg-white"
                    >
                      {thumb ? (
                        <Image src={thumb} alt="" width={64} height={48} className="h-12 w-16 shrink-0 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-400">—</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800 group-hover:text-[#2d1b3d]">
                          {v.marque} {v.modele}
                        </p>
                        <p className="text-xs text-slate-400">{[v.annee, v.energie].filter(Boolean).join(' · ')}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${st.cls}`}>{st.label}</span>
                          {v.type_usage !== 'location' && v.prix_vente ? (
                            <span className="text-xs font-semibold text-slate-600">{money(v.prix_vente)} XOF</span>
                          ) : v.prix ? (
                            <span className="text-xs font-semibold text-slate-600">{money(v.prix)} XOF/j</span>
                          ) : null}
                        </div>
                      </div>
                      <svg className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#2d1b3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

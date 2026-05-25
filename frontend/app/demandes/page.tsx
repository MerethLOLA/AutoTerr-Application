'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';

interface Demande {
  id: number;
  type: 'information' | 'reprise' | 'essai' | 'achat';
  statut: 'en_attente' | 'traite' | 'archive';
  nom: string;
  email: string;
  telephone?: string;
  message?: string;
  id_voiture?: number;
  voiture?: { id: number; marque: string; modele: string };
  reprise_marque?: string;
  reprise_modele?: string;
  reprise_annee?: number;
  reprise_kilometrage?: number;
  reprise_etat?: string;
  rendez_vous_date?: string;
  rendez_vous_heure?: string;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  information: 'Infos',
  reprise:     'Reprise',
  essai:       'Essai',
  achat:       'Achat',
};
const TYPE_COLOR: Record<string, string> = {
  information: 'bg-blue-100 text-blue-800',
  reprise:     'bg-amber-100 text-amber-800',
  essai:       'bg-violet-100 text-violet-800',
  achat:       'bg-emerald-100 text-emerald-800',
};
const STATUT_LABEL: Record<string, string> = {
  en_attente: 'En attente',
  traite:     'Traité',
  archive:    'Archivé',
};
const STATUT_COLOR: Record<string, string> = {
  en_attente: 'bg-red-100 text-red-700',
  traite:     'bg-emerald-100 text-emerald-800',
  archive:    'bg-[#f5f8fa] text-[#6b7280]',
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Badge({ cls, label }: { cls: string; label: string }) {
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export default function DemandesPage() {
  const _initDem = apiClient.getCached<any>('/demandes', { statut: 'en_attente' });
  const [demandes, setDemandes]   = useState<Demande[]>(_initDem?.data ?? []);
  const [loading, setLoading]     = useState(_initDem === null);
  const [selected, setSelected]   = useState<Demande | null>(null);
  const [updating, setUpdating]   = useState<number | null>(null);
  const [filterType, setFilterType]     = useState('');
  const [filterStatut, setFilterStatut] = useState('en_attente');

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/demandes', {
        type:   filterType   || undefined,
        statut: filterStatut || undefined,
      });
      setDemandes(res?.data ?? []);
    } catch {
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filterType, filterStatut]);

  async function updateStatut(id: number, statut: string) {
    setUpdating(id);
    try {
      await apiClient.patch(`/demandes/${id}`, { statut });
      setDemandes((prev) => prev.map((d) => d.id === id ? { ...d, statut: statut as any } : d));
      if (selected?.id === id) setSelected((s) => s ? { ...s, statut: statut as any } : s);
    } finally {
      setUpdating(null);
    }
  }

  const counts = {
    all:       demandes.length,
    en_attente: demandes.filter((d) => d.statut === 'en_attente').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#111827]">Demandes clients</h1>
            <p className="text-sm text-[#6b7280]">
              Informations, reprises, essais et demandes d&apos;achat soumis depuis le site
            </p>
          </div>
          {counts.en_attente > 0 && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
              {counts.en_attente} en attente
            </span>
          )}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}
            className="field-control w-auto">
            <option value="">Tous statuts</option>
            <option value="en_attente">En attente</option>
            <option value="traite">Traités</option>
            <option value="archive">Archivés</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="field-control w-auto">
            <option value="">Tous types</option>
            <option value="information">Demandes d&apos;infos</option>
            <option value="reprise">Reprises</option>
            <option value="essai">Essais</option>
            <option value="achat">Achats</option>
          </select>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">

          {/* ── Liste ── */}
          <div className="surface-panel overflow-hidden">
            {loading ? (
              <div className="space-y-0">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-[#f0f2f5] px-5 py-4">
                    <div className="h-4 w-16 animate-pulse rounded bg-[#f3f0f7]" />
                    <div className="h-4 flex-1 animate-pulse rounded bg-[#f3f0f7]" />
                    <div className="h-4 w-20 animate-pulse rounded bg-[#f3f0f7]" />
                  </div>
                ))}
              </div>
            ) : demandes.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-semibold text-[#6b7280]">Aucune demande trouvée</p>
                <p className="mt-1 text-sm text-[#99acc2]">Modifiez les filtres pour voir plus de résultats.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="table-header pl-5">Type</th>
                    <th className="table-header">Client</th>
                    <th className="table-header hidden md:table-cell">Véhicule</th>
                    <th className="table-header hidden sm:table-cell">Date</th>
                    <th className="table-header">Statut</th>
                    <th className="table-header" />
                  </tr>
                </thead>
                <tbody>
                  {demandes.map((d) => (
                    <tr key={d.id}
                      onClick={() => setSelected(d)}
                      className={`table-row cursor-pointer ${selected?.id === d.id ? 'bg-[#f3f0f7]' : ''}`}>
                      <td className="table-cell pl-5">
                        <Badge cls={TYPE_COLOR[d.type]} label={TYPE_LABEL[d.type]} />
                      </td>
                      <td className="table-cell">
                        <p className="font-semibold text-[#111827]">{d.nom}</p>
                        <p className="text-xs text-[#6b7280]">{d.email}</p>
                      </td>
                      <td className="table-cell hidden text-[#6b7280] md:table-cell">
                        {d.voiture ? `${d.voiture.marque} ${d.voiture.modele}` : '—'}
                      </td>
                      <td className="table-cell hidden text-xs text-[#6b7280] sm:table-cell">
                        {fmtDate(d.created_at)}
                      </td>
                      <td className="table-cell">
                        <Badge cls={STATUT_COLOR[d.statut]} label={STATUT_LABEL[d.statut]} />
                      </td>
                      <td className="table-cell pr-4 text-right">
                        <button className="text-xs font-semibold text-[#5b2d8e] hover:underline"
                          onClick={(e) => { e.stopPropagation(); setSelected(d); }}>
                          Voir →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Détail ── */}
          {selected ? (
            <div className="surface-panel p-5 space-y-4 self-start">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge cls={TYPE_COLOR[selected.type]} label={TYPE_LABEL[selected.type]} />
                    <Badge cls={STATUT_COLOR[selected.statut]} label={STATUT_LABEL[selected.statut]} />
                  </div>
                  <p className="mt-2 text-xs text-[#6b7280]">{fmtDate(selected.created_at)}</p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="rounded p-1 text-[#6b7280] hover:bg-[#f3f0f7]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 rounded-lg border border-[#dfe3eb] bg-[#f9f7fc] p-4 text-sm">
                <p><span className="font-bold text-[#33475b]">Nom :</span> {selected.nom}</p>
                <p><span className="font-bold text-[#33475b]">Email :</span>{' '}
                  <a href={`mailto:${selected.email}`} className="text-[#5b2d8e] hover:underline">{selected.email}</a>
                </p>
                {selected.telephone && (
                  <p><span className="font-bold text-[#33475b]">Tél :</span>{' '}
                    <a href={`tel:${selected.telephone}`} className="text-[#5b2d8e] hover:underline">{selected.telephone}</a>
                  </p>
                )}
                {selected.voiture && (
                  <p><span className="font-bold text-[#33475b]">Véhicule :</span> {selected.voiture.marque} {selected.voiture.modele}</p>
                )}
              </div>

              {selected.type === 'achat' && (selected.rendez_vous_date || selected.rendez_vous_heure) && (
                <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Rendez-vous souhaité</p>
                  {selected.rendez_vous_date && (
                    <p><span className="font-bold">Date :</span> {new Date(selected.rendez_vous_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  )}
                  {selected.rendez_vous_heure && (
                    <p><span className="font-bold">Heure :</span> {selected.rendez_vous_heure}</p>
                  )}
                </div>
              )}

              {selected.type === 'reprise' && (selected.reprise_marque || selected.reprise_modele) && (
                <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Véhicule à reprendre</p>
                  <p><span className="font-bold">Marque / Modèle :</span> {selected.reprise_marque} {selected.reprise_modele}</p>
                  {selected.reprise_annee && <p><span className="font-bold">Année :</span> {selected.reprise_annee}</p>}
                  {selected.reprise_kilometrage && (
                    <p><span className="font-bold">Km :</span> {new Intl.NumberFormat('fr-FR').format(selected.reprise_kilometrage)}</p>
                  )}
                  {selected.reprise_etat && (
                    <p><span className="font-bold">État :</span> {selected.reprise_etat === 'bon' ? 'Bon état' : selected.reprise_etat === 'moyen' ? 'État moyen' : 'Mauvais état'}</p>
                  )}
                </div>
              )}

              {selected.message && (
                <div className="rounded-lg border border-[#dfe3eb] p-4 text-sm">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#6b7280]">Message</p>
                  <p className="whitespace-pre-wrap text-[#33475b]">{selected.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 border-t border-[#dfe3eb] pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">Changer le statut</p>
                <div className="flex gap-2">
                  {selected.statut !== 'traite' && (
                    <button
                      disabled={updating === selected.id}
                      onClick={() => updateStatut(selected.id, 'traite')}
                      className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50">
                      ✓ Marquer traité
                    </button>
                  )}
                  {selected.statut !== 'archive' && (
                    <button
                      disabled={updating === selected.id}
                      onClick={() => updateStatut(selected.id, 'archive')}
                      className="flex-1 rounded-lg border border-[#dfe3eb] py-2 text-xs font-bold text-[#6b7280] transition hover:border-[#2d1b3d] hover:text-[#2d1b3d] disabled:opacity-50">
                      Archiver
                    </button>
                  )}
                  {selected.statut !== 'en_attente' && (
                    <button
                      disabled={updating === selected.id}
                      onClick={() => updateStatut(selected.id, 'en_attente')}
                      className="flex-1 rounded-lg border border-[#dfe3eb] py-2 text-xs font-bold text-[#6b7280] transition hover:border-[#2d1b3d] hover:text-[#2d1b3d] disabled:opacity-50">
                      Rouvrir
                    </button>
                  )}
                </div>
                <a href={`mailto:${selected.email}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2d1b3d] py-2 text-xs font-bold text-[#2d1b3d] transition hover:bg-[#f3f0f7]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Répondre par email
                </a>
              </div>
            </div>
          ) : (
            <div className="surface-panel flex items-center justify-center py-16 text-center self-start">
              <div>
                <svg className="mx-auto mb-3 h-10 w-10 text-[#c9a8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-sm font-semibold text-[#6b7280]">Sélectionnez une demande</p>
                <p className="mt-1 text-xs text-[#99acc2]">pour voir les détails et agir</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

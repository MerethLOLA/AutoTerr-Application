'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Tache {
  id: number;
  description: string;
  statut: string;
  temps_passe_minutes: number | null;
}

interface Consommation {
  id: number;
  quantite: number;
  date_consommation: string | null;
  piece?: { designation: string; reference?: string };
}

interface OrdreTravail {
  id: number;
  reference_ot: string;
  description: string;
  statut: string;
  priorite: string;
  deadline?: string | null;
  voiture?: { marque: string; modele?: string };
  technicien?: { nom: string; prenom?: string };
  ticketSav?: { reference_ticket: string };
  taches?: Tache[];
  consommations?: Consommation[];
}

const STATUTS_OT = ['ouvert', 'en_cours', 'termine', 'annule'];
const PRIORITES = ['basse', 'normale', 'haute', 'urgente'];

function badge(value: string) {
  const map: Record<string, string> = {
    ouvert: 'bg-amber-100 text-amber-800',
    en_cours: 'bg-blue-100 text-blue-800',
    termine: 'bg-emerald-100 text-emerald-800',
    annule: 'bg-[#f5f8fa] text-[#6b7280]',
    basse: 'bg-[#f5f8fa] text-[#6b7280]',
    normale: 'bg-blue-100 text-blue-800',
    haute: 'bg-orange-100 text-orange-800',
    urgente: 'bg-red-100 text-red-800',
    fait: 'bg-emerald-100 text-emerald-800',
    en_attente: 'bg-amber-100 text-amber-800',
  };
  return `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${map[value] ?? 'bg-[#f5f8fa] text-[#6b7280]'}`;
}

function fmt(minutes: number | null) {
  if (!minutes) return '-';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h${minutes % 60 ? (minutes % 60) + 'min' : ''}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OrdreTravailDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const _initOT = apiClient.getCached<{ data: OrdreTravail }>(`/ordres-travail/${id}`);
  const [ordre, setOrdre] = useState<OrdreTravail | null>(_initOT?.data ?? null);
  const [loading, setLoading] = useState(_initOT === null);
  const [error, setError] = useState<string | null>(null);
  const [statut, setStatut] = useState('');
  const [priorite, setPriorite] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<{ data: OrdreTravail }>(`/ordres-travail/${id}`)
      .then((res) => {
        const o = res.data;
        setOrdre(o);
        setStatut(o.statut);
        setPriorite(o.priorite);
      })
      .catch(() => setError('Impossible de charger l\'ordre de travail'))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatut() {
    setSaving(true);
    try {
      await apiClient.put(`/ordres-travail/${id}`, { statut, priorite });
      setOrdre((o) => o ? { ...o, statut, priorite } : o);
      setFeedback('Mis à jour.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded bg-[#f5f8fa]" />)}
        </div>
      </DashboardLayout>
    );
  }

  if (error || !ordre) {
    return (
      <DashboardLayout>
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Ordre de travail introuvable'}
        </div>
      </DashboardLayout>
    );
  }

  const name = (obj?: { nom: string; prenom?: string }) =>
    obj ? [obj.nom, obj.prenom].filter(Boolean).join(' ') : '-';

  const totalMinutes = (ordre.taches ?? []).reduce((s, t) => s + (t.temps_passe_minutes ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <nav className="mb-1 flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Link href="/atelier" className="hover:text-[#111827]">Atelier</Link>
              <span>/</span>
              <span className="font-semibold text-[#111827]">{ordre.reference_ot}</span>
            </nav>
            <h1 className="page-title">Ordre de travail</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={badge(ordre.statut)}>{ordre.statut.replace('_', ' ')}</span>
            <span className={badge(ordre.priorite)}>{ordre.priorite}</span>
          </div>
        </div>

        {feedback && (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{feedback}</div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

          {/* Colonne gauche */}
          <div className="space-y-5">

            {/* Description */}
            <section className="surface-panel p-5">
              <h2 className="section-title mb-3">Description</h2>
              <p className="text-sm text-[#6b7280] whitespace-pre-wrap">{ordre.description || '-'}</p>
            </section>

            {/* Tâches */}
            <section className="surface-panel">
              <div className="flex items-center justify-between border-b border-[#dfe3eb] px-5 py-4">
                <h2 className="section-title">
                  Tâches
                  {ordre.taches && ordre.taches.length > 0 && (
                    <span className="ml-2 rounded bg-[#f5f8fa] px-2 py-0.5 text-xs text-[#6b7280]">
                      {ordre.taches.length}
                    </span>
                  )}
                </h2>
                {totalMinutes > 0 && (
                  <span className="text-xs text-[#6b7280]">Total : {fmt(totalMinutes)}</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-header pl-5">Description</th>
                      <th className="table-header">Statut</th>
                      <th className="table-header">Temps passé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!ordre.taches || ordre.taches.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-sm text-[#6b7280]">Aucune tâche enregistrée.</td>
                      </tr>
                    ) : (
                      ordre.taches.map((tache) => (
                        <tr key={tache.id} className="table-row">
                          <td className="table-cell pl-5 font-medium text-[#111827] max-w-xs">{tache.description}</td>
                          <td className="table-cell"><span className={badge(tache.statut)}>{tache.statut.replace('_', ' ')}</span></td>
                          <td className="table-cell">{fmt(tache.temps_passe_minutes)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Consommations de pièces */}
            <section className="surface-panel">
              <div className="border-b border-[#dfe3eb] px-5 py-4">
                <h2 className="section-title">
                  Pièces consommées
                  {ordre.consommations && ordre.consommations.length > 0 && (
                    <span className="ml-2 rounded bg-[#f5f8fa] px-2 py-0.5 text-xs text-[#6b7280]">
                      {ordre.consommations.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-header pl-5">Pièce</th>
                      <th className="table-header">Référence</th>
                      <th className="table-header">Quantité</th>
                      <th className="table-header">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!ordre.consommations || ordre.consommations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-sm text-[#6b7280]">Aucune pièce consommée.</td>
                      </tr>
                    ) : (
                      ordre.consommations.map((c) => (
                        <tr key={c.id} className="table-row">
                          <td className="table-cell pl-5 font-medium text-[#111827]">{c.piece?.designation || '-'}</td>
                          <td className="table-cell text-[#6b7280]">{c.piece?.reference || '-'}</td>
                          <td className="table-cell">{c.quantite}</td>
                          <td className="table-cell">{fmtDate(c.date_consommation)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Colonne droite */}
          <div className="space-y-5">

            {/* Infos */}
            <section className="surface-panel p-5">
              <h2 className="section-title mb-4">Informations</h2>
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Référence', value: ordre.reference_ot },
                  { label: 'Véhicule', value: ordre.voiture ? `${ordre.voiture.marque} ${ordre.voiture.modele ?? ''}`.trim() : '-' },
                  { label: 'Technicien', value: name(ordre.technicien) },
                  { label: 'Ticket SAV', value: ordre.ticketSav?.reference_ticket || '-' },
                  { label: 'Deadline', value: fmtDate(ordre.deadline) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-[#6b7280]">{label}</dt>
                    <dd className="text-right font-medium text-[#111827]">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Mise à jour du statut */}
            <section className="surface-panel p-5">
              <h2 className="section-title mb-4">Mettre à jour</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#111827]">Statut</label>
                  <select className="field-control" value={statut} onChange={(e) => setStatut(e.target.value)}>
                    {STATUTS_OT.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#111827]">Priorité</label>
                  <select className="field-control" value={priorite} onChange={(e) => setPriorite(e.target.value)}>
                    {PRIORITES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={updateStatut}
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde…' : 'Enregistrer'}
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

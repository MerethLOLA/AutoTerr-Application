'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Intervention {
  id: number;
  description: string;
  statut: string;
  temps_passe_minutes: number | null;
  date_intervention: string | null;
  employe?: { nom: string; prenom?: string };
}

interface TicketSav {
  id: number;
  reference_ticket: string;
  objet: string;
  description?: string;
  statut: string;
  priorite: string;
  date_ouverture: string;
  date_resolution?: string | null;
  client?: { nom: string; prenom?: string };
  voiture?: { marque: string; modele?: string };
  responsable?: { nom: string; prenom?: string };
  interventions?: Intervention[];
  interventions_count?: number;
}

const STATUTS_TICKET = ['ouvert', 'en_cours', 'resolu', 'ferme'];
const PRIORITES = ['basse', 'normale', 'haute', 'urgente'];

function badge(value: string) {
  const map: Record<string, string> = {
    ouvert: 'bg-amber-100 text-amber-800',
    en_cours: 'bg-blue-100 text-blue-800',
    resolu: 'bg-emerald-100 text-emerald-800',
    ferme: 'bg-[#f5f8fa] text-[#516f90]',
    basse: 'bg-[#f5f8fa] text-[#516f90]',
    normale: 'bg-blue-100 text-blue-800',
    haute: 'bg-orange-100 text-orange-800',
    urgente: 'bg-red-100 text-red-800',
    terminee: 'bg-emerald-100 text-emerald-800',
  };
  return `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${map[value] ?? 'bg-[#f5f8fa] text-[#516f90]'}`;
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

export default function TicketSavDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<TicketSav | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statut, setStatut] = useState('');
  const [priorite, setPriorite] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<{ data: TicketSav }>(`/tickets-sav/${id}`)
      .then((res) => {
        const t = res.data;
        setTicket(t);
        setStatut(t.statut);
        setPriorite(t.priorite);
      })
      .catch(() => setError('Impossible de charger le ticket'))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatut() {
    setSaving(true);
    try {
      await apiClient.put(`/tickets-sav/${id}`, { statut, priorite });
      setTicket((t) => t ? { ...t, statut, priorite } : t);
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

  if (error || !ticket) {
    return (
      <DashboardLayout>
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Ticket introuvable'}
        </div>
      </DashboardLayout>
    );
  }

  const name = (obj?: { nom: string; prenom?: string }) =>
    obj ? [obj.nom, obj.prenom].filter(Boolean).join(' ') : '-';

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <nav className="mb-1 flex items-center gap-1.5 text-xs text-[#516f90]">
              <Link href="/sav" className="hover:text-[#33475b]">SAV</Link>
              <span>/</span>
              <span className="font-semibold text-[#33475b]">{ticket.reference_ticket}</span>
            </nav>
            <h1 className="page-title">{ticket.objet}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={badge(ticket.statut)}>{ticket.statut.replace('_', ' ')}</span>
            <span className={badge(ticket.priorite)}>{ticket.priorite}</span>
          </div>
        </div>

        {feedback && (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{feedback}</div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

          {/* Colonne gauche */}
          <div className="space-y-5">

            {/* Description */}
            {ticket.description && (
              <section className="surface-panel p-5">
                <h2 className="section-title mb-3">Description</h2>
                <p className="text-sm text-[#516f90] whitespace-pre-wrap">{ticket.description}</p>
              </section>
            )}

            {/* Interventions */}
            <section className="surface-panel">
              <div className="flex items-center justify-between border-b border-[#dfe3eb] px-5 py-4">
                <h2 className="section-title">
                  Interventions
                  {ticket.interventions && ticket.interventions.length > 0 && (
                    <span className="ml-2 rounded bg-[#f5f8fa] px-2 py-0.5 text-xs text-[#516f90]">
                      {ticket.interventions.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-header pl-5">Date</th>
                      <th className="table-header">Technicien</th>
                      <th className="table-header">Description</th>
                      <th className="table-header">Statut</th>
                      <th className="table-header">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!ticket.interventions || ticket.interventions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-sm text-[#516f90]">Aucune intervention enregistrée.</td>
                      </tr>
                    ) : (
                      ticket.interventions.map((inv) => (
                        <tr key={inv.id} className="table-row">
                          <td className="table-cell pl-5 font-medium text-[#33475b]">{fmtDate(inv.date_intervention)}</td>
                          <td className="table-cell">{name(inv.employe)}</td>
                          <td className="table-cell max-w-xs truncate">{inv.description || '-'}</td>
                          <td className="table-cell"><span className={badge(inv.statut)}>{inv.statut}</span></td>
                          <td className="table-cell">{fmt(inv.temps_passe_minutes)}</td>
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
                  { label: 'Référence', value: ticket.reference_ticket },
                  { label: 'Client', value: name(ticket.client) },
                  { label: 'Véhicule', value: ticket.voiture ? `${ticket.voiture.marque} ${ticket.voiture.modele ?? ''}`.trim() : '-' },
                  { label: 'Responsable', value: name(ticket.responsable) },
                  { label: 'Date ouverture', value: fmtDate(ticket.date_ouverture) },
                  { label: 'Date résolution', value: fmtDate(ticket.date_resolution) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-[#516f90]">{label}</dt>
                    <dd className="text-right font-medium text-[#33475b]">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Mise à jour du statut */}
            <section className="surface-panel p-5">
              <h2 className="section-title mb-4">Mettre à jour</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#33475b]">Statut</label>
                  <select className="field-control" value={statut} onChange={(e) => setStatut(e.target.value)}>
                    {STATUTS_TICKET.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#33475b]">Priorité</label>
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

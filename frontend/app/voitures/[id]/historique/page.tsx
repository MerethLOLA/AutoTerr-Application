'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HistoriqueVoiture {
  id: number;
  marque: string;
  modele: string;
  numero_chassis: string;
  kilometrage?: number;
  annee?: number;
  statut: string;
  ventes?: any[];
  locations?: any[];
  tickets_savs?: any[];
  ordres_travails?: any[];
  assurances?: any[];
  controles_techniques?: any[];
  entretiens?: any[];
  sinistres?: any[];
  carburants?: any[];
}

interface TimelineEvent {
  date: string;
  type: string;
  label: string;
  description: string;
  statut?: string;
  montant?: number;
  link?: string;
}

function money(v?: number | string | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0));
}

function fmtDate(d?: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function eventColor(type: string): { dot: string; line: string } {
  const map: Record<string, { dot: string; line: string }> = {
    vente:              { dot: 'bg-emerald-500', line: 'border-emerald-200' },
    location:           { dot: 'bg-blue-500',    line: 'border-blue-200' },
    sav:                { dot: 'bg-orange-500',   line: 'border-orange-200' },
    atelier:            { dot: 'bg-purple-500',   line: 'border-purple-200' },
    assurance:          { dot: 'bg-indigo-500',   line: 'border-indigo-200' },
    controle_technique: { dot: 'bg-teal-500',     line: 'border-teal-200' },
    entretien:          { dot: 'bg-cyan-500',      line: 'border-cyan-200' },
    sinistre:           { dot: 'bg-red-500',       line: 'border-red-200' },
    carburant:          { dot: 'bg-amber-500',     line: 'border-amber-200' },
  };
  return map[type] ?? { dot: 'bg-[#6b7280]', line: 'border-[#dfe3eb]' };
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    vente:              'Vente',
    location:           'Location',
    sav:                'SAV',
    atelier:            'Atelier',
    assurance:          'Assurance',
    controle_technique: 'Contrôle Tech.',
    entretien:          'Entretien',
    sinistre:           'Sinistre',
    carburant:          'Carburant',
  };
  return map[type] ?? type;
}

function buildTimeline(data: HistoriqueVoiture): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  (data.ventes ?? []).forEach((v) => events.push({
    date: v.date_vente,
    type: 'vente',
    label: v.reference_vente,
    description: `Prix : ${money(v.prix_final)} XOF`,
    statut: v.statut,
    montant: v.prix_final,
  }));

  (data.locations ?? []).forEach((l) => events.push({
    date: l.date_debut,
    type: 'location',
    label: l.reference_location,
    description: `${fmtDate(l.date_debut)} → ${fmtDate(l.date_fin)} | ${money(l.tarif_journalier)} XOF/j`,
    statut: l.statut,
  }));

  (data.tickets_savs ?? []).forEach((t) => events.push({
    date: t.date_ouverture,
    type: 'sav',
    label: t.reference_ticket,
    description: t.objet,
    statut: t.statut,
  }));

  (data.ordres_travails ?? []).forEach((o) => events.push({
    date: o.created_at,
    type: 'atelier',
    label: o.reference_ot,
    description: o.description?.slice(0, 80) ?? '-',
    statut: o.statut,
  }));

  (data.assurances ?? []).forEach((a) => events.push({
    date: a.date_debut,
    type: 'assurance',
    label: a.compagnie,
    description: `${a.type_assurance} | Fin : ${fmtDate(a.date_fin)}`,
    statut: a.statut,
  }));

  (data.controles_techniques ?? []).forEach((c) => events.push({
    date: c.date_controle,
    type: 'controle_technique',
    label: c.type_controle ?? 'Contrôle',
    description: `Résultat : ${c.resultat} | Exp. : ${fmtDate(c.date_expiration)}`,
  }));

  (data.entretiens ?? []).forEach((e) => events.push({
    date: e.date_realise ?? e.date_prevue,
    type: 'entretien',
    label: e.type_entretien,
    description: `Statut : ${e.statut}${e.cout ? ` | Coût : ${money(e.cout)} XOF` : ''}`,
    statut: e.statut,
    montant: e.cout,
  }));

  (data.sinistres ?? []).forEach((s) => events.push({
    date: s.date_sinistre,
    type: 'sinistre',
    label: s.type_sinistre ?? 'Sinistre',
    description: `${s.statut} | Dommages : ${money(s.montant_dommages)} XOF`,
    statut: s.statut,
    montant: s.montant_dommages,
  }));

  (data.carburants ?? []).forEach((c) => events.push({
    date: c.date_plein,
    type: 'carburant',
    label: `Plein ${c.type_carburant ?? ''}`,
    description: `${c.kilometrage_au_plein ? c.kilometrage_au_plein + ' km | ' : ''}${money(c.montant_total)} XOF`,
    montant: c.montant_total,
  }));

  return events
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function VehicleHistoryPage({ params }: { params: { id: string } }) {
  const _initHist = apiClient.getCached<any>(`/voitures/${params.id}/historique`);
  const [voiture, setVoiture] = useState<HistoriqueVoiture | null>(_initHist?.data ?? _initHist ?? null);
  const [loading, setLoading] = useState(_initHist === null);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<any>(`/voitures/${params.id}/historique`)
      .then((res) => { setVoiture(res?.data ?? res); setLoading(false); })
      .catch((err: any) => { setError(err?.message || 'Véhicule introuvable'); setLoading(false); });
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-[#f5f8fa]" />
          <div className="h-4 w-32 animate-pulse rounded bg-[#f5f8fa]" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded border border-[#dfe3eb] bg-[#f5f8fa]" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error || !voiture) {
    return (
      <DashboardLayout>
        <div className="surface-panel py-16 text-center">
          <p className="text-sm font-semibold text-red-600">{error ?? 'Véhicule introuvable'}</p>
          <Link href="/voitures" className="mt-4 inline-block text-sm font-bold text-[#111827] hover:underline">
            ← Retour aux véhicules
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const timeline = buildTimeline(voiture);

  /* Stats résumées */
  const totalCarburant = (voiture.carburants ?? []).reduce((s, c) => s + Number(c.montant_total ?? 0), 0);
  const totalEntretien = (voiture.entretiens ?? []).reduce((s, e) => s + Number(e.cout ?? 0), 0);
  const totalSinistres = (voiture.sinistres ?? []).reduce((s, sr) => s + Number(sr.montant_dommages ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#6b7280]">
          <Link href="/voitures" className="font-semibold hover:text-[#111827]">Véhicules</Link>
          <span>/</span>
          <Link href={`/voitures/${params.id}`} className="font-semibold hover:text-[#111827]">
            {voiture.marque} {voiture.modele}
          </Link>
          <span>/</span>
          <span className="font-bold text-[#111827]">Historique</span>
        </nav>

        <div className="page-header">
          <div>
            <h1 className="page-title mt-0.5">{voiture.marque} {voiture.modele} {voiture.annee ?? ''}</h1>
            <p className="page-subtitle">Châssis : {voiture.numero_chassis} · {voiture.kilometrage ? money(voiture.kilometrage) + ' km' : '—'}</p>
          </div>
        </div>

        {/* KPIs coût de possession */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="surface-panel p-4">
            <p className="text-xs text-[#6b7280]">Dépenses carburant</p>
            <p className="mt-1 text-xl font-bold text-[#111827]">{money(totalCarburant)} <span className="text-sm font-normal">XOF</span></p>
            <p className="mt-0.5 text-xs text-[#6b7280]">{(voiture.carburants ?? []).length} pleins</p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-xs text-[#6b7280]">Dépenses entretien</p>
            <p className="mt-1 text-xl font-bold text-[#111827]">{money(totalEntretien)} <span className="text-sm font-normal">XOF</span></p>
            <p className="mt-0.5 text-xs text-[#6b7280]">{(voiture.entretiens ?? []).length} entretiens</p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-xs text-[#6b7280]">Sinistres déclarés</p>
            <p className="mt-1 text-xl font-bold text-red-600">{money(totalSinistres)} <span className="text-sm font-normal">XOF</span></p>
            <p className="mt-0.5 text-xs text-[#6b7280]">{(voiture.sinistres ?? []).length} sinistres</p>
          </div>
        </div>

        {/* Timeline */}
        <section className="surface-panel p-5">
          <h2 className="section-title mb-5">Chronologie complète</h2>

          {timeline.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#6b7280]">Aucun événement enregistré pour ce véhicule.</p>
          ) : (
            <div className="relative">
              {/* Trait vertical */}
              <div className="absolute left-[11px] top-0 h-full w-px bg-[#dfe3eb]" />

              <div className="space-y-4 pl-8">
                {timeline.map((event, i) => {
                  const colors = eventColor(event.type);
                  return (
                    <div key={i} className="relative">
                      {/* Point */}
                      <div className={`absolute -left-8 mt-1 h-4 w-4 rounded-full border-2 border-white shadow ${colors.dot}`} />

                      <div className={`rounded border-l-2 bg-white px-4 py-3 shadow-sm ${colors.line}`}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-[#f5f8fa] px-1.5 py-0.5 text-xs font-semibold text-[#6b7280]">
                                {typeLabel(event.type)}
                              </span>
                              <span className="text-sm font-bold text-[#111827]">{event.label}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-[#6b7280]">{event.description}</p>
                          </div>
                          <span className="shrink-0 text-xs text-[#6b7280]">{fmtDate(event.date)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <div className="flex gap-3">
          <Link href={`/voitures/${params.id}`} className="btn-secondary">← Retour fiche</Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

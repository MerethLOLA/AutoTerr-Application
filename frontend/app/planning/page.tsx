'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface OT {
  id: number;
  reference_ot: string;
  description: string;
  priorite: string;
  statut: string;
  deadline?: string;
  voiture?: { id: number; marque: string; modele: string };
  technicien?: { id: number; nom: string; prenom?: string };
}

const VIOLET = '#2d1b3d';
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const result = new Date(d);
  result.setDate(d.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(d.getDate() + n);
  return result;
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function priorityColor(p: string): string {
  const map: Record<string, string> = {
    haute:    'border-red-400 bg-red-50',
    urgente:  'border-red-500 bg-red-100',
    normale:  'border-blue-300 bg-blue-50',
    basse:    'border-[#dfe3eb] bg-[#f5f8fa]',
  };
  return map[p] ?? 'border-[#dfe3eb] bg-[#f5f8fa]';
}

function statutBadge(s: string): string {
  const map: Record<string, string> = {
    ouvert:      'bg-amber-100 text-amber-800',
    en_cours:    'bg-blue-100 text-blue-800',
    termine:     'bg-emerald-100 text-emerald-800',
    annule:      'bg-[#f5f8fa] text-[#516f90]',
  };
  return `inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${map[s] ?? 'bg-[#f5f8fa] text-[#516f90]'}`;
}

export default function PlanningPage() {
  const [ots, setOts]           = useState<OT[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [selected, setSelected] = useState<OT | null>(null);

  const loadOTs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<any>('/ordres-travail', { per_page: 200 });
      setOts(res?.data ?? res ?? []);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les ordres de travail');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOTs(); }, [loadOTs]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function otForDay(day: Date): OT[] {
    const iso = isoDate(day);
    return ots.filter((ot) => {
      if (!ot.deadline) return false;
      return ot.deadline.slice(0, 10) === iso;
    });
  }

  const noDeadline = ots.filter((ot) => !ot.deadline && !['termine', 'annule'].includes(ot.statut));

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Atelier</p>
            <h1 className="page-title mt-0.5">Planning Atelier</h1>
            <p className="page-subtitle">Visualisez les ordres de travail par semaine.</p>
          </div>
          <Link href="/atelier" className="btn-primary shrink-0">
            Nouvel OT
          </Link>
        </div>

        {/* Navigation semaine */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="rounded border border-[#dfe3eb] px-3 py-1.5 text-xs font-medium text-[#33475b] transition hover:bg-[#f5f8fa]"
          >
            ← Semaine préc.
          </button>
          <span className="text-sm font-semibold text-[#33475b]">
            {fmtDay(weekStart)} — {fmtDay(addDays(weekStart, 6))}
          </span>
          <button
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="rounded border border-[#dfe3eb] px-3 py-1.5 text-xs font-medium text-[#33475b] transition hover:bg-[#f5f8fa]"
          >
            Semaine suiv. →
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="ml-2 rounded border border-[#dfe3eb] px-3 py-1.5 text-xs font-medium text-[#516f90] transition hover:bg-[#f5f8fa]"
          >
            Aujourd&apos;hui
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded border border-[#dfe3eb] bg-[#f5f8fa]" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <div className="grid min-w-[700px] grid-cols-7 gap-2">
              {weekDays.map((day, i) => {
                const isToday = isoDate(day) === isoDate(new Date());
                const dayOTs = otForDay(day);
                return (
                  <div key={i} className={`rounded border ${isToday ? 'border-[#2d1b3d]' : 'border-[#dfe3eb]'} bg-white`}>
                    {/* Header jour */}
                    <div className={`rounded-t px-2 py-1.5 text-center text-xs font-bold ${isToday ? 'text-white' : 'text-[#516f90]'}`}
                      style={{ backgroundColor: isToday ? VIOLET : '#f5f8fa' }}>
                      {DAYS_FR[i]}<br />
                      <span className="font-normal">{fmtDay(day)}</span>
                    </div>

                    {/* OTs du jour */}
                    <div className="space-y-1.5 p-1.5">
                      {dayOTs.length === 0 ? (
                        <p className="py-4 text-center text-xs text-[#dfe3eb]">—</p>
                      ) : (
                        dayOTs.map((ot) => (
                          <button
                            key={ot.id}
                            onClick={() => setSelected(ot)}
                            className={`w-full rounded border-l-2 px-2 py-1.5 text-left transition hover:opacity-80 ${priorityColor(ot.priorite)}`}
                          >
                            <p className="truncate text-xs font-bold text-[#33475b]">{ot.reference_ot}</p>
                            <p className="truncate text-xs text-[#516f90]">
                              {ot.voiture ? `${ot.voiture.marque} ${ot.voiture.modele}` : '-'}
                            </p>
                            <span className={statutBadge(ot.statut)}>{ot.statut.replace('_', ' ')}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* OTs sans deadline */}
        {!loading && noDeadline.length > 0 && (
          <section className="surface-panel">
            <div className="border-b border-[#dfe3eb] px-5 py-3">
              <h2 className="section-title">Sans deadline ({noDeadline.length})</h2>
            </div>
            <div className="divide-y divide-[#dfe3eb]">
              {noDeadline.map((ot) => (
                <button
                  key={ot.id}
                  onClick={() => setSelected(ot)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-[#f5f8fa]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#33475b]">{ot.reference_ot}</p>
                    <p className="text-xs text-[#516f90]">{ot.voiture ? `${ot.voiture.marque} ${ot.voiture.modele}` : '-'}</p>
                  </div>
                  <span className={statutBadge(ot.statut)}>{ot.statut.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Panneau latéral OT sélectionné */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelected(null)}>
            <div className="w-full max-w-sm rounded-sm bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between border-b border-[#dfe3eb] px-5 py-4">
                <div>
                  <p className="text-xs font-semibold text-[#516f90]">Ordre de travail</p>
                  <h3 className="text-base font-bold text-[#33475b]">{selected.reference_ot}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#516f90] hover:text-[#33475b]">✕</button>
              </div>
              <div className="space-y-3 px-5 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-xs text-[#516f90]">Statut</span>
                  <span className={statutBadge(selected.statut)}>{selected.statut.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#516f90]">Priorité</span>
                  <span className="font-semibold text-[#33475b]">{selected.priorite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#516f90]">Véhicule</span>
                  <span className="font-semibold text-[#33475b]">
                    {selected.voiture ? `${selected.voiture.marque} ${selected.voiture.modele}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#516f90]">Technicien</span>
                  <span className="font-semibold text-[#33475b]">
                    {selected.technicien ? `${selected.technicien.nom}${selected.technicien.prenom ? ' ' + selected.technicien.prenom : ''}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#516f90]">Deadline</span>
                  <span className="font-semibold text-[#33475b]">
                    {selected.deadline ? new Date(selected.deadline).toLocaleDateString('fr-FR') : 'Non fixée'}
                  </span>
                </div>
                <p className="border-t border-[#dfe3eb] pt-3 text-xs leading-relaxed text-[#516f90]">{selected.description}</p>
              </div>
              <div className="border-t border-[#dfe3eb] px-5 py-3">
                <Link href="/atelier" className="text-xs font-semibold text-[#ff6b35] hover:underline">
                  Voir tous les OT →
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

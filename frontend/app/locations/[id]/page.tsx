'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface EtatDesLieux {
  id: number;
  type_etat: string;
  description?: string | null;
  date_etat: string | null;
  chemin_photo?: string | null;
}

interface Location {
  id: number;
  reference_location: string;
  statut: string;
  date_debut: string;
  date_fin: string;
  date_retour_effective?: string | null;
  tarif_journalier: number;
  caution?: number | null;
  observations?: string | null;
  client?: { nom: string; prenom?: string };
  voiture?: { marque: string; modele?: string };
  etatsDesLieux?: EtatDesLieux[];
}

const STATUTS_LOCATION = ['planifiee', 'en_cours', 'terminee', 'annulee'];

function badge(value: string) {
  const map: Record<string, string> = {
    planifiee: 'bg-amber-100 text-amber-800',
    en_cours: 'bg-blue-100 text-blue-800',
    terminee: 'bg-emerald-100 text-emerald-800',
    annulee: 'bg-[#f5f8fa] text-[#516f90]',
    depart: 'bg-blue-100 text-blue-800',
    retour: 'bg-emerald-100 text-emerald-800',
  };
  return `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${map[value] ?? 'bg-[#f5f8fa] text-[#516f90]'}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtMoney(n: number | null | undefined) {
  if (n == null) return '-';
  return new Intl.NumberFormat('fr-FR').format(n) + ' XOF';
}

export default function LocationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statut, setStatut] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<{ data: Location }>(`/locations/${id}`)
      .then((res) => {
        const l = res.data;
        setLocation(l);
        setStatut(l.statut);
      })
      .catch(() => setError('Impossible de charger la location'))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatut() {
    setSaving(true);
    try {
      await apiClient.put(`/locations/${id}`, { statut });
      setLocation((l) => l ? { ...l, statut } : l);
      setFeedback('Statut mis à jour.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  async function exportPdf() {
    if (!location) return;
    setDownloading(true);
    try {
      await apiClient.download(
        `/locations/${id}/export`,
        `contrat-${location.reference_location}.pdf`,
      );
    } catch {
      // silently ignore
    } finally {
      setDownloading(false);
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

  if (error || !location) {
    return (
      <DashboardLayout>
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Location introuvable'}
        </div>
      </DashboardLayout>
    );
  }

  const name = (obj?: { nom: string; prenom?: string }) =>
    obj ? [obj.nom, obj.prenom].filter(Boolean).join(' ') : '-';

  const jours = Math.max(1, Math.round(
    (new Date(location.date_fin).getTime() - new Date(location.date_debut).getTime()) / 86400000
  ));
  const montantTotal = location.tarif_journalier * jours;

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <nav className="mb-1 flex items-center gap-1.5 text-xs text-[#516f90]">
              <Link href="/locations" className="hover:text-[#33475b]">Locations</Link>
              <span>/</span>
              <span className="font-semibold text-[#33475b]">{location.reference_location}</span>
            </nav>
            <h1 className="page-title">Contrat de location</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={badge(location.statut)}>{location.statut.replace('_', ' ')}</span>
            <button
              type="button"
              onClick={exportPdf}
              disabled={downloading}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading ? 'Génération…' : 'Exporter PDF'}
            </button>
          </div>
        </div>

        {feedback && (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{feedback}</div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

          {/* Colonne gauche */}
          <div className="space-y-5">

            {/* Résumé financier */}
            <section className="surface-panel p-5">
              <h2 className="section-title mb-4">Résumé financier</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Tarif / jour', value: fmtMoney(location.tarif_journalier) },
                  { label: 'Durée', value: `${jours} jour${jours > 1 ? 's' : ''}` },
                  { label: 'Montant total', value: fmtMoney(montantTotal) },
                  { label: 'Caution', value: fmtMoney(location.caution) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3">
                    <p className="text-xs text-[#516f90]">{label}</p>
                    <p className="mt-1 text-sm font-bold text-[#33475b]">{value}</p>
                  </div>
                ))}
              </div>
              {location.observations && (
                <div className="mt-4 rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3">
                  <p className="text-xs font-semibold text-[#516f90]">Observations</p>
                  <p className="mt-1 text-sm text-[#33475b]">{location.observations}</p>
                </div>
              )}
            </section>

            {/* États des lieux */}
            <section className="surface-panel">
              <div className="border-b border-[#dfe3eb] px-5 py-4">
                <h2 className="section-title">
                  États des lieux
                  {location.etatsDesLieux && location.etatsDesLieux.length > 0 && (
                    <span className="ml-2 rounded bg-[#f5f8fa] px-2 py-0.5 text-xs text-[#516f90]">
                      {location.etatsDesLieux.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-header pl-5">Type</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!location.etatsDesLieux || location.etatsDesLieux.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-sm text-[#516f90]">Aucun état des lieux enregistré.</td>
                      </tr>
                    ) : (
                      location.etatsDesLieux.map((etat) => (
                        <tr key={etat.id} className="table-row">
                          <td className="table-cell pl-5">
                            <span className={badge(etat.type_etat)}>
                              {etat.type_etat === 'depart' ? 'Départ' : etat.type_etat === 'retour' ? 'Retour' : etat.type_etat}
                            </span>
                          </td>
                          <td className="table-cell font-medium text-[#33475b]">{fmtDate(etat.date_etat)}</td>
                          <td className="table-cell text-[#516f90] max-w-xs truncate">{etat.description || '-'}</td>
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
                  { label: 'Référence', value: location.reference_location },
                  { label: 'Client', value: name(location.client) },
                  { label: 'Véhicule', value: location.voiture ? `${location.voiture.marque} ${location.voiture.modele ?? ''}`.trim() : '-' },
                  { label: 'Début', value: fmtDate(location.date_debut) },
                  { label: 'Fin prévue', value: fmtDate(location.date_fin) },
                  { label: 'Retour effectif', value: fmtDate(location.date_retour_effective) },
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
                    {STATUTS_LOCATION.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
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

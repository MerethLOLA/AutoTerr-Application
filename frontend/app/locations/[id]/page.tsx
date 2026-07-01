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

interface Paiement {
  id: number;
  date: string;
  mode_paiement: string;
  montant: number;
  reste: number;
}

interface Facture {
  id: number;
  numero_facture: string;
  date_facture: string;
  montant_ht: number;
  taux_tva: number;
  montant_ttc: number;
  statut: string;
  date_echeance?: string | null;
  observations?: string | null;
  paiements: Paiement[];
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

const MODES_PAIEMENT = ['especes', 'virement', 'cheque', 'carte', 'mobile_money'];

function badge(value: string) {
  const map: Record<string, string> = {
    planifiee: 'bg-amber-100 text-amber-800',
    en_cours: 'bg-blue-100 text-blue-800',
    terminee: 'bg-emerald-100 text-emerald-800',
    annulee: 'bg-[#f5f8fa] text-[#6b7280]',
    depart: 'bg-blue-100 text-blue-800',
    retour: 'bg-emerald-100 text-emerald-800',
    impayee: 'bg-red-100 text-red-700',
    partiellement_payee: 'bg-amber-100 text-amber-700',
    payee: 'bg-emerald-100 text-emerald-700',
    en_retard: 'bg-red-100 text-red-700',
  };
  return `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${map[value] ?? 'bg-[#f5f8fa] text-[#6b7280]'}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtMoney(n: number | null | undefined) {
  if (n == null) return '-';
  return new Intl.NumberFormat('fr-FR').format(n) + ' XOF';
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function LocationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const _initLoc = apiClient.getCached<{ data: Location }>(`/locations/${id}`);
  const [location, setLocation] = useState<Location | null>(_initLoc?.data ?? null);
  const [loading, setLoading] = useState(_initLoc === null);
  const [error, setError] = useState<string | null>(null);
  const [statut, setStatut] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // État des lieux form
  const [showEtatForm, setShowEtatForm] = useState(false);
  const [etatForm, setEtatForm] = useState({ type_etat: 'depart', date_etat: todayISO(), description: '' });
  const [savingEtat, setSavingEtat] = useState(false);
  const [etatError, setEtatError] = useState<string | null>(null);

  // Facturation — chargée directement depuis location.facturation
  const [facture, setFacture] = useState<Facture | null>(null);
  const [genForm, setGenForm] = useState({ taux_tva: '18', tarif_journalier: '', date_echeance: '', observations: '' });
  const [generatingFacture, setGeneratingFacture] = useState(false);
  const [factureError, setFactureError] = useState<string | null>(null);

  // Paiement form
  const [showPaiForm, setShowPaiForm] = useState(false);
  const [paiForm, setPaiForm] = useState({ montant: '', mode_paiement: 'especes', date: todayISO() });
  const [savingPai, setSavingPai] = useState(false);
  const [paiError, setPaiError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<{ data: Location }>(`/locations/${id}`)
      .then((res) => {
        const l = res.data;
        setLocation(l);
        setStatut(l.statut);
        setFacture((l as any).facturation ?? null);
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

  async function submitEtat(e: React.FormEvent) {
    e.preventDefault();
    setSavingEtat(true);
    setEtatError(null);
    try {
      const res = await apiClient.post<{ data: EtatDesLieux }>(`/locations/${id}/etats-lieux`, etatForm);
      setLocation((l) => l ? { ...l, etatsDesLieux: [...(l.etatsDesLieux ?? []), res.data] } : l);
      setEtatForm({ type_etat: 'depart', date_etat: todayISO(), description: '' });
      setShowEtatForm(false);
      setFeedback('État des lieux enregistré.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setEtatError(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSavingEtat(false);
    }
  }


  async function generateAndPay(e: React.FormEvent) {
    e.preventDefault();
    setGeneratingFacture(true);
    setFactureError(null);
    try {
      const payload: Record<string, string> = { taux_tva: genForm.taux_tva };
      if (genForm.tarif_journalier) payload.tarif_journalier = genForm.tarif_journalier;
      if (genForm.date_echeance) payload.date_echeance = genForm.date_echeance;
      const res = await apiClient.post<{ data: Facture }>(`/locations/${id}/facture`, payload);
      setFacture(res.data);
      setGeneratingFacture(false);
      if (paiForm.montant) {
        setSavingPai(true);
        const res2 = await apiClient.post<any>(`/locations/${id}/paiements`, paiForm);
        setFacture((res2 as any).facture ?? res2.data ?? res.data);
        setSavingPai(false);
      }
      setShowPaiForm(false);
      setPaiForm({ montant: '', mode_paiement: 'especes', date: todayISO() });
      setFeedback('Paiement enregistré.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFactureError(err?.response?.data?.message || 'Erreur');
      setGeneratingFacture(false);
      setSavingPai(false);
    }
  }

  async function addPaiement(e: React.FormEvent) {
    e.preventDefault();
    setSavingPai(true);
    setPaiError(null);
    try {
      const res = await apiClient.post<{ data: Paiement; facture: Facture }>(`/locations/${id}/paiements`, paiForm);
      const updated = (res as any).facture ?? null;
      if (updated) {
        setFacture(updated);
      } else {
        setFacture((f) => f ? {
          ...f,
          paiements: [...(f.paiements ?? []), res.data],
        } : f);
      }
      setPaiForm({ montant: '', mode_paiement: 'especes', date: todayISO() });
      setShowPaiForm(false);
      setFeedback('Paiement enregistré.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setPaiError(err?.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setSavingPai(false);
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

  const totalPaye = facture?.paiements?.reduce((s, p) => s + Number(p.montant), 0) ?? 0;
  const resteAPayer = facture ? Math.max(facture.montant_ttc - totalPaye, 0) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-5">

        <div className="page-header">
          <div>
            <h1 className="page-title">Contrat de location</h1>
            <p className="page-subtitle">Détail du contrat, état des lieux et suivi des paiements.</p>
          </div>
          <div className="flex shrink-0 gap-2">
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
              {downloading ? 'Génération…' : 'Contrat PDF'}
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
                  { label: 'Montant total HT', value: fmtMoney(montantTotal) },
                  { label: 'Caution', value: fmtMoney(location.caution) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3">
                    <p className="text-xs text-[#6b7280]">{label}</p>
                    <p className="mt-1 text-sm font-bold text-[#111827]">{value}</p>
                  </div>
                ))}
              </div>
              {location.observations && (
                <div className="mt-4 rounded border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3">
                  <p className="text-xs font-semibold text-[#6b7280]">Observations</p>
                  <p className="mt-1 text-sm text-[#111827]">{location.observations}</p>
                </div>
              )}
            </section>

            {/* ── Paiements ─────────────────────────────────── */}
            <section className="surface-panel">
              <div className="flex items-center justify-between border-b border-[#dfe3eb] px-5 py-4">
                <h2 className="section-title">
                  Paiements
                  {facture && <span className={`ml-2 ${badge(facture.statut)}`}>{facture.statut.replace('_', ' ')}</span>}
                </h2>
                {facture && facture.statut !== 'payee' && location.statut !== 'annulee' && (
                  <button type="button" onClick={() => setShowPaiForm((v) => !v)}
                    className="inline-flex items-center gap-1 rounded border border-[#dfe3eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] transition hover:border-emerald-600 hover:bg-emerald-600 hover:text-white">
                    {showPaiForm ? 'Annuler' : '+ Enregistrer un paiement'}
                  </button>
                )}
                {!facture && location.statut !== 'annulee' && (
                  <button type="button" onClick={() => setShowPaiForm((v) => !v)}
                    className="inline-flex items-center gap-1 rounded border border-[#dfe3eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] transition hover:border-[#185FA5] hover:bg-[#185FA5] hover:text-white">
                    {showPaiForm ? 'Annuler' : '+ Définir le montant'}
                  </button>
                )}
              </div>

              {/* Résumé montants si facture */}
              {facture && (
                <div className="grid grid-cols-2 gap-4 border-b border-[#dfe3eb] px-5 py-4 sm:grid-cols-4">
                  {[
                    { label: 'N° facture', value: facture.numero_facture },
                    { label: 'Total TTC', value: fmtMoney(facture.montant_ttc) },
                    { label: 'Payé', value: fmtMoney(totalPaye) },
                    { label: 'Reste à payer', value: fmtMoney(resteAPayer) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-[#6b7280]">{label}</p>
                      <p className="mt-0.5 text-sm font-bold text-[#111827]">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulaire paiement (ou définir montant si pas de facture) */}
              {showPaiForm && (
                <form onSubmit={facture ? addPaiement : generateAndPay}
                  className="border-b border-[#dfe3eb] bg-[#f5f8fa] px-5 py-4">
                  {!facture && (
                    <div className="mb-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#111827]">Tarif / jour (XOF) *</label>
                        <input type="number" className="field-control" min="0" step="1" required
                          placeholder={String(location.tarif_journalier || '')}
                          value={genForm.tarif_journalier}
                          onChange={(e) => setGenForm((f) => ({ ...f, tarif_journalier: e.target.value }))} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#111827]">TVA (%)</label>
                        <input type="number" className="field-control" min="0" max="100" step="0.01"
                          value={genForm.taux_tva}
                          onChange={(e) => setGenForm((f) => ({ ...f, taux_tva: e.target.value }))} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#111827]">Date d'échéance</label>
                        <input type="date" className="field-control"
                          value={genForm.date_echeance}
                          onChange={(e) => setGenForm((f) => ({ ...f, date_echeance: e.target.value }))} />
                      </div>
                    </div>
                  )}
                  {facture && (
                    <p className="mb-3 text-xs font-semibold text-emerald-800">Reste à payer : {fmtMoney(resteAPayer)}</p>
                  )}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#111827]">Montant *</label>
                      <input type="number" className="field-control" min="1" step="1" required
                        placeholder={facture ? String(Math.round(resteAPayer)) : ''}
                        value={paiForm.montant}
                        onChange={(e) => setPaiForm((f) => ({ ...f, montant: e.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#111827]">Mode *</label>
                      <select className="field-control" required value={paiForm.mode_paiement}
                        onChange={(e) => setPaiForm((f) => ({ ...f, mode_paiement: e.target.value }))}>
                        {MODES_PAIEMENT.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#111827]">Date *</label>
                      <input type="date" className="field-control" required value={paiForm.date}
                        onChange={(e) => setPaiForm((f) => ({ ...f, date: e.target.value }))} />
                    </div>
                  </div>
                  {(paiError || factureError) && (
                    <p className="mt-2 text-xs text-red-600">{paiError || factureError}</p>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button type="submit" disabled={savingPai || generatingFacture} className="btn-primary">
                      {(savingPai || generatingFacture) ? 'Enregistrement…' : 'Valider'}
                    </button>
                  </div>
                </form>
              )}

              {/* Historique paiements */}
              {facture && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="table-header pl-5">Date</th>
                        <th className="table-header">Mode</th>
                        <th className="table-header text-right pr-5">Montant</th>
                        <th className="table-header text-right pr-5">Reste</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!facture.paiements || facture.paiements.length === 0 ? (
                        <tr><td colSpan={4} className="px-5 py-6 text-sm text-[#6b7280]">Aucun paiement enregistré.</td></tr>
                      ) : (
                        facture.paiements.map((p) => (
                          <tr key={p.id} className="table-row">
                            <td className="table-cell pl-5 font-medium text-[#111827]">{fmtDate(p.date)}</td>
                            <td className="table-cell capitalize">{p.mode_paiement.replace('_', ' ')}</td>
                            <td className="table-cell text-right pr-5 text-emerald-700 font-semibold tabular-nums">{fmtMoney(p.montant)}</td>
                            <td className="table-cell text-right pr-5 tabular-nums text-[#6b7280]">{fmtMoney(p.reste)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {!facture && !showPaiForm && location.statut !== 'annulee' && (
                <p className="px-5 py-6 text-sm text-[#6b7280]">
                  Aucun montant défini. Cliquez sur « + Définir le montant » pour enregistrer le premier paiement.
                </p>
              )}
            </section>

            {/* États des lieux */}
            <section className="surface-panel">
              <div className="flex items-center justify-between border-b border-[#dfe3eb] px-5 py-4">
                <h2 className="section-title">
                  États des lieux
                  {location.etatsDesLieux && location.etatsDesLieux.length > 0 && (
                    <span className="ml-2 rounded bg-[#f5f8fa] px-2 py-0.5 text-xs text-[#6b7280]">
                      {location.etatsDesLieux.length}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowEtatForm((v) => !v)}
                  className="inline-flex items-center gap-1 rounded border border-[#dfe3eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] transition hover:border-[#185FA5] hover:bg-[#185FA5] hover:text-white"
                >
                  {showEtatForm ? 'Annuler' : '+ Ajouter'}
                </button>
              </div>

              {showEtatForm && (
                <form onSubmit={submitEtat} className="border-b border-[#dfe3eb] bg-[#f5f8fa] px-5 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#111827]">Type *</label>
                      <select
                        className="field-control"
                        value={etatForm.type_etat}
                        onChange={(e) => setEtatForm((f) => ({ ...f, type_etat: e.target.value }))}
                        required
                      >
                        <option value="depart">Départ</option>
                        <option value="retour">Retour</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#111827]">Date *</label>
                      <input
                        type="date"
                        className="field-control"
                        value={etatForm.date_etat}
                        onChange={(e) => setEtatForm((f) => ({ ...f, date_etat: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-[#111827]">Description / observations</label>
                      <textarea
                        className="field-control resize-none"
                        rows={3}
                        placeholder="État général du véhicule, dommages constatés…"
                        value={etatForm.description}
                        onChange={(e) => setEtatForm((f) => ({ ...f, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  {etatError && <p className="mt-2 text-xs text-red-600">{etatError}</p>}
                  <div className="mt-3 flex justify-end">
                    <button type="submit" disabled={savingEtat} className="btn-primary">
                      {savingEtat ? 'Enregistrement…' : "Enregistrer l'état"}
                    </button>
                  </div>
                </form>
              )}

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
                        <td colSpan={3} className="px-5 py-8 text-sm text-[#6b7280]">Aucun état des lieux enregistré.</td>
                      </tr>
                    ) : (
                      location.etatsDesLieux.map((etat) => (
                        <tr key={etat.id} className="table-row">
                          <td className="table-cell pl-5">
                            <span className={badge(etat.type_etat)}>
                              {etat.type_etat === 'depart' ? 'Départ' : etat.type_etat === 'retour' ? 'Retour' : etat.type_etat}
                            </span>
                          </td>
                          <td className="table-cell font-medium text-[#111827]">{fmtDate(etat.date_etat)}</td>
                          <td className="table-cell text-[#6b7280] max-w-xs truncate">{etat.description || '-'}</td>
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
                    <dt className="text-[#6b7280]">{label}</dt>
                    <dd className="text-right font-medium text-[#111827]">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Mise à jour du statut */}
            <section className="surface-panel p-5">
              <h2 className="section-title mb-4">Mettre à jour le statut</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#111827]">Statut</label>
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

            {/* Récap paiement rapide */}
            {facture && (
              <section className="surface-panel p-5">
                <h2 className="section-title mb-3">Statut de paiement</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Facture</span>
                    <span className="font-semibold text-[#111827]">{facture.numero_facture}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Total TTC</span>
                    <span className="font-bold text-[#111827]">{fmtMoney(facture.montant_ttc)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Payé</span>
                    <span className="font-bold text-emerald-700">{fmtMoney(totalPaye)}</span>
                  </div>
                  <div className="my-1 h-px bg-[#dfe3eb]" />
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Reste</span>
                    <span className={`font-black ${resteAPayer > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {fmtMoney(resteAPayer)}
                    </span>
                  </div>
                  {/* Barre de progression */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#dfe3eb]">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${facture.montant_ttc > 0 ? Math.min((totalPaye / facture.montant_ttc) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-[#6b7280]">
                    {facture.montant_ttc > 0 ? Math.round((totalPaye / facture.montant_ttc) * 100) : 0}% payé
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

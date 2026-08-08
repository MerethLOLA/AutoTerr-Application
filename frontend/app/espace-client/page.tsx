'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Profile { id: number; name: string; email: string; role: string; client_id?: number; }

interface LocationItem {
  id: number;
  reference_location?: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  tarif_journalier?: number;
  voiture?: { id: number; marque?: string; modele?: string; image_principale?: string };
}

interface FacturationItem {
  id: number;
  numero_facture: string;
  montant_ttc: number | string;
  statut: string;
  date_facture?: string;
  vente?: { voiture?: { marque?: string; modele?: string } };
  location?: { voiture?: { marque?: string; modele?: string } };
}

interface DocumentItem {
  id: number;
  type_document: string;
  numero_document?: string;
  date_expiration?: string;
  voiture?: { marque?: string; modele?: string };
}

interface VoitureOption {
  id: number; marque: string; modele: string;
  prix?: number; prix_vente?: number; type_usage?: string;
  image_principale?: string; energie?: string;
}

interface DemandeItem {
  id: number;
  type: 'information' | 'reprise' | 'essai' | 'achat';
  statut: 'en_attente' | 'traite' | 'archive';
  message?: string;
  voiture?: { marque?: string; modele?: string };
  reprise_marque?: string; reprise_modele?: string;
  rendez_vous_date?: string; rendez_vous_heure?: string;
  created_at: string;
}

interface PortalResponse {
  profile: Profile;
  locations: LocationItem[];
  facturations: FacturationItem[];
  documents: DocumentItem[];
  demandes: DemandeItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function money(v?: number | string) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v || 0));
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function diffDays(a: string, b: string) {
  return Math.max(1, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000));
}
function imgUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/storage/${path}`;
}
function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

const STATUT_LABEL: Record<string, string> = {
  planifiee: 'Planifiée', en_cours: 'En cours', en_retard: 'En retard',
  terminee: 'Terminée', annulee: 'Annulée',
  payee: 'Payée', impayee: 'Impayée', partiellement_payee: 'Partielle',
};

const STATUT_BADGE: Record<string, string> = {
  planifiee: 'bg-amber-100 text-amber-800',
  en_cours:  'bg-blue-100 text-blue-800',
  en_retard: 'bg-red-100 text-red-800',
  terminee:  'bg-emerald-100 text-emerald-800',
  annulee:   'bg-[#f5f8fa] text-[#6b7280]',
  payee:     'bg-emerald-100 text-emerald-800',
  impayee:   'bg-red-100 text-red-700',
  partiellement_payee: 'bg-amber-100 text-amber-800',
};

function Badge({ statut }: { statut: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${STATUT_BADGE[statut] ?? 'bg-[#f5f8fa] text-[#6b7280]'}`}>
      {STATUT_LABEL[statut] ?? statut.replace('_', ' ')}
    </span>
  );
}

// ── Timeline statut location ───────────────────────────────────────────────────
function LocationTimeline({ loc }: { loc: LocationItem }) {
  const steps = ['planifiee', 'en_cours', 'terminee'];
  const cur = steps.indexOf(loc.statut === 'en_retard' ? 'en_cours' : loc.statut);
  const isCancelled = loc.statut === 'annulee';
  const days = diffDays(loc.date_debut, loc.date_fin);
  const cost = loc.tarif_journalier && loc.tarif_journalier > 0 ? loc.tarif_journalier * days : null;

  return (
    <div className="rounded-lg border border-[#dfe3eb] bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {loc.voiture?.image_principale ? (
            <Image src={imgUrl(loc.voiture.image_principale)!} alt="" width={64} height={48} className="h-12 w-16 rounded object-cover shrink-0" />
          ) : (
            <div className="flex h-12 w-16 items-center justify-center rounded bg-[#f5f8fa] shrink-0">
              <svg className="h-5 w-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
              </svg>
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-[#111827]">
              {loc.voiture ? `${loc.voiture.marque} ${loc.voiture.modele}` : loc.reference_location}
            </p>
            <p className="text-xs text-[#6b7280]">{fmtDate(loc.date_debut)} → {fmtDate(loc.date_fin)} · {days} jour{days > 1 ? 's' : ''}</p>
            {cost && <p className="text-xs font-semibold text-[#111827]">{money(cost)} XOF estimé</p>}
          </div>
        </div>
        <Badge statut={loc.statut} />
      </div>

      {!isCancelled && (
        <div className="flex items-center gap-1">
          {steps.map((step, i) => (
            <div key={step} className="flex flex-1 items-center gap-1">
              <div className={`h-2 flex-1 rounded-full transition-all ${i <= cur ? 'bg-[#185FA5]' : 'bg-[#dfe3eb]'}`} />
              {i < steps.length - 1 && (
                <div className={`h-2 w-2 shrink-0 rounded-full ${i < cur ? 'bg-[#185FA5]' : 'bg-[#dfe3eb]'}`} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function EspaceClientPage() {
  const _initPortal = apiClient.getCached<PortalResponse>('/customer/portal');
  const _initVoit   = apiClient.getCached<any>('/voitures/public', { type_usage: 'location', per_page: 48 });
  const [profile, setProfile]       = useState<Profile | null>(_initPortal?.profile ?? null);
  const [locations, setLocations]   = useState<LocationItem[]>(_initPortal?.locations ?? []);
  const [facturations, setFacturations] = useState<FacturationItem[]>(_initPortal?.facturations ?? []);
  const [documents, setDocuments]   = useState<DocumentItem[]>(_initPortal?.documents ?? []);
  const [demandes, setDemandes]     = useState<DemandeItem[]>(_initPortal?.demandes ?? []);
  const [voitures, setVoitures]     = useState<VoitureOption[]>(_initVoit?.data ?? _initVoit ?? []);
  const [loading, setLoading]       = useState(_initPortal === null);
  const [saving, setSaving]         = useState(false);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [feedback, setFeedback]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [activeTab, setActiveTab]   = useState<'locations' | 'factures' | 'documents' | 'demandes'>('locations');
  const [form, setForm] = useState({ id_voiture: '', date_debut: '', date_fin: '', observations: '' });

  async function load() {
    const [portal, voit] = await Promise.all([
      apiClient.get<PortalResponse>('/customer/portal'),
      apiClient.getPublicVoitures({ type_usage: 'location', per_page: 48 }),
    ]);
    setProfile(portal.profile);
    setLocations(portal.locations || []);
    setFacturations(portal.facturations || []);
    setDocuments(portal.documents || []);
    setDemandes(portal.demandes || []);
    setVoitures(voit?.data || voit || []);
  }

  useEffect(() => {
    let mounted = true;
    load().catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  function showFeedback(msg: string, ok = true) {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 4000);
  }

  async function submitReservation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/customer/reservations', {
        id_voiture: Number(form.id_voiture),
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        observations: form.observations || undefined,
      });
      setForm({ id_voiture: '', date_debut: '', date_fin: '', observations: '' });
      showFeedback('Réservation envoyée avec succès. Notre équipe vous contactera.');
      await load();
    } catch (err: any) {
      showFeedback(err?.message || 'Erreur lors de la réservation.', false);
    } finally {
      setSaving(false);
    }
  }

  async function cancelReservation(id: number) {
    if (!window.confirm('Confirmer l\'annulation de cette réservation ?')) return;
    setCancelling(id);
    try {
      await apiClient.put(`/locations/${id}`, { statut: 'annulee' });
      showFeedback('Réservation annulée.');
      await load();
    } catch {
      showFeedback('Impossible d\'annuler cette réservation.', false);
    } finally {
      setCancelling(null);
    }
  }

  // Véhicule sélectionné dans le formulaire
  const selectedVehicle = voitures.find((v) => String(v.id) === form.id_voiture);
  const estimatedDays   = form.date_debut && form.date_fin ? diffDays(form.date_debut, form.date_fin) : 0;
  const estimatedCost   = selectedVehicle?.prix && estimatedDays > 0 ? selectedVehicle.prix * estimatedDays : 0;

  const activeLocations = locations.filter((l) => ['planifiee', 'en_cours', 'en_retard'].includes(l.statut));
  const pastLocations   = locations.filter((l) => !['planifiee', 'en_cours', 'en_retard'].includes(l.statut));
  const unpaidInvoices  = facturations.filter((f) => f.statut !== 'payee').length;

  return (
    <DashboardLayout allowedRoles={['client']} guestRedirect="/login/client" menuVariant="client">
      <div className="space-y-6">

        {/* ── Hero client ─────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-[#dfe3eb] bg-white p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#185FA5] text-lg font-black text-white">
              {profile ? initials(profile.name) : '?'}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Espace client</p>
              <h1 className="page-title">{profile?.name ?? '—'}</h1>
              <p className="text-sm text-[#6b7280]">{profile?.email ?? ''}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-[#111827]">{activeLocations.length}</p>
              <p className="text-xs text-[#6b7280]">Location{activeLocations.length > 1 ? 's' : ''} active{activeLocations.length > 1 ? 's' : ''}</p>
            </div>
            <div className="w-px bg-[#dfe3eb]" />
            <div className="text-center">
              <p className={`text-2xl font-black ${unpaidInvoices > 0 ? 'text-red-600' : 'text-[#111827]'}`}>{unpaidInvoices}</p>
              <p className="text-xs text-[#6b7280]">Facture{unpaidInvoices > 1 ? 's' : ''} impayée{unpaidInvoices > 1 ? 's' : ''}</p>
            </div>
            <div className="w-px bg-[#dfe3eb]" />
            <div className="text-center">
              <p className="text-2xl font-black text-[#111827]">{facturations.length}</p>
              <p className="text-xs text-[#6b7280]">Facture{facturations.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>
        </div>

        {/* ── Feedback ─────────────────────────────────────────────────────── */}
        {feedback && (
          <div className={`rounded border px-4 py-3 text-sm ${feedback.ok
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-red-200 bg-red-50 text-red-700'}`}>
            {feedback.msg}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg border border-[#dfe3eb] bg-[#f5f8fa]" />)}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">

            {/* ── Formulaire réservation ──────────────────────────────────── */}
            <div className="space-y-4">
              <form className="surface-panel p-5" onSubmit={submitReservation}>
                <h2 className="section-title mb-4">Nouvelle réservation</h2>
                <div className="space-y-3">

                  {/* Sélecteur véhicule */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#111827]">Véhicule *</label>
                    <select
                      className="field-control"
                      required
                      value={form.id_voiture}
                      onChange={(e) => setForm((f) => ({ ...f, id_voiture: e.target.value }))}
                    >
                      <option value="">— Choisir un véhicule —</option>
                      {voitures.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.marque} {v.modele}{v.prix ? ` — ${money(v.prix)} XOF/j` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Aperçu véhicule sélectionné */}
                  {selectedVehicle && (
                    <div className="flex items-center gap-3 rounded-lg border border-[#dfe3eb] bg-[#f5f8fa] p-3">
                      {selectedVehicle.image_principale ? (
                        <Image
                          src={imgUrl(selectedVehicle.image_principale)!}
                          alt={`${selectedVehicle.marque} ${selectedVehicle.modele}`}
                          width={80} height={56}
                          className="h-14 w-20 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded bg-[#dfe3eb] shrink-0 text-[#9ca3af]">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111827] truncate">{selectedVehicle.marque} {selectedVehicle.modele}</p>
                        {selectedVehicle.energie && <p className="text-xs text-[#6b7280]">{selectedVehicle.energie}</p>}
                        {selectedVehicle.prix ? (
                          <p className="text-xs font-semibold text-[#111827]">{money(selectedVehicle.prix)} XOF <span className="font-normal text-[#6b7280]">/ jour</span></p>
                        ) : (
                          <p className="text-xs text-[#6b7280]">Tarif à confirmer</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#111827]">Date de début *</label>
                      <input
                        className="field-control"
                        type="date"
                        required
                        min={new Date().toISOString().slice(0, 10)}
                        value={form.date_debut}
                        onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value, date_fin: f.date_fin < e.target.value ? '' : f.date_fin }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#111827]">Date de fin *</label>
                      <input
                        className="field-control"
                        type="date"
                        required
                        min={form.date_debut || new Date().toISOString().slice(0, 10)}
                        value={form.date_fin}
                        onChange={(e) => setForm((f) => ({ ...f, date_fin: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Estimation coût */}
                  {estimatedDays > 0 && selectedVehicle && (
                    <div className="rounded-lg border border-[#dfe3eb] bg-[#f5f8fa] px-4 py-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6b7280]">{estimatedDays} jour{estimatedDays > 1 ? 's' : ''}</span>
                        {estimatedCost > 0 ? (
                          <span className="font-black text-[#111827]">{money(estimatedCost)} XOF estimé</span>
                        ) : (
                          <span className="text-[#6b7280]">Tarif à confirmer</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Observations */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#111827]">Observations</label>
                    <textarea
                      className="field-control h-20 resize-none"
                      placeholder="Informations complémentaires…"
                      value={form.observations}
                      onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
                    />
                  </div>

                  <button type="submit" disabled={saving}
                    className="w-full rounded bg-[#185FA5] py-2.5 text-sm font-bold text-white transition hover:bg-[#185FA5]/90 disabled:opacity-50">
                    {saving ? 'Envoi en cours…' : 'Envoyer la réservation'}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Contenu principal ────────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Tabs */}
              <div className="flex gap-1 rounded-lg border border-[#dfe3eb] bg-[#f5f8fa] p-1">
                {([
                  { key: 'locations', label: `Locations (${locations.length})` },
                  { key: 'factures',  label: `Factures (${facturations.length})` },
                  { key: 'documents', label: `Documents (${documents.length})` },
                  { key: 'demandes',  label: `Demandes (${demandes.length})` },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 rounded px-3 py-2 text-xs font-semibold transition ${
                      activeTab === key
                        ? 'bg-white text-[#111827] shadow-sm'
                        : 'text-[#6b7280] hover:text-[#111827]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Onglet Locations ─────────────────────────────────────── */}
              {activeTab === 'locations' && (
                <div className="space-y-4">
                  {activeLocations.length > 0 && (
                    <section>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6b7280]">En cours / À venir</p>
                      <div className="space-y-3">
                        {activeLocations.map((l) => (
                          <div key={l.id} className="space-y-2">
                            <LocationTimeline loc={l} />
                            {l.statut === 'planifiee' && (
                              <button
                                onClick={() => cancelReservation(l.id)}
                                disabled={cancelling === l.id}
                                className="ml-auto flex items-center gap-1.5 rounded border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                              >
                                {cancelling === l.id ? 'Annulation…' : 'Annuler la réservation'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {pastLocations.length > 0 && (
                    <section>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6b7280]">Historique</p>
                      <div className="surface-panel overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr>
                              <th className="table-header pl-5">Véhicule</th>
                              <th className="table-header">Période</th>
                              <th className="table-header">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pastLocations.slice(0, 8).map((l) => (
                              <tr key={l.id} className="table-row">
                                <td className="table-cell pl-5 font-medium text-[#111827]">
                                  {l.voiture ? `${l.voiture.marque} ${l.voiture.modele}` : l.reference_location}
                                </td>
                                <td className="table-cell text-[#6b7280]">{fmtDate(l.date_debut)} – {fmtDate(l.date_fin)}</td>
                                <td className="table-cell"><Badge statut={l.statut} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {locations.length === 0 && (
                    <div className="surface-panel py-16 text-center">
                      <p className="text-sm font-semibold text-[#6b7280]">Aucune location pour le moment.</p>
                      <p className="mt-1 text-xs text-[#9ca3af]">Utilisez le formulaire pour effectuer une réservation.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Onglet Factures ──────────────────────────────────────── */}
              {activeTab === 'factures' && (
                <div className="surface-panel overflow-hidden">
                  {facturations.length === 0 ? (
                    <p className="px-5 py-12 text-center text-sm text-[#6b7280]">Aucune facture disponible.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr>
                          <th className="table-header pl-5">Numéro</th>
                          <th className="table-header">Date</th>
                          <th className="table-header">Véhicule</th>
                          <th className="table-header">Montant TTC</th>
                          <th className="table-header">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facturations.map((f) => (
                          <tr key={f.id} className="table-row">
                            <td className="table-cell pl-5 font-medium text-[#111827]">{f.numero_facture}</td>
                            <td className="table-cell text-[#6b7280]">{f.date_facture ? fmtDate(f.date_facture) : '—'}</td>
                            <td className="table-cell text-[#6b7280]">
                              {[f.vente?.voiture?.marque ?? f.location?.voiture?.marque, f.vente?.voiture?.modele ?? f.location?.voiture?.modele].filter(Boolean).join(' ') || '—'}
                            </td>
                            <td className="table-cell tabular-nums font-semibold text-[#111827]">{money(f.montant_ttc)} XOF</td>
                            <td className="table-cell"><Badge statut={f.statut} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── Onglet Documents ─────────────────────────────────────── */}
              {activeTab === 'documents' && (
                <div className="surface-panel overflow-hidden">
                  {documents.length === 0 ? (
                    <p className="px-5 py-12 text-center text-sm text-[#6b7280]">Aucun document disponible.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr>
                          <th className="table-header pl-5">Type</th>
                          <th className="table-header">Numéro</th>
                          <th className="table-header">Véhicule</th>
                          <th className="table-header">Expiration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((d) => {
                          const isExpired = d.date_expiration && d.date_expiration < new Date().toISOString().slice(0, 10);
                          return (
                            <tr key={d.id} className="table-row">
                              <td className="table-cell pl-5 font-medium text-[#111827]">{d.type_document}</td>
                              <td className="table-cell text-[#6b7280]">{d.numero_document || '—'}</td>
                              <td className="table-cell text-[#6b7280]">
                                {[d.voiture?.marque, d.voiture?.modele].filter(Boolean).join(' ') || '—'}
                              </td>
                              <td className={`table-cell font-semibold ${isExpired ? 'text-red-600' : 'text-[#111827]'}`}>
                                {d.date_expiration ? fmtDate(d.date_expiration) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── Onglet Demandes ──────────────────────────────────────── */}
              {activeTab === 'demandes' && (
                <div className="space-y-3">
                  {demandes.length === 0 ? (
                    <div className="surface-panel py-16 text-center">
                      <p className="text-sm font-semibold text-[#6b7280]">Aucune demande envoyée.</p>
                      <p className="mt-1 text-xs text-[#9ca3af]">Vos demandes d&apos;infos, de reprise et d&apos;achat apparaîtront ici.</p>
                    </div>
                  ) : (
                    demandes.map((d) => {
                      const typeLabel: Record<string, string> = {
                        information: "Demande d'infos",
                        reprise:     'Demande de reprise',
                        essai:       'Essai',
                        achat:       'Demande d\'achat',
                      };
                      const typeColor: Record<string, string> = {
                        information: 'bg-blue-100 text-blue-800',
                        reprise:     'bg-amber-100 text-amber-800',
                        essai:       'bg-violet-100 text-violet-800',
                        achat:       'bg-emerald-100 text-emerald-800',
                      };
                      const statutColor: Record<string, string> = {
                        en_attente: 'bg-red-100 text-red-700',
                        traite:     'bg-emerald-100 text-emerald-800',
                        archive:    'bg-[#f5f8fa] text-[#6b7280]',
                      };
                      const statutLabel: Record<string, string> = {
                        en_attente: 'En attente de réponse',
                        traite:     'Traité',
                        archive:    'Archivé',
                      };
                      return (
                        <div key={d.id} className="surface-panel p-4 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${typeColor[d.type] ?? 'bg-[#f5f8fa] text-[#6b7280]'}`}>
                                {typeLabel[d.type] ?? d.type}
                              </span>
                              {d.voiture && (
                                <span className="text-xs text-[#6b7280]">{d.voiture.marque} {d.voiture.modele}</span>
                              )}
                            </div>
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${statutColor[d.statut] ?? 'bg-[#f5f8fa] text-[#6b7280]'}`}>
                              {statutLabel[d.statut] ?? d.statut}
                            </span>
                          </div>
                          {d.type === 'reprise' && d.reprise_marque && (
                            <p className="text-xs text-[#6b7280]">Reprise : {d.reprise_marque} {d.reprise_modele}</p>
                          )}
                          {d.type === 'achat' && (d.rendez_vous_date || d.rendez_vous_heure) && (
                            <p className="text-xs text-emerald-700 font-semibold">
                              RDV souhaité : {d.rendez_vous_date ? new Date(d.rendez_vous_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : ''}{d.rendez_vous_heure ? ` à ${d.rendez_vous_heure}` : ''}
                            </p>
                          )}
                          {d.message && (
                            <p className="text-sm text-[#374151] line-clamp-2">{d.message}</p>
                          )}
                          <p className="text-xs text-[#9ca3af]">{fmtDate(d.created_at)}</p>
                        </div>
                      );
                    })
                  )}
                  <div className="text-center pt-2">
                    <a href="/catalogue" className="text-sm font-semibold text-[#5b2d8e] hover:underline">
                      + Nouvelle demande depuis le catalogue
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

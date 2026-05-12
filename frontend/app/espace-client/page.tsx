'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';

interface Profile { id: number; name: string; email: string; role: string; }

interface LocationItem {
  id: number;
  reference_location?: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  voiture?: { marque?: string; modele?: string };
}

interface FacturationItem {
  id: number;
  numero_facture: string;
  montant_ttc: number | string;
  statut: string;
  vente?: { voiture?: { marque?: string; modele?: string } };
}

interface DocumentItem {
  id: number;
  type_document: string;
  numero_document?: string;
  date_expiration?: string;
  voiture?: { marque?: string; modele?: string };
}

interface VoitureOption { id: number; marque: string; modele: string; prix?: number; }

interface PortalResponse {
  profile: Profile;
  locations: LocationItem[];
  facturations: FacturationItem[];
  documents: DocumentItem[];
}

function money(value?: number | string) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function badge(statut: string) {
  const map: Record<string, string> = {
    planifiee: 'bg-amber-100 text-amber-800',
    en_cours:  'bg-blue-100 text-blue-800',
    terminee:  'bg-emerald-100 text-emerald-800',
    annulee:   'bg-[#f5f8fa] text-[#516f90]',
    payee:     'bg-emerald-100 text-emerald-800',
    impayee:   'bg-red-100 text-red-700',
    partiellement_payee: 'bg-amber-100 text-amber-800',
  };
  return `inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${map[statut] ?? 'bg-[#f5f8fa] text-[#516f90]'}`;
}

export default function EspaceClientPage() {
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [locations, setLocations]     = useState<LocationItem[]>([]);
  const [facturations, setFacturations] = useState<FacturationItem[]>([]);
  const [documents, setDocuments]     = useState<DocumentItem[]>([]);
  const [voitures, setVoitures]       = useState<VoitureOption[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [feedback, setFeedback]       = useState<string | null>(null);
  const [form, setForm] = useState({ id_voiture: '', date_debut: '', date_fin: '', observations: '' });

  async function load() {
    const [portal, voit] = await Promise.all([
      apiClient.get<PortalResponse>('/customer/portal'),
      apiClient.getPublicVoitures(),
    ]);
    setProfile(portal.profile);
    setLocations(portal.locations || []);
    setFacturations(portal.facturations || []);
    setDocuments(portal.documents || []);
    setVoitures(voit?.data || voit || []);
  }

  useEffect(() => {
    let mounted = true;
    load().catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

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
      setFeedback('Réservation envoyée avec succès.');
      setTimeout(() => setFeedback(null), 4000);
      await load();
    } catch (err: any) {
      setFeedback(err?.message || 'Erreur lors de la réservation.');
    } finally {
      setSaving(false);
    }
  }

  const activeLocations = locations.filter((l) => ['planifiee', 'en_cours'].includes(l.statut)).length;
  const unpaidInvoices  = facturations.filter((f) => f.statut !== 'payee').length;

  return (
    <DashboardLayout allowedRoles={['client']} guestRedirect="/login/client" menuVariant="client">
      <div className="space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Espace client</p>
            <h1 className="page-title mt-0.5">Mon espace</h1>
            <p className="page-subtitle">Réservation, suivi des locations et consultation de vos factures.</p>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {feedback}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded border border-[#dfe3eb] bg-[#f5f8fa]" />)}
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Client',             value: profile?.name || '-' },
                { label: 'Email',              value: profile?.email || '-' },
                { label: 'Locations actives',  value: String(activeLocations) },
                { label: 'Factures ouvertes',  value: String(unpaidInvoices) },
              ].map(({ label, value }) => (
                <div key={label} className="surface-panel p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#516f90]">{label}</p>
                  <p className="mt-1.5 truncate text-sm font-bold text-[#33475b]">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">

              {/* Formulaire de réservation */}
              <form className="surface-panel p-5" onSubmit={submitReservation}>
                <h2 className="section-title mb-4">Nouvelle réservation</h2>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#33475b]">Véhicule disponible *</label>
                    <select
                      className="field-control"
                      required
                      value={form.id_voiture}
                      onChange={(e) => setForm((f) => ({ ...f, id_voiture: e.target.value }))}
                    >
                      <option value="">— Sélectionner —</option>
                      {voitures.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.marque} {v.modele}{v.prix ? ` — ${money(v.prix)} XOF/j` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#33475b]">Date de début *</label>
                      <input
                        className="field-control"
                        type="date"
                        required
                        min={new Date().toISOString().slice(0, 10)}
                        value={form.date_debut}
                        onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#33475b]">Date de fin *</label>
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
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#33475b]">Observations</label>
                    <textarea
                      className="field-control h-20 resize-none"
                      placeholder="Informations complémentaires…"
                      value={form.observations}
                      onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={saving}>
                    {saving ? 'Envoi…' : 'Envoyer la réservation'}
                  </button>
                </div>
              </form>

              {/* Mes locations */}
              <section className="surface-panel">
                <div className="border-b border-[#dfe3eb] px-5 py-4">
                  <h2 className="section-title">Historique des locations</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="table-header pl-5">Référence</th>
                        <th className="table-header">Véhicule</th>
                        <th className="table-header">Début</th>
                        <th className="table-header">Fin</th>
                        <th className="table-header">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-8 text-sm text-[#516f90]">Aucune location pour le moment.</td></tr>
                      ) : (
                        locations.slice(0, 10).map((l) => (
                          <tr key={l.id} className="table-row">
                            <td className="table-cell pl-5 font-medium text-[#33475b]">{l.reference_location || `LOC-${l.id}`}</td>
                            <td className="table-cell">{[l.voiture?.marque, l.voiture?.modele].filter(Boolean).join(' ') || '-'}</td>
                            <td className="table-cell">{fmtDate(l.date_debut)}</td>
                            <td className="table-cell">{fmtDate(l.date_fin)}</td>
                            <td className="table-cell"><span className={badge(l.statut)}>{l.statut.replace('_', ' ')}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">

              {/* Factures */}
              <section className="surface-panel">
                <div className="border-b border-[#dfe3eb] px-5 py-4">
                  <h2 className="section-title">Mes factures</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="table-header pl-5">Numéro</th>
                        <th className="table-header">Véhicule</th>
                        <th className="table-header">Montant TTC</th>
                        <th className="table-header">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturations.length === 0 ? (
                        <tr><td colSpan={4} className="px-5 py-8 text-sm text-[#516f90]">Aucune facture disponible.</td></tr>
                      ) : (
                        facturations.slice(0, 8).map((f) => (
                          <tr key={f.id} className="table-row">
                            <td className="table-cell pl-5 font-medium text-[#33475b]">{f.numero_facture}</td>
                            <td className="table-cell">{[f.vente?.voiture?.marque, f.vente?.voiture?.modele].filter(Boolean).join(' ') || '-'}</td>
                            <td className="table-cell tabular-nums">{money(f.montant_ttc)} XOF</td>
                            <td className="table-cell"><span className={badge(f.statut)}>{f.statut.replace('_', ' ')}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Documents */}
              <section className="surface-panel">
                <div className="border-b border-[#dfe3eb] px-5 py-4">
                  <h2 className="section-title">Mes documents</h2>
                </div>
                <div className="overflow-x-auto">
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
                      {documents.length === 0 ? (
                        <tr><td colSpan={4} className="px-5 py-8 text-sm text-[#516f90]">Aucun document disponible.</td></tr>
                      ) : (
                        documents.slice(0, 8).map((d) => (
                          <tr key={d.id} className="table-row">
                            <td className="table-cell pl-5 font-medium text-[#33475b]">{d.type_document}</td>
                            <td className="table-cell">{d.numero_document || '-'}</td>
                            <td className="table-cell">{[d.voiture?.marque, d.voiture?.modele].filter(Boolean).join(' ') || '-'}</td>
                            <td className="table-cell">{d.date_expiration ? fmtDate(d.date_expiration) : '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

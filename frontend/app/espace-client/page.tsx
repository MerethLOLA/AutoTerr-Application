'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';

interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LocationItem {
  id: number;
  reference_location?: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  voiture?: {
    marque?: string;
    modele?: string;
  };
}

interface FacturationItem {
  id: number;
  numero_facture: string;
  montant_ttc: number | string;
  statut: string;
  vente?: {
    reference_vente?: string;
    voiture?: {
      marque?: string;
      modele?: string;
    };
  };
}

interface DocumentItem {
  id: number;
  type_document: string;
  numero_document?: string;
  date_expiration?: string;
  vente?: {
    reference_vente?: string;
  };
  voiture?: {
    marque?: string;
    modele?: string;
  };
}

interface VoitureOption {
  id: number;
  marque: string;
  modele: string;
  prix?: number;
}

interface PortalResponse {
  profile: Profile;
  locations: LocationItem[];
  facturations: FacturationItem[];
  documents: DocumentItem[];
}

function money(value?: number | string) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function EspaceClientPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [facturations, setFacturations] = useState<FacturationItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [voitures, setVoitures] = useState<VoitureOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingReservation, setSavingReservation] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    id_voiture: '',
    date_debut: '',
    date_fin: '',
    observations: '',
  });

  async function loadPortal() {
    const [portalResponse, voituresResponse] = await Promise.all([
      apiClient.get<PortalResponse>('/customer/portal'),
      apiClient.getPublicVoitures(),
    ]);

    setProfile(portalResponse.profile);
    setLocations(portalResponse.locations || []);
    setFacturations(portalResponse.facturations || []);
    setDocuments(portalResponse.documents || []);
    setVoitures(voituresResponse?.data || voituresResponse || []);
  }

  useEffect(() => {
    let mounted = true;

    loadPortal()
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function submitReservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingReservation(true);

    try {
      await apiClient.post('/customer/reservations', {
        id_voiture: Number(reservationForm.id_voiture),
        date_debut: reservationForm.date_debut,
        date_fin: reservationForm.date_fin,
        observations: reservationForm.observations || undefined,
      });

      setReservationForm({
        id_voiture: '',
        date_debut: '',
        date_fin: '',
        observations: '',
      });

      await loadPortal();
    } finally {
      setSavingReservation(false);
    }
  }

  const activeLocations = locations.filter((location) => ['planifiee', 'en_cours'].includes(location.statut)).length;
  const unpaidInvoices = facturations.filter((facture) => facture.statut !== 'payee').length;

  return (
    <DashboardLayout allowedRoles={['client']} guestRedirect="/login/client" menuVariant="client">
      <div className="space-y-8">
        <section className="hero-panel">
          <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
            Espace client
          </p>
          <h1 className="text-4xl font-black tracking-tight">Mon espace</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200">
            Reservation, suivi des locations, consultation des factures et des documents depuis un espace client unique.
          </p>
        </section>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement de l espace client...</p>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <div className="metric-card">
                <p className="metric-label">Client</p>
                <p className="mt-2 text-lg font-black text-slate-900">{profile?.name || '-'}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Email</p>
                <p className="mt-2 text-lg font-black text-slate-900">{profile?.email || '-'}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Locations actives</p>
                <p className="mt-2 text-lg font-black text-slate-900">{activeLocations}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Factures ouvertes</p>
                <p className="mt-2 text-lg font-black text-slate-900">{unpaidInvoices}</p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <form className="surface-panel p-6" onSubmit={submitReservation}>
                <h2 className="section-title">Nouvelle reservation</h2>
                <div className="mt-5 grid gap-4">
                  <select className="field-control" onChange={(event) => setReservationForm((current) => ({ ...current, id_voiture: event.target.value }))} required value={reservationForm.id_voiture}>
                    <option value="">Choisir un vehicule disponible</option>
                    {voitures.map((voiture) => (
                      <option key={voiture.id} value={voiture.id}>
                        {voiture.marque} {voiture.modele} - {money(voiture.prix)} XOF
                      </option>
                    ))}
                  </select>
                  <input className="field-control" min={new Date().toISOString().slice(0, 10)} onChange={(event) => setReservationForm((current) => ({ ...current, date_debut: event.target.value }))} required type="date" value={reservationForm.date_debut} />
                  <input className="field-control" min={reservationForm.date_debut || new Date().toISOString().slice(0, 10)} onChange={(event) => setReservationForm((current) => ({ ...current, date_fin: event.target.value }))} required type="date" value={reservationForm.date_fin} />
                  <textarea className="field-control min-h-28" onChange={(event) => setReservationForm((current) => ({ ...current, observations: event.target.value }))} placeholder="Observations client" value={reservationForm.observations} />
                  <button className="btn-primary" disabled={savingReservation} type="submit">
                    {savingReservation ? 'Reservation...' : 'Envoyer la reservation'}
                  </button>
                </div>
              </form>

              <section className="surface-panel p-6">
                <h2 className="section-title">Historique locations</h2>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
                        <th className="py-3 pr-4">Reference</th>
                        <th className="py-3 pr-4">Vehicule</th>
                        <th className="py-3 pr-4">Debut</th>
                        <th className="py-3 pr-4">Fin</th>
                        <th className="py-3 pr-4">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.length === 0 ? (
                        <tr><td className="py-6 text-slate-500" colSpan={5}>Aucune location visible pour le moment.</td></tr>
                      ) : (
                        locations.slice(0, 10).map((location) => (
                          <tr key={location.id} className="border-b border-slate-100">
                            <td className="py-3 pr-4 text-slate-700">{location.reference_location || `LOC-${location.id}`}</td>
                            <td className="py-3 pr-4 text-slate-700">{[location.voiture?.marque, location.voiture?.modele].filter(Boolean).join(' ') || '-'}</td>
                            <td className="py-3 pr-4 text-slate-700">{location.date_debut}</td>
                            <td className="py-3 pr-4 text-slate-700">{location.date_fin}</td>
                            <td className="py-3 pr-4 text-slate-700">{location.statut}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <section className="surface-panel p-6">
                <h2 className="section-title">Factures</h2>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
                        <th className="py-3 pr-4">Numero</th>
                        <th className="py-3 pr-4">Vehicule</th>
                        <th className="py-3 pr-4">Montant TTC</th>
                        <th className="py-3 pr-4">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturations.length === 0 ? (
                        <tr><td className="py-6 text-slate-500" colSpan={4}>Aucune facture disponible.</td></tr>
                      ) : (
                        facturations.slice(0, 8).map((facture) => (
                          <tr key={facture.id} className="border-b border-slate-100">
                            <td className="py-3 pr-4 text-slate-700">{facture.numero_facture}</td>
                            <td className="py-3 pr-4 text-slate-700">{[facture.vente?.voiture?.marque, facture.vente?.voiture?.modele].filter(Boolean).join(' ') || '-'}</td>
                            <td className="py-3 pr-4 text-slate-700">{money(facture.montant_ttc)} XOF</td>
                            <td className="py-3 pr-4 text-slate-700">{facture.statut}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="surface-panel p-6">
                <h2 className="section-title">Documents</h2>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
                        <th className="py-3 pr-4">Type</th>
                        <th className="py-3 pr-4">Numero</th>
                        <th className="py-3 pr-4">Vehicule</th>
                        <th className="py-3 pr-4">Expiration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.length === 0 ? (
                        <tr><td className="py-6 text-slate-500" colSpan={4}>Aucun document disponible.</td></tr>
                      ) : (
                        documents.slice(0, 8).map((document) => (
                          <tr key={document.id} className="border-b border-slate-100">
                            <td className="py-3 pr-4 text-slate-700">{document.type_document}</td>
                            <td className="py-3 pr-4 text-slate-700">{document.numero_document || '-'}</td>
                            <td className="py-3 pr-4 text-slate-700">{[document.voiture?.marque, document.voiture?.modele].filter(Boolean).join(' ') || '-'}</td>
                            <td className="py-3 pr-4 text-slate-700">{document.date_expiration || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

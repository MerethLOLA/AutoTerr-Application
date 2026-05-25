'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function money(v?: number | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0));
}
function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function initials(nom?: string, prenom?: string) {
  return [(nom ?? '')[0], (prenom ?? '')[0]].filter(Boolean).join('').toUpperCase() || '?';
}

interface Vente {
  id: number;
  reference_vente: string;
  date_vente: string;
  prix_final: number;
  statut: string;
  facturation?: { numero_facture: string; statut: string };
}
interface Location {
  id: number;
  reference_location: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  montant_total?: number;
}
interface Paiement {
  id: number;
  date: string;
  montant: number;
  mode_paiement: string;
}
interface Client {
  id: number;
  nom: string;
  prenom?: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  type_client?: string;
  classe?: string;
  raison_sociale?: string;
  numero_siret?: string;
  piece_identite?: string;
  numero_piece?: string;
  numero_piece2?: string;
  date_naissance?: string;
  created_at: string;
  vendeurAttribue?: { id: number; nom: string; prenom?: string };
  ventes?: Vente[];
  locations?: Location[];
  paiements?: Paiement[];
}

const STATUT_VENTE: Record<string, string> = {
  termine:    'bg-emerald-100 text-emerald-700',
  en_cours:   'bg-blue-100 text-blue-700',
  annule:     'bg-red-100 text-red-700',
  en_attente: 'bg-amber-100 text-amber-700',
};
const STATUT_LOC: Record<string, string> = {
  en_cours:   'bg-blue-100 text-blue-700',
  terminee:   'bg-emerald-100 text-emerald-700',
  annulee:    'bg-red-100 text-red-700',
  en_attente: 'bg-amber-100 text-amber-700',
};

function Badge({ statut, map }: { statut: string; map: Record<string, string> }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${map[statut] ?? 'bg-slate-100 text-slate-600'}`}>
      {statut.replace('_', ' ')}
    </span>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const _initCli = id ? apiClient.getCached<any>(`/clients/${id}`) : null;
  const [client, setClient] = useState<Client | null>(_initCli?.data ?? _initCli ?? null);
  const [loading, setLoading] = useState(_initCli === null);
  const [tab, setTab] = useState<'ventes' | 'locations' | 'paiements'>('ventes');

  useEffect(() => {
    if (!id) return;
    apiClient.get<any>(`/clients/${id}`)
      .then((res) => setClient(res?.data ?? res))
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="grid gap-5 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl bg-slate-200" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="surface-panel py-20 text-center">
          <p className="text-sm font-semibold text-red-600">Client introuvable.</p>
          <Link href="/clients" className="mt-4 inline-block text-sm font-bold text-slate-800 hover:underline">← Retour aux clients</Link>
        </div>
      </DashboardLayout>
    );
  }

  const ventes    = client.ventes ?? [];
  const locations = client.locations ?? [];
  const paiements = client.paiements ?? [];
  const totalVentes   = ventes.reduce((s, v) => s + Number(v.prix_final), 0);
  const totalPaiements = paiements.reduce((s, p) => s + Number(p.montant), 0);
  const fullName = [client.nom, client.prenom].filter(Boolean).join(' ');

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Fil d'ariane */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/clients" className="font-semibold hover:text-slate-800">Clients</Link>
          <span>/</span>
          <span className="font-bold text-slate-800">{fullName}</span>
        </nav>

        {/* En-tête */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2d1b3d] text-lg font-black text-white">
              {initials(client.nom, client.prenom)}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{client.type_client ?? 'Client'}</p>
              <h1 className="text-2xl font-black text-slate-900">{fullName}</h1>
              {client.raison_sociale && <p className="text-sm text-slate-500">{client.raison_sociale}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/ventes?client_id=${client.id}`} className="btn-primary text-sm">+ Vente</Link>
            <Link href={`/locations?client_id=${client.id}`} className="btn-secondary text-sm">+ Location</Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ventes</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{ventes.length}</p>
            <p className="mt-0.5 text-xs text-slate-400">{money(totalVentes)} XOF au total</p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Locations</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{locations.length}</p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Encaissé</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{money(totalPaiements)} XOF</p>
            <p className="mt-0.5 text-xs text-slate-400">{paiements.length} paiement{paiements.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Infos + Activité */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Fiche client */}
          <div className="surface-panel p-5 space-y-0">
            <h2 className="section-title mb-3">Coordonnées</h2>
            <Row label="Téléphone"     value={client.telephone} />
            <Row label="Contact"       value={client.contact} />
            <Row label="Email"         value={client.email} />
            <Row label="Adresse"       value={client.adresse} />
            <Row label="Classe"        value={client.classe} />
            <Row label="Naissance"     value={fmtDate(client.date_naissance)} />
            <Row label="Pièce d'identité" value={client.piece_identite} />
            <Row label="N° pièce"      value={client.numero_piece} />
            <Row label="N° pièce 2"    value={client.numero_piece2} />
            <Row label="SIRET"         value={client.numero_siret} />
            <Row label="Vendeur attribué" value={client.vendeurAttribue ? [client.vendeurAttribue.nom, client.vendeurAttribue.prenom].filter(Boolean).join(' ') : null} />
            <Row label="Client depuis" value={fmtDate(client.created_at)} />
          </div>

          {/* Historique */}
          <div className="lg:col-span-2 surface-panel">
            {/* Onglets */}
            <div className="flex gap-1 border-b border-slate-100 px-5 pt-4">
              {([
                { key: 'ventes',    label: `Ventes (${ventes.length})` },
                { key: 'locations', label: `Locations (${locations.length})` },
                { key: 'paiements', label: `Paiements (${paiements.length})` },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${tab === t.key ? 'border-[#2d1b3d] text-[#2d1b3d]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              {tab === 'ventes' && (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-header pl-5">Référence</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Prix final</th>
                      <th className="table-header">Statut</th>
                      <th className="table-header"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventes.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-8 text-sm text-slate-400">Aucune vente.</td></tr>
                    ) : ventes.map((v) => (
                      <tr key={v.id} className="table-row">
                        <td className="table-cell pl-5 font-semibold text-slate-800">{v.reference_vente}</td>
                        <td className="table-cell text-slate-500">{fmtDate(v.date_vente)}</td>
                        <td className="table-cell font-bold">{money(v.prix_final)} XOF</td>
                        <td className="table-cell"><Badge statut={v.statut} map={STATUT_VENTE} /></td>
                        <td className="table-cell">
                          <Link href={`/ventes/${v.id}`} className="text-xs font-semibold text-slate-600 hover:text-slate-900">Voir →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'locations' && (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-header pl-5">Référence</th>
                      <th className="table-header">Début</th>
                      <th className="table-header">Fin prévue</th>
                      <th className="table-header">Montant</th>
                      <th className="table-header">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-8 text-sm text-slate-400">Aucune location.</td></tr>
                    ) : locations.map((l) => (
                      <tr key={l.id} className="table-row">
                        <td className="table-cell pl-5 font-semibold text-slate-800">{l.reference_location}</td>
                        <td className="table-cell text-slate-500">{fmtDate(l.date_debut)}</td>
                        <td className="table-cell text-slate-500">{fmtDate(l.date_fin)}</td>
                        <td className="table-cell font-bold">{l.montant_total ? money(l.montant_total) + ' XOF' : '—'}</td>
                        <td className="table-cell"><Badge statut={l.statut} map={STATUT_LOC} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'paiements' && (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="table-header pl-5">Date</th>
                      <th className="table-header">Mode</th>
                      <th className="table-header">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.length === 0 ? (
                      <tr><td colSpan={3} className="px-5 py-8 text-sm text-slate-400">Aucun paiement.</td></tr>
                    ) : paiements.map((p) => (
                      <tr key={p.id} className="table-row">
                        <td className="table-cell pl-5 font-semibold text-slate-800">{fmtDate(p.date)}</td>
                        <td className="table-cell text-slate-500 capitalize">{p.mode_paiement?.replace('_', ' ')}</td>
                        <td className="table-cell font-bold">{money(p.montant)} XOF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

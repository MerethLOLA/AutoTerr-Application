'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function money(v?: number | string | null) {
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
}
interface ActiviteMois {
  periode: string;
  total_ventes_mois: number;
  total_locations_mois: number;
  taux_commission: number;
  commission_mois: number;
  salaire_fixe: number;
  salaire_total_mois: number;
}
interface Employe {
  id: number;
  nom: string;
  prenom?: string;
  poste?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  date_embauche?: string;
  salaire?: number;
  taux_commission?: number;
  contrat?: string;
  statut?: string;
  created_at: string;
  ventes?: Vente[];
  activite_mois?: ActiviteMois;
}

const STATUT_VENTE: Record<string, string> = {
  termine:    'bg-emerald-100 text-emerald-700',
  en_cours:   'bg-blue-100 text-blue-700',
  annule:     'bg-red-100 text-red-700',
  en_attente: 'bg-amber-100 text-amber-700',
};
const STATUT_EMPLOYE: Record<string, string> = {
  actif:   'bg-emerald-100 text-emerald-700',
  inactif: 'bg-slate-100 text-slate-600',
  conge:   'bg-amber-100 text-amber-700',
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

export default function EmployeDetailPage() {
  const { id } = useParams();
  const _initEmp = id ? apiClient.getCached<any>(`/employes/${id}`) : null;
  const [employe, setEmploye] = useState<Employe | null>(_initEmp?.data ?? _initEmp ?? null);
  const [loading, setLoading] = useState(_initEmp === null);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient.get<any>(`/employes/${id}`)
      .then((res) => setEmploye(res?.data ?? res))
      .catch(() => setEmploye(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePrint() {
    if (!id) return;
    setPrinting(true);
    try {
      await apiClient.openPdf(`/employes/${id}/export`);
    } finally {
      setPrinting(false);
    }
  }

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

  if (!employe) {
    return (
      <DashboardLayout>
        <div className="surface-panel py-20 text-center">
          <p className="text-sm font-semibold text-red-600">Employé introuvable.</p>
          <Link href="/employes" className="mt-4 inline-block text-sm font-bold text-slate-800 hover:underline">← Retour aux employés</Link>
        </div>
      </DashboardLayout>
    );
  }

  const ventes = employe.ventes ?? [];
  const activite = employe.activite_mois;
  const fullName = [employe.nom, employe.prenom].filter(Boolean).join(' ');

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Fil d'ariane */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/employes" className="font-semibold hover:text-slate-800">Employés</Link>
          <span>/</span>
          <span className="font-bold text-slate-800">{fullName}</span>
        </nav>

        {/* En-tête */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#185FA5] text-lg font-black text-white">
              {initials(employe.nom, employe.prenom)}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{employe.poste ?? 'Employé'}</p>
              <h1 className="page-title">{fullName}</h1>
              {employe.statut && <Badge statut={employe.statut} map={STATUT_EMPLOYE} />}
            </div>
          </div>
          <button onClick={handlePrint} disabled={printing} className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-60">
            {printing ? 'Génération…' : 'Imprimer la fiche de paie'}
          </button>
        </div>

        {/* KPIs — salaire & commission du mois */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Salaire fixe</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{money(activite?.salaire_fixe ?? employe.salaire)} XOF</p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Commission {activite?.periode ? `· ${activite.periode}` : ''}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{money(activite?.commission_mois)} XOF</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {activite?.taux_commission ?? employe.taux_commission ?? 0}% sur {money((activite?.total_ventes_mois ?? 0) + (activite?.total_locations_mois ?? 0))} XOF d'activité
            </p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total à verser {activite?.periode ? `· ${activite.periode}` : ''}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{money(activite?.salaire_total_mois)} XOF</p>
          </div>
        </div>

        {/* Infos + Activité */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Fiche employé */}
          <div className="surface-panel p-5 space-y-0">
            <h2 className="section-title mb-3">Coordonnées</h2>
            <Row label="Téléphone"         value={employe.telephone} />
            <Row label="Email"             value={employe.email} />
            <Row label="Adresse"           value={employe.adresse} />
            <Row label="Poste"             value={employe.poste} />
            <Row label="Type de contrat"   value={employe.contrat} />
            <Row label="Taux de commission" value={employe.taux_commission !== undefined ? `${employe.taux_commission}%` : null} />
            <Row label="Date d'embauche"   value={fmtDate(employe.date_embauche)} />
            <Row label="Employé depuis"    value={fmtDate(employe.created_at)} />
          </div>

          {/* Historique ventes */}
          <div className="lg:col-span-2 surface-panel">
            <div className="border-b border-slate-100 px-5 pt-4 pb-3">
              <h2 className="section-title">Ventes réalisées ({ventes.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="table-header pl-5">Référence</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Prix final</th>
                    <th className="table-header">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {ventes.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-sm text-slate-400">Aucune vente enregistrée.</td></tr>
                  ) : ventes.map((v) => (
                    <tr key={v.id} className="table-row">
                      <td className="table-cell pl-5 font-semibold text-slate-800">{v.reference_vente}</td>
                      <td className="table-cell text-slate-500">{fmtDate(v.date_vente)}</td>
                      <td className="table-cell font-bold">{money(v.prix_final)} XOF</td>
                      <td className="table-cell"><Badge statut={v.statut} map={STATUT_VENTE} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

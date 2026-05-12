'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AlerteItem {
  id: number;
  voiture?: { id: number; marque: string; modele: string };
  compagnie?: string;
  type_assurance?: string;
  date_fin?: string;
  type_controle?: string;
  date_expiration?: string;
  resultat?: string;
  type_entretien?: string;
  date_prevue?: string;
  statut?: string;
}

interface AlertesData {
  assurances_expirant: AlerteItem[];
  assurances_expirees: AlerteItem[];
  controles_expirant: AlerteItem[];
  controles_expires: AlerteItem[];
  entretiens_prevus: AlerteItem[];
  total_alertes: number;
}

function fmtDate(d?: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysRemaining(d?: string | null): number | null {
  if (!d) return null;
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function UrgencyBadge({ date }: { date?: string | null }) {
  const days = daysRemaining(date);
  if (days === null) return null;
  if (days < 0) return <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Expiré il y a {Math.abs(days)}j</span>;
  if (days === 0) return <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Expire aujourd&apos;hui</span>;
  return <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Dans {days}j</span>;
}

function AlerteCard({ title, items, dateKey, descKey, color }: {
  title: string;
  items: AlerteItem[];
  dateKey: string;
  descKey: string;
  color: 'red' | 'amber' | 'blue';
}) {
  const colorMap = {
    red:   { border: 'border-red-200',   bg: 'bg-red-50',   title: 'text-red-700',   dot: 'bg-red-500' },
    amber: { border: 'border-amber-200', bg: 'bg-amber-50', title: 'text-amber-800', dot: 'bg-amber-500' },
    blue:  { border: 'border-blue-200',  bg: 'bg-blue-50',  title: 'text-blue-800',  dot: 'bg-blue-500' },
  };
  const c = colorMap[color];

  if (items.length === 0) return null;

  return (
    <div className={`rounded border ${c.border} ${c.bg}`}>
      <div className={`flex items-center gap-2 border-b ${c.border} px-4 py-3`}>
        <div className={`h-2 w-2 rounded-full ${c.dot}`} />
        <h3 className={`text-sm font-bold ${c.title}`}>{title} ({items.length})</h3>
      </div>
      <div className="divide-y divide-[#dfe3eb]">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#33475b]">
                {item.voiture ? `${item.voiture.marque} ${item.voiture.modele}` : '-'}
              </p>
              <p className="text-xs text-[#516f90]">{(item as any)[descKey] ?? '-'}</p>
            </div>
            <div className="flex items-center gap-2 text-right">
              <span className="text-xs text-[#516f90]">{fmtDate((item as any)[dateKey])}</span>
              <UrgencyBadge date={(item as any)[dateKey]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AlertesPage() {
  const [data, setData]       = useState<AlertesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<any>('/alertes/expirations')
      .then((res) => setData(res?.data ?? res))
      .catch((err: any) => setError(err?.message || 'Impossible de charger les alertes'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Conformité</p>
            <h1 className="page-title mt-0.5">Alertes & Expirations</h1>
            <p className="page-subtitle">Suivez les assurances, contrôles techniques et entretiens à renouveler.</p>
          </div>
          {data && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-xl font-black text-red-700">
              {data.total_alertes}
            </div>
          )}
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded border border-[#dfe3eb] bg-[#f5f8fa]" />)}
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && data && (
          <>
            {data.total_alertes === 0 ? (
              <div className="surface-panel py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-emerald-700">Tout est en ordre !</p>
                <p className="mt-1 text-xs text-[#516f90]">Aucune assurance, contrôle technique ou entretien n&apos;expire dans les 30 prochains jours.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AlerteCard
                  title="Assurances expirées"
                  items={data.assurances_expirees}
                  dateKey="date_fin"
                  descKey="compagnie"
                  color="red"
                />
                <AlerteCard
                  title="Assurances expirant bientôt"
                  items={data.assurances_expirant}
                  dateKey="date_fin"
                  descKey="compagnie"
                  color="amber"
                />
                <AlerteCard
                  title="Contrôles techniques expirés"
                  items={data.controles_expires}
                  dateKey="date_expiration"
                  descKey="type_controle"
                  color="red"
                />
                <AlerteCard
                  title="Contrôles techniques expirant bientôt"
                  items={data.controles_expirant}
                  dateKey="date_expiration"
                  descKey="type_controle"
                  color="amber"
                />
                <AlerteCard
                  title="Entretiens planifiés à venir"
                  items={data.entretiens_prevus}
                  dateKey="date_prevue"
                  descKey="type_entretien"
                  color="blue"
                />
              </div>
            )}

            {/* Liens rapides */}
            <div className="flex flex-wrap gap-3">
              <Link href="/assurances" className="btn-secondary text-xs">Gérer les assurances →</Link>
              <Link href="/controles-techniques" className="btn-secondary text-xs">Gérer les CT →</Link>
              <Link href="/entretiens" className="btn-secondary text-xs">Gérer les entretiens →</Link>
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}

'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SaleDetailPageProps {
  saleId: string;
}

interface Payment {
  id: number;
  date: string;
  montant: number | string;
  mode_paiement?: string;
}

interface SaleDetail {
  id: number;
  reference_vente: string;
  date_vente: string;
  prix_final: number | string;
  statut: string;
  client?: { nom?: string; prenom?: string; telephone?: string; email?: string };
  voiture?: { marque?: string; modele?: string };
  facturation?: {
    id: number;
    numero_facture?: string;
    montant_ttc?: number | string;
    montant_ht?: number | string;
    remise?: number | string;
    statut?: string;
  };
  paiements?: Payment[];
}

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function name(person?: { nom?: string; prenom?: string }) {
  return [person?.nom, person?.prenom].filter(Boolean).join(' ') || '-';
}

function vehicle(vehicle?: { marque?: string; modele?: string }) {
  return [vehicle?.marque, vehicle?.modele].filter(Boolean).join(' ') || '-';
}

function statusClass(status?: string) {
  if (status === 'payee' || status === 'finalisee') return 'bg-emerald-50 text-emerald-700';
  if (status === 'partiellement_payee') return 'bg-amber-50 text-amber-700';
  if (status === 'en_retard') return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-700';
}

export default function SaleDetailPage({ saleId }: SaleDetailPageProps) {
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSale() {
    setLoading(true);
    setError(null);
    try {
      setSale(await apiClient.get<SaleDetail>(`/ventes/${saleId}`));
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger la vente');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSale();
  }, [saleId]);

  async function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sale?.facturation) return;

    const formData = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await apiClient.post('/paiements', {
        date: formData.get('date'),
        mode_paiement: formData.get('mode_paiement'),
        montant: Number(formData.get('montant') || 0),
        id_facture: sale.facturation.id,
      });
      event.currentTarget.reset();
      await loadSale();
    } catch (err: any) {
      setError(err?.message || 'Paiement impossible');
    } finally {
      setSaving(false);
    }
  }

  const paid = sale?.paiements?.reduce((sum, payment) => sum + Number(payment.montant || 0), 0) ?? 0;
  const total = Number(sale?.facturation?.montant_ttc || 0);
  const remaining = Math.max(total - paid, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white shadow-xl">
          <Link className="text-sm font-bold text-cyan-100 hover:text-white" href="/ventes/historique">
            Retour historique
          </Link>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            {sale?.reference_vente || 'Detail vente'}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200">
            Fiche complete de la vente avec facture, paiements et suivi du reste a payer.
          </p>
        </section>

        {loading && <p className="text-sm text-slate-500">Chargement de la vente...</p>}
        {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

        {!loading && sale && (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Client</p>
                <p className="mt-2 text-lg font-black text-slate-900">{name(sale.client)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Vehicule</p>
                <p className="mt-2 text-lg font-black text-slate-900">{vehicle(sale.voiture)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Total TTC</p>
                <p className="mt-2 text-lg font-black text-slate-900">{money(total)} XOF</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Reste a payer</p>
                <p className="mt-2 text-lg font-black text-slate-900">{money(remaining)} XOF</p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">Facture</h2>
                <div className="mt-5 space-y-3 text-sm text-slate-700">
                  <p><strong>Numero :</strong> {sale.facturation?.numero_facture || '-'}</p>
                  <p><strong>HT :</strong> {money(sale.facturation?.montant_ht)} XOF</p>
                  <p><strong>Remise :</strong> {money(sale.facturation?.remise)} XOF</p>
                  <p><strong>TTC :</strong> {money(sale.facturation?.montant_ttc)} XOF</p>
                  <p>
                    <strong>Statut :</strong>{' '}
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(sale.facturation?.statut)}`}>
                      {sale.facturation?.statut || '-'}
                    </span>
                  </p>
                </div>
              </div>

              <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submitPayment}>
                <h2 className="text-xl font-black text-slate-900">Ajouter un paiement</h2>
                <div className="mt-5 space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Date
                    <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" defaultValue={new Date().toISOString().slice(0, 10)} name="date" required type="date" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Mode
                    <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" name="mode_paiement" required>
                      <option value="especes">Especes</option>
                      <option value="virement">Virement</option>
                      <option value="cheque">Cheque</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="wave">Wave</option>
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Montant
                    <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" defaultValue={remaining} min="0" name="montant" required type="number" />
                  </label>
                </div>
                <button className="mt-5 w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-400" disabled={saving || !sale.facturation} type="submit">
                  {saving ? 'Enregistrement...' : 'Enregistrer paiement'}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Paiements</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Mode</th>
                      <th className="py-3 pr-4">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sale.paiements || []).length === 0 ? (
                      <tr><td className="py-6 text-slate-500" colSpan={3}>Aucun paiement enregistre.</td></tr>
                    ) : (
                      sale.paiements?.map((payment) => (
                        <tr key={payment.id} className="border-b border-slate-100">
                          <td className="py-3 pr-4">{payment.date}</td>
                          <td className="py-3 pr-4">{payment.mode_paiement || '-'}</td>
                          <td className="py-3 pr-4">{money(payment.montant)} XOF</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

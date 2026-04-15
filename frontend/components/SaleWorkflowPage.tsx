'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';

interface OptionItem {
  id: number;
  nom?: string;
  prenom?: string;
  marque?: string;
  modele?: string;
  prix?: number | string;
}

interface SaleResponse {
  id: number;
  reference_vente: string;
  prix_final: number | string;
  statut: string;
  client?: OptionItem;
  voiture?: OptionItem;
  facturation?: {
    id: number;
    numero_facture: string;
    montant_ht: number | string;
    remise: number | string;
    montant_ttc: number | string;
    statut: string;
  };
}

function collection(response: any): OptionItem[] {
  return Array.isArray(response) ? response : response?.data || [];
}

function label(item: OptionItem, fallback = 'Element') {
  const parts = [item.nom, item.prenom].filter(Boolean).join(' ');
  const vehicle = [item.marque, item.modele].filter(Boolean).join(' ');
  return parts || vehicle || `${fallback} #${item.id}`;
}

function money(value: number | string | undefined) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function SaleWorkflowPage() {
  const [clients, setClients] = useState<OptionItem[]>([]);
  const [voitures, setVoitures] = useState<OptionItem[]>([]);
  const [employes, setEmployes] = useState<OptionItem[]>([]);
  const [selectedVoiture, setSelectedVoiture] = useState<OptionItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [sale, setSale] = useState<SaleResponse | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [priceInput, setPriceInput] = useState(0);
  const [discountInput, setDiscountInput] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const subtotal = Math.max(priceInput - discountInput, 0);
  const tva = Math.round(subtotal * 0.18);
  const total = subtotal + tva;

  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      const [clientsResponse, voituresResponse, employesResponse] = await Promise.all([
        apiClient.get('/clients'),
        apiClient.get('/voitures', { statut: 'disponible' }),
        apiClient.get('/employes'),
      ]);

      if (!mounted) return;

      setClients(collection(clientsResponse));
      setVoitures(collection(voituresResponse));
      setEmployes(collection(employesResponse));
    }

    loadOptions().catch((err) => setError(err?.message || 'Chargement impossible'));

    return () => {
      mounted = false;
    };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!confirming) {
      setConfirming(true);
      setError(null);
      return;
    }

    const data = {
      date_vente: formData.get('date_vente'),
      id_client: Number(formData.get('id_client')),
      id_voiture: Number(formData.get('id_voiture')),
      prix_final: Number(formData.get('prix_final')),
      remise: Number(formData.get('remise') || 0),
      mode_paiement: formData.get('mode_paiement'),
      statut: 'finalisee',
      id_employe: Number(formData.get('id_employe')),
      observations: formData.get('observations'),
    };

    setSaving(true);
    setError(null);
    try {
      const response = await apiClient.post<SaleResponse>('/ventes', data);
      setSale(response);
      setPaidAmount(0);
      setVoitures((current) => current.filter((voiture) => voiture.id !== data.id_voiture));
      setSelectedVoiture(null);
      setPriceInput(0);
      setDiscountInput(0);
      setConfirming(false);
      form.reset();
    } catch (err: any) {
      setError(err?.message || 'Creation de vente impossible');
    } finally {
      setSaving(false);
    }
  }

  async function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sale?.facturation) return;

    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get('montant') || 0);

    setPaying(true);
    setPaymentError(null);
    try {
      await apiClient.post('/paiements', {
        date: formData.get('date'),
        mode_paiement: formData.get('mode_paiement'),
        montant: amount,
        id_facture: sale.facturation.id,
      });
      setPaidAmount((current) => current + amount);
      setSale({
        ...sale,
        facturation: {
          ...sale.facturation,
          statut: amount + paidAmount >= Number(sale.facturation.montant_ttc) ? 'payee' : 'partiellement_payee',
        },
      });
      event.currentTarget.reset();
    } catch (err: any) {
      setPaymentError(err?.message || 'Paiement impossible');
    } finally {
      setPaying(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white shadow-xl">
          <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">
            Workflow commercial
          </p>
          <h1 className="text-4xl font-black tracking-tight">Nouvelle vente</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200">
            Choisir un client, vendre uniquement un vehicule disponible, appliquer une remise, generer la facture et passer le vehicule en vendu.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Date vente
                <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" defaultValue={new Date().toISOString().slice(0, 10)} name="date_vente" required type="date" />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Client
                <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" name="id_client" required>
                  <option value="">Selectionner un client</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{label(client, 'Client')}</option>)}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Vehicule disponible
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                  name="id_voiture"
                  onChange={(event) => {
                    const voiture = voitures.find((item) => item.id === Number(event.target.value)) ?? null;
                    setSelectedVoiture(voiture);
                    setPriceInput(Number(voiture?.prix || 0));
                  }}
                  required
                >
                  <option value="">Selectionner un vehicule</option>
                  {voitures.map((voiture) => (
                    <option key={voiture.id} value={voiture.id}>
                      {label(voiture, 'Vehicule')} - {money(voiture.prix)} XOF
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Employe vendeur
                <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" name="id_employe" required>
                  <option value="">Selectionner un employe</option>
                  {employes.map((employe) => <option key={employe.id} value={employe.id}>{label(employe, 'Employe')}</option>)}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Prix final
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                  min="0"
                  name="prix_final"
                  onChange={(event) => setPriceInput(Number(event.target.value || 0))}
                  required
                  type="number"
                  value={priceInput || ''}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Remise
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                  min="0"
                  name="remise"
                  onChange={(event) => setDiscountInput(Number(event.target.value || 0))}
                  type="number"
                  value={discountInput || ''}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Mode de paiement
                <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" name="mode_paiement">
                  <option value="especes">Especes</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Cheque</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="wave">Wave</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700 md:col-span-2">
                Observations
                <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2" name="observations" />
              </label>
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h2 className="text-lg font-black text-slate-900">Recapitulatif avant validation</h2>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                <div>
                  <p className="text-slate-500">Prix saisi</p>
                  <p className="font-black text-slate-900">{money(priceInput)} XOF</p>
                </div>
                <div>
                  <p className="text-slate-500">Remise</p>
                  <p className="font-black text-slate-900">{money(discountInput)} XOF</p>
                </div>
                <div>
                  <p className="text-slate-500">HT apres remise</p>
                  <p className="font-black text-slate-900">{money(subtotal)} XOF</p>
                </div>
                <div>
                  <p className="text-slate-500">TTC avec TVA 18%</p>
                  <p className="font-black text-emerald-800">{money(total)} XOF</p>
                </div>
              </div>
              {discountInput > priceInput && (
                <p className="mt-3 text-sm font-semibold text-amber-700">
                  La remise depasse le prix saisi. Laravel forcera le HT a 0.
                </p>
              )}
              {confirming && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Confirme cette operation uniquement si le client, le vehicule, le prix et la remise sont corrects.
                  Apres validation, le vehicule passera au statut vendu et une facture sera generee.
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:bg-slate-400"
                disabled={saving}
                type="submit"
              >
                {saving ? 'Creation en cours...' : confirming ? 'Confirmer la vente' : 'Verifier avant validation'}
              </button>
              {confirming && (
                <button
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  onClick={() => setConfirming(false)}
                  type="button"
                >
                  Modifier les informations
                </button>
              )}
            </div>
          </form>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Resultat du workflow</h2>
            {!sale ? (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Apres validation, Laravel cree la vente, genere la facture avec TVA 18%, et met le vehicule au statut vendu.
              </p>
            ) : (
              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="font-bold text-emerald-900">Vente creee : {sale.reference_vente}</p>
                  <p className="mt-1 text-emerald-800">Statut vehicule : vendu</p>
                </div>
                <p><strong>Client :</strong> {sale.client ? label(sale.client, 'Client') : '-'}</p>
                <p><strong>Vehicule :</strong> {sale.voiture ? label(sale.voiture, 'Vehicule') : '-'}</p>
                <p><strong>Prix vente :</strong> {money(sale.prix_final)} XOF</p>
                {sale.facturation && (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p><strong>Facture :</strong> {sale.facturation.numero_facture}</p>
                    <p><strong>Remise :</strong> {money(sale.facturation.remise)} XOF</p>
                    <p><strong>HT apres remise :</strong> {money(sale.facturation.montant_ht)} XOF</p>
                    <p><strong>TTC :</strong> {money(sale.facturation.montant_ttc)} XOF</p>
                    <p><strong>Paye :</strong> {money(paidAmount)} XOF</p>
                    <p><strong>Reste :</strong> {money(Math.max(Number(sale.facturation.montant_ttc) - paidAmount, 0))} XOF</p>
                    <p><strong>Statut facture :</strong> {sale.facturation.statut}</p>
                  </div>
                )}
              </div>
            )}
          </aside>
        </section>

        {sale?.facturation && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Paiement immediat</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enregistrer un acompte ou solder directement la facture {sale.facturation.numero_facture}.
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                Reste a payer : {money(Math.max(Number(sale.facturation.montant_ttc) - paidAmount, 0))} XOF
              </div>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-4" onSubmit={submitPayment}>
              <label className="text-sm font-semibold text-slate-700">
                Date
                <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" defaultValue={new Date().toISOString().slice(0, 10)} name="date" required type="date" />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Mode
                <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" name="mode_paiement" required>
                  <option value="especes">Especes</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Cheque</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="wave">Wave</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Montant
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                  defaultValue={Math.max(Number(sale.facturation.montant_ttc) - paidAmount, 0)}
                  min="0"
                  name="montant"
                  required
                  type="number"
                />
              </label>

              <div className="flex items-end">
                <button className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-400" disabled={paying} type="submit">
                  {paying ? 'Paiement...' : 'Enregistrer paiement'}
                </button>
              </div>

              {paymentError && <p className="text-sm font-semibold text-red-600 md:col-span-4">{paymentError}</p>}
            </form>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

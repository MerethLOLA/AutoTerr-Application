'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
function imgUrl(p?: string | null) { return p ? `${API_URL}/storage/${p}` : null; }
function money(v?: number | string | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0));
}

interface Client  { id: number; nom: string; prenom?: string; telephone?: string; email?: string; }
interface Voiture { id: number; marque: string; modele: string; annee?: number; prix: number; statut: string; energie?: string; image_principale?: string; }
interface Employe { id: number; nom: string; prenom?: string; }

const STEPS = [
  { num: 1, label: 'Véhicule' },
  { num: 2, label: 'Client' },
  { num: 3, label: 'Conditions' },
  { num: 4, label: 'Confirmation' },
];

// ── Indicateur d'étapes ────────────────────────────────────────────────────────
function Stepper({ current }: { current: number }) {
  return (
    <div className="surface-panel p-5">
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition-all ${
                current > s.num  ? 'bg-emerald-500 text-white'
                : current === s.num ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/30'
                : 'bg-slate-100 text-slate-400'
              }`}>
                {current > s.num ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.num}
              </div>
              <span className={`hidden text-[11px] font-bold sm:block ${current === s.num ? 'text-[#ff6b35]' : current > s.num ? 'text-emerald-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 rounded-full transition-all ${current > s.num ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Carte véhicule résumée ─────────────────────────────────────────────────────
function VoitureCard({ v, compact = false }: { v: Voiture; compact?: boolean }) {
  const photo = imgUrl(v.image_principale);
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14v6H5v-6z" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-[#002d54]">{v.marque} {v.modele}</p>
          <p className="text-xs text-slate-500">{[v.annee, v.energie].filter(Boolean).join(' · ')}</p>
        </div>
        <p className="shrink-0 text-sm font-black text-[#002d54]">{money(v.prix)} <span className="text-xs font-normal text-slate-400">XOF</span></p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[16/7] overflow-hidden bg-slate-100">
        {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : (
          <div className="flex h-full items-center justify-center text-slate-200">
            <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5M5 11H3a1 1 0 00-1 1v1a1 1 0 001 1h2m14-2h2a1 1 0 011 1v1a1 1 0 01-1 1h-2" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{[v.annee, v.energie].filter(Boolean).join(' · ')}</p>
        <h3 className="mt-1 text-xl font-black text-[#002d54]">{v.marque} {v.modele}</h3>
        <p className="mt-2 text-2xl font-black text-slate-900">{money(v.prix)} <span className="text-sm font-bold text-slate-400">XOF</span></p>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function SaleWorkflowPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const preVoitureId = searchParams.get('voiture_id');

  const [step, setStep]     = useState(preVoitureId ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saleId, setSaleId] = useState<number | null>(null);

  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [clients, setClients]   = useState<Client[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);

  const [searchV, setSearchV] = useState('');
  const [searchC, setSearchC] = useState('');

  const [selVoiture, setSelVoiture] = useState<Voiture | null>(null);
  const [selClient, setSelClient]   = useState<Client | null>(null);

  const [form, setForm] = useState({
    id_voiture:   preVoitureId ?? '',
    id_client:    '',
    id_employe:   '',
    prix_final:   '',
    remise:       '0',
    date_vente:   new Date().toISOString().slice(0, 10),
    observations: '',
  });

  function patch(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  // Chargement des données de référence
  useEffect(() => {
    function arr<T>(res: any): T[] {
      return Array.isArray(res) ? res : (res?.data ?? []);
    }
    Promise.all([
      apiClient.get<any>('/voitures?statut=disponible&per_page=100').then((r) => setVoitures(arr<Voiture>(r))),
      apiClient.get<any>('/clients?per_page=200').then((r) => setClients(arr<Client>(r))),
      apiClient.get<any>('/employes?per_page=100').then((r) => setEmployes(arr<Employe>(r))),
    ]).catch(console.error);
  }, []);

  // Si voiture_id dans l'URL → pré-sélectionner
  useEffect(() => {
    if (!preVoitureId || voitures.length === 0) return;
    const found = voitures.find((v) => String(v.id) === preVoitureId);
    if (found) { setSelVoiture(found); patch('prix_final', String(found.prix)); }
  }, [preVoitureId, voitures]);

  // Filtres locaux
  const filteredVoitures = useMemo(() =>
    voitures.filter((v) =>
      !searchV || `${v.marque} ${v.modele}`.toLowerCase().includes(searchV.toLowerCase())
    ), [voitures, searchV]);

  const filteredClients = useMemo(() =>
    clients.filter((c) =>
      !searchC || `${c.nom} ${c.prenom ?? ''} ${c.telephone ?? ''}`.toLowerCase().includes(searchC.toLowerCase())
    ), [clients, searchC]);

  // Calculs financiers
  const prixBase = Number(form.prix_final) || 0;
  const remise   = Number(form.remise) || 0;
  const montantHT  = Math.max(prixBase - remise, 0);
  const tva        = 18;
  const montantTTC = Math.round(montantHT * (1 + tva / 100) * 100) / 100;

  // Soumission
  async function handleSubmit() {
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await apiClient.post<any>('/ventes', {
        id_voiture:   Number(form.id_voiture),
        id_client:    Number(form.id_client),
        id_employe:   Number(form.id_employe) || undefined,
        prix_final:   prixBase,
        remise:       remise,
        date_vente:   form.date_vente,
        statut:       'finalisee',
        observations: form.observations || undefined,
      });
      setSaleId(res?.id ?? res?.data?.id ?? null);
      setStep(5);
    } catch (err: any) {
      setSubmitError(err?.message || 'Une erreur est survenue. Vérifiez les informations.');
    } finally {
      setLoading(false);
    }
  }

  // ── Écran de succès ──────────────────────────────────────────────────────────
  if (step === 5) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-10 w-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-black text-[#002d54]">Vente finalisée !</h1>
          <p className="mt-3 text-slate-500">
            La vente a été enregistrée avec succès.
            {selClient && ` Client : ${selClient.nom}${selClient.prenom ? ' ' + selClient.prenom : ''}.`}
          </p>
          {selVoiture && (
            <div className="mt-6">
              <VoitureCard v={selVoiture} compact />
            </div>
          )}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Récapitulatif financier</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Prix de vente</span><span className="font-bold">{money(prixBase)} XOF</span></div>
              {remise > 0 && <div className="flex justify-between text-amber-600"><span>Remise</span><span className="font-bold">- {money(remise)} XOF</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">Montant HT</span><span className="font-bold">{money(montantHT)} XOF</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base"><span className="font-black text-[#002d54]">Total TTC (TVA {tva}%)</span><span className="font-black text-[#002d54]">{money(montantTTC)} XOF</span></div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {saleId && (
              <Link href={`/ventes/${saleId}`} className="btn-primary w-full text-center">
                Voir la fiche de vente →
              </Link>
            )}
            {saleId && (
              <Link href={`/facturations`} className="btn-secondary w-full text-center">
                Accéder aux factures
              </Link>
            )}
            <button onClick={() => { setStep(1); setSelVoiture(null); setSelClient(null); setForm({ id_voiture: '', id_client: '', id_employe: '', prix_final: '', remise: '0', date_vente: new Date().toISOString().slice(0, 10), observations: '' }); setSaleId(null); }}
              className="text-sm font-bold text-slate-500 hover:text-[#002d54]">
              Créer une nouvelle vente
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">

        {/* En-tête */}
        <div className="page-header">
          <div>
            <p className="eyebrow">Commercial</p>
            <h1 className="page-title mt-1">Nouvelle vente</h1>
            <p className="page-subtitle">Sélectionnez le véhicule, le client et finalisez la transaction.</p>
          </div>
        </div>

        {/* Stepper */}
        <Stepper current={step} />

        {/* Récap compact si véhicule déjà sélectionné (étapes 2+) */}
        {selVoiture && step > 1 && <VoitureCard v={selVoiture} compact />}

        {/* ── Étape 1 : Véhicule ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="surface-panel space-y-5 p-6">
            <div>
              <h2 className="section-title">Sélection du véhicule</h2>
              <p className="mt-1 text-sm text-slate-400">{voitures.length} véhicule{voitures.length !== 1 ? 's' : ''} disponible{voitures.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Recherche */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Filtrer par marque ou modèle…" className="field-control pl-10"
                value={searchV} onChange={(e) => setSearchV(e.target.value)} />
            </div>

            {/* Liste */}
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {filteredVoitures.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Aucun véhicule disponible.</p>}
              {filteredVoitures.map((v) => {
                const sel = selVoiture?.id === v.id;
                const photo = imgUrl(v.image_principale);
                return (
                  <button key={v.id} type="button"
                    onClick={() => { setSelVoiture(v); patch('id_voiture', String(v.id)); patch('prix_final', String(v.prix)); }}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      sel ? 'border-[#ff6b35] bg-[#ff6b35]/[0.04] shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}>
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14v6H5v-6z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-[#002d54]">{v.marque} {v.modele}</p>
                      <p className="text-xs text-slate-400">{[v.annee, v.energie].filter(Boolean).join(' · ')}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-black text-slate-800">{money(v.prix)}</p>
                      <p className="text-xs text-slate-400">XOF</p>
                    </div>
                    {sel && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff6b35]">
                        <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button type="button" className="btn-primary" onClick={() => setStep(2)} disabled={!selVoiture}>
                Sélectionner ce véhicule →
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 2 : Client ───────────────────────────────────────────── */}
        {step === 2 && (
          <div className="surface-panel space-y-5 p-6">
            <div>
              <h2 className="section-title">Sélection du client</h2>
              <p className="mt-1 text-sm text-slate-400">{clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Rechercher par nom, prénom, téléphone…" className="field-control pl-10"
                value={searchC} onChange={(e) => setSearchC(e.target.value)} />
            </div>

            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {filteredClients.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Aucun client trouvé.</p>}
              {filteredClients.map((c) => {
                const sel = selClient?.id === c.id;
                const full = `${c.nom}${c.prenom ? ' ' + c.prenom : ''}`;
                return (
                  <button key={c.id} type="button"
                    onClick={() => { setSelClient(c); patch('id_client', String(c.id)); }}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      sel ? 'border-[#ff6b35] bg-[#ff6b35]/[0.04]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${sel ? 'bg-[#ff6b35] text-white' : 'bg-[#002d54] text-white'}`}>
                      {full.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-800">{full}</p>
                      {c.telephone && <p className="text-xs text-slate-400">{c.telephone}</p>}
                    </div>
                    {sel && (
                      <svg className="h-5 w-5 shrink-0 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <Link href="/clients" className="text-sm font-bold text-[#ff6b35] hover:underline">
                + Créer un nouveau client
              </Link>
              <div className="flex gap-3">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>← Retour</button>
                <button type="button" className="btn-primary" onClick={() => setStep(3)} disabled={!selClient}>
                  Continuer →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Étape 3 : Conditions ───────────────────────────────────────── */}
        {step === 3 && (
          <div className="surface-panel space-y-5 p-6">
            <h2 className="section-title">Conditions de la vente</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                Prix de vente (XOF) *
                <input type="number" min={0} className="field-control font-normal"
                  value={form.prix_final} onChange={(e) => patch('prix_final', e.target.value)} required />
              </label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                Remise (XOF)
                <input type="number" min={0} className="field-control font-normal"
                  value={form.remise} onChange={(e) => patch('remise', e.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                Date de vente *
                <input type="date" className="field-control font-normal"
                  value={form.date_vente} onChange={(e) => patch('date_vente', e.target.value)} required />
              </label>
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                Vendeur responsable
                <select className="field-control font-normal" value={form.id_employe}
                  onChange={(e) => patch('id_employe', e.target.value)}>
                  <option value="">Sélectionner…</option>
                  {employes.map((e) => (
                    <option key={e.id} value={e.id}>{e.nom}{e.prenom ? ' ' + e.prenom : ''}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              Observations
              <textarea rows={3} className="field-control min-h-20 font-normal"
                placeholder="Notes internes, conditions particulières…"
                value={form.observations} onChange={(e) => patch('observations', e.target.value)} />
            </label>

            {/* Simulation financière */}
            {prixBase > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Simulation financière</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Prix de vente</span><span className="font-bold">{money(prixBase)} XOF</span></div>
                  {remise > 0 && <div className="flex justify-between text-amber-600"><span>Remise accordée</span><span className="font-bold">- {money(remise)} XOF</span></div>}
                  <div className="flex justify-between"><span className="text-slate-500">Montant HT</span><span className="font-bold">{money(montantHT)} XOF</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">TVA ({tva}%)</span><span className="font-bold">{money(montantTTC - montantHT)} XOF</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-black text-[#002d54]">
                    <span>Total TTC</span>
                    <span>{money(montantTTC)} XOF</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between border-t border-slate-100 pt-4">
              <button type="button" className="btn-secondary" onClick={() => setStep(2)}>← Retour</button>
              <button type="button" className="btn-primary" onClick={() => setStep(4)}
                disabled={!form.prix_final || !form.date_vente}>
                Récapitulatif →
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 4 : Confirmation ────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="surface-panel p-6">
              <h2 className="section-title mb-5">Récapitulatif avant finalisation</h2>

              {/* Véhicule */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Véhicule</p>
                {selVoiture && <VoitureCard v={selVoiture} compact />}
              </div>

              {/* Client */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Client</p>
                {selClient && (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002d54] text-sm font-black text-white">
                      {selClient.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{selClient.nom}{selClient.prenom ? ' ' + selClient.prenom : ''}</p>
                      {selClient.telephone && <p className="text-xs text-slate-500">{selClient.telephone}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Financier */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Conditions financières</p>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Prix de vente</span><span className="font-bold">{money(prixBase)} XOF</span></div>
                    {remise > 0 && <div className="flex justify-between text-amber-600"><span>Remise</span><span className="font-bold">- {money(remise)} XOF</span></div>}
                    <div className="flex justify-between"><span className="text-slate-500">Montant HT</span><span className="font-bold">{money(montantHT)} XOF</span></div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-black text-[#002d54]">
                      <span>Total TTC (TVA {tva}%)</span>
                      <span>{money(montantTTC)} XOF</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Date : {form.date_vente}</p>
                  {form.observations && <p className="mt-1 text-xs text-slate-400">Observations : {form.observations}</p>}
                </div>
              </div>
            </div>

            {/* Erreur */}
            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {submitError}
              </div>
            )}

            <div className="flex justify-between">
              <button type="button" className="btn-secondary" onClick={() => setStep(3)}>← Modifier</button>
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="btn-primary min-w-48 disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Finalisation…
                  </span>
                ) : '✓ Finaliser la vente'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

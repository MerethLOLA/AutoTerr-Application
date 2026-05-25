'use client';

import PublicLayout from '@/components/PublicLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Image { id: number; chemin: string; vue?: string; }
interface Voiture {
  id: number; marque: string; modele: string; annee?: number;
  prix?: number; prix_vente?: number;
  energie?: string; kilometrage?: number;
  puissance?: number; couleur?: string; boite_vitesse?: string;
  nombre_portes?: number; nombre_places?: number;
  statut?: string; type_usage?: string; image_principale?: string;
  images?: Image[];
}

const VIOLET = '#2d1b3d';
const HEURES = ['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'];

function money(v?: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0);
}
function imgUrl(p?: string | null) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  return `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/storage/${p}`;
}

type Tab = 'reserver' | 'achat' | 'information' | 'reprise';

const ALL_TABS: { key: Tab; label: string }[] = [
  { key: 'reserver',    label: 'Réserver' },
  { key: 'achat',       label: 'Acheter' },
  { key: 'information', label: 'Infos' },
  { key: 'reprise',     label: 'Reprise' },
];

const inputCls = 'w-full rounded-lg border border-[#dfe3eb] bg-[#f5f8fa] px-3 py-2.5 text-sm text-[#33475b] placeholder:text-[#99acc2] focus:border-[#5b2d8e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5b2d8e]/20';
const labelCls = 'mb-1.5 block text-xs font-bold text-[#33475b]';

function Feedback({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
      {msg}
    </div>
  );
}

function ReserverTab({ voiture }: { voiture: Voiture }) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-sm text-[#6b7280]">
        Connectez-vous ou créez un compte pour réserver ce véhicule depuis votre espace client.
      </p>
      <Link href="/inscription"
        className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-black text-white transition hover:opacity-90"
        style={{ backgroundColor: VIOLET }}>
        Créer mon compte et réserver
      </Link>
      <Link href="/login/client"
        className="flex w-full items-center justify-center rounded-xl border border-[#dfe3eb] py-3.5 text-sm font-bold text-[#33475b] transition hover:border-[#2d1b3d] hover:text-[#2d1b3d]">
        J&apos;ai déjà un compte — Se connecter
      </Link>
      {voiture.prix && (
        <p className="text-center text-xs text-[#6b7280]">
          Tarif : <strong>{money(voiture.prix)} XOF / jour</strong> · Confirmation sous 24h
        </p>
      )}
    </div>
  );
}

function RendezVousForm({ voiture }: { voiture: Voiture }) {
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '',
    rendez_vous_date: '', rendez_vous_heure: '', message: '',
  });
  const [loading, setLoading]   = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      await apiClient.post('/demandes', {
        type: 'achat',
        id_voiture: voiture.id,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone || undefined,
        rendez_vous_date: form.rendez_vous_date || undefined,
        rendez_vous_heure: form.rendez_vous_heure || undefined,
        message: form.message || undefined,
      });
      setFeedback({ msg: "Votre demande d'achat a bien été reçue. Nous confirmerons votre rendez-vous par email.", ok: true });
      setForm({ nom: '', email: '', telephone: '', rendez_vous_date: '', rendez_vous_heure: '', message: '' });
    } catch (err: any) {
      setFeedback({ msg: err?.message || 'Une erreur est survenue. Réessayez.', ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 pt-2">
      {feedback && <Feedback {...feedback} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nom complet *</label>
          <input className={inputCls} placeholder="Votre nom" required
            value={form.nom} onChange={(e) => set('nom', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input className={inputCls} type="email" placeholder="vous@exemple.com" required
            value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Téléphone</label>
        <input className={inputCls} placeholder="+221 77 000 00 00"
          value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Date souhaitée</label>
          <input className={inputCls} type="date"
            min={new Date().toISOString().split('T')[0]}
            value={form.rendez_vous_date} onChange={(e) => set('rendez_vous_date', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Heure</label>
          <select className={inputCls}
            value={form.rendez_vous_heure} onChange={(e) => set('rendez_vous_heure', e.target.value)}>
            <option value="">— Sélectionner —</option>
            {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Message (facultatif)</label>
        <textarea className={`${inputCls} h-20 resize-none`}
          placeholder="Questions sur le financement, reprise de votre véhicule actuel…"
          value={form.message} onChange={(e) => set('message', e.target.value)} />
      </div>

      {voiture.prix_vente && (
        <p className="rounded-lg border border-[#ede8f4] bg-[#f9f7fc] px-4 py-2.5 text-sm text-[#33475b]">
          Prix de vente : <strong>{money(voiture.prix_vente)} XOF</strong>
        </p>
      )}

      <button type="submit" disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-black text-white transition disabled:opacity-50"
        style={{ backgroundColor: VIOLET }}>
        {loading ? 'Envoi en cours…' : "Prendre rendez-vous pour l'achat"}
      </button>
    </form>
  );
}

function DemandeForm({ type, voitureId }: { type: 'information' | 'reprise'; voitureId: number }) {
  const isReprise = type === 'reprise';
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '', message: '',
    reprise_marque: '', reprise_modele: '',
    reprise_annee: '', reprise_kilometrage: '', reprise_etat: '',
  });
  const [loading, setLoading]   = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        type,
        id_voiture: voitureId,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone || undefined,
        message: form.message || undefined,
      };
      if (isReprise) {
        payload.reprise_marque      = form.reprise_marque;
        payload.reprise_modele      = form.reprise_modele;
        payload.reprise_annee       = form.reprise_annee ? Number(form.reprise_annee) : undefined;
        payload.reprise_kilometrage = form.reprise_kilometrage ? Number(form.reprise_kilometrage) : undefined;
        payload.reprise_etat        = form.reprise_etat || undefined;
      }
      await apiClient.post('/demandes', payload);
      setFeedback({
        msg: isReprise
          ? 'Votre demande de reprise a été envoyée. Nous vous recontacterons rapidement.'
          : "Votre demande d'informations a bien été reçue. Nous vous répondrons dans les plus brefs délais.",
        ok: true,
      });
      setForm({ nom: '', email: '', telephone: '', message: '',
        reprise_marque: '', reprise_modele: '',
        reprise_annee: '', reprise_kilometrage: '', reprise_etat: '' });
    } catch (err: any) {
      setFeedback({ msg: err?.message || 'Une erreur est survenue. Réessayez.', ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 pt-2">
      {feedback && <Feedback {...feedback} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nom complet *</label>
          <input className={inputCls} placeholder="Votre nom" required
            value={form.nom} onChange={(e) => set('nom', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input className={inputCls} type="email" placeholder="vous@exemple.com" required
            value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Téléphone</label>
        <input className={inputCls} placeholder="+221 77 000 00 00"
          value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
      </div>

      {isReprise && (
        <div className="rounded-lg border border-[#ede8f4] bg-[#f9f7fc] p-3">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6b7280]">Votre véhicule à reprendre</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Marque *</label>
              <input className={inputCls} placeholder="Toyota, Renault…" required
                value={form.reprise_marque} onChange={(e) => set('reprise_marque', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Modèle *</label>
              <input className={inputCls} placeholder="Corolla, Clio…" required
                value={form.reprise_modele} onChange={(e) => set('reprise_modele', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Année</label>
              <input className={inputCls} type="number" placeholder="2019"
                min="1970" max={new Date().getFullYear()}
                value={form.reprise_annee} onChange={(e) => set('reprise_annee', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Kilométrage</label>
              <input className={inputCls} type="number" placeholder="85000"
                value={form.reprise_kilometrage} onChange={(e) => set('reprise_kilometrage', e.target.value)} />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelCls}>État général</label>
            <select className={inputCls}
              value={form.reprise_etat} onChange={(e) => set('reprise_etat', e.target.value)}>
              <option value="">— Sélectionner —</option>
              <option value="bon">Bon état</option>
              <option value="moyen">État moyen</option>
              <option value="mauvais">Mauvais état</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>{isReprise ? 'Informations complémentaires' : 'Votre message'}</label>
        <textarea className={`${inputCls} h-24 resize-none`}
          placeholder={isReprise ? "Précisez les options, l'historique d'entretien…" : 'Posez vos questions sur ce véhicule…'}
          value={form.message} onChange={(e) => set('message', e.target.value)} />
      </div>

      <button type="submit" disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-black text-white transition disabled:opacity-50"
        style={{ backgroundColor: VIOLET }}>
        {loading ? 'Envoi en cours…' : isReprise ? 'Envoyer ma demande de reprise' : 'Envoyer ma demande'}
      </button>
    </form>
  );
}

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const _initCatV = apiClient.getCached<any>(`/voitures/${Number(id)}/public`);
  const [voiture, setVoiture]     = useState<Voiture | null>(_initCatV ?? null);
  const [loading, setLoading]     = useState(_initCatV === null);
  const [notFound, setNotFound]   = useState(false);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('reserver');

  useEffect(() => {
    apiClient.getPublicVoiture(Number(id))
      .then((data: any) => {
        setVoiture(data);
        if (data.type_usage === 'vente') setActiveTab('achat');
        const first = imgUrl(data?.image_principale) ?? imgUrl(data?.images?.[0]?.chemin);
        setActiveImg(first ?? null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="h-96 animate-pulse rounded-xl bg-[#f3f0f7]" />
            <div className="space-y-4">
              {[1,2,3].map((i) => <div key={i} className="h-8 animate-pulse rounded bg-[#f3f0f7]" />)}
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (notFound || !voiture) {
    return (
      <PublicLayout>
        <div className="py-32 text-center">
          <p className="text-xl font-black text-[#111827]">Véhicule introuvable</p>
          <Link href="/catalogue" className="mt-4 inline-block text-sm font-semibold text-[#5b2d8e] hover:underline">
            ← Retour au catalogue
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const allImages: string[] = [];
  if (voiture.image_principale) { const u = imgUrl(voiture.image_principale); if (u) allImages.push(u); }
  voiture.images?.forEach((img) => { const u = imgUrl(img.chemin); if (u && !allImages.includes(u)) allImages.push(u); });
  const currentImg = activeImg ?? allImages[0] ?? null;

  const specs = [
    voiture.energie                    && { label: 'Énergie',     value: voiture.energie },
    voiture.kilometrage !== undefined  && { label: 'Kilométrage', value: `${money(voiture.kilometrage)} km` },
    voiture.boite_vitesse              && { label: 'Boîte',       value: voiture.boite_vitesse },
    voiture.nombre_places !== undefined && { label: 'Places',     value: String(voiture.nombre_places) },
    voiture.puissance                  && { label: 'Puissance',   value: `${voiture.puissance} ch` },
    voiture.couleur                    && { label: 'Couleur',     value: voiture.couleur },
    voiture.nombre_portes !== undefined && { label: 'Portes',     value: String(voiture.nombre_portes) },
    voiture.annee                      && { label: 'Année',       value: String(voiture.annee) },
  ].filter(Boolean) as { label: string; value: string }[];

  const isLocation = voiture.type_usage === 'location' || voiture.type_usage === 'les_deux';
  const isVente    = voiture.type_usage === 'vente'    || voiture.type_usage === 'les_deux';

  const visibleTabs = ALL_TABS.filter((t) => {
    if (t.key === 'reserver') return isLocation;
    if (t.key === 'achat')    return isVente;
    return true;
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#6b7280]">
          <Link href="/" className="hover:text-[#2d1b3d]">Accueil</Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-[#2d1b3d]">Catalogue</Link>
          <span>/</span>
          <span className="font-semibold text-[#111827]">{voiture.marque} {voiture.modele}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">

          {/* ── Galerie ── */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl bg-[#f3f0f7]" style={{ aspectRatio: '16/9' }}>
              {currentImg ? (
                <Image src={currentImg} alt={`${voiture.marque} ${voiture.modele}`}
                  fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg className="h-20 w-20 text-[#c9a8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
                  </svg>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((src, i) => (
                  <button key={i} onClick={() => setActiveImg(src)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${src === currentImg ? 'border-[#2d1b3d]' : 'border-transparent hover:border-[#c9a8e8]'}`}>
                    <Image src={src} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specs */}
            {specs.length > 0 && (
              <div className="rounded-xl border border-[#ede8f4] bg-[#f9f7fc] p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6b7280]">Caractéristiques</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {specs.map((s) => (
                    <div key={s.label}>
                      <p className="text-xs text-[#6b7280]">{s.label}</p>
                      <p className="text-sm font-bold text-[#111827]">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Panneau droit ── */}
          <div className="space-y-4">
            {/* Titre + prix */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-bold uppercase tracking-widest text-[#5b2d8e]">{voiture.marque}</p>
                {voiture.type_usage === 'location' && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Location</span>}
                {voiture.type_usage === 'vente'    && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Vente</span>}
                {voiture.type_usage === 'les_deux' && <span className="rounded-full bg-[#f3f0f7] px-2 py-0.5 text-xs font-bold text-[#2d1b3d]">Location · Vente</span>}
              </div>
              <h1 className="mt-0.5 text-3xl font-black text-[#111827]">
                {voiture.modele}{' '}
                {voiture.annee && <span className="text-xl font-normal text-[#6b7280]">{voiture.annee}</span>}
              </h1>

              {/* Prix : location + vente séparés */}
              <div className="mt-2 space-y-1">
                {isLocation && voiture.prix && (
                  <p className="text-2xl font-black" style={{ color: VIOLET }}>
                    {money(voiture.prix)}{' '}
                    <span className="text-base font-normal text-[#6b7280]">XOF / jour</span>
                  </p>
                )}
                {isVente && voiture.prix_vente && (
                  <p className={isLocation ? 'text-xl font-black text-emerald-700' : 'text-2xl font-black'}
                    style={!isLocation ? { color: VIOLET } : {}}>
                    {money(voiture.prix_vente)}{' '}
                    <span className="text-base font-normal text-[#6b7280]">XOF</span>
                    {isLocation && <span className="ml-1 text-sm font-normal text-[#6b7280]">(à l&apos;achat)</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-[#ede8f4] bg-white p-5">
              {visibleTabs.length > 1 && (
                <div className="flex gap-1 rounded-lg border border-[#ede8f4] bg-[#f9f7fc] p-1 mb-4">
                  {visibleTabs.map((t) => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`flex-1 rounded px-2 py-2 text-xs font-bold transition ${
                        activeTab === t.key ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6b7280] hover:text-[#111827]'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'reserver'    && <ReserverTab voiture={voiture} />}
              {activeTab === 'achat'       && <RendezVousForm voiture={voiture} />}
              {activeTab === 'information' && <DemandeForm type="information" voitureId={voiture.id} />}
              {activeTab === 'reprise'     && <DemandeForm type="reprise" voitureId={voiture.id} />}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

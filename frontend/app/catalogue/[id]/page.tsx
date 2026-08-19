'use client';

import PublicLayout from '@/components/PublicLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Image { id: number; chemin: string; vue?: string; }
interface Voiture {
  id: number; marque: string; modele: string; annee?: number;
  prix?: number; prix_vente?: number;
  energie?: string; kilometrage?: number;
  puissance?: number; cylindree?: string; couleur?: string; type_boite?: string;
  nombre_vitesses?: number; transmission?: string; nombre_portes?: number; nombre_places?: number;
  consommation?: number; emissions_co2?: number; etat?: string;
  type_vehicule?: { id: number; nom: string };
  origine_marque?: { id: number; nom: string };
  statut?: string; type_usage?: string; image_principale?: string;
  images?: Image[]; likes_count?: number;
}

const NAVY = 'var(--color-accent)';
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

const inputCls = 'w-full rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-background-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:bg-[var(--color-background-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-ring)]';
const labelCls = 'mb-1.5 block text-xs font-bold text-[var(--color-text-primary)]';

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
      <p className="text-sm text-[var(--color-text-secondary)]">
        Connectez-vous ou créez un compte pour réserver ce véhicule depuis votre espace client.
      </p>
      <Link href="/inscription"
        className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-black text-white transition hover:opacity-90"
        style={{ backgroundColor: NAVY }}>
        Créer mon compte et réserver
      </Link>
      <Link href="/login/client"
        className="flex w-full items-center justify-center rounded-xl border border-[var(--color-border-secondary)] py-3.5 text-sm font-bold text-[var(--color-text-primary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
        J&apos;ai déjà un compte — Se connecter
      </Link>
      {voiture.prix && (
        <p className="text-center text-xs text-[var(--color-text-secondary)]">
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
        <p className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)]">
          Prix de vente : <strong>{money(voiture.prix_vente)} XOF</strong>
        </p>
      )}

      <button type="submit" disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-black text-white transition disabled:opacity-50"
        style={{ backgroundColor: NAVY }}>
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
        <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-3">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Votre véhicule à reprendre</p>
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
        style={{ backgroundColor: NAVY }}>
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
  const [activeTab, setActiveTab] = useState<Tab>('reserver');

  // Galerie
  const [selected, setSelected] = useState(0);
  const [paused, setPaused]     = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.getPublicVoiture(Number(id))
      .then((data: any) => {
        setVoiture(data);
        if (data.type_usage === 'vente') setActiveTab('achat');
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const allImages: string[] = [];
  if (voiture?.image_principale) { const u = imgUrl(voiture.image_principale); if (u) allImages.push(u); }
  voiture?.images?.forEach((img) => { const u = imgUrl(img.chemin); if (u && !allImages.includes(u)) allImages.push(u); });
  const count = allImages.length;

  const goTo = useCallback((i: number) => {
    setSelected(i);
    const el = thumbsRef.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, []);
  const prev = useCallback(() => goTo((selected - 1 + count) % count), [goTo, selected, count]);
  const next = useCallback(() => goTo((selected + 1) % count), [goTo, selected, count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => setSelected((s) => (s + 1) % count), 4000);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="h-96 animate-pulse rounded-xl bg-[var(--color-accent-light)]" />
            <div className="space-y-4">
              {[1,2,3].map((i) => <div key={i} className="h-8 animate-pulse rounded bg-[var(--color-accent-light)]" />)}
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
          <p className="text-xl font-black text-[var(--color-text-primary)]">Véhicule introuvable</p>
          <Link href="/catalogue" className="mt-4 inline-block text-sm font-semibold text-[var(--color-accent)] hover:underline">
            ← Retour au catalogue
          </Link>
        </div>
      </PublicLayout>
    );
  }

  type Spec = { label: string; value: string };
  const specGroups: { title: string; icon: string; items: Spec[] }[] = [
    {
      title: 'Général',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      items: [
        voiture.modele                      && { label: 'Modèle',      value: voiture.modele },
        voiture.annee                       && { label: 'Année',       value: String(voiture.annee) },
        voiture.kilometrage !== undefined   && { label: 'Kilométrage', value: `${money(voiture.kilometrage)} km` },
        voiture.etat                        && { label: 'État',        value: voiture.etat.replace(/^\w/, (c) => c.toUpperCase()) },
        voiture.type_vehicule?.nom          && { label: 'Type de véhicule', value: voiture.type_vehicule.nom },
        voiture.origine_marque?.nom         && { label: 'Origine',     value: voiture.origine_marque.nom },
      ].filter(Boolean) as Spec[],
    },
    {
      title: 'Motorisation & Performance',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      items: [
        voiture.energie                     && { label: 'Énergie',      value: voiture.energie },
        voiture.puissance                   && { label: 'Puissance',    value: `${voiture.puissance} ch` },
        voiture.cylindree                   && { label: 'Cylindrée',    value: voiture.cylindree },
        voiture.type_boite                  && { label: 'Boîte',        value: voiture.type_boite },
        voiture.nombre_vitesses !== undefined && { label: 'Vitesses',   value: String(voiture.nombre_vitesses) },
        voiture.transmission                && { label: 'Transmission', value: voiture.transmission },
        voiture.consommation !== undefined  && { label: 'Consommation', value: `${voiture.consommation} L/100 km` },
        voiture.emissions_co2 !== undefined  && { label: 'CO₂',          value: `${voiture.emissions_co2} g/km` },
      ].filter(Boolean) as Spec[],
    },
    {
      title: 'Confort & Dimensions',
      icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 2a4 4 0 100-8 4 4 0 000 8z',
      items: [
        voiture.couleur                     && { label: 'Couleur',     value: voiture.couleur },
        voiture.nombre_portes !== undefined  && { label: 'Portes',      value: String(voiture.nombre_portes) },
        voiture.nombre_places !== undefined  && { label: 'Places',      value: String(voiture.nombre_places) },
      ].filter(Boolean) as Spec[],
    },
  ].filter((g) => g.items.length > 0);
  const specsCount = specGroups.reduce((n, g) => n + g.items.length, 0);

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
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <Link href="/" className="hover:text-[var(--color-accent)]">Accueil</Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-[var(--color-accent)]">Catalogue</Link>
          <span>/</span>
          <span className="font-semibold text-[var(--color-text-primary)]">{voiture.marque} {voiture.modele}</span>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_420px]">

          {/* ── Galerie ── */}
          <div className="space-y-3">
            <div
              className="group relative overflow-hidden rounded-2xl bg-[var(--color-accent-light)] shadow-sm"
              style={{ aspectRatio: '4/3' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {count > 0 ? (
                allImages.map((src, i) => (
                  <Image key={src} src={src} alt={`${voiture.marque} ${voiture.modele} — photo ${i + 1}`}
                    fill className="object-cover transition-opacity duration-500"
                    style={{ opacity: i === selected ? 1 : 0, zIndex: i === selected ? 1 : 0 }} />
                ))
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg className="h-20 w-20 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
                  </svg>
                </div>
              )}

              {/* Badge type */}
              <div className="absolute left-3 top-3 flex items-center gap-2">
                {voiture.type_usage === 'location' && <span className="rounded-full bg-blue-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">Location</span>}
                {voiture.type_usage === 'vente'    && <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">Vente</span>}
                {voiture.type_usage === 'les_deux' && <span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm" style={{ backgroundColor: `${NAVY}e6` }}>Location · Vente</span>}
              </div>

              {count > 1 && (
                <>
                  {/* Flèches */}
                  <button type="button" aria-label="Photo précédente" onClick={prev}
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button type="button" aria-label="Photo suivante" onClick={next}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Indicateurs */}
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                    {allImages.map((_, i) => (
                      <button key={i} type="button" aria-label={`Photo ${i + 1}`} onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-300 ${i === selected ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/50 hover:bg-white/80'}`} />
                    ))}
                  </div>

                  {/* Compteur */}
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs font-bold text-white">
                    {selected + 1} / {count}
                  </span>
                </>
              )}
            </div>

            {/* Miniatures */}
            {count > 1 && (
              <div ref={thumbsRef} className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((src, i) => (
                  <button key={src} type="button" onClick={() => goTo(i)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === selected ? 'border-[var(--color-accent)]' : 'border-transparent hover:border-[var(--color-text-secondary)]'}`}>
                    <Image src={src} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specs */}
            {specsCount > 0 && (
              <div className="rounded-xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Caractéristiques</p>
                <div className="space-y-5">
                  {specGroups.map((group) => (
                    <div key={group.title}>
                      <div className="mb-2.5 flex items-center gap-1.5">
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke={NAVY} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={group.icon} />
                        </svg>
                        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: NAVY }}>{group.title}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {group.items.map((s) => (
                          <div key={s.label} className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 py-2">
                            <p className="text-[11px] text-[var(--color-text-secondary)]">{s.label}</p>
                            <p className="mt-0.5 text-sm font-bold text-[var(--color-text-primary)]">{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Panneau droit ── */}
          <div className="space-y-4 lg:sticky lg:top-6">
            {/* Titre + prix */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">{voiture.marque}</p>
                {voiture.type_usage === 'location' && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Location</span>}
                {voiture.type_usage === 'vente'    && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Vente</span>}
                {voiture.type_usage === 'les_deux' && <span className="rounded-full bg-[var(--color-accent-light)] px-2 py-0.5 text-xs font-bold text-[var(--color-accent)]">Location · Vente</span>}
              </div>
              <h1 className="mt-0.5 text-3xl font-black text-[var(--color-text-primary)]">
                {voiture.modele}{' '}
                {voiture.annee && <span className="text-xl font-normal text-[var(--color-text-secondary)]">{voiture.annee}</span>}
              </h1>

              {/* Prix : location + vente séparés */}
              <div className="mt-2 space-y-1">
                {isLocation && voiture.prix && (
                  <p className="text-2xl font-black" style={{ color: NAVY }}>
                    {money(voiture.prix)}{' '}
                    <span className="text-base font-normal text-[var(--color-text-secondary)]">XOF / jour</span>
                  </p>
                )}
                {isVente && voiture.prix_vente && (
                  <p className={isLocation ? 'text-xl font-black text-emerald-700' : 'text-2xl font-black'}
                    style={!isLocation ? { color: NAVY } : {}}>
                    {money(voiture.prix_vente)}{' '}
                    <span className="text-base font-normal text-[var(--color-text-secondary)]">XOF</span>
                    {isLocation && <span className="ml-1 text-sm font-normal text-[var(--color-text-secondary)]">(à l&apos;achat)</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-5">
              {visibleTabs.length > 1 && (
                <div className="flex gap-1 rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-1 mb-4">
                  {visibleTabs.map((t) => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`flex-1 rounded px-2 py-2 text-xs font-bold transition ${
                        activeTab === t.key ? 'bg-[var(--color-background-primary)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
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

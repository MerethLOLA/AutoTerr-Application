'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRole } from '@/lib/useRole';

const STORAGE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '');
function imgUrl(p?: string | null) {
  return p ? `${STORAGE_URL}/storage/${p}` : null;
}
function money(v?: number | string | null) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0));
}

const STATUT: Record<string, { label: string; cls: string }> = {
  disponible:    { label: 'Disponible',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  vendu:         { label: 'Vendu',         cls: 'bg-red-100 text-red-700 border-red-200' },
  en_location:   { label: 'En location',   cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  reserve:       { label: 'Réservé',       cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  en_reparation: { label: 'En réparation', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function VoitureDetailPage() {
  const { canWrite } = useRole();
  const { id } = useParams();
  const _initV = id ? apiClient.getCached<any>(`/voitures/${id}`) : null;
  const [voiture, setVoiture] = useState<any>(_initV?.data ?? _initV ?? null);
  const [loading, setLoading] = useState(_initV === null);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get(`/voitures/${id}`)
      .then((res: any) => setVoiture(res?.data ?? res))
      .catch(() => setVoiture(null))
      .finally(() => setLoading(false));
  }, [id]);

  const gallery: any[] = voiture?.images ?? [];
  const images: any[] = gallery.length > 0
    ? gallery
    : voiture?.image_principale
      ? [{ id: 'main', chemin: voiture.image_principale }]
      : [];
  const count = images.length;

  const goTo = useCallback((i: number) => {
    setSelected(i);
    const el = thumbsRef.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, []);

  const prev = useCallback(() => goTo((selected - 1 + count) % count), [goTo, selected, count]);
  const next = useCallback(() => goTo((selected + 1) % count), [goTo, selected, count]);

  // Auto-avance toutes les 4 secondes (pause au survol)
  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => setSelected((s) => (s + 1) % count), 4000);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-2xl bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="aspect-video rounded-2xl bg-slate-200" />
            <div className="space-y-4">
              <div className="h-8 w-48 rounded bg-slate-200" />
              <div className="h-24 rounded-2xl bg-slate-200" />
              <div className="h-40 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!voiture) {
    return (
      <DashboardLayout>
        <div className="surface-panel py-20 text-center">
          <p className="font-semibold text-slate-600">Véhicule introuvable.</p>
          <Link href="/voitures" className="mt-4 inline-block text-sm font-bold text-[#111827] hover:underline">
            ← Retour à la liste
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const st = STATUT[voiture.statut] ?? { label: voiture.statut, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  const dispo = voiture.statut === 'disponible';

  const specs = [
    { label: 'Kilométrage', value: voiture.kilometrage != null ? `${money(voiture.kilometrage)} km` : null },
    { label: 'Énergie', value: voiture.energie },
    { label: 'Boîte', value: voiture.type_boite },
    { label: 'Couleur', value: voiture.couleur },
    { label: 'Numéro de châssis', value: voiture.numero_chassis },
    { label: 'Type de véhicule', value: voiture.typeVehicule?.nom },
    { label: 'Origine', value: voiture.origineMarque?.nom },
    { label: "Date d'acquisition", value: voiture.date_acquisition },
  ].filter((s) => s.value);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/voitures" className="font-semibold hover:text-[#111827]">Véhicules</Link>
          <span>/</span>
          <span className="font-bold text-slate-800">{voiture.marque} {voiture.modele}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* ── Galerie carousel ── */}
          <div className="space-y-3">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 select-none"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {images.length > 0 ? (
                images.map((img: any, i: number) => imgUrl(img.chemin) ? (
                  <Image
                    key={img.id ?? i}
                    src={imgUrl(img.chemin)!}
                    alt={`${voiture.marque} ${voiture.modele} — photo ${i + 1}`}
                    fill
                    className="object-cover"
                    style={{
                      opacity: i === selected ? 1 : 0,
                      transition: 'opacity 0.5s ease',
                      zIndex: i === selected ? 1 : 0,
                    }}
                  />
                ) : null)
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-300">
                  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                      d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5M5 11H3a1 1 0 00-1 1v1a1 1 0 001 1h2m14-2h2a1 1 0 011 1v1a1 1 0 01-1 1h-2" />
                  </svg>
                  <span className="text-sm">Aucune photo disponible</span>
                </div>
              )}

              {/* Statut badge */}
              <span className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${st.cls}`}>
                {st.label}
              </span>

              {/* Flèches de navigation */}
              {count > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Photo précédente"
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/65"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Photo suivante"
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/65"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Indicateurs */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {images.map((_: any, i: number) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Photo ${i + 1}`}
                        onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === selected ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/50 hover:bg-white/80'
                        }`}
                      />
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
                {images.map((img: any, i: number) => (
                  <button
                    key={img.id ?? i}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      selected === i ? 'border-slate-700 shadow-md scale-105' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {imgUrl(img.chemin) && <Image src={imgUrl(img.chemin)!} alt={`vue ${i + 1}`} width={80} height={64} className="object-cover" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Infos & Actions ── */}
          <div className="space-y-5">

            {/* Titre */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {voiture.annee}{voiture.energie ? ` · ${voiture.energie}` : ''}
              </p>
              <h1 className="page-title mt-1">
                {voiture.marque} {voiture.modele}
              </h1>
            </div>

            {/* Prix */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              {voiture.type_usage !== 'vente' && voiture.prix != null && (
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tarif location</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {money(voiture.prix)}
                    <span className="ml-2 text-base font-bold text-slate-400">XOF/jour</span>
                  </p>
                </div>
              )}
              {voiture.type_usage !== 'location' && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Prix de vente</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {voiture.prix_vente != null ? money(voiture.prix_vente) : '—'}
                    <span className="ml-2 text-base font-bold text-slate-400">XOF</span>
                  </p>
                </div>
              )}
              {voiture.garantie && (
                <p className="mt-2 text-xs font-semibold text-emerald-600">
                  ✓ Garantie {voiture.garantie.type_garantie} jusqu&apos;au {voiture.garantie.date_fin}
                </p>
              )}
            </div>

            {/* Actions principales */}
            {dispo ? (
              <div className="space-y-2">
                <Link href={`/ventes?voiture_id=${voiture.id}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#374151] bg-white px-6 py-4 text-sm font-black text-[#111827] shadow-sm transition hover:bg-[#f5f8fa] active:scale-95">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Créer une vente pour ce véhicule
                </Link>
                <Link href={`/locations?voiture_id=${voiture.id}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-[#111827] transition hover:bg-slate-50">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Mettre en location
                </Link>
              </div>
            ) : (
              <div className={`rounded-2xl border p-4 text-center text-sm font-semibold ${st.cls}`}>
                Ce véhicule n&apos;est pas disponible à la vente ({st.label.toLowerCase()}).
              </div>
            )}

            {/* Actions secondaires */}
            <div className="flex flex-wrap gap-2">
              {canWrite('voitures') && (
                <Link href={`/voitures/${voiture.id}/edit`}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                  Modifier
                </Link>
              )}
              <Link href={`/voitures/${voiture.id}/historique`}
                className="flex-1 rounded-xl border border-[#185FA5] bg-[#185FA5]/5 py-2.5 text-center text-sm font-bold text-[#185FA5] transition hover:bg-[#185FA5]/10">
                Historique
              </Link>
              <Link href={`/garanties?voiture_id=${voiture.id}`}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                Garantie
              </Link>
              <Link href={`/sav?voiture_id=${voiture.id}`}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                SAV
              </Link>
            </div>

            {/* Caractéristiques */}
            <div className="rounded-2xl border border-slate-100 p-5">
              <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-slate-400">Caractéristiques</h2>
              <dl className="space-y-2.5">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
                    <dt className="shrink-0 font-medium text-slate-400">{label}</dt>
                    <dd className="text-right font-semibold text-slate-800">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Description */}
            {voiture.description && (
              <div className="rounded-2xl border border-slate-100 p-5">
                <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">Description</h2>
                <p className="text-sm leading-relaxed text-slate-600">{voiture.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Historique des ventes */}
        {(voiture.ventes?.length ?? 0) > 0 && (
          <div className="surface-panel p-6">
            <h2 className="section-title mb-4">Historique des ventes</h2>
            <div className="divide-y divide-slate-100">
              {voiture.ventes.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-semibold text-slate-700">{v.reference_vente}</span>
                  <span className="font-black text-[#111827]">{money(v.prix_final)} XOF</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

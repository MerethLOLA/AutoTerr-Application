'use client';

import PublicLayout from '@/components/PublicLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface VoitureImage { id: number; chemin: string; ordre?: number; }
interface Voiture {
  id: number; marque: string; modele: string; annee?: number;
  prix?: number; prix_vente?: number; energie?: string; kilometrage?: number;
  statut?: string; type_usage?: string; image_principale?: string;
  images?: VoitureImage[];
}
interface Meta { current_page: number; last_page: number; total: number; per_page: number; }

const VIOLET = '#2d1b3d';
const ENERGIES = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'];

const HERO_PHOTOS = [
  '/yaris-cross-header_Large-Landscape.webp',
  '/22d530df7698c8e2f6bb46563dfd7230.jpeg',
  '/8c6302a174b589edb3f51f132ab99092.jpeg',
  '/f683ce4a053ae9b946648652725ea080.png',
];

function money(v?: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0);
}
function imgUrl(p?: string | null) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  return `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/storage/${p}`;
}

function buildPhotos(v: Voiture): string[] {
  const fromGallery = (v.images ?? [])
    .slice()
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
    .map((img) => imgUrl(img.chemin))
    .filter(Boolean) as string[];
  if (fromGallery.length > 0) return fromGallery.slice(0, 6);
  const main = imgUrl(v.image_principale);
  return main ? [main] : [];
}

function VehicleCard({ v }: { v: Voiture }) {
  const photos = buildPhotos(v);
  const multi  = photos.length > 1;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!multi) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), 2500);
    return () => clearInterval(t);
  }, [multi, photos.length]);

  const isLocation = v.type_usage === 'location' || v.type_usage === 'les_deux';
  const isVente    = v.type_usage === 'vente'    || v.type_usage === 'les_deux';

  return (
    <Link
      href={`/catalogue/${v.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#ede8f4] bg-white transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#2d1b3d]/10"
    >
      {/* ── Zone photo ── */}
      <div className="relative h-52 overflow-hidden bg-[#f3f0f7]">

        {photos.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <svg className="h-14 w-14 text-[#c9a8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
            </svg>
          </div>
        ) : photos.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`${v.marque} ${v.modele}`}
            fill
            className="object-cover transition-opacity duration-500"
            style={{ opacity: i === idx ? 1 : 0 }}
          />
        ))}

        {/* Gradient bas pour lisibilité dots */}
        {multi && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        )}

        {/* Badge type usage */}
        <div className="absolute left-2.5 top-2.5 z-10 flex gap-1.5">
          {v.type_usage === 'location' && (
            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">Location</span>
          )}
          {v.type_usage === 'vente' && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">Vente</span>
          )}
          {v.type_usage === 'les_deux' && (
            <span className="rounded-full bg-[#2d1b3d] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">Location · Vente</span>
          )}
        </div>

        {/* Badge énergie */}
        {v.energie && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#2d1b3d] shadow backdrop-blur-sm">
            {v.energie}
          </span>
        )}

        {/* Dots de navigation */}
        {multi && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className="block rounded-full bg-white transition-all duration-300"
                style={{ width: i === idx ? 18 : 5, height: 4, opacity: i === idx ? 1 : 0.55 }}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Infos véhicule ── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">{v.marque}</p>
          <p className="mt-0.5 font-black leading-tight text-[#111827]">
            {v.modele}{v.annee && <span className="ml-1.5 text-sm font-normal text-[#9ca3af]">{v.annee}</span>}
          </p>
        </div>

        {v.kilometrage !== undefined && (
          <p className="flex items-center gap-1 text-xs text-[#6b7280]">
            <svg className="h-3.5 w-3.5 shrink-0 text-[#c9a8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {money(v.kilometrage)} km
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-[#f3f4f6] pt-3">
          <div className="flex flex-col gap-0.5">
            {isLocation && v.prix && (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-[#2d1b3d]">{money(v.prix)}</span>
                <span className="text-xs text-[#9ca3af]">XOF/j</span>
              </div>
            )}
            {isVente && v.prix_vente && (
              <div className="flex items-baseline gap-1">
                <span className={`font-black ${isLocation ? 'text-sm text-emerald-700' : 'text-lg text-[#2d1b3d]'}`}>
                  {money(v.prix_vente)}
                </span>
                <span className="text-xs text-[#9ca3af]">{isLocation ? 'XOF achat' : 'XOF'}</span>
              </div>
            )}
          </div>
          <span
            className="shrink-0 rounded-xl px-3.5 py-2 text-xs font-black text-white shadow-sm transition group-hover:opacity-90"
            style={{ backgroundColor: VIOLET }}
          >
            Voir →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CataloguePage() {
  const _initCat = apiClient.getCached<any>('/voitures/public', { page: 1, per_page: 12 });
  const [voitures, setVoitures] = useState<Voiture[]>(_initCat?.data ?? []);
  const [meta, setMeta]         = useState<Meta | null>(_initCat?.meta ?? null);
  const [loading, setLoading]     = useState(_initCat === null);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [energie, setEnergie]     = useState('');
  const [typeUsage, setTypeUsage] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_PHOTOS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async (p: number, q: string, e: string, t: string) => {
    setLoading(true);
    try {
      const res: any = await apiClient.getPublicVoitures({
        page: p,
        search: q || undefined,
        energie: e || undefined,
        type_usage: t || undefined,
        per_page: 12,
      });
      setVoitures(res?.data ?? []);
      setMeta(res?.meta ?? null);
    } catch {
      setVoitures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1, '', '', ''); }, [load]);

  function onSearch(v: string) {
    setSearch(v);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, v, energie, typeUsage), 400);
  }

  function onEnergie(v: string) {
    setEnergie(v);
    setPage(1);
    load(1, search, v, typeUsage);
  }

  function onTypeUsage(v: string) {
    setTypeUsage(v);
    setPage(1);
    load(1, search, energie, v);
  }

  function goPage(p: number) {
    setPage(p);
    load(p, search, energie, typeUsage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <PublicLayout>

      {/* ── Hero avec slideshow ── */}
      <section className="relative flex items-center overflow-hidden" style={{ minHeight: 300 }}>
        <div className="absolute inset-0">
          {HERO_PHOTOS.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              priority={i === 0}
              className="object-cover object-center transition-opacity duration-1000"
              style={{ opacity: heroIndex === i ? 1 : 0 }}
            />
          ))}
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${VIOLET}f2 0%, ${VIOLET}c0 55%, ${VIOLET}80 100%)` }} />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#c9a8e8]">Notre sélection</p>
          <h1 className="mt-1 text-4xl font-black text-white">Catalogue</h1>
          <p className="mt-2 max-w-lg text-sm text-white/70">
            Découvrez notre flotte disponible à la location et à la vente.
            {meta && (
              <span className="ml-1 font-semibold text-[#c9a8e8]">
                {meta.total} véhicule{meta.total > 1 ? 's' : ''} disponible{meta.total > 1 ? 's' : ''}.
              </span>
            )}
          </p>
          <div className="mt-5 flex gap-1.5">
            {HERO_PHOTOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className="h-1 rounded-full transition-all duration-300"
                style={{ width: heroIndex === i ? 24 : 6, backgroundColor: heroIndex === i ? '#fff' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Filtres ── */}
        <div className="mb-8 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99acc2]"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 105.65 5.65a7 7 0 0011.3 11.3z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher marque, modèle…"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-lg border border-[#dfe3eb] bg-white py-2.5 pl-9 pr-4 text-sm text-[#33475b] placeholder:text-[#99acc2] focus:border-[#5b2d8e] focus:outline-none focus:ring-2 focus:ring-[#5b2d8e]/20"
            />
          </div>

          <select
            value={typeUsage}
            onChange={(e) => onTypeUsage(e.target.value)}
            className="rounded-lg border border-[#dfe3eb] bg-white px-3 py-2.5 text-sm text-[#33475b] focus:border-[#5b2d8e] focus:outline-none focus:ring-2 focus:ring-[#5b2d8e]/20"
          >
            <option value="">Location & Vente</option>
            <option value="location">Location uniquement</option>
            <option value="vente">Vente uniquement</option>
          </select>

          <select
            value={energie}
            onChange={(e) => onEnergie(e.target.value)}
            className="rounded-lg border border-[#dfe3eb] bg-white px-3 py-2.5 text-sm text-[#33475b] focus:border-[#5b2d8e] focus:outline-none focus:ring-2 focus:ring-[#5b2d8e]/20"
          >
            <option value="">Toutes énergies</option>
            {ENERGIES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>

          {(search || energie || typeUsage) && (
            <button onClick={() => { setSearch(''); setEnergie(''); setTypeUsage(''); load(1, '', '', ''); }}
              className="rounded-lg border border-[#dfe3eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#6b7280] hover:border-[#2d1b3d] hover:text-[#2d1b3d]">
              Réinitialiser
            </button>
          )}
        </div>

        {/* ── Grille ── */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl border border-[#ede8f4] bg-[#f3f0f7]" />
            ))}
          </div>
        ) : voitures.length === 0 ? (
          <div className="py-24 text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-[#c9a8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
            </svg>
            <p className="font-semibold text-[#6b7280]">Aucun véhicule trouvé</p>
            <p className="mt-1 text-sm text-[#99acc2]">Modifiez vos filtres ou revenez plus tard.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {voitures.map((v) => <VehicleCard key={v.id} v={v} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {meta && meta.last_page > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button onClick={() => goPage(page - 1)} disabled={page <= 1}
              className="rounded-lg border border-[#dfe3eb] px-4 py-2 text-sm font-semibold text-[#33475b] disabled:opacity-30 hover:border-[#2d1b3d]">
              ← Précédent
            </button>
            <span className="px-4 text-sm text-[#6b7280]">Page {page} / {meta.last_page}</span>
            <button onClick={() => goPage(page + 1)} disabled={page >= meta.last_page}
              className="rounded-lg border border-[#dfe3eb] px-4 py-2 text-sm font-semibold text-[#33475b] disabled:opacity-30 hover:border-[#2d1b3d]">
              Suivant →
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

'use client';

import PublicLayout from '@/components/PublicLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface VoitureImage { id: number; chemin: string; ordre?: number; }
interface Voiture {
  id: number; marque: string; modele: string; annee?: number;
  prix?: number; prix_vente?: number; type_usage?: string;
  energie?: string; kilometrage?: number;
  statut?: string; image_principale?: string;
  images?: VoitureImage[];
}

const VIOLET = '#2d1b3d';

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
  if (fromGallery.length > 0) return fromGallery.slice(0, 5);
  const main = imgUrl(v.image_principale);
  return main ? [main] : [];
}

function VehicleCard({ v }: { v: Voiture }) {
  const photos     = buildPhotos(v);
  const multi      = photos.length > 1;
  const isLocation = v.type_usage === 'location' || v.type_usage === 'les_deux';
  const isVente    = v.type_usage === 'vente'    || v.type_usage === 'les_deux';
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!multi) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), 2500);
    return () => clearInterval(t);
  }, [multi, photos.length]);

  return (
    <Link
      href={`/catalogue/${v.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#ede8f4] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl w-64 shrink-0 snap-start"
    >
      <div className="relative h-44 overflow-hidden bg-[#f3f0f7]">
        {photos.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <svg className="h-12 w-12 text-[#c9a8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
            </svg>
          </div>
        ) : photos.map((src, i) => (
          <Image key={i} src={src} alt={`${v.marque} ${v.modele}`}
            fill
            className="object-cover transition-opacity duration-500"
            style={{ opacity: i === idx ? 1 : 0 }}
          />
        ))}

        {multi && <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />}

        <div className="absolute left-2 top-2 z-10 flex gap-1">
          {v.type_usage === 'location' && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white shadow">Location</span>}
          {v.type_usage === 'vente'    && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow">Vente</span>}
          {v.type_usage === 'les_deux' && <span className="rounded-full bg-[#2d1b3d] px-2 py-0.5 text-[10px] font-black text-white shadow">Location · Vente</span>}
        </div>

        {v.energie && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#2d1b3d] shadow backdrop-blur-sm">{v.energie}</span>
        )}

        {multi && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {photos.map((_, i) => (
              <span key={i} className="block rounded-full bg-white transition-all duration-300"
                style={{ width: i === idx ? 14 : 4, height: 3, opacity: i === idx ? 1 : 0.5 }} />
            ))}
          </div>
        )}

      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">{v.marque}</p>
          <p className="mt-0.5 font-black text-[#111827]">{v.modele} {v.annee && <span className="font-normal text-sm text-[#9ca3af]">{v.annee}</span>}</p>
        </div>
        {v.kilometrage !== undefined && (
          <p className="text-xs text-[#6b7280]">{money(v.kilometrage)} km</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-[#f3f4f6] pt-2">
          <div className="flex flex-col gap-0.5">
            {isLocation && v.prix && (
              <div><span className="font-black text-[#2d1b3d]">{money(v.prix)}</span><span className="ml-1 text-xs text-[#9ca3af]">XOF/j</span></div>
            )}
            {isVente && v.prix_vente && (
              <div>
                <span className={isLocation ? 'text-sm font-bold text-emerald-700' : 'font-black text-[#2d1b3d]'}>{money(v.prix_vente)}</span>
                <span className="ml-1 text-xs text-[#9ca3af]">{isLocation ? 'XOF achat' : 'XOF'}</span>
              </div>
            )}
          </div>
          <span className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-black text-white transition group-hover:opacity-90"
            style={{ backgroundColor: VIOLET }}>Voir →</span>
        </div>
      </div>
    </Link>
  );
}

const SERVICES = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Location de véhicules',
    desc: 'Courte ou longue durée, choisissez parmi notre flotte de véhicules disponibles immédiatement.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Vente de véhicules',
    desc: "Achetez votre véhicule neuf ou d'occasion avec garantie et financement disponible.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Entretien & SAV',
    desc: "Techniciens certifiés, pièces d'origine, diagnostic électronique et suivi complet de votre véhicule.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Garantie & Assurance',
    desc: 'Plans de garantie flexibles et accompagnement assurance pour rouler en toute sérénité.',
  },
];

const STATS = [
  { value: '500+', label: 'Véhicules gérés' },
  { value: '5 ans', label: "D'expérience" },
  { value: '1 200+', label: 'Clients satisfaits' },
  { value: '98%', label: 'Taux de satisfaction' },
];

const HERO_PHOTOS = [
  '/yaris-cross-header_Large-Landscape.webp',
  '/22d530df7698c8e2f6bb46563dfd7230.jpeg',
  '/8c6302a174b589edb3f51f132ab99092.jpeg',
  '/f683ce4a053ae9b946648652725ea080.png',
];

export default function HomePage() {
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.getPublicVoitures({ per_page: 12 })
      .then((res: any) => setVoitures(res?.data ?? res ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_PHOTOS.length), 3500);
    return () => clearInterval(t);
  }, []);

  function slide(dir: 'left' | 'right') {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  }

  return (
    <PublicLayout>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[580px] overflow-hidden flex items-center">

        {/* Fond : photos qui défilent */}
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
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${VIOLET}f0 0%, ${VIOLET}b0 50%, ${VIOLET}50 100%)` }} />
        </div>

        <div className="relative w-full">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <span className="mb-5 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                Votre partenaire automobile au Sénégal
              </span>
              <h1 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                Trouvez le véhicule<br />
                <span style={{ color: '#c9a8e8' }}>qui vous correspond</span>
              </h1>
              <p className="mb-8 text-base leading-7 text-white/80">
                Location, vente et entretien de véhicules. SunuPark vous accompagne à chaque étape avec une flotte moderne et un service de qualité.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/catalogue"
                  className="rounded-lg bg-white px-6 py-3 text-sm font-black transition hover:bg-white/90"
                  style={{ color: VIOLET }}>
                  Voir le catalogue
                </Link>
                <Link href="/inscription"
                  className="rounded-lg border-2 border-white/60 bg-transparent px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  Créer mon compte
                </Link>
              </div>

              {/* Indicateurs */}
              <div className="mt-8 flex gap-2">
                {HERO_PHOTOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: heroIndex === i ? 28 : 8,
                      backgroundColor: heroIndex === i ? '#fff' : 'rgba(255,255,255,0.35)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats (défilement infini) ──────────────────────────────────────── */}
      <section className="border-b border-[#ede8f4] bg-[#f9f7fc] py-8 overflow-hidden">
        <div className="flex animate-marquee">
          {[...STATS, ...STATS].map((s, i) => (
            <div key={i} className="flex shrink-0 items-center gap-4 px-10">
              <p className="text-3xl font-black whitespace-nowrap" style={{ color: VIOLET }}>{s.value}</p>
              <p className="text-sm font-semibold text-[#6b7280] whitespace-nowrap">{s.label}</p>
              <span className="ml-4 text-2xl font-black" style={{ color: '#c9a8e8' }}>·</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Catalogue en vedette — CAROUSEL ───────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#5b2d8e]">Disponibles maintenant</p>
              <h2 className="mt-1 text-3xl font-black text-[#111827]">Notre flotte</h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => slide('left')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe3eb] bg-white text-[#33475b] shadow-sm transition hover:border-[#2d1b3d] hover:text-[#2d1b3d] disabled:opacity-30">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={() => slide('right')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe3eb] bg-white text-[#33475b] shadow-sm transition hover:border-[#2d1b3d] hover:text-[#2d1b3d] disabled:opacity-30">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <Link href="/catalogue"
                className="hidden text-sm font-bold text-[#2d1b3d] underline-offset-2 hover:underline sm:block">
                Voir tout →
              </Link>
            </div>
          </div>

          {voitures.length === 0 ? (
            <div className="flex gap-5 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 w-64 shrink-0 animate-pulse rounded-xl border border-[#ede8f4] bg-[#f3f0f7]" />
              ))}
            </div>
          ) : (
            <div
              ref={sliderRef}
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {voitures.map((v) => <VehicleCard key={v.id} v={v} />)}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/catalogue"
              className="inline-block rounded-lg border border-[#2d1b3d] px-6 py-2.5 text-sm font-bold text-[#2d1b3d]">
              Voir tout le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────────── */}
      <section id="services" className="border-t border-[#ede8f4] bg-[#f9f7fc] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#5b2d8e]">Ce que nous proposons</p>
            <h2 className="mt-1 text-3xl font-black text-[#111827]">Nos services</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div key={s.title}
                className="rounded-xl border border-[#ede8f4] bg-white p-6 transition hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${VIOLET}15`, color: VIOLET }}>
                  {s.icon}
                </div>
                <h3 className="mb-2 font-black text-[#111827]">{s.title}</h3>
                <p className="text-sm leading-6 text-[#6b7280]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA inscription ───────────────────────────────────────────────────── */}
      <section id="contact" className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-3xl font-black text-[#111827]">
            Prêt à démarrer votre expérience ?
          </h2>
          <p className="mb-8 text-base text-[#6b7280]">
            Créez votre compte client gratuitement et accédez à votre espace personnel pour gérer vos locations, vos factures et bien plus.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/inscription"
              className="rounded-lg px-8 py-3 text-sm font-black text-white transition hover:opacity-90"
              style={{ backgroundColor: VIOLET }}>
              Créer mon compte gratuitement
            </Link>
            <Link href="/catalogue"
              className="rounded-lg border border-[#dfe3eb] px-8 py-3 text-sm font-bold text-[#33475b] transition hover:bg-[#f3f0f7]">
              Parcourir le catalogue
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}

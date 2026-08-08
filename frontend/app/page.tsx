'use client';

import PublicLayout from '@/components/PublicLayout';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface VoitureImage { id: number; chemin: string; ordre?: number; }
interface Voiture {
  id: number; marque: string; modele: string; annee?: number;
  prix?: number; prix_vente?: number; type_usage?: string;
  energie?: string; kilometrage?: number;
  statut?: string; image_principale?: string;
  images?: VoitureImage[];
}

const NAVY = '#185FA5';
const BLUE = '#1d6fb8';

function money(v?: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0);
}
function imgUrl(p?: string | null) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  return `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/storage/${p}`;
}
function buildPhotos(v: Voiture): string[] {
  const g = (v.images ?? []).slice().sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
    .map((i) => imgUrl(i.chemin)).filter(Boolean) as string[];
  if (g.length) return g.slice(0, 5);
  const m = imgUrl(v.image_principale);
  return m ? [m] : [];
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<Element>('.reveal, .reveal-left, .reveal-scale');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`h-4 w-4 ${filled ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function VehicleCard({ v }: { v: Voiture }) {
  const photos = buildPhotos(v);
  const multi  = photos.length > 1;
  const isLoc  = v.type_usage === 'location' || v.type_usage === 'les_deux';
  const isVte  = v.type_usage === 'vente'    || v.type_usage === 'les_deux';
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!multi) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), 3000);
    return () => clearInterval(t);
  }, [multi, photos.length]);

  return (
    <Link href={`/catalogue/${v.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-[#1d6fb8]/30 w-72 shrink-0 snap-start">
      <div className="relative h-52 overflow-hidden bg-[#eff6ff]">
        {photos.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <svg className="h-14 w-14 text-[#93c5fd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
            </svg>
            <span className="text-xs text-[#93c5fd]">Photo à venir</span>
          </div>
        ) : photos.map((src, i) => (
          <Image key={i} src={src} alt={`${v.marque} ${v.modele}`} fill
            className="object-cover transition-all duration-700 group-hover:scale-110"
            style={{ opacity: i === idx ? 1 : 0 }} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-3 top-3 z-10 flex gap-1.5">
          {isLoc && <span className="rounded-full bg-[#1d6fb8]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">Location</span>}
          {isVte && <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">Vente</span>}
        </div>
        {v.energie && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#185FA5] shadow-sm backdrop-blur-sm">
            {v.energie}
          </span>
        )}
        {multi && (
          <div className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {photos.map((_, i) => (
              <span key={i} className="block rounded-full bg-white transition-all duration-300"
                style={{ width: i === idx ? 16 : 4, height: 3, opacity: i === idx ? 1 : 0.45 }} />
            ))}
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 z-10 px-4 pb-4 pt-8">
          <div className="flex items-end justify-between">
            <div>
              {isLoc && v.prix && (
                <p className="text-white font-black text-xl leading-none">
                  {money(v.prix)} <span className="text-xs font-medium text-white/70">XOF/j</span>
                </p>
              )}
              {isVte && v.prix_vente && (
                <p className={`font-black leading-none ${isLoc ? 'text-sm text-emerald-300' : 'text-white text-xl'}`}>
                  {money(v.prix_vente)} <span className="text-xs font-medium opacity-70">XOF</span>
                </p>
              )}
            </div>
            <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm ring-1 ring-white/25 transition group-hover:bg-white group-hover:text-[#185FA5]">
              Voir →
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">{v.marque}</p>
          <p className="mt-0.5 text-base font-black text-[#111827]">
            {v.modele}{v.annee && <span className="ml-1.5 text-sm font-normal text-[#9ca3af]">{v.annee}</span>}
          </p>
        </div>
        {v.kilometrage !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {money(v.kilometrage)} km
          </div>
        )}
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
    href: '/catalogue',
    color: '#1d6fb8',
    bg: '#eff6ff',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Vente de véhicules',
    desc: "Achetez votre véhicule neuf ou d'occasion avec garantie et financement disponible.",
    href: '/catalogue',
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Entretien & SAV',
    desc: "Techniciens certifiés, pièces d'origine, diagnostic électronique et suivi complet.",
    href: '/#contact',
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Garantie & Assurance',
    desc: 'Plans de garantie flexibles et accompagnement assurance pour rouler en toute sérénité.',
    href: '/#contact',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Parcourez le catalogue',
    desc: 'Explorez notre sélection de véhicules vérifiés. Filtrez par marque, type, énergie ou budget.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Réservez en ligne',
    desc: 'Créez votre compte client, sélectionnez vos dates et soumettez votre demande en quelques clics.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Conduisez & profitez',
    desc: 'Récupérez votre véhicule en agence, signez l\'état des lieux et prenez la route en toute confiance.',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 18h.01M16 18h.01M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
      </svg>
    ),
  },
];

const TESTIMONIALS = [
  {
    name: 'Moussa Diallo',
    role: 'Client fidèle',
    stars: 5,
    text: 'Service excellent, véhicules bien entretenus et équipe très professionnelle. Je recommande vivement AutoTerr pour tous vos besoins de mobilité à Dakar !',
    avatar: 'MD',
  },
  {
    name: 'Fatou Ndiaye',
    role: 'Entrepreneuse',
    stars: 5,
    text: 'J\'utilise AutoTerr pour mes déplacements professionnels depuis 2 ans. Processus simple, véhicules impeccables et factures claires. Très satisfaite.',
    avatar: 'FN',
  },
  {
    name: 'Ibrahima Sow',
    role: 'Client particulier',
    stars: 5,
    text: 'Achat de ma voiture facilité grâce à leur équipe compétente. Transparence totale sur les prix, excellent suivi après-vente. Je ne regrette pas.',
    avatar: 'IS',
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

const BRANDS = ['Toyota','Mercedes','BMW','Renault','Peugeot','Nissan','Hyundai','Kia','Honda','Ford','Volkswagen','Mitsubishi'];

export default function HomePage() {
  const router = useRouter();
  const [voitures, setVoitures]     = useState<Voiture[]>([]);
  const [heroIndex, setHeroIndex]   = useState(0);
  const [filter, setFilter]         = useState<'tous' | 'location' | 'vente'>('tous');
  const [searchType, setSearchType] = useState('');
  const [searchMarque, setSearchMarque] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);
  useReveal();

  useEffect(() => {
    apiClient.getPublicVoitures({ per_page: 12 })
      .then((res: any) => setVoitures(res?.data ?? res ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_PHOTOS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = voitures.filter((v) => {
    if (filter === 'tous') return true;
    if (filter === 'location') return v.type_usage === 'location' || v.type_usage === 'les_deux';
    return v.type_usage === 'vente' || v.type_usage === 'les_deux';
  });

  function slide(dir: 'left' | 'right') {
    sliderRef.current?.scrollBy({ left: dir === 'left' ? -290 : 290, behavior: 'smooth' });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchMarque) params.set('marque', searchMarque);
    if (searchType)   params.set('type', searchType);
    router.push(`/catalogue?${params.toString()}`);
  }

  return (
    <PublicLayout>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[640px] overflow-hidden flex items-center">

        {/* Photos de fond */}
        <div className="absolute inset-0">
          {HERO_PHOTOS.map((src, i) => (
            <Image key={src} src={src} alt="" fill priority={i === 0}
              className="object-cover object-center transition-opacity duration-1000"
              style={{ opacity: heroIndex === i ? 1 : 0 }} />
          ))}
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(105deg, ${NAVY}f5 0%, ${NAVY}cc 45%, ${NAVY}66 75%, transparent 100%)` }} />
          {/* Motif pointillé décoratif */}
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #93c5fd 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative w-full">
          <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
            <div className="max-w-2xl">

              {/* Titre */}
              <h1 className="anim-up mb-5 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                Trouvez le véhicule<br />
                <span className="relative">
                  <span style={{ color: '#93c5fd' }}>qui vous correspond</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                    <path d="M0 5 Q100 0 200 5" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </span>
              </h1>
              <p className="anim-up-2 mb-8 text-base leading-7 text-white/80 max-w-lg">
                Location, vente et entretien de véhicules. AutoTerr vous accompagne à chaque étape avec une flotte moderne et un service de qualité.
              </p>

              {/* Barre de recherche */}
              <form onSubmit={handleSearch}
                className="anim-up-3 mb-8 flex flex-wrap gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/20 sm:flex-nowrap">
                <select
                  value={searchMarque}
                  onChange={(e) => setSearchMarque(e.target.value)}
                  className="flex-1 min-w-[140px] rounded-xl bg-white/95 px-4 py-3 text-sm font-semibold text-[#185FA5] outline-none focus:ring-2 focus:ring-white/60">
                  <option value="">Toutes marques</option>
                  {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="flex-1 min-w-[120px] rounded-xl bg-white/95 px-4 py-3 text-sm font-semibold text-[#185FA5] outline-none focus:ring-2 focus:ring-white/60">
                  <option value="">Tous types</option>
                  <option value="location">Location</option>
                  <option value="vente">Vente</option>
                </select>
                <button type="submit"
                  className="rounded-full bg-white px-6 py-3 text-sm font-black transition hover:bg-white/90 flex items-center gap-2 whitespace-nowrap"
                  style={{ color: NAVY }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Rechercher
                </button>
              </form>

              {/* CTAs secondaires */}
              <div className="anim-up-4 flex flex-wrap items-center gap-4">
                <Link href="/catalogue"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/50 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  Voir tout le catalogue
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Indicateurs */}
              <div className="mt-8 flex gap-2">
                {HERO_PHOTOS.map((_, i) => (
                  <button key={i} onClick={() => setHeroIndex(i)}
                    className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                    style={{ width: heroIndex === i ? 32 : 8, backgroundColor: heroIndex === i ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section className="bg-white py-6 border-b border-[#dbeafe] overflow-hidden">
        <div className="flex animate-marquee">
          {[...STATS, ...STATS].map((s, i) => (
            <div key={i} className="flex shrink-0 items-center gap-3 px-10">
              <p className="text-2xl font-black whitespace-nowrap" style={{ color: NAVY }}>{s.value}</p>
              <p className="text-sm font-medium text-[#6b7280] whitespace-nowrap">{s.label}</p>
              <span className="ml-4 h-6 w-px bg-[#dbeafe]" />
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUES ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#dbeafe] bg-[#f9fbff] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {BRANDS.map((brand) => (
              <span key={brand}
                className="text-base font-black tracking-tight text-[#c8d5e8] transition-colors duration-200 hover:text-[#185FA5] cursor-default select-none">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTRE FLOTTE ─────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-12 bg-[#f9fbff]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-[#111827] sm:text-4xl">Notre catalogue</h2>
              <p className="mt-2 text-sm text-[#6b7280]">Véhicules vérifiés, prêts à être loués ou achetés.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['tous', 'location', 'vente'] as const).map((f) => (
                <button key={f} onClick={() => { setFilter(f); sliderRef.current?.scrollTo({ left: 0, behavior: 'smooth' }); }}
                  className={`rounded-full px-5 py-2 text-xs font-bold capitalize transition-all ${
                    filter === f ? 'bg-[#185FA5] text-white shadow-md' : 'bg-white text-[#6b7280] ring-1 ring-[#dfe3eb] hover:ring-[#185FA5] hover:text-[#185FA5]'
                  }`}>
                  {f === 'tous' ? 'Tous' : f === 'location' ? 'Location' : 'Vente'}
                </button>
              ))}
              <div className="flex gap-2 ml-1">
                <button onClick={() => slide('left')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#374151] shadow-sm ring-1 ring-[#dfe3eb] transition hover:bg-[#185FA5] hover:text-white hover:ring-[#185FA5]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => slide('right')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#374151] shadow-sm ring-1 ring-[#dfe3eb] transition hover:bg-[#185FA5] hover:text-white hover:ring-[#185FA5]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>

          {voitures.length === 0 ? (
            <div className="flex gap-5 overflow-hidden">
              {[1,2,3,4].map((i) => <div key={i} className="h-80 w-72 shrink-0 animate-pulse rounded-2xl bg-[#dbeafe]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-[#dfe3eb] bg-white text-sm text-[#9ca3af]">
              Aucun véhicule dans cette catégorie pour le moment.
            </div>
          ) : (
            <div ref={sliderRef}
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filtered.map((v) => <VehicleCard key={v.id} v={v} />)}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Link href="/catalogue"
              className="inline-flex items-center gap-2 rounded-full border-2 px-8 py-3 text-sm font-bold transition-all hover:shadow-lg group"
              style={{ borderColor: NAVY, color: NAVY }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = NAVY; el.style.color = '#fff'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = ''; el.style.color = NAVY; }}>
              Voir tout le catalogue
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ────────────────────────────────────────────────── */}
      <section className="pt-10 pb-20 bg-[#f9fbff]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mb-14 text-center">
            <h2 className="text-3xl font-black text-[#111827] sm:text-4xl">Comment ça marche ?</h2>
            <p className="mt-3 text-sm text-[#6b7280] max-w-md mx-auto">Louez ou achetez votre véhicule en 3 étapes simples, depuis votre téléphone ou votre ordinateur.</p>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Ligne de connexion (desktop) */}
            <div className="absolute top-12 left-1/6 right-1/6 hidden h-0.5 sm:block"
              style={{ background: `linear-gradient(to right, ${NAVY}30, ${NAVY}30)`, backgroundImage: `repeating-linear-gradient(to right, ${NAVY}40 0, ${NAVY}40 8px, transparent 8px, transparent 16px)` }} />

            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.step} className={`reveal relative flex flex-col items-center text-center ${idx === 1 ? 'd-200' : idx === 2 ? 'd-300' : 'd-100'}`}>
                {/* Numéro + icône */}
                <div className="relative mb-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style={{ backgroundColor: idx === 0 ? '#eff6ff' : idx === 1 ? `${NAVY}10` : '#ecfdf5', color: idx === 0 ? BLUE : idx === 1 ? NAVY : '#059669' }}>
                    {step.icon}
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow-md"
                    style={{ backgroundColor: idx === 0 ? BLUE : idx === 1 ? NAVY : '#059669' }}>
                    {idx + 1}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-black text-[#111827]">{step.title}</h3>
                <p className="text-sm leading-6 text-[#6b7280] max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/inscription"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-black text-white transition hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: BLUE }}>
              Commencer maintenant
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── NOS SERVICES ─────────────────────────────────────────────────────── */}
      <section id="services" className="pt-0 pb-20 bg-[#f9fbff]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mb-12 text-center">
            <h2 className="text-3xl font-black text-[#111827] sm:text-4xl">Nos services</h2>
            <p className="mt-3 text-sm text-[#6b7280] max-w-md mx-auto">Location, vente, entretien et assurance — tout en un seul endroit.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Link key={s.title} href={s.href}
                className={`reveal-scale group relative overflow-hidden rounded-2xl border border-[#e8f0fa] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-transparent block ${['d-100','d-200','d-300','d-400'][i]}`}>
                {/* Fond coloré au hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${s.bg} 0%, white 100%)` }} />
                <div className="relative">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <h3 className="mb-2 font-black text-[#111827]">{s.title}</h3>
                  <p className="text-sm leading-6 text-[#6b7280]">{s.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold transition-colors"
                    style={{ color: s.color }}>
                    En savoir plus
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mb-12 text-center">
            <h2 className="text-3xl font-black text-[#111827] sm:text-4xl">Avis de nos clients</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name}
                className={`reveal rounded-2xl border border-[#e8f0fa] bg-[#f9fbff] p-6 transition hover:shadow-md relative overflow-hidden ${['d-100','d-200','d-300'][i]}`}>
                {/* Guillemet décoratif */}
                <div className="absolute right-4 top-4 text-6xl font-black leading-none text-[#dbeafe] select-none">"</div>
                {/* Étoiles */}
                <div className="mb-4 flex gap-0.5">
                  {[1,2,3,4,5].map((s) => <StarIcon key={s} filled={s <= t.stars} />)}
                </div>
                <p className="mb-5 text-sm leading-7 text-[#374151] relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white"
                    style={{ backgroundColor: NAVY }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#111827]">{t.name}</p>
                    <p className="text-xs text-[#6b7280]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCALISATION ─────────────────────────────────────────────────────── */}
      <section id="localisation" className="py-16 bg-[#f9fbff] border-t border-[#dbeafe]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mb-10 text-center">
            <h2 className="mt-2 text-3xl font-black text-[#111827] sm:text-4xl">Nous trouver</h2>
            <p className="mt-3 text-sm text-[#6b7280]">Venez découvrir notre flotte en concession</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-5 items-stretch">
            {/* Carte */}
            <div className="lg:col-span-3 overflow-hidden rounded-2xl border border-[#dbeafe] shadow-sm" style={{ minHeight: 340 }}>
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-17.475%2C14.680%2C-17.440%2C14.705&layer=mapnik&marker=14.6937%2C-17.4628"
                title="Localisation AutoTerr — Route de la Corniche, Dakar"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 340, display: 'block' }}
                loading="lazy"
              />
            </div>
            {/* Infos */}
            <div className="lg:col-span-2 flex flex-col gap-5 justify-center">
              {[
                {
                  icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
                  label: 'Adresse',
                  lines: ['Route de la Corniche Ouest', 'Dakar, Sénégal'],
                },
                {
                  icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
                  label: 'Téléphone',
                  lines: ['+221 77 758 82 95', 'Lun – Sam : 8h – 18h'],
                },
                {
                  icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                  label: 'Email',
                  lines: ['contact@autoterr.sn', 'Réponse sous 24h'],
                },
              ].map(({ icon, label, lines }) => (
                <div key={label} className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: '#E6F1FB' }}>
                    <svg className="h-5 w-5" fill="none" stroke={NAVY} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: NAVY }}>{label}</p>
                    {lines.map((l, i) => (
                      <p key={i} className={i === 0 ? 'text-sm font-semibold text-[#111827]' : 'text-xs text-[#6b7280]'}>{l}</p>
                    ))}
                  </div>
                </div>
              ))}
              <a
                href="https://www.openstreetmap.org/?mlat=14.6937&mlon=-17.4628#map=16/14.6937/-17.4628"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: NAVY, width: 'fit-content' }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ouvrir dans la carte
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <section id="contact" className="relative py-24 overflow-hidden">
        {/* Photo de fond */}
        <img
          src="/8c6302a174b589edb3f51f132ab99092.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Fond dégradé (assombrit la photo pour garder le texte lisible) */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}e6 0%, #1d3a70e6 50%, #1d6fb8cc 100%)` }} />
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="float absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-10" style={{ backgroundColor: '#93c5fd' }} />
        <div className="float absolute -left-10 -bottom-10 h-60 w-60 rounded-full opacity-10" style={{ backgroundColor: '#93c5fd', animationDelay: '1.5s' }} />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="reveal mb-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            Prêt à démarrer<br />votre expérience ?
          </h2>
          <p className="reveal d-100 mb-10 text-base text-white/70 max-w-lg mx-auto leading-7">
            Créez votre compte client gratuitement et accédez à votre espace personnel pour gérer vos locations, vos factures et suivre vos demandes.
          </p>

          <div className="reveal d-200 flex flex-wrap justify-center gap-4">
            <Link href="/inscription"
              className="rounded-full px-8 py-3.5 text-sm font-black text-white transition hover:opacity-90 hover:shadow-xl"
              style={{ backgroundColor: BLUE }}>
              Créer mon compte gratuitement
            </Link>
            <Link href="/catalogue"
              className="rounded-full border-2 border-white/40 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 hover:border-white/60">
              Parcourir le catalogue
            </Link>
          </div>

          {/* Infos pratiques */}
          <div className="reveal d-300 mt-12 grid gap-4 sm:grid-cols-3 text-white/60 text-sm">
            <div className="flex flex-col items-center gap-1">
              <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white/80 font-semibold">Route de la Corniche</span>
              <span>Dakar, Sénégal</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-white/80 font-semibold">+221 77 758 82 95</span>
              <span>Lun – Sam : 8h – 18h</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-white/80 font-semibold">contact@autoterr.sn</span>
              <span>Réponse sous 24h</span>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}

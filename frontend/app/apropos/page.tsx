'use client';

import PublicLayout from '@/components/PublicLayout';
import { useReveal } from '@/lib/useReveal';
import Link from 'next/link';

const NAVY = '#185FA5';
const LIGHT = '#E6F1FB';

const VALEURS = [
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    titre: 'Fiabilité',
    texte: 'Chaque véhicule est inspecté et certifié avant d\'être proposé. Nos clients méritent des véhicules en parfait état.',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    titre: 'Service client',
    texte: 'Une équipe dédiée disponible du lundi au samedi pour vous accompagner à chaque étape, de la recherche à la livraison.',
  },
  {
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    titre: 'Transparence',
    texte: 'Pas de frais cachés, des prix clairs et des contrats détaillés. La confiance se construit dans la transparence.',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    titre: 'Innovation',
    texte: 'Plateforme digitale complète pour gérer locations, ventes et documents en ligne — disponible 24h/24.',
  },
];

const EQUIPE = [
  { nom: 'Lola Semereth Rebecca', poste: 'Directeur Général', initiales: 'LS', couleur: '#185FA5' },
  { nom: 'Fatou Diallo', poste: 'Commercial', initiales: 'FD', couleur: '#1d6fb8' },
  { nom: 'Robert Silou', poste: 'Atelier', initiales: 'RS', couleur: '#0e4d8a' },
  { nom: 'Malou Diop', poste: 'Assurance', initiales: 'MD', couleur: '#2563ab' },
];

const CHIFFRES = [
  { valeur: '500+', label: 'Véhicules gérés' },
  { valeur: '1 200+', label: 'Clients satisfaits' },
  { valeur: '8 ans', label: 'D\'expérience' },
  { valeur: '98%', label: 'Taux de satisfaction' },
];

export default function AproposPage() {
  useReveal();
  return (
    <PublicLayout>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-20">
        {/* Photo de fond */}
        <img
          src="/yaris-cross-header_Large-Landscape.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Fond dégradé (assombrit la photo pour garder le texte lisible) */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}e6 0%, #1d3a70e6 60%, #1d6fb8cc 100%)` }} />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="reveal mb-5 text-4xl font-black text-white sm:text-5xl lg:text-6xl leading-tight">
            Le partenaire de confiance<br />pour votre mobilité
          </h1>
          <p className="reveal d-100 mx-auto max-w-2xl text-base leading-7 text-white/75">
            Depuis 2016, AutoTerr accompagne particuliers et entreprises au Sénégal dans la location et l'achat de véhicules de qualité — avec rigueur, transparence et passion du service.
          </p>
        </div>
      </section>

      {/* ── CHIFFRES CLÉS ── */}
      <section className="bg-white py-14 border-b border-[#dbeafe]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {CHIFFRES.map(({ valeur, label }, i) => (
              <div key={label} className={`reveal-scale text-center ${['d-100','d-200','d-300','d-400'][i]}`}>
                <div className="text-4xl font-black" style={{ color: NAVY }}>{valeur}</div>
                <div className="mt-1 text-sm text-[#6b7280]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HISTOIRE ── */}
      <section className="py-16 bg-[#f9fbff]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="reveal-left">
              <h2 className="text-3xl font-black text-[#111827]">Nés à Dakar, construits pour le Sénégal</h2>
              <p className="mt-4 text-sm leading-7 text-[#4b5563]">
                AutoTerr est né en 2016 de la conviction que la gestion d'un parc automobile méritait une solution moderne, locale et fiable. Fondée à Dakar par une équipe passionnée, notre entreprise s'est rapidement imposée comme un acteur de référence dans la location et la vente de véhicules au Sénégal.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#4b5563]">
                Aujourd'hui, notre plateforme digitale permet à des centaines de clients de louer, acheter et gérer leurs véhicules en toute simplicité — depuis leur smartphone ou ordinateur, à tout moment.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#4b5563]">
                Nous couvrons Dakar et ses environs, avec des projets d'expansion vers Thiès, Saint-Louis et Ziguinchor dans les prochaines années.
              </p>
              <div className="mt-6 flex gap-4">
                <Link href="/catalogue"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: NAVY }}>
                  Voir le catalogue
                </Link>
                <Link href="/#contact"
                  className="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] px-6 py-2.5 text-sm font-bold transition hover:border-[#185FA5]/40"
                  style={{ color: NAVY }}>
                  Nous contacter
                </Link>
              </div>
            </div>
            {/* Visual */}
            <div className="reveal-scale d-200 relative overflow-hidden rounded-2xl p-8 text-center">
              {/* Photo de fond */}
              <img
                src="/f683ce4a053ae9b946648652725ea080.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Voile clair (garde le contenu lisible tout en laissant transparaître la photo) */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(245,248,250,0.92) 100%)' }} />
              <div className="relative">
                <div className="mx-auto mb-4" style={{ position: 'relative', width: 200, height: 72, overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/LOgo2.png" alt="AutoTerr" style={{ position: 'absolute', width: 200, height: 'auto', top: '50%', transform: 'translateY(-57%)' }} />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  {['Location courte durée', 'Location longue durée', 'Vente de véhicules', 'Entretien & SAV',
                    'Assurance & conformité', 'Espace client en ligne'].map((s) => (
                    <div key={s} className="flex items-center gap-2 text-xs text-[#374151]">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke={NAVY} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mb-10 text-center">
            <h2 className="text-3xl font-black text-[#111827]">Nos valeurs</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALEURS.map(({ icon, titre, texte }, i) => (
              <div key={titre} className={`reveal-scale ${['d-100','d-200','d-300','d-400'][i]} rounded-2xl border border-[#dbeafe] p-6 transition hover:shadow-md hover:border-[#185FA5]/30`}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: LIGHT }}>
                  <svg className="h-5 w-5" fill="none" stroke={NAVY} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                  </svg>
                </div>
                <h3 className="mb-2 text-sm font-black text-[#111827]">{titre}</h3>
                <p className="text-xs leading-6 text-[#6b7280]">{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÉQUIPE ── */}
      <section className="py-16 bg-[#f9fbff] border-t border-[#dbeafe]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="reveal mb-10 text-center">
            <h2 className="text-3xl font-black text-[#111827]">Notre équipe</h2>
          </div>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-4">
            {EQUIPE.map(({ nom, poste, initiales, couleur }, i) => (
              <div key={nom} className={`reveal-scale ${['d-100','d-200','d-300','d-400'][i]} flex flex-col items-center text-center rounded-2xl border border-[#dbeafe] bg-white p-6 transition hover:shadow-md`}>
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full text-xl font-black text-white"
                  style={{ background: couleur }}>
                  {initiales}
                </div>
                <p className="text-sm font-bold text-[#111827]">{nom}</p>
                <p className="mt-0.5 text-xs text-[#6b7280]">{poste}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 text-center" style={{ background: `linear-gradient(135deg, ${NAVY}, #1d6fb8)` }}>
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="reveal text-3xl font-black text-white mb-4">Prêt à nous faire confiance ?</h2>
          <p className="reveal d-100 text-white/70 text-sm mb-8">Rejoignez des centaines de clients qui nous font confiance pour leur mobilité au quotidien.</p>
          <div className="reveal d-200 flex flex-wrap justify-center gap-4">
            <Link href="/inscription"
              className="rounded-full px-8 py-3 text-sm font-black text-white transition hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}>
              Créer mon compte
            </Link>
            <Link href="/catalogue"
              className="rounded-full bg-white px-8 py-3 text-sm font-black transition hover:opacity-90"
              style={{ color: NAVY }}>
              Parcourir le catalogue
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}

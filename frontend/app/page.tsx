'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [locale, setLocale] = useState('fr');

  useEffect(() => {
    // Récupérer la locale depuis localStorage ou le navigateur
    const savedLocale = localStorage.getItem('locale') || 'fr';
    setLocale(savedLocale);
  }, []);

  const toggleLocale = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr';
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t: Record<string, Record<string, string>> = {
    fr: {
      'brand_tag': 'GESTION DE PARC AUTOMOBILE',
      'nav.home': 'Accueil',
      'nav.services': 'Services',
      'nav.catalogue': 'Catalogue',
      'nav.reservation': 'Réservation',
      'nav.contact': 'Contact',
      'nav.client_login': 'Client',
      'nav.employee_login': 'Employé',
      'welcome.hero_label': 'Bienvenue chez SunuPark',
      'welcome.hero_title_1': 'Gestion complète de votre',
      'welcome.hero_title_accent': 'parc automobile',
      'welcome.hero_subtitle': 'Une solution tout-en-un pour la location, vente et maintenance de véhicules',
      'welcome.cta_primary': 'Découvrir le catalogue',
      'welcome.cta_secondary': 'Demander un devis',
    },
    en: {
      'brand_tag': 'FLEET MANAGEMENT',
      'nav.home': 'Home',
      'nav.services': 'Services',
      'nav.catalogue': 'Catalog',
      'nav.reservation': 'Reservation',
      'nav.contact': 'Contact',
      'nav.client_login': 'Client',
      'nav.employee_login': 'Employee',
      'welcome.hero_label': 'Welcome to SunuPark',
      'welcome.hero_title_1': 'Complete management of your',
      'welcome.hero_title_accent': 'vehicle fleet',
      'welcome.hero_subtitle': 'An all-in-one solution for rental, sales and vehicle maintenance',
      'welcome.cta_primary': 'Explore catalog',
      'welcome.cta_secondary': 'Request a quote',
    },
  };

  const trans = t[locale as keyof typeof t] || t.fr;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/92 backdrop-blur-lg border-b border-slate-200 dark:bg-slate-900/92 dark:border-slate-700 px-12 h-16 flex items-center justify-between anim-fade">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform hover:scale-110">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/>
              <circle cx="8.5" cy="17" r="2"/>
              <circle cx="17.5" cy="17" r="2"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">SunuPark</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase">{trans['brand_tag']}</div>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <a href="#home" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{trans['nav.home']}</a>
          <a href="#services" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{trans['nav.services']}</a>
          <Link href="/catalogue" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{trans['nav.catalogue']}</Link>
          <a href="#reservation" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{trans['nav.reservation']}</a>
          <a href="#contact" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{trans['nav.contact']}</a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="px-4 py-2 text-sm text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {locale === 'fr' ? 'EN' : 'FR'}
          </button>
          <Link href="/login/client" className="px-4 py-2 text-sm text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{trans['nav.client_login']}</Link>
          <Link href="/login/employee" className="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-red-600 transition-all">{trans['nav.employee_login']}</Link>
        </div>
      </nav>

      <section id="home" className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"/>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[60px_60px] pointer-events-none"/>
        
        <div className="max-w-5xl mx-auto w-full grid grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1 text-xs font-semibold text-primary mb-6 shadow-sm anim-up">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {trans['welcome.hero_label']}
            </div>

            <h1 className="text-5xl font-black text-slate-900 dark:text-white leading-tight -tracking-wide mb-3 anim-up-2">
              {trans['welcome.hero_title_1']}{' '}
              <span className="text-primary">{trans['welcome.hero_title_accent']}</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 anim-up-3">
              {trans['welcome.hero_subtitle']}
            </p>

            <div className="flex items-center gap-4 anim-up-4">
              <Link
                href="/catalogue"
                className="px-6 py-3 font-bold rounded-lg bg-primary text-white hover:bg-red-600 transition-all hover:-translate-y-0.5 shadow-lg"
              >
                {trans['welcome.cta_primary']}
              </Link>
              <button className="px-6 py-3 font-bold rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                {trans['welcome.cta_secondary']}
              </button>
            </div>
          </div>

          <div className="relative h-96 float">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20" />
            <div className="absolute inset-8 flex items-center justify-center">
              <svg viewBox="0 0 300 300" className="w-full h-full text-primary/40">
                <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

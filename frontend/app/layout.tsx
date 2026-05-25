import type { Metadata } from 'next';
import './globals.css';
import { LanguageInitializer } from '@/components/LanguageInitializer';

export const metadata: Metadata = {
  title: 'SunuPark - Gestion de parc automobile',
  description: 'Système complet de gestion de location et vente de véhicules',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        {/* Applique le thème AVANT hydratation pour éviter le flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var u=sessionStorage.getItem('user');var t=u?JSON.parse(u).theme:null;var sys=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';var r=t==='system'?sys:(t||'light');if(r==='dark')document.documentElement.classList.add('dark');}catch(e){}})();` }} />
      </head>
      <body>
        <LanguageInitializer />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'AutoTerr - Gestion de parc automobile',
  description: 'Système complet de gestion de location et vente de véhicules',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=document.cookie.match(/sp_theme=([^;]+)/);var sys=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';var r=t?t[1]:(sys||'light');if(r==='dark')document.documentElement.classList.add('dark');}catch(e){}})();` }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

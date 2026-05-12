import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SunuPark - Gestion de parc automobile',
  description: 'Système complet de gestion de location et vente de véhicules',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}

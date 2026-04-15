import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SunuPark - Gestion de parc automobile',
  description: 'Système complet de gestion de location et vente de véhicules',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-950">
        {children}
      </body>
    </html>
  );
}

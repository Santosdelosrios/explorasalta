import type {Metadata} from 'next';
import {Navbar} from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: { default: 'Explorá Salta', template: '%s | Explorá Salta' },
  description: 'Mapa interactivo y cultura viva de Salta.',
  openGraph: { type: 'website', siteName: 'Explorá Salta' },
  alternates: { languages: { es: '/es', en: '/en' } }
};

export default function MarketingLayout({
  children, params: { locale }
}: { children: React.ReactNode; params: { locale: 'es'|'en' } }) {
  return (
    <html lang={locale}>
      <head>
        {/* Fuentes (puedes migrar a next/font si querés autohost) */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@700;800&display=swap" rel="stylesheet"/>
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only">Saltar al contenido</a>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

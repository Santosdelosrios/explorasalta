import type {Metadata} from 'next';
import {Navbar} from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: { default: 'Explorá Salta', template: '%s | Explorá Salta' },
  description: 'Mapa interactivo y cultura viva de Salta.',
  openGraph: { type: 'website', siteName: 'Explorá Salta' },
  alternates: { languages: { es: '/es', en: '/en' } }
};

export default function MarketingLayout({
  children
}: { 
  children: React.ReactNode; 
  params: { locale: 'es'|'en' } 
}) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">
        Saltar al contenido
      </a>
      <Navbar />
      {children}
    </>
  );
}

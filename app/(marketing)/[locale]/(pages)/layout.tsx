import type {Metadata} from 'next';
import {Navbar} from '@/components/ui/Navbar';
import type {Locale} from '@/lib/i18n/config';

type LocaleLayoutProps = { children: React.ReactNode; params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: { default: 'Explorá Salta', template: '%s | Explorá Salta' },
  description: 'Mapa interactivo y cultura viva de Salta.',
  openGraph: { type: 'website', siteName: 'Explorá Salta' },
  alternates: { languages: { es: '/es', en: '/en' } }
};

export default async function MarketingLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const normalizedLocale: Locale = locale === 'en' ? 'en' : 'es';
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">
        {normalizedLocale === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>
      <Navbar locale={normalizedLocale} />
      {children}
    </>
  );
}

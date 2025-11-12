import type {Metadata} from 'next';
import {Navbar} from '@/components/ui/Navbar';
import type {Locale} from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: { default: 'Explorá Salta', template: '%s | Explorá Salta' },
  description: 'Mapa interactivo y cultura viva de Salta.',
  openGraph: { type: 'website', siteName: 'Explorá Salta' },
  alternates: { languages: { es: '/es', en: '/en' } }
};

export default function MarketingLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: Locale};
}) {
  const locale = params.locale;
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">
        {locale === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>
      <Navbar locale={locale} />
      {children}
    </>
  );
}

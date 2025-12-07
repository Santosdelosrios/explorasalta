import type {Metadata} from 'next';
import {Navbar} from '@/components/ui/Navbar';
import type {Locale} from '@/lib/i18n/config';

type CoreLayoutProps = { children: React.ReactNode; params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: {default: 'Explorá Salta', template: '%s | Explorá Salta'},
  description: 'Mapa interactivo y cultura viva de Salta.'
};

export default async function CoreLayout({ children, params }: CoreLayoutProps) {
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

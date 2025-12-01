import type {Metadata} from 'next';
import {Navbar} from '@/components/ui/Navbar';
import type {Locale} from '@/lib/i18n/config';

type CoreLayoutProps = { children: React.ReactNode; params: Promise<{ locale?: Locale }> };

export const metadata: Metadata = {
  title: {default: 'Explorá Salta', template: '%s | Explorá Salta'},
  description: 'Mapa interactivo y cultura viva de Salta.'
};

export default async function CoreLayout({ children, params }: CoreLayoutProps) {
  const { locale = 'es' } = await params;

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

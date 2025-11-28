import MapClient from '@/components/map/MapClient';
import {getPOIs} from '@/lib/fetchers';
import type {Locale} from '@/lib/i18n/config';

const COPY: Record<
  Locale,
  {
    title: string;
    intro: string;
  }
> = {
  es: {
    title: 'Mapa interactivo de Salta',
    intro:
      'Filtrá por categoría, buscá experiencias específicas y abrí indicaciones en Google Maps sin perder tu contexto.'
  },
  en: {
    title: 'Interactive Salta map',
    intro:
      'Filter by category, search for specific stops, and jump into Google Maps directions without losing your place.'
  }
};

export default async function MapaPage({
  params
}: {
  params: {locale: Locale};
}) {
  const locale = params.locale;
  const pois = await getPOIs();
  const copy = COPY[locale];

  return (
    <main id="main" className="container mx-auto flex flex-col gap-10 px-4 py-10">
      <header className="space-y-3 text-poncho">
        <h1 className="font-heading text-4xl font-bold">{copy.title}</h1>
        <p className="text-lg text-ink/80">{copy.intro}</p>
      </header>

      <MapClient pois={pois} locale={locale} />
    </main>
  );
}

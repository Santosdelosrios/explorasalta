import MapClient from '@/components/map/MapClient';
import {getPOIs} from '@/lib/fetchers';
import type {Locale} from '@/lib/i18n/config';

const COPY: Record<Locale, {title: string; intro: string; filterHint: string}> = {
  es: {
    title: 'Mapa interactivo de Salta',
    intro:
      'Explorá los puntos imperdibles de cada región, filtrá por intereses y encontrá inspiración para tu próxima salida.',
    filterHint: 'Elegí las capas para mostrar solo lo que te interesa.'
  },
  en: {
    title: 'Interactive Salta map',
    intro:
      'Browse must-see locations across every region, toggle categories and uncover inspiration for your next getaway.',
    filterHint: 'Pick the layers to surface what matters to you.'
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
    <main id="main" className="container mx-auto flex flex-col gap-8 px-4 py-10">
      <header className="space-y-4">
        <h1 className="font-heading text-4xl font-bold text-poncho">{copy.title}</h1>
        <p className="max-w-3xl text-lg text-ink/80">{copy.intro}</p>
        <p className="text-sm uppercase tracking-[0.18em] text-cardon/70">{copy.filterHint}</p>
      </header>

      <MapClient pois={pois} locale={locale} />
    </main>
  );
}

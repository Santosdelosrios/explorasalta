import MapClient from '@/components/map/MapClient';
import MapFilters from '@/components/map/MapFilters';
import {CATEGORY_METADATA, getCategoryLabel} from '@/lib/content/categories';
import {getPOIs} from '@/lib/fetchers';
import type {Category} from '@/lib/schema';
import type {Locale} from '@/lib/i18n/config';

const COPY: Record<Locale, {title: string; intro: string; filterHint: string; statsTitle: string}> = {
  es: {
    title: 'Mapa interactivo de Salta',
    intro:
      'Explorá los puntos imperdibles de cada región, filtrá por intereses y encontrá inspiración para tu próxima salida.',
    filterHint: 'Elegí las capas para mostrar solo lo que te interesa.',
    statsTitle: 'Explorá por categoría'
  },
  en: {
    title: 'Interactive Salta map',
    intro:
      'Browse must-see locations across every region, toggle categories and uncover inspiration for your next getaway.',
    filterHint: 'Pick the layers to surface what matters to you.',
    statsTitle: 'Explore by category'
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

  const categoryStats = (Object.keys(CATEGORY_METADATA) as Category[])
    .map(category => ({
      category,
      count: pois.filter(poi => poi.category === category).length
    }))
    .filter(stat => stat.count > 0);

  const formatter = new Intl.PluralRules(locale === 'es' ? 'es-AR' : 'en-US');
  const labelForCount = (count: number) => {
    const pluralForm = formatter.select(count);
    if (locale === 'es') {
      return pluralForm === 'one'
        ? '1 lugar destacado'
        : `${count} lugares destacados`;
    }
    return pluralForm === 'one'
      ? '1 highlighted spot'
      : `${count} highlighted spots`;
  };

  return (
    <main id="main" className="container mx-auto flex flex-col gap-8 px-4 py-10">
      <header className="space-y-4">
        <h1 className="font-heading text-4xl font-bold text-poncho">{copy.title}</h1>
        <p className="max-w-3xl text-lg text-ink/80">{copy.intro}</p>
        <p className="text-sm uppercase tracking-[0.18em] text-cardon/70">{copy.filterHint}</p>
        <MapFilters locale={locale} />
      </header>

      <section aria-labelledby="map-stats" className="rounded-3xl bg-arena/60 p-6 shadow-soft">
        <h2 id="map-stats" className="font-heading text-xl font-semibold text-poncho">
          {copy.statsTitle}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryStats.map(stat => (
            <article
              key={stat.category}
              className="flex items-start gap-3 rounded-2xl border border-poncho/10 bg-white/80 px-4 py-3 shadow-sm"
            >
              <span aria-hidden className="text-2xl">
                {CATEGORY_METADATA[stat.category].icon}
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cardon/70">
                  {getCategoryLabel(stat.category, locale)}
                </p>
                <p className="font-heading text-lg text-poncho">{labelForCount(stat.count)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <MapClient pois={pois} locale={locale} />
    </main>
  );
}

import Link from 'next/link';
import {getExperiencias, getPOIs, getRegiones} from '@/lib/fetchers';
import type {POI, Region} from '@/lib/schema';
import type {Locale} from '@/lib/i18n/config';
import {CATEGORY_METADATA, getCategoryLabel} from '@/lib/content/categories';

interface RegionSummary {
  region: Region;
  pois: POI[];
  experiences: number;
}

const COPY: Record<Locale, {
  title: string;
  intro: string;
  anchorsLabel: string;
  statsLabel: string;
  poiHighlight: string;
  experiencesLabel(count: number): string;
  viewMap: string;
}> = {
  es: {
    title: 'Regiones y paisajes de Salta',
    intro:
      'Descubrí cómo se vive cada territorio: sus pueblos, experiencias destacadas y puntos panorámicos imprescindibles.',
    anchorsLabel: 'Navegar por región',
    statsLabel: 'Resumen rápido',
    poiHighlight: 'Puntos destacados',
    experiencesLabel: count => (count === 1 ? '1 experiencia sugerida' : `${count} experiencias sugeridas`),
    viewMap: 'Ver en el mapa'
  },
  en: {
    title: 'Regions and landscapes',
    intro:
      'See how each territory comes to life with signature villages, standout experiences and essential viewpoints.',
    anchorsLabel: 'Jump to region',
    statsLabel: 'Quick overview',
    poiHighlight: 'Highlights',
    experiencesLabel: count => (count === 1 ? '1 suggested experience' : `${count} suggested experiences`),
    viewMap: 'View on the map'
  }
};

function formatRegionSummaries(regions: Region[], pois: POI[], experiencesPerRegion: Map<Region['id'], number>): RegionSummary[] {
  return regions.map(region => {
    const regionPois = pois
      .filter(poi => poi.region === region.id)
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

    return {
      region,
      pois: regionPois,
      experiences: experiencesPerRegion.get(region.id) ?? 0
    };
  });
}

function formatAnchorLabel(region: Region, locale: Locale) {
  return region.name[locale];
}

export default async function RegionesPage({
  params
}: {
  params: {locale: Locale};
}) {
  const locale = params.locale;
  const copy = COPY[locale];

  const [regions, pois, experiences] = await Promise.all([
    getRegiones(),
    getPOIs(),
    getExperiencias()
  ]);

  const experiencesPerRegion = new Map<Region['id'], number>();
  experiences.forEach(exp => {
    const involvedRegions = new Set(
      exp.poiIds
        .map(poiId => pois.find(poi => poi.id === poiId)?.region)
        .filter((regionId): regionId is Region['id'] => Boolean(regionId))
    );
    involvedRegions.forEach(regionId => {
      experiencesPerRegion.set(regionId, (experiencesPerRegion.get(regionId) ?? 0) + 1);
    });
  });

  const summaries = formatRegionSummaries(regions, pois, experiencesPerRegion);

  return (
    <main id="main" className="container mx-auto flex flex-col gap-10 px-4 py-12">
      <header className="space-y-6">
        <h1 className="font-heading text-4xl font-bold text-poncho">{copy.title}</h1>
        <p className="max-w-3xl text-lg text-ink/80">{copy.intro}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold uppercase tracking-[0.2em] text-cardon/70">
            {copy.anchorsLabel}
          </span>
          {summaries.map(summary => (
            <Link
              key={summary.region.id}
              href={`#${summary.region.id}`}
              className="rounded-full border border-poncho/20 bg-white/60 px-3 py-1 font-medium text-poncho transition hover:border-poncho/50 hover:bg-white"
            >
              {formatAnchorLabel(summary.region, locale)}
            </Link>
          ))}
        </div>
      </header>

      <div className="space-y-16">
        {summaries.map(summary => {
          const highlightPois = summary.pois.slice(0, 3);
          return (
            <section
              key={summary.region.id}
              id={summary.region.id}
              className="scroll-mt-24 rounded-3xl border border-poncho/10 bg-white/80 p-6 shadow-soft"
              aria-labelledby={`${summary.region.id}-title`}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="lg:w-2/5 space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cardon/70">
                    {copy.statsLabel}
                  </p>
                  <h2 id={`${summary.region.id}-title`} className="font-heading text-3xl font-bold text-poncho">
                    {summary.region.name[locale]}
                  </h2>
                  <p className="text-base text-ink/80">{summary.region.intro[locale]}</p>

                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-arena/60 p-4">
                      <dt className="text-sm font-semibold uppercase tracking-[0.18em] text-cardon/70">
                        {locale === 'es' ? 'Puntos en el mapa' : 'Map points'}
                      </dt>
                      <dd className="font-heading text-2xl text-poncho">
                        {summary.pois.length}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-arena/60 p-4">
                      <dt className="text-sm font-semibold uppercase tracking-[0.18em] text-cardon/70">
                        {locale === 'es' ? 'Experiencias' : 'Experiences'}
                      </dt>
                      <dd className="font-heading text-2xl text-poncho">
                        {copy.experiencesLabel(summary.experiences)}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/${locale}/mapa?region=${summary.region.id}`}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-poncho/30 px-4 py-2 font-semibold text-poncho transition hover:border-poncho/60 hover:bg-arena/60"
                  >
                    {copy.viewMap}
                    <span aria-hidden>→</span>
                  </Link>
                </div>

                <div className="lg:w-3/5 space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cardon/70">
                    {copy.poiHighlight}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {highlightPois.length > 0 ? (
                      highlightPois.map(poi => (
                        <article
                          key={poi.id}
                          className="flex h-full flex-col justify-between rounded-2xl border border-poncho/10 bg-white/70 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                          <div className="space-y-2">
                            <h3 className="font-heading text-xl font-semibold text-poncho">{poi.title[locale]}</h3>
                            <p className="text-sm text-ink/70">{poi.summary[locale]}</p>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cardon/70">
                            <span aria-hidden>{CATEGORY_METADATA[poi.category].icon}</span>
                            {getCategoryLabel(poi.category, locale)}
                          </div>
                        </article>
                      ))
                    ) : (
                      <p className="rounded-2xl border border-dashed border-poncho/20 bg-arena/40 p-4 text-sm text-ink/60">
                        {locale === 'es'
                          ? 'Pronto sumaremos puntos destacados para esta región.'
                          : 'We will soon add highlighted places for this region.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

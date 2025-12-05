import type {ReactNode} from 'react';
import Link from 'next/link';
import HeroMapWrapper from '@/components/map/HeroMapWrapper';
import CulturaVivaSection from '@/components/sections/CulturaVivaSection';
import {getEventos, getPOIs, getRegiones} from '@/lib/fetchers';
import {CATEGORY_METADATA, getCategoryLabel} from '@/lib/content/categories';
import type {Locale} from '@/lib/i18n/config';
import type {POI, Region} from '@/lib/schema';

type LocalePageProps = { params: Promise<{ locale: Locale }> };

type RegionHighlight = {
  region: Region;
  poiCount: number;
  topPoi?: POI;
};

const HERO_COPY: Record<Locale, {
  title: ReactNode;
  description: string;
  mapCta: string;
  experiencesCta: string;
}> = {
  es: {
    title: (
      <>
        Explorá <span className="text-poncho">Salta</span>
      </>
    ),
    description: 'Descubrí paisajes, pueblos, rutas y tradiciones del norte argentino.',
    mapCta: 'Ir al mapa',
    experiencesCta: 'Ver experiencias'
  },
  en: {
    title: (
      <>
        Explore <span className="text-poncho">Salta</span>
      </>
    ),
    description: 'Discover landscapes, villages, routes and living traditions across northern Argentina.',
    mapCta: 'Open the map',
    experiencesCta: 'Browse experiences'
  }
};

const REGIONES_COPY: Record<Locale, {
  title: string;
  description: string;
  exploreAll: string;
  mapCta: string;
  highlightLabel: string;
  emptyHighlight: string;
}> = {
  es: {
    title: 'Regiones para explorar',
    description:
      'Elegí una región y descubrí sus paisajes, pueblos, rutas escénicas y puntos panorámicos en el mapa interactivo.',
    exploreAll: 'Ver todas las regiones',
    mapCta: 'Ver en el mapa',
    highlightLabel: 'Imperdible en la zona',
    emptyHighlight: 'Pronto sumaremos más puntos destacados aquí.'
  },
  en: {
    title: 'Regions to explore',
    description:
      'Pick a region to discover its landscapes, villages, scenic routes and viewpoints on the interactive map.',
    exploreAll: 'See all regions',
    mapCta: 'View on the map',
    highlightLabel: 'Don’t miss',
    emptyHighlight: 'We will soon feature more highlights here.'
  }
};

export default async function HomePage({ params }: LocalePageProps) {
  const { locale } = await params;
  const copy = HERO_COPY[locale];
  const [events, regiones, pois] = await Promise.all([
    getEventos(),
    getRegiones(),
    getPOIs()
  ]);

  const regionesCopy = REGIONES_COPY[locale];

  const regionHighlights: RegionHighlight[] = regiones.map(region => {
    const regionPois = pois
      .filter(poi => poi.region === region.id)
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

    return {
      region,
      poiCount: regionPois.length,
      topPoi: regionPois[0]
    };
  });

  return (
    <>
      <main
        id="main"
        className="container mx-auto flex flex-col gap-10 px-3 py-12 md:px-5"
      >
        <section className="relative overflow-hidden rounded-3xl shadow-soft" id="mapa">
          <HeroMapWrapper locale={locale} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/45" aria-hidden />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center text-white md:items-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              {locale === 'es' ? 'Mapa interactivo y cultura viva' : 'Interactive map and living culture'}
            </p>
            <h1 className="max-w-4xl font-heading text-4xl font-extrabold sm:text-5xl md:text-6xl">
              {copy.title}
            </h1>
            <p className="max-w-3xl text-base font-medium text-white/85 sm:text-lg">
              {copy.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-2xl bg-poncho px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:bg-poncho/90"
                href={`/${locale}/mapa`}
              >
                {copy.mapCta}
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
                href={`/${locale}/experiencias`}
              >
                {copy.experiencesCta}
              </Link>
            </div>
          </div>
        </section>

        <div className="hidden rounded-2xl border border-poncho/15 bg-white/85 px-4 py-3 text-center text-sm font-semibold text-ink shadow-soft">
          {locale === 'es' ? 'Espacio publicitario' : 'Promotional placement'}
        </div>

        <section className="space-y-6 rounded-3xl border border-poncho/10 bg-white/80 p-6 shadow-soft" id="regiones">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cardon/70">Regiones</p>
              <h2 className="font-heading text-3xl font-bold text-poncho">{regionesCopy.title}</h2>
              <p className="max-w-3xl text-base text-ink/80">{regionesCopy.description}</p>
            </div>
            <Link
              href={`/${locale}/regiones`}
              className="inline-flex items-center gap-2 rounded-xl border border-poncho/30 px-4 py-2 font-semibold text-poncho transition hover:border-poncho/60 hover:bg-arena/60"
            >
              {regionesCopy.exploreAll}
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {regionHighlights.map(({ region, poiCount, topPoi }) => (
              <article
                key={region.id}
                className="flex h-full flex-col gap-4 rounded-2xl border border-poncho/10 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-2xl font-bold text-poncho">{region.name[locale]}</h3>
                    {poiCount > 0 ? (
                      <span className="rounded-full bg-arena/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cardon/80">
                        {poiCount} {locale === 'es' ? 'puntos' : 'spots'}
                      </span>
                    ) : (
                      <span className="rounded-full bg-arena/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
                        {locale === 'es' ? 'Próximamente' : 'Coming soon'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink/75">{region.intro[locale]}</p>
                </div>

                <div className="rounded-2xl border border-poncho/25 bg-arena/80 p-3 shadow-inner">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cardon/70">
                    {regionesCopy.highlightLabel}
                  </p>
                  {topPoi ? (
                    <div className="mt-2 space-y-1">
                      <p className="font-heading text-lg font-semibold text-poncho">{topPoi.title[locale]}</p>
                      <p className="text-sm text-ink/70">{topPoi.summary[locale]}</p>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cardon/70">
                        <span aria-hidden>{CATEGORY_METADATA[topPoi.category].icon}</span>
                        {getCategoryLabel(topPoi.category, locale)}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-ink/60">{regionesCopy.emptyHighlight}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/mapa?region=${region.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-poncho px-4 py-2 text-sm font-semibold text-white transition hover:bg-poncho/90"
                  >
                    {regionesCopy.mapCta}
                    <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href={`/${locale}/regiones#${region.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-poncho px-4 py-2 text-sm font-semibold text-poncho transition hover:border-poncho hover:bg-poncho/5"
                  >
                    {locale === 'es' ? 'Ficha de la región' : 'Region details'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <CulturaVivaSection events={events} locale={locale} />
    </>
  );
}

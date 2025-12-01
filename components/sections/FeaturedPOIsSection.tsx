import Link from 'next/link';
import type {Locale} from '@/lib/i18n/config';
import type {POI} from '@/lib/schema';
import {CATEGORY_METADATA, getCategoryLabel} from '@/lib/content/categories';

interface FeaturedPOIsSectionProps {
  pois: POI[];
  locale: Locale;
}

const SECTION_COPY: Record<Locale, {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  viewAll: string;
  ratingLabel: string;
  directions: string;
}> = {
  es: {
    eyebrow: 'Lugares imperdibles',
    title: 'Puntos destacados',
    description: 'Los lugares más populares y mejor valorados de Salta que no podés dejar de conocer.',
    cta: 'Ver en el mapa',
    viewAll: 'Ver todos los lugares',
    ratingLabel: 'Calificación',
    directions: 'Cómo llegar'
  },
  en: {
    eyebrow: 'Must-see places',
    title: 'Featured spots',
    description: 'The most popular and highly-rated places in Salta that you cannot miss.',
    cta: 'View on map',
    viewAll: 'See all places',
    ratingLabel: 'Rating',
    directions: 'Get directions'
  }
};

function directionsUrl(poi: POI, locale: Locale): string {
  if (poi.plusCode) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.plusCode)}`;
  }
  if (poi.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.title[locale])}&query_place_id=${poi.placeId}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${poi.coords.lat},${poi.coords.lng}`;
}

export default function FeaturedPOIsSection({pois, locale}: FeaturedPOIsSectionProps) {
  const copy = SECTION_COPY[locale];
  
  // Get top POIs by popularity
  const featured = [...pois]
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 6);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-arena/40 via-white to-arena/40 py-16" aria-labelledby="pois-title">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cielo/5 via-transparent to-poncho/5" aria-hidden />
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cardon/70">{copy.eyebrow}</p>
            <h2 id="pois-title" className="font-heading text-3xl md:text-4xl font-bold text-poncho">{copy.title}</h2>
            <p className="text-base text-ink/70">{copy.description}</p>
          </div>
          <Link
            href={`/${locale}/mapa`}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-poncho px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-poncho/90"
          >
            {copy.viewAll}
            <span aria-hidden className="text-lg">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map(poi => {
            const category = CATEGORY_METADATA[poi.category];
            const rating = poi.rating?.average;
            const count = poi.rating?.count;

            return (
              <article
                key={poi.id}
                className="group flex h-full flex-col justify-between rounded-2xl border border-poncho/20 bg-white/90 p-6 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cardon/70">
                        {category.label[locale]}
                      </p>
                      <h3 className="font-heading text-xl font-semibold text-poncho">
                        {category.icon} {poi.title[locale]}
                      </h3>
                    </div>
                    {rating && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-lg font-bold text-ochre" aria-label={copy.ratingLabel}>
                          {rating.toFixed(1)}★
                        </span>
                        {count && (
                          <span className="text-xs text-ink/50">
                            {count} {locale === 'es' ? 'reseñas' : 'reviews'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-ink/70 leading-relaxed">
                    {poi.summary[locale]}
                  </p>

                  {poi.tags && poi.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {poi.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="rounded-full bg-poncho/5 px-2 py-1 text-xs font-medium text-poncho"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-poncho/10 pt-4">
                  <Link
                    href={`/${locale}/lugares/${poi.id}`}
                    className="text-sm font-semibold text-poncho transition hover:text-cardon"
                  >
                    {locale === 'es' ? 'Ver detalles' : 'View details'}
                  </Link>
                  <a
                    href={directionsUrl(poi, locale)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-ochre transition hover:text-ochre/80"
                  >
                    {copy.directions}
                    <span aria-hidden>↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


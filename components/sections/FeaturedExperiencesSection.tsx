import Link from 'next/link';
import type {Locale} from '@/lib/i18n/config';
import type {Experiencia, POI} from '@/lib/schema';
import {CATEGORY_METADATA} from '@/lib/content/categories';

interface FeaturedExperiencesSectionProps {
  experiencias: Experiencia[];
  pois: POI[];
  locale: Locale;
}

const SECTION_COPY: Record<Locale, {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  viewAll: string;
  durationLabel: (hours?: number) => string;
  stopsLabel: (count: number) => string;
  difficultyLabel: (level?: Experiencia['difficulty']) => string;
}> = {
  es: {
    eyebrow: 'Itinerarios curados',
    title: 'Experiencias destacadas',
    description: 'Recorridos sugeridos que combinan paisajes, sabores y cultura en un mismo viaje.',
    cta: 'Ver todas las experiencias',
    viewAll: 'Ver todas',
    durationLabel: hours => {
      if (!hours) return 'Duración flexible';
      return hours === 1 ? '1 hora' : `${hours} horas`;
    },
    stopsLabel: count => (count === 1 ? '1 parada' : `${count} paradas`),
    difficultyLabel: level => {
      switch (level) {
        case 'easy':
          return 'Fácil';
        case 'moderate':
          return 'Moderada';
        case 'hard':
          return 'Difícil';
        default:
          return 'Variable';
      }
    }
  },
  en: {
    eyebrow: 'Curated itineraries',
    title: 'Featured experiences',
    description: 'Suggested routes that blend landscapes, flavours and culture into one journey.',
    cta: 'See all experiences',
    viewAll: 'See all',
    durationLabel: hours => {
      if (!hours) return 'Flexible duration';
      return hours === 1 ? '1 hour' : `${hours} hours`;
    },
    stopsLabel: count => (count === 1 ? '1 stop' : `${count} stops`),
    difficultyLabel: level => {
      switch (level) {
        case 'easy':
          return 'Easy';
        case 'moderate':
          return 'Moderate';
        case 'hard':
          return 'Hard';
        default:
          return 'Varies';
      }
    }
  }
};

function resolveStops(experience: Experiencia, pois: POI[], locale: Locale): string[] {
  return experience.poiIds
    .map(id => pois.find(poi => poi.id === id))
    .filter((poi): poi is POI => Boolean(poi))
    .map(poi => poi.title[locale]);
}

export default function FeaturedExperiencesSection({experiencias, pois, locale}: FeaturedExperiencesSectionProps) {
  const copy = SECTION_COPY[locale];
  const featured = experiencias.slice(0, 3);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-arena/20 to-white py-16" aria-labelledby="experiencias-title">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-poncho/5 via-transparent to-cielo/5" aria-hidden />
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cardon/70">{copy.eyebrow}</p>
            <h2 id="experiencias-title" className="font-heading text-3xl md:text-4xl font-bold text-poncho">{copy.title}</h2>
            <p className="text-base text-ink/70">{copy.description}</p>
          </div>
          <Link
            href={`/${locale}/experiencias`}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-poncho/40 bg-white/70 px-4 py-2 text-sm font-semibold text-poncho shadow-soft transition hover:border-poncho hover:bg-white"
          >
            {copy.viewAll}
            <span aria-hidden className="text-lg">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map(experience => {
            const stops = resolveStops(experience, pois, locale);
            const difficultyColor = {
              easy: 'bg-green-100 text-green-800',
              moderate: 'bg-yellow-100 text-yellow-800',
              hard: 'bg-red-100 text-red-800'
            }[experience.difficulty || 'easy'] || 'bg-gray-100 text-gray-800';

            return (
              <article
                key={experience.id}
                className="group flex h-full flex-col justify-between rounded-2xl border border-poncho/20 bg-white/90 p-6 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-heading text-2xl font-semibold text-poncho">
                      {experience.title[locale]}
                    </h3>
                    <p className="text-sm text-ink/70 leading-relaxed">
                      {experience.overview[locale]}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {experience.durationHours && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-arena/60 px-3 py-1 font-medium text-cardon">
                        <span aria-hidden>⏱</span>
                        {copy.durationLabel(experience.durationHours)}
                      </span>
                    )}
                    {stops.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-poncho/10 px-3 py-1 font-medium text-poncho">
                        <span aria-hidden>📍</span>
                        {copy.stopsLabel(stops.length)}
                      </span>
                    )}
                    {experience.difficulty && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium ${difficultyColor}`}>
                        {copy.difficultyLabel(experience.difficulty)}
                      </span>
                    )}
                  </div>

                  {stops.length > 0 && (
                    <div className="space-y-2 rounded-xl bg-arena/40 p-3 text-sm">
                      <p className="font-semibold uppercase tracking-[0.18em] text-cardon/70 text-xs">
                        {locale === 'es' ? 'Paradas' : 'Stops'}
                      </p>
                      <ul className="space-y-1 text-ink/80">
                        {stops.slice(0, 3).map((stop, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-poncho" aria-hidden />
                            <span>{stop}</span>
                          </li>
                        ))}
                        {stops.length > 3 && (
                          <li className="text-xs text-ink/60 italic">
                            +{stops.length - 3} {locale === 'es' ? 'más' : 'more'}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-poncho/10 pt-4">
                  <Link
                    href={`/${locale}/experiencias#${experience.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-poncho transition hover:text-cardon"
                  >
                    {locale === 'es' ? 'Ver detalles' : 'View details'}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


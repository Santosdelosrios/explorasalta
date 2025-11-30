import Link from 'next/link';
import {getExperiencias, getPOIs} from '@/lib/fetchers';
import type {Experiencia, POI} from '@/lib/schema';
import type {Locale} from '@/lib/i18n/config';

type LocalePageProps = { params: Promise<{ locale: Locale }> };

const COPY: Record<Locale, {
  title: string;
  intro: string;
  curatedLabel: string;
  detailsLabel: string;
  discoverMore: string;
  durationLabel(hours?: number): string;
  stopsLabel(count: number): string;
  difficultyLabel(level?: Experiencia['difficulty']): string;
}> = {
  es: {
    title: 'Experiencias sugeridas',
    intro: 'Itinerarios curados para combinar paisajes, sabores y cultura en un mismo recorrido.',
    curatedLabel: 'Colecciones para inspirarte',
    detailsLabel: 'Detalle del recorrido',
    discoverMore: 'Descubrir en el mapa',
    durationLabel: hours => {
      if (!hours) return 'Duración flexible';
      return hours === 1 ? '1 hora aproximada' : `${hours} horas aproximadas`;
    },
    stopsLabel: count => (count === 1 ? '1 parada' : `${count} paradas`),
    difficultyLabel: level => {
      switch (level) {
        case 'easy':
          return 'Dificultad: baja';
        case 'moderate':
          return 'Dificultad: media';
        case 'hard':
          return 'Dificultad: alta';
        default:
          return 'Dificultad variable';
      }
    }
  },
  en: {
    title: 'Curated experiences',
    intro: 'Curated itineraries that blend landscapes, flavours and culture into one route.',
    curatedLabel: 'Collections to inspire you',
    detailsLabel: 'Route details',
    discoverMore: 'Open on the map',
    durationLabel: hours => {
      if (!hours) return 'Flexible duration';
      return hours === 1 ? 'About 1 hour' : `About ${hours} hours`;
    },
    stopsLabel: count => (count === 1 ? '1 stop' : `${count} stops`),
    difficultyLabel: level => {
      switch (level) {
        case 'easy':
          return 'Difficulty: easy';
        case 'moderate':
          return 'Difficulty: moderate';
        case 'hard':
          return 'Difficulty: hard';
        default:
          return 'Difficulty: varies';
      }
    }
  }
};

function resolveStops(experience: Experiencia, pois: POI[], locale: Locale) {
  return experience.poiIds
    .map(id => pois.find(poi => poi.id === id))
    .filter((poi): poi is POI => Boolean(poi))
    .map(poi => poi.title[locale]);
}

export default async function ExperienciasPage({ params }: LocalePageProps) {
  const { locale } = await params;
  const copy = COPY[locale];
  const [experiencias, pois] = await Promise.all([getExperiencias(), getPOIs()]);

  return (
    <main id="main" className="container mx-auto flex flex-col gap-10 px-4 py-12">
      <header className="space-y-5">
        <h1 className="font-heading text-4xl font-bold text-poncho">{copy.title}</h1>
        <p className="max-w-3xl text-lg text-ink/80">{copy.intro}</p>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cardon/70">{copy.curatedLabel}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {experiencias.map(experience => {
          const stops = resolveStops(experience, pois, locale);
          return (
            <article
              key={experience.id}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-poncho/10 bg-white/80 shadow-soft"
            >
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="space-y-2">
                  <h2 className="font-heading text-2xl font-semibold text-poncho">{experience.title[locale]}</h2>
                  <p className="text-sm text-ink/70">{experience.overview[locale]}</p>
                </div>

                <dl className="grid grid-cols-1 gap-2 text-sm text-ink/80">
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.18em] text-cardon/70">
                      {copy.detailsLabel}
                    </dt>
                    <dd className="mt-1 space-y-1">
                      <p>{copy.durationLabel(experience.durationHours)}</p>
                      <p>{copy.stopsLabel(stops.length)}</p>
                      <p>{copy.difficultyLabel(experience.difficulty)}</p>
                    </dd>
                  </div>
                </dl>

                {stops.length > 0 ? (
                  <div className="space-y-2 rounded-2xl bg-arena/50 p-4 text-sm text-ink/80">
                    <p className="font-semibold uppercase tracking-[0.18em] text-cardon/70">
                      {locale === 'es' ? 'Paradas sugeridas' : 'Suggested stops'}
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                      {stops.map(stop => (
                        <li key={stop}>{stop}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-auto pt-2">
                  <Link
                    href={`/${locale}/mapa?poi=${experience.poiIds[0] ?? ''}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-poncho/30 px-4 py-2 text-sm font-semibold text-poncho transition hover:border-poncho/60 hover:bg-arena/60"
                  >
                    {copy.discoverMore}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

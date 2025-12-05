import Link from 'next/link';
import type {Locale} from '@/lib/i18n/config';
import type {Evento, RegionId} from '@/lib/schema';

interface CulturaVivaSectionProps {
  events: Evento[];
  locale: Locale;
}

const SECTION_COPY: Record<Locale, { title: string; eyebrow: string; description: string; cta: string; empty: string; websiteLabel: string; regionLabel(region: RegionId): string; }>
  = {
    es: {
      title: 'Cultura viva',
      eyebrow: 'Agenda cultural',
      description: 'Música, fiestas populares y tradiciones que podés disfrutar en los próximos meses.',
      cta: 'Ver toda la agenda',
      empty: 'Pronto sumaremos nuevos eventos culturales.',
      websiteLabel: 'Sitio oficial',
      regionLabel(region) {
        const labels: Record<RegionId, string> = {
          valles: 'Valles Calchaquíes',
          puna: 'Puna',
          yungas: 'Yungas',
          ciudad: 'Ciudad de Salta',
          lerma: 'Valle de Lerma',
          anta: 'Anta',
          'orán': 'Orán'
        };
        return labels[region];
      }
    },
    en: {
      title: 'Living culture',
      eyebrow: 'Cultural agenda',
      description: 'Live music, popular festivities and traditions happening over the next few months.',
      cta: 'See full calendar',
      empty: 'We will publish new cultural events soon.',
      websiteLabel: 'Official website',
      regionLabel(region) {
        const labels: Record<RegionId, string> = {
          valles: 'Calchaquí Valleys',
          puna: 'Puna Highlands',
          yungas: 'Yungas Jungle',
          ciudad: 'Salta City',
          lerma: 'Lerma Valley',
          anta: 'Anta',
          'orán': 'Orán'
        };
        return labels[region];
      }
    }
  };

function formatDateRange({ start, end }: Evento['dateRange'], locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale === 'es' ? 'es-AR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const startDate = formatter.format(new Date(start));
  if (!end || end === start) {
    return startDate;
  }

  const endDate = formatter.format(new Date(end));
  return `${startDate} – ${endDate}`;
}

function sortEvents(events: Evento[]) {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.dateRange.start).getTime();
    const dateB = new Date(b.dateRange.start).getTime();
    return dateA - dateB;
  });
}

function groupEventsByYear(events: Evento[]) {
  return events.reduce<Record<string, Evento[]>>((groups, event) => {
    const year = new Date(event.dateRange.start).getFullYear().toString();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(event);
    return groups;
  }, {});
}

export default function CulturaVivaSection({ events, locale }: CulturaVivaSectionProps) {
  const copy = SECTION_COPY[locale];
  const sorted = sortEvents(events);
  const byYear = Object.entries(groupEventsByYear(sorted)).sort(
    ([yearA], [yearB]) => Number(yearA) - Number(yearB)
  );

  if (sorted.length === 0) {
    return (
      <section className="bg-arena/40 py-16" aria-labelledby="cultura-viva-title">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cardon/70">{copy.eyebrow}</p>
            <h2 id="cultura-viva-title" className="text-3xl md:text-4xl font-bold text-poncho">{copy.title}</h2>
            <p className="text-base text-ink/70">{copy.empty}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-arena/40 py-16" aria-labelledby="cultura-viva-title">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cardon/10 via-transparent to-cielo/10" aria-hidden />
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cardon/70">{copy.eyebrow}</p>
            <h2 id="cultura-viva-title" className="text-3xl md:text-4xl font-bold text-poncho">{copy.title}</h2>
            <p className="text-base text-ink/70">{copy.description}</p>
          </div>
          <Link
            href={`/${locale}/cultura`}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-poncho/40 bg-white/70 px-4 py-2 text-sm font-semibold text-poncho shadow-soft transition hover:border-poncho hover:bg-white"
          >
            {copy.cta}
            <span aria-hidden className="text-lg">→</span>
          </Link>
        </div>

        {byYear.map(([year, eventsForYear]) => (
          <div key={year} className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cardon/70">{year}</p>
              <div className="h-px flex-1 rounded-full bg-cardon/10" aria-hidden />
            </div>

            <div className="columns-1 gap-6 md:columns-2 xl:columns-3">
              {eventsForYear.map(event => (
                <article
                  key={event.id}
                  className="mb-6 break-inside-avoid rounded-2xl border border-poncho/20 bg-white/80 p-6 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-cardon/80">
                      {formatDateRange(event.dateRange, locale)}
                    </p>
                    <h3 className="text-2xl font-semibold text-poncho">
                      {event.title[locale]}
                    </h3>
                    <p className="text-sm text-ink/70">
                      {event.description[locale]}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-poncho/10 pt-4 text-sm">
                    <span className="inline-flex items-center gap-2 rounded-full bg-cardon/10 px-3 py-1 font-medium text-cardon">
                      <span className="h-2 w-2 rounded-full bg-cardon" aria-hidden />
                      {copy.regionLabel(event.region)}
                    </span>
                    {event.website ? (
                      <Link
                        href={event.website}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-poncho transition hover:text-cardon"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {copy.websiteLabel}
                        <span aria-hidden>↗</span>
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

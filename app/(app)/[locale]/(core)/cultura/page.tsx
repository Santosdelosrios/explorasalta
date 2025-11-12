import Link from 'next/link';
import {getEventos, getPOIs, getRegiones} from '@/lib/fetchers';
import type {Evento, POI, Region} from '@/lib/schema';
import type {Locale} from '@/lib/i18n/config';

const COPY: Record<Locale, {
  title: string;
  intro: string;
  monthLabel(date: Date): string;
  locationFallback: string;
  regionLabel(region: Region): string;
  scheduleLabel: string;
  empty: string;
  website: string;
}> = {
  es: {
    title: 'Cultura viva',
    intro: 'Festivales, ferias y encuentros culturales que podés vivir en las próximas semanas.',
    monthLabel: date =>
      new Intl.DateTimeFormat('es-AR', {month: 'long', year: 'numeric'}).format(date),
    locationFallback: 'Ubicación a confirmar',
    regionLabel: region => region.name.es,
    scheduleLabel: 'Agenda cultural',
    empty: 'Pronto publicaremos nuevas actividades culturales.',
    website: 'Sitio oficial'
  },
  en: {
    title: 'Living culture',
    intro: 'Festivals, fairs and cultural gatherings happening over the next few weeks.',
    monthLabel: date =>
      new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric'}).format(date),
    locationFallback: 'Location to be confirmed',
    regionLabel: region => region.name.en,
    scheduleLabel: 'Cultural calendar',
    empty: 'We will publish new cultural activities soon.',
    website: 'Official website'
  }
};

function formatDateRange({start, end}: Evento['dateRange'], locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale === 'es' ? 'es-AR' : 'en-US', {
    day: 'numeric',
    month: 'short'
  });

  const startDate = formatter.format(new Date(start));
  if (!end || end === start) {
    return startDate;
  }
  const endDate = formatter.format(new Date(end));
  return `${startDate} – ${endDate}`;
}

function groupByMonth(events: Evento[]) {
  const groups = new Map<string, Evento[]>();
  events.forEach(event => {
    const monthKey = event.dateRange.start.slice(0, 7);
    const list = groups.get(monthKey) ?? [];
    list.push(event);
    groups.set(monthKey, list);
  });
  return groups;
}

export default async function CulturaPage({
  params
}: {
  params: {locale: Locale};
}) {
  const locale = params.locale;
  const copy = COPY[locale];

  const [events, pois, regions] = await Promise.all([
    getEventos(),
    getPOIs(),
    getRegiones()
  ]);

  const regionMap = new Map<Region['id'], Region>(regions.map(region => [region.id, region]));
  const poiMap = new Map<POI['id'], POI>(pois.map(poi => [poi.id, poi]));

  const upcoming = [...events].sort((a, b) =>
    new Date(a.dateRange.start).getTime() - new Date(b.dateRange.start).getTime()
  );

  if (upcoming.length === 0) {
    return (
      <main id="main" className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-4xl font-bold text-poncho">{copy.title}</h1>
        <p className="mt-4 text-lg text-ink/80">{copy.empty}</p>
      </main>
    );
  }

  const grouped = groupByMonth(upcoming);

  return (
    <main id="main" className="container mx-auto flex flex-col gap-12 px-4 py-12">
      <header className="space-y-4 text-center md:text-left">
        <h1 className="font-heading text-4xl font-bold text-poncho">{copy.title}</h1>
        <p className="mx-auto max-w-3xl text-lg text-ink/80 md:mx-0">{copy.intro}</p>
      </header>

      <section className="space-y-10" aria-label={copy.scheduleLabel}>
        {[...grouped.entries()].map(([monthKey, monthEvents]) => {
          const monthDate = new Date(`${monthKey}-01T00:00:00`);
          return (
            <article key={monthKey} className="space-y-6">
              <header>
                <h2 className="font-heading text-2xl font-semibold text-poncho">
                  {copy.monthLabel(monthDate)}
                </h2>
                <div className="mt-1 h-1 w-20 rounded-full bg-cardon/50" aria-hidden />
              </header>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {monthEvents.map(event => {
                  const region = regionMap.get(event.region);
                  const location = event.locationPoiId
                    ? poiMap.get(event.locationPoiId)?.title[locale]
                    : undefined;
                  return (
                    <div
                      key={event.id}
                      className="flex h-full flex-col justify-between rounded-3xl border border-poncho/15 bg-white/80 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cardon/70">
                          {formatDateRange(event.dateRange, locale)}
                        </p>
                        <h3 className="font-heading text-2xl font-semibold text-poncho">
                          {event.title[locale]}
                        </h3>
                        <p className="text-sm text-ink/70">{event.description[locale]}</p>
                      </div>

                      <dl className="mt-4 space-y-2 text-sm text-ink/80">
                        <div>
                          <dt className="font-semibold uppercase tracking-[0.18em] text-cardon/70">
                            {locale === 'es' ? 'Lugar' : 'Location'}
                          </dt>
                          <dd>{location ?? copy.locationFallback}</dd>
                        </div>
                        {region ? (
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.18em] text-cardon/70">
                              {locale === 'es' ? 'Región' : 'Region'}
                            </dt>
                            <dd>{copy.regionLabel(region)}</dd>
                          </div>
                        ) : null}
                      </dl>

                      <div className="mt-6 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-cardon/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cardon/80">
                          {locale === 'es' ? 'Cultura viva' : 'Living culture'}
                        </span>
                        {event.website ? (
                          <Link
                            href={event.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-poncho transition hover:text-cardon"
                          >
                            {copy.website}
                            <span aria-hidden>↗</span>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

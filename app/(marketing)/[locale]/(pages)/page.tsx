import type {ReactNode} from 'react';
import Link from 'next/link';
import HeroMapWrapper from '@/components/map/HeroMapWrapper';
import CulturaVivaSection from '@/components/sections/CulturaVivaSection';
import {getEventos} from '@/lib/fetchers';
import type {Locale} from '@/lib/i18n/config';

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

export default async function HomePage({
  params
}: {
  params: {locale: Locale};
}) {
  const locale = params.locale;
  const copy = HERO_COPY[locale];
  const events = await getEventos();

  return (
    <>
      <main
        id="main"
        className="container mx-auto flex flex-col gap-12 px-3 py-12 md:px-5"
      >
        <section className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
          <div className="flex w-full flex-col items-center gap-3 md:flex-row md:items-start md:justify-between md:text-left">
            <h1 className="max-w-3xl font-heading text-4xl font-extrabold md:text-5xl">
              {copy.title}
              <span className="block text-xl font-semibold text-cardon md:text-2xl">
                {locale === 'es'
                  ? 'Mapa interactivo y cultura viva'
                  : 'Interactive map and living culture'}
              </span>
            </h1>
            <div className="flex w-full flex-col items-center gap-3 md:max-w-sm md:items-end">
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
                <Link
                  className="rounded-xl bg-poncho px-5 py-3 font-semibold text-white shadow-soft transition-colors hover:bg-poncho/90"
                  href={{pathname: `/${locale}`, hash: 'mapa'}}
                  scroll
                >
                  {copy.mapCta}
                </Link>
                <Link
                  className="rounded-xl border border-poncho/30 px-5 py-3 font-semibold transition-all hover:border-poncho/50 hover:bg-ink/5"
                  href={`/${locale}/experiencias`}
                >
                  {copy.experiencesCta}
                </Link>
              </div>
              <div className="w-full rounded-2xl border border-poncho/20 bg-white/70 px-4 py-3 text-sm font-semibold text-ink shadow-soft">
                {locale === 'es' ? 'Espacio publicitario' : 'Promotional placement'}
              </div>
            </div>
          </div>
          <p className="max-w-2xl text-lg text-zinc-700 md:text-left">{copy.description}</p>
        </section>

        <section className="w-full" id="mapa">
          <HeroMapWrapper locale={locale} />
        </section>
      </main>

      <CulturaVivaSection events={events} locale={locale} />
    </>
  );
}

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
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const copy = HERO_COPY[locale];
  const events = await getEventos();

  return (
    <>
      <main id="main" className="container mx-auto grid items-center gap-8 px-4 py-16 md:grid-cols-2">
        {/* Columna izquierda: Texto */}
        <div>
          <h1 className="font-[Montserrat] text-4xl font-extrabold md:text-5xl">
            {copy.title}
            <span className="block text-xl font-semibold text-cardon md:text-2xl">
              {locale === 'es' ? 'Mapa interactivo y cultura viva' : 'Interactive map and living culture'}
            </span>
          </h1>
          <p className="mt-4 text-lg text-zinc-700">{copy.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="rounded-xl bg-poncho px-5 py-3 font-semibold text-white shadow-soft transition-colors hover:bg-poncho/90"
              href={`/${locale}/mapa`}
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
        </div>

        {/* Columna derecha: MAPA PREVIEW */}
        <div className="overflow-hidden rounded-2xl shadow-soft">
          <HeroMapWrapper />
        </div>
      </main>

      <CulturaVivaSection events={events} locale={locale} />
    </>
  );
}

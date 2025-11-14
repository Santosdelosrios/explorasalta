import MapExplorer from '@/components/map/MapExplorer';
import {CATEGORY_METADATA} from '@/lib/content/categories';
import {getPOIs} from '@/lib/fetchers';
import type {Locale} from '@/lib/i18n/config';
import type {Category} from '@/lib/schema';

const COPY: Record<
  Locale,
  {
    title: string;
    intro: string;
    subtitle: string;
    stats: string;
    highlight: string;
  }
> = {
  es: {
    title: 'Mapa interactivo de Salta',
    intro:
      'Filtrá por categoría, buscá experiencias específicas y abrí indicaciones en Google Maps sin perder tu contexto.',
    subtitle: 'Capas organizadas y una lista curada de lugares imperdibles para planificar tu ruta.',
    stats: 'Cobertura actual',
    highlight: 'Capas disponibles'
  },
  en: {
    title: 'Interactive Salta map',
    intro:
      'Filter by category, search for specific stops, and jump into Google Maps directions without losing your place.',
    subtitle: 'Organized layers plus a curated list of must-see spots to plan confidently.',
    stats: 'Coverage today',
    highlight: 'Available layers'
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

  const uniqueRegions = new Set(pois.map((poi) => poi.region));
  const uniqueTags = new Set(
    pois
      .flatMap((poi) => poi.tags ?? [])
      .map((tag) => tag.toLowerCase())
  );

  const categoryCounts = (Object.keys(CATEGORY_METADATA) as Category[]).map((category) => ({
    category,
    count: pois.filter((poi) => poi.category === category).length
  }));

  return (
    <main id="main" className="container mx-auto flex flex-col gap-10 px-4 py-10">
      <header className="space-y-4 rounded-3xl border border-white/50 bg-white/80 p-6 text-ink shadow backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">{copy.stats}</p>
        <div className="grid gap-4 text-poncho/80 sm:grid-cols-3">
          <Stat label={locale === 'es' ? 'Regiones cubiertas' : 'Regions covered'} value={uniqueRegions.size} />
          <Stat label={locale === 'es' ? 'Lugares activos' : 'Active places'} value={pois.length} />
          <Stat
            label={locale === 'es' ? 'Temas destacados' : 'Featured tags'}
            value={uniqueTags.size > 0 ? uniqueTags.size : '20+'}
          />
        </div>

        <div className="space-y-2 text-poncho">
          <h1 className="font-heading text-4xl font-bold">{copy.title}</h1>
          <p className="text-lg text-ink/80">{copy.intro}</p>
          <p className="text-sm uppercase tracking-[0.3em] text-ink/40">{copy.subtitle}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ink/40">{copy.highlight}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {categoryCounts.map(({category, count}) => {
              const metadata = CATEGORY_METADATA[category];
              const totalLabel = locale === 'es' ? 'sitios' : 'spots';
              return (
                <div
                  key={category}
                  className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm font-semibold text-ink shadow"
                >
                  <p className="text-2xl text-poncho">{metadata.icon}</p>
                  <p>{metadata.label[locale]}</p>
                  <p className="text-xs font-medium text-ink/50">{count} {totalLabel}</p>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <MapExplorer pois={pois} locale={locale} />
    </main>
  );
}

function Stat({label, value}: {label: string; value: number | string}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-center shadow">
      <p className="text-3xl font-bold text-poncho">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">{label}</p>
    </div>
  );
}

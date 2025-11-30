import {getPOIs} from '@/lib/fetchers';
import type {Metadata} from 'next';

type Props = { params: Promise<{ slug: string; locale: 'es' | 'en' }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const pois = await getPOIs();
  const poi = pois.find(p => p.id === slug);
  if (!poi) return {};
  return {
    title: poi.title[locale],
    description: poi.summary[locale],
    openGraph: { type: 'website', title: poi.title[locale], description: poi.summary[locale] }
  };
}

export default async function LugarPage({ params }: Props) {
  const { slug, locale } = await params;
  const pois = await getPOIs();
  const poi = pois.find(p => p.id === slug);
  if (!poi) return <div className="p-8">No encontrado</div>;
  return (
    <main className="container mx-auto px-4 py-8 space-y-3">
      <h1 className="text-3xl font-bold">{poi.title[locale]}</h1>
      <p className="text-zinc-700">{poi.summary[locale]}</p>
      <a className="text-poncho underline" href={`/${locale}/mapa?poi=${poi.id}`}>
        Ver en mapa
      </a>
    </main>
  );
}

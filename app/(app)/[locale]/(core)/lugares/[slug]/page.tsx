import {getPOIs} from '@/lib/fetchers';
import type {Metadata} from 'next';

type Props = { params: { slug: string; locale: 'es'|'en' } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pois = await getPOIs();
  const poi = pois.find(p => p.id === params.slug);
  if (!poi) return {};
  return {
    title: poi.title[params.locale],
    description: poi.summary[params.locale],
    openGraph: { type: 'place', title: poi.title[params.locale], description: poi.summary[params.locale] }
  };
}

export default async function LugarPage({ params }: Props) {
  const pois = await getPOIs();
  const poi = pois.find(p => p.id === params.slug);
  if (!poi) return <div className="p-8">No encontrado</div>;
  return (
    <main className="container mx-auto px-4 py-8 space-y-3">
      <h1 className="text-3xl font-bold">{poi.title[params.locale]}</h1>
      <p className="text-zinc-700">{poi.summary[params.locale]}</p>
      <a className="text-poncho underline" href="/es/mapa?poi=${poi.id}">Ver en mapa</a>
    </main>
  );
}

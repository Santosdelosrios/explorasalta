import dynamic from 'next/dynamic';
import {getPOIs} from '@/lib/fetchers';
import MapFilters from '@/components/map/MapFilters';

const MapLibre = dynamic(() => import('@/components/map/MapLibre'), { ssr: false });

export default async function MapaPage() {
  const pois = await getPOIs();
  return (
    <main className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-3xl font-bold text-poncho">Mapa interactivo</h1>
      <MapFilters />
      {/* @ts-expect-error server-to-client prop */}
      <MapLibre pois={pois} />
    </main>
  );
}

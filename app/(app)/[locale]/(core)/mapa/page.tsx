import { getPOIs } from '@/lib/fetchers';
import MapFilters from '@/components/map/MapFilters';
import MapClient from '@/components/map/MapClient';

export default async function MapaPage() {
  const pois = await getPOIs(); // Server Component OK
  return (
    <main className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-3xl font-bold text-poncho">Mapa interactivo</h1>
      <MapFilters /> {/* ya es client, no hay problema */}
      <MapClient pois={pois} /> {/* client wrapper con dynamic ssr:false */}
    </main>
  );
}

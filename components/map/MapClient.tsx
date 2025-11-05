'use client';
import dynamic from 'next/dynamic';
import type { POI } from '@/lib/schema';

// Lazy-load del mapa SOLO en el cliente
const MapLibre = dynamic(() => import('@/components/map/MapLibre'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[64vh] w-full rounded-2xl shadow bg-white/40 animate-pulse"
      aria-busy="true"
      aria-label="Cargando mapa…"
    />
  ),
});

export default function MapClient({ pois }: { pois: POI[] }) {
  return <MapLibre pois={pois} />;
}

'use client';
import dynamic from 'next/dynamic';
import type { POI } from '@/lib/schema';

const MapLibre = dynamic(() => import('@/components/map/MapLibre'), {
  ssr: false,
  loading: () => (
    <div className="h-[64vh] w-full rounded-2xl shadow bg-white/40 animate-pulse"
         aria-busy="true" aria-label="Cargando mapa…" />
  )
});

export default function MapClient({ pois }: { pois: POI[] }) {
  const styleUrl = process.env.NEXT_PUBLIC_MAPTILER_KEY
    ? `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
    : 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_D6rA4zTHduk6KOKTXzGB';

  return <MapLibre pois={pois} styleUrl={styleUrl} />;
}

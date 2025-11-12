'use client';
import dynamic from 'next/dynamic';
import type { POI } from '@/lib/schema';
import type {Locale} from '@/lib/i18n/config';

function loadingFallback(label: string) {
  return (
    <div
      className="h-[64vh] w-full animate-pulse rounded-2xl bg-white/40 shadow"
      aria-busy="true"
      aria-label={label}
    />
  );
}

const MapLibre = dynamic(() => import('@/components/map/MapLibre'), {
  ssr: false,
  loading: () => loadingFallback('Cargando mapa… / Loading map…')
});

export default function MapClient({ pois, locale }: { pois: POI[]; locale: Locale }) {
  const styleUrl = process.env.NEXT_PUBLIC_MAPTILER_KEY
    ? `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
    : 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_D6rA4zTHduk6KOKTXzGB';

  return (
    <MapLibre
      pois={pois}
      styleUrl={styleUrl}
      locale={locale}
    />
  );
}

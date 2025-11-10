'use client';
import dynamic from 'next/dynamic';

// Importación dinámica del mapa (sin SSR)
const HeroMapPreview = dynamic(
  () => import('@/components/map/HeroMapPreview'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-arena/30 animate-pulse rounded-2xl">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-poncho border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-poncho/50 text-sm font-medium">Cargando mapa...</p>
        </div>
      </div>
    )
  }
);

export default function HeroMapWrapper() {
  return <HeroMapPreview />;
}

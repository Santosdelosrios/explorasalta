'use client';
import dynamic from 'next/dynamic';
import type {Locale} from '@/lib/i18n/config';
import type {POI} from '@/lib/schema';

const HeroMapPreview = dynamic(() => import('@/components/map/HeroMapPreview'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full animate-pulse items-center justify-center rounded-2xl bg-arena/30">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-poncho border-t-transparent" />
        <p className="text-sm font-medium text-poncho/60">Cargando mapa · Loading map</p>
      </div>
    </div>
  )
});

interface HeroMapWrapperProps {
  locale: Locale;
  pois: POI[];
}

export default function HeroMapWrapper({locale, pois}: HeroMapWrapperProps) {
  return <HeroMapPreview pois={pois} locale={locale} enableTour={false} />;
}

'use client';

import type {Locale} from '@/lib/i18n/config';
import type {POI} from '@/lib/schema';

import MapExplorer from './MapExplorer';

interface MapClientProps {
  pois: POI[];
  locale: Locale;
}

export default function MapClient(props: MapClientProps) {
  return <MapExplorer {...props} />;
}

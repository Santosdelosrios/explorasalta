'use client';

import {useEffect, useRef} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type {POI, Category} from '@/lib/schema';
import type {Locale} from '@/lib/i18n/config';

const TOUR_POINTS = [
  {name: 'Cafayate', coords: [-65.9767, -26.0733], zoom: 11},
  {name: 'Cachi', coords: [-66.1667, -25.1167], zoom: 11.5},
  {name: 'San Antonio de los Cobres', coords: [-66.3208, -24.2167], zoom: 10.5},
  {name: 'Salta Capital', coords: [-65.4117, -24.7829], zoom: 11},
  {name: 'Coronel Moldes', coords: [-65.4786, -25.2922], zoom: 12},
  {name: 'Rosario de la Frontera', coords: [-64.9667, -25.8], zoom: 11},
  {name: 'Las Lajitas', coords: [-64.1667, -24.7333], zoom: 11.5},
  {name: 'Iruya', coords: [-65.2172, -22.7833], zoom: 12},
] as const;

const SALTA_CENTER: [number, number] = [-65.4, -24.8];
const INITIAL_ZOOM = 6.5;

const CATEGORY_COLORS: Record<Category, string> = {
  pueblo: '#b45309',
  mirador: '#0f766e',
  ruta: '#9333ea',
  fiesta: '#be123c',
  museo: '#2563eb',
  gastronomia: '#b91c1c',
  sendero: '#15803d',
  patrimonio: '#7c3aed'
};

interface HeroMapPreviewProps {
  pois?: POI[];
  locale?: Locale;
  enableTour?: boolean;
}

export default function HeroMapPreview({pois = [], locale = 'es', enableTour = false}: HeroMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const tourIndexRef = useRef(0);
  const tourTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!maptilerKey) {
      console.error('Falta NEXT_PUBLIC_MAPTILER_KEY para renderizar el mapa.');
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerKey}`,
      center: SALTA_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: enableTour ? 45 : 20,
      bearing: 0,
      interactive: !enableTour,
      attributionControl: false,
      refreshExpiredTiles: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add POI markers if POIs are provided
      if (pois.length > 0) {
        pois.forEach((poi) => {
          const el = document.createElement('button');
          el.className = 'poi-marker focus:outline-none';
          el.setAttribute('aria-label', poi.title[locale]);
          el.style.setProperty('--marker-color', CATEGORY_COLORS[poi.category]);

          const marker = new maplibregl.Marker({element: el, anchor: 'bottom'})
            .setLngLat([poi.coords.lng, poi.coords.lat])
            .addTo(map);

          markersRef.current[poi.id] = marker;
        });

        // If not in tour mode, fit bounds to show all POIs
        if (!enableTour && pois.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          pois.forEach((poi) => bounds.extend([poi.coords.lng, poi.coords.lat]));
          map.fitBounds(bounds, {padding: 60, maxZoom: 12.5, duration: 1000});
        }
      }

      // Start tour only if enabled
      if (enableTour) {
        startAutoTour(map);
      }
    });

    return () => {
      if (tourTimeoutRef.current) {
        clearTimeout(tourTimeoutRef.current);
      }

      Object.values(markersRef.current).forEach((marker) => {
        if (marker instanceof maplibregl.Marker) {
          marker.remove();
        }
      });
      markersRef.current = {};

      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [enableTour]);

  // Update markers when POIs change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((marker) => {
      if (marker instanceof maplibregl.Marker) {
        marker.remove();
      }
    });
    markersRef.current = {};

    // Add new markers if POIs are provided
    if (pois.length > 0) {
      pois.forEach((poi) => {
        const el = document.createElement('button');
        el.className = 'poi-marker focus:outline-none';
        el.setAttribute('aria-label', poi.title[locale]);
        el.style.setProperty('--marker-color', CATEGORY_COLORS[poi.category]);

        const marker = new maplibregl.Marker({element: el, anchor: 'bottom'})
          .setLngLat([poi.coords.lng, poi.coords.lat])
          .addTo(map);

        markersRef.current[poi.id] = marker;
      });

      // If not in tour mode, fit bounds to show all POIs
      if (!enableTour && pois.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        pois.forEach((poi) => bounds.extend([poi.coords.lng, poi.coords.lat]));
        map.fitBounds(bounds, {padding: 60, maxZoom: 12.5, duration: 700});
      }
    }
  }, [pois, locale, enableTour]);

  const startAutoTour = (map: maplibregl.Map) => {
    const flyToNext = () => {
      if (!mapRef.current) return;

      const point = TOUR_POINTS[tourIndexRef.current];

      map.flyTo({
        center: point.coords as [number, number],
        zoom: point.zoom,
        duration: 6000,
        essential: true,
        pitch: 50,
        bearing: Math.random() * 60 - 30,
      });

      tourTimeoutRef.current = setTimeout(() => {
        tourIndexRef.current = (tourIndexRef.current + 1) % TOUR_POINTS.length;
        flyToNext();
      }, 10000);
    };

    flyToNext();
  };

  return (
    <div className="relative w-full h-[400px] rounded-2xl shadow-soft overflow-hidden md:h-[500px] lg:h-[600px] xl:h-[680px]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

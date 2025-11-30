'use client';

import {useEffect, useRef} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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

export default function HeroMapPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
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
      pitch: 45,
      bearing: 0,
      interactive: false,
      attributionControl: false,
      refreshExpiredTiles: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      startAutoTour(map);
    });

    return () => {
      if (tourTimeoutRef.current) {
        clearTimeout(tourTimeoutRef.current);
      }

      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const startAutoTour = (map: MapInstance) => {
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

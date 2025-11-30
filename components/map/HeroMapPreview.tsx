'use client';

import {useEffect, useRef} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const SALTA_CENTER: [number, number] = [-65.4, -24.8];
const INITIAL_ZOOM = 6.5;

export default function HeroMapPreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] rounded-2xl shadow-soft overflow-hidden md:h-[500px] lg:h-[600px] xl:h-[680px]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

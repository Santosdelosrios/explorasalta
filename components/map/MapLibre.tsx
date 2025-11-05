'use client';
import {useEffect, useMemo, useRef} from 'react';
import maplibregl, {Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type {POI} from '@/lib/schema';
import {useSearchParams, useRouter} from 'next/navigation';
import {parseMapQuery} from '@/lib/url';

type Props = { pois: POI[]; styleUrl?: string };

export default function MapLibre({pois, styleUrl}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const params = useSearchParams();
  const router = useRouter();

  const query = useMemo(() => parseMapQuery(params.toString()), [params]);
  const features = useMemo(() => ({
    type: 'FeatureCollection',
    features: pois.map(p => ({
      type: 'Feature',
      properties: { id: p.id, category: p.category, region: p.region, title: p.title.es },
      geometry: { type: 'Point', coordinates: [p.coords.lng, p.coords.lat] }
    }))
  }), [pois]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const style =
      styleUrl ??
      (process.env.NEXT_PUBLIC_MAPTILER_KEY
        ? `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
        : 'https://demotiles.maplibre.org/style.json'); // fallback libre

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [query.lng ?? -65.423, query.lat ?? -24.787],
      zoom: query.z ?? 6,
      attributionControl: false
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({visualizePitch: true}), 'top-right');
    map.addControl(new maplibregl.AttributionControl({compact: true, customAttribution: '© OpenStreetMap contributors'}), 'bottom-right');

    map.on('load', () => {
      map.addSource('pois', { type: 'geojson', data: features, cluster: true, clusterRadius: 40 });

      map.addLayer({ id: 'clusters', type: 'circle', source: 'pois', filter: ['has', 'point_count'],
        paint: {'circle-radius': 18, 'circle-color': '#7B2D26'} });

      map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'pois', filter: ['has', 'point_count'],
        layout: {'text-field': '{point_count_abbreviated}', 'text-size': 12},
        paint: {'text-color': '#fff'} });

      map.addLayer({ id: 'poi', type: 'circle', source: 'pois', filter: ['!', ['has', 'point_count']],
        paint: {'circle-radius': 6, 'circle-color': '#6E8B3D', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff'} });

      const popup = new maplibregl.Popup({ closeOnClick: true, closeButton: true, maxWidth: '320px' });

      map.on('click', 'poi', e => {
        const f = e.features?.[0];
        if (!f) return;
        const {id, title} = f.properties as any;
        const [lng, lat] = (f.geometry as any).coordinates;
        popup.setLngLat([lng, lat]).setHTML(`<strong>${title}</strong>`).addTo(map);
        const sp = new URLSearchParams(params);
        sp.set('poi', id);
        router.replace(`?${sp.toString()}`, { scroll: false });
      });

      if (query.poi) {
        const f = (features.features as any[]).find((g: any) => g.properties.id === query.poi);
        if (f) {
          map.flyTo({ center: f.geometry.coordinates, zoom: 12 });
          popup.setLngLat(f.geometry.coordinates).setHTML(`<strong>${f.properties.title}</strong>`).addTo(map);
        }
      }

      map.getCanvas().setAttribute('aria-label', 'Mapa interactivo de Salta');
      map.getCanvas().setAttribute('role', 'application');
    });

    return () => map.remove();
  }, [features, params, query.poi, query.lat, query.lng, query.z, router, styleUrl]);

  return <div ref={containerRef} className="h-[64vh] w-full rounded-2xl shadow" />;
}

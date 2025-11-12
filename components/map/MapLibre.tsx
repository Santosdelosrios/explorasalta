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
    // CRÍTICO: Evitar doble inicialización
    if (!containerRef.current || mapRef.current) return;

    // CRÍTICO: Usar styleUrl correctamente (estaba duplicado)
    const finalStyle = styleUrl ??
      (process.env.NEXT_PUBLIC_MAPTILER_KEY
        ? `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
        : 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_D6rA4zTHduk6KOKTXzGB');

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: finalStyle,
      center: [query.lng ?? -65.423, query.lat ?? -24.787],
      zoom: query.z ?? 6,
      attributionControl: false,
      // NUEVO: Opciones para reducir errores de AbortError
      refreshExpiredTiles: false,
      maxParallelImageRequests: 8
    });
    
    mapRef.current = map;

    // NUEVO: Manejar errores del mapa
    map.on('error', (e) => {
      // Filtrar AbortErrors que son normales en desarrollo
      if (e.error?.name === 'AbortError') {
        console.log('Request cancelled (normal in dev mode)');
        return;
      }
      console.error('Map error:', e.error);
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      // Verificar que el mapa todavía existe
      if (!mapRef.current) return;

      map.addSource('pois', { 
        type: 'geojson', 
        data: features, 
        cluster: true, 
        clusterRadius: 40 
      });

      map.addLayer({ 
        id: 'clusters', 
        type: 'circle', 
        source: 'pois', 
        filter: ['has', 'point_count'],
        paint: {
          'circle-radius': 18, 
          'circle-color': '#7B2D26'
        } 
      });

      map.addLayer({ 
        id: 'cluster-count', 
        type: 'symbol', 
        source: 'pois', 
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}', 
          'text-size': 12
        },
        paint: {'text-color': '#fff'} 
      });

      map.addLayer({ 
        id: 'poi', 
        type: 'circle', 
        source: 'pois', 
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 6, 
          'circle-color': '#6E8B3D', 
          'circle-stroke-width': 2, 
          'circle-stroke-color': '#fff'
        } 
      });

      const popup = new maplibregl.Popup({ 
        closeOnClick: true, 
        closeButton: true, 
        maxWidth: '320px' 
      });

      map.on('click', 'poi', e => {
        const f = e.features?.[0];
        if (!f) return;
        const {id, title} = f.properties as any;
        const [lng, lat] = (f.geometry as any).coordinates;
        
        popup.setLngLat([lng, lat])
          .setHTML(`<strong>${title}</strong>`)
          .addTo(map);
        
        const sp = new URLSearchParams(params);
        sp.set('poi', id);
        router.replace(`?${sp.toString()}`, { scroll: false });
      });

      // Mostrar POI inicial si existe en la query
      if (query.poi) {
        const f = (features.features as any[]).find(
          (g: any) => g.properties.id === query.poi
        );
        if (f) {
          map.flyTo({ center: f.geometry.coordinates, zoom: 12 });
          popup.setLngLat(f.geometry.coordinates)
            .setHTML(`<strong>${f.properties.title}</strong>`)
            .addTo(map);
        }
      }

      map.getCanvas().setAttribute('aria-label', 'Mapa interactivo de Salta');
      map.getCanvas().setAttribute('role', 'application');
    });

    // CRÍTICO: Cleanup apropiado
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // CRÍTICO: Array vacío para evitar re-renders

  // Actualizar source cuando cambien los features (filtros)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('pois') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(features as any);
    }
  }, [features]);

  // Manejar navegación a POI específico
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !query.poi) return;

    const f = (features.features as any[]).find(
      (g: any) => g.properties.id === query.poi
    );
    
    if (f) {
      map.flyTo({ center: f.geometry.coordinates, zoom: 12 });
      
      const popup = new maplibregl.Popup({ 
        closeOnClick: true, 
        closeButton: true, 
        maxWidth: '320px' 
      });
      
      popup.setLngLat(f.geometry.coordinates)
        .setHTML(`<strong>${f.properties.title}</strong>`)
        .addTo(map);
    }
  }, [query.poi, features]);

  return <div ref={containerRef} className="h-[64vh] w-full rounded-2xl shadow" />;
}

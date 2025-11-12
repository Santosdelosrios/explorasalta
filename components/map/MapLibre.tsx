'use client';
import {useEffect, useMemo, useRef} from 'react';
import maplibregl, {Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useSearchParams, useRouter} from 'next/navigation';
import type {POI} from '@/lib/schema';
import type {Locale} from '@/lib/i18n/config';
import {CATEGORY_METADATA, getCategoryLabel} from '@/lib/content/categories';
import {parseMapQuery} from '@/lib/url';

type Props = { pois: POI[]; styleUrl?: string; locale: Locale };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function MapLibre({pois, styleUrl, locale}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const params = useSearchParams();
  const router = useRouter();

  const query = useMemo(() => parseMapQuery(params.toString()), [params]);

  const filteredPois = useMemo(() => {
    return pois.filter(poi => {
      const matchesCategory = query.cat ? query.cat.includes(poi.category) : true;
      const matchesRegion = query.region ? query.region.includes(poi.region) : true;
      return matchesCategory && matchesRegion;
    });
  }, [pois, query.cat, query.region]);

  const features = useMemo(() => ({
    type: 'FeatureCollection',
    features: filteredPois.map(p => ({
      type: 'Feature',
      properties: {
        id: p.id,
        category: p.category,
        region: p.region,
        title: p.title[locale],
        summary: p.summary[locale]
      },
      geometry: { type: 'Point', coordinates: [p.coords.lng, p.coords.lat] }
    }))
  }), [filteredPois, locale]);

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
      const {id, title, category, summary} = f.properties as any;
      const [lng, lat] = (f.geometry as any).coordinates;

      const catKey = (category ?? 'pueblo') as keyof typeof CATEGORY_METADATA;
      const catIcon = CATEGORY_METADATA[catKey]?.icon ?? '📍';
      const catLabel = getCategoryLabel(catKey, locale);

      popup
        .setLngLat([lng, lat])
        .setHTML(`
          <div style="font-family: var(--font-body, 'Tenor Sans'), system-ui; max-width: 260px;">
            <strong style="font-family: var(--font-heading, 'Lexend Deca'), inherit; font-size: 1rem; color: #7B2D26; display: block; margin-bottom: 0.25rem;">
              ${escapeHtml(title)}
            </strong>
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: #4A2F27; text-transform: uppercase; letter-spacing: 0.12em;">
              <span aria-hidden="true">${catIcon}</span>
              ${escapeHtml(catLabel)}
            </span>
            <p style="margin-top: 0.5rem; font-size: 0.85rem; line-height: 1.35; color: #2C2C2C;">
              ${escapeHtml(summary ?? '')}
            </p>
          </div>
        `)
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

      map.getCanvas().setAttribute(
        'aria-label',
        locale === 'es' ? 'Mapa interactivo de Salta' : 'Interactive map of Salta'
      );
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

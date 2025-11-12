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

const RATING_COPY: Record<Locale, {
  visitorsLabel: string;
  reviewCount: (count: number) => string;
}> = {
  es: {
    visitorsLabel: 'Valoración de visitantes',
    reviewCount: count => `${count} ${count === 1 ? 'reseña' : 'reseñas'}`
  },
  en: {
    visitorsLabel: 'Visitor rating',
    reviewCount: count => `${count} ${count === 1 ? 'review' : 'reviews'}`
  }
};

function createStaticStars(value: number) {
  const filled = Math.round(Math.min(Math.max(value, 0), 5));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

function createPopupContent(poi: POI, locale: Locale): HTMLElement {
  const container = document.createElement('div');
  container.style.fontFamily = "var(--font-body, 'Tenor Sans'), system-ui";
  container.style.maxWidth = '260px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '0.65rem';
  container.style.padding = '0.25rem 0';

  const title = document.createElement('strong');
  title.textContent = poi.title[locale];
  title.style.fontFamily = "var(--font-heading, 'Lexend Deca'), inherit";
  title.style.fontSize = '1rem';
  title.style.color = '#7B2D26';
  title.style.display = 'block';
  title.style.marginBottom = '0.15rem';
  container.appendChild(title);

  const meta = document.createElement('span');
  meta.style.display = 'inline-flex';
  meta.style.alignItems = 'center';
  meta.style.gap = '0.35rem';
  meta.style.fontSize = '0.75rem';
  meta.style.color = '#4A2F27';
  meta.style.textTransform = 'uppercase';
  meta.style.letterSpacing = '0.12em';

  const icon = document.createElement('span');
  icon.textContent = CATEGORY_METADATA[poi.category]?.icon ?? '📍';
  icon.setAttribute('aria-hidden', 'true');
  meta.appendChild(icon);

  const categoryLabel = document.createElement('span');
  categoryLabel.textContent = getCategoryLabel(poi.category, locale);
  meta.appendChild(categoryLabel);

  container.appendChild(meta);

  const summary = document.createElement('p');
  summary.textContent = poi.summary[locale] ?? '';
  summary.style.margin = '0';
  summary.style.fontSize = '0.85rem';
  summary.style.lineHeight = '1.35';
  summary.style.color = '#2C2C2C';
  container.appendChild(summary);

  const ratingInfo = poi.rating;
  if (ratingInfo) {
    const ratingBlock = document.createElement('div');
    ratingBlock.style.display = 'flex';
    ratingBlock.style.flexDirection = 'column';
    ratingBlock.style.gap = '0.15rem';

    const label = document.createElement('span');
    label.textContent = RATING_COPY[locale].visitorsLabel;
    label.style.fontSize = '0.7rem';
    label.style.fontWeight = '600';
    label.style.color = '#7B2D26';
    label.style.textTransform = 'uppercase';
    label.style.letterSpacing = '0.12em';
    ratingBlock.appendChild(label);

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '0.5rem';

    const stars = document.createElement('span');
    stars.textContent = createStaticStars(ratingInfo.average);
    stars.style.fontSize = '1rem';
    stars.style.color = '#F59E0B';
    stars.setAttribute('aria-hidden', 'true');
    row.appendChild(stars);

    const average = document.createElement('span');
    average.textContent = `${ratingInfo.average.toFixed(1)} · ${RATING_COPY[locale].reviewCount(ratingInfo.count)}`;
    average.style.fontSize = '0.8rem';
    average.style.color = '#2C2C2C';
    row.appendChild(average);

    ratingBlock.appendChild(row);
    container.appendChild(ratingBlock);
  }

  return container;
}

export default function MapLibre({pois, styleUrl, locale}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const params = useSearchParams();
  const router = useRouter();

  const search = params.toString();
  const query = useMemo(() => parseMapQuery(search), [search]);
  const lng = query.lng;
  const lat = query.lat;
  const z = query.z;
  const selectedPoi = query.poi;
  const cat = query.cat;
  const region = query.region;

  const poiIndex = useMemo(() => {
    const index = new Map<string, POI>();
    pois.forEach(poi => {
      index.set(poi.id, poi);
    });
    return index;
  }, [pois]);

  const filteredPois = useMemo(() => {
    return pois.filter(candidate => {
      const matchesCategory = cat
        ? cat.includes(candidate.category)
        : selectedPoi
          ? candidate.id === selectedPoi
          : false;
      const matchesRegion = region
        ? region.includes(candidate.region) || candidate.id === selectedPoi
        : true;
      return matchesCategory && matchesRegion;
    });
  }, [pois, cat, region, selectedPoi]);

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

  const featuresRef = useRef(features);

  useEffect(() => {
    if (mapRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const finalStyle =
      styleUrl ??
      (process.env.NEXT_PUBLIC_MAPTILER_KEY
        ? `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
        : 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_D6rA4zTHduk6KOKTXzGB');

    const map = new maplibregl.Map({
      container,
      style: finalStyle,
      center: [lng ?? -65.423, lat ?? -24.787],
      zoom: z ?? 6,
      attributionControl: false,
      refreshExpiredTiles: false,
      maxParallelImageRequests: 8
    });

    mapRef.current = map;

    map.on('error', e => {
      if (e.error?.name === 'AbortError') {
        console.log('Request cancelled (normal in dev mode)');
        return;
      }
      console.error('Map error:', e.error);
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    const handleLoad = () => {
      if (!mapRef.current) return;

      map.addSource('pois', {
        type: 'geojson',
        data: featuresRef.current,
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

      popupRef.current = popup;

      const showPoiPopup = (
        poiId: string,
        coordinates: [number, number],
        options?: { updateQuery?: boolean; flyTo?: boolean }
      ) => {
        const poiData = poiIndex.get(poiId);
        if (!poiData) return;

        if (options?.flyTo) {
          map.flyTo({ center: coordinates, zoom: Math.max(map.getZoom(), 11.5) });
        }

        const content = createPopupContent(poiData, locale);
        popup.setLngLat(coordinates).setDOMContent(content).addTo(map);

        const shouldUpdateQuery = options?.updateQuery ?? true;
        if (shouldUpdateQuery && typeof window !== 'undefined') {
          const sp = new URLSearchParams(window.location.search);
          sp.set('poi', poiId);
          router.replace(`${window.location.pathname}?${sp.toString()}`, { scroll: false });
        }
      };

      map.on('click', 'poi', e => {
        const f = e.features?.[0];
        if (!f) return;
        const {id} = f.properties as { id?: string };
        const coordinates = (f.geometry as any).coordinates as [number, number];
        if (!id) return;
        showPoiPopup(id, coordinates);
      });

      if (selectedPoi) {
        const poiData = poiIndex.get(selectedPoi);
        if (poiData) {
          const coordinates: [number, number] = [poiData.coords.lng, poiData.coords.lat];
          showPoiPopup(poiData.id, coordinates, { updateQuery: false, flyTo: true });
        }
      }

      map.getCanvas().setAttribute(
        'aria-label',
        locale === 'es' ? 'Mapa interactivo de Salta' : 'Interactive map of Salta'
      );
      map.getCanvas().setAttribute('role', 'application');
    };

    map.on('load', handleLoad);

    return () => {
      map.off('load', handleLoad);

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, [styleUrl, lng, lat, z, poiIndex, locale, router, features]);

  // Actualizar source cuando cambien los features (filtros)
  useEffect(() => {
    featuresRef.current = features;

    const map = mapRef.current;
    if (!map) return;

    const applyFeatures = () => {
      const source = map.getSource('pois') as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData(featuresRef.current as any);
      }
    };

    if (map.isStyleLoaded()) {
      applyFeatures();
      return;
    }

    map.once('load', applyFeatures);
    return () => {
      map.off('load', applyFeatures);
    };
  }, [features]);

  // Manejar navegación a POI específico
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPoi) return;

    const poiData = poiIndex.get(selectedPoi);
    if (!poiData) return;

    const showSelected = () => {
      const popup = popupRef.current;
      if (!popup) return;

      const coordinates: [number, number] = [poiData.coords.lng, poiData.coords.lat];
      map.flyTo({ center: coordinates, zoom: Math.max(map.getZoom(), 12) });

      const content = createPopupContent(poiData, locale);
      popup.setLngLat(coordinates).setDOMContent(content).addTo(map);
    };

    if (map.isStyleLoaded() && popupRef.current) {
      showSelected();
      return;
    }

    map.once('load', showSelected);
    return () => {
      map.off('load', showSelected);
    };
  }, [selectedPoi, poiIndex, locale]);

  return <div ref={containerRef} className="h-[64vh] w-full rounded-2xl shadow" />;
}

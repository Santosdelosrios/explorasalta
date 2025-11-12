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

const STORAGE_PREFIX = 'explorasalta:poi-rating';

const RATING_COPY: Record<Locale, {
  visitorsLabel: string;
  reviewCount: (count: number) => string;
  yourRating: string;
  prompt: string;
  thanks: string;
  currentRating: (value: number) => string;
  starLabel: (value: number) => string;
}> = {
  es: {
    visitorsLabel: 'Valoración de visitantes',
    reviewCount: count => `${count} ${count === 1 ? 'reseña' : 'reseñas'}`,
    yourRating: 'Tu calificación',
    prompt: 'Contanos cuántas estrellas merece este lugar.',
    thanks: '¡Gracias por calificar!',
    currentRating: value => `Tu calificación: ${value} ${value === 1 ? 'estrella' : 'estrellas'}.`,
    starLabel: value => `${value} ${value === 1 ? 'estrella' : 'estrellas'}`
  },
  en: {
    visitorsLabel: 'Visitor rating',
    reviewCount: count => `${count} ${count === 1 ? 'review' : 'reviews'}`,
    yourRating: 'Your rating',
    prompt: 'How many stars would you give this spot?',
    thanks: 'Thanks for sharing!',
    currentRating: value => `Your rating: ${value} ${value === 1 ? 'star' : 'stars'}.`,
    starLabel: value => `${value} ${value === 1 ? 'star' : 'stars'}`
  }
};

function getStoredRating(id: string): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${id}`);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 5) : null;
}

function setStoredRating(id: string, value: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${STORAGE_PREFIX}:${id}`, String(value));
}

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

  const ratingControls = document.createElement('div');
  ratingControls.style.display = 'flex';
  ratingControls.style.flexDirection = 'column';
  ratingControls.style.gap = '0.25rem';

  const ratingHeading = document.createElement('span');
  ratingHeading.textContent = RATING_COPY[locale].yourRating;
  ratingHeading.style.fontSize = '0.75rem';
  ratingHeading.style.fontWeight = '600';
  ratingHeading.style.color = '#4A2F27';
  ratingControls.appendChild(ratingHeading);

  const starsRow = document.createElement('div');
  starsRow.style.display = 'inline-flex';
  starsRow.style.alignItems = 'center';
  starsRow.style.gap = '0.15rem';
  starsRow.setAttribute('role', 'radiogroup');

  const stored = getStoredRating(poi.id);
  let currentValue = stored ?? 0;

  const feedback = document.createElement('p');
  feedback.textContent = stored
    ? RATING_COPY[locale].currentRating(stored)
    : RATING_COPY[locale].prompt;
  feedback.style.fontSize = '0.75rem';
  feedback.style.color = '#4A2F27';
  feedback.style.margin = '0';
  feedback.setAttribute('aria-live', 'polite');

  const buttons: HTMLButtonElement[] = [];
  const updateState = (value: number) => {
    buttons.forEach((btn, idx) => {
      const active = idx < value;
      btn.style.color = active ? '#F59E0B' : '#D6D3D1';
      btn.style.transform = active ? 'scale(1.05)' : 'scale(1)';
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  for (let i = 1; i <= 5; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '★';
    btn.style.background = 'transparent';
    btn.style.border = 'none';
    btn.style.padding = '0';
    btn.style.margin = '0';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '1.2rem';
    btn.style.transition = 'transform 0.15s ease';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-label', RATING_COPY[locale].starLabel(i));
    btn.addEventListener('mouseenter', () => updateState(i));
    btn.addEventListener('focus', () => updateState(i));
    btn.addEventListener('mouseleave', () => updateState(currentValue));
    btn.addEventListener('blur', () => updateState(currentValue));
    btn.addEventListener('click', event => {
      event.stopPropagation();
      currentValue = i;
      setStoredRating(poi.id, i);
      feedback.textContent = `${RATING_COPY[locale].thanks} ${RATING_COPY[locale].currentRating(i)}`;
      updateState(currentValue);
    });
    buttons.push(btn);
    starsRow.appendChild(btn);
  }

  updateState(currentValue);

  ratingControls.appendChild(starsRow);
  ratingControls.appendChild(feedback);
  container.appendChild(ratingControls);

  return container;
}

export default function MapLibre({pois, styleUrl, locale}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const params = useSearchParams();
  const router = useRouter();

  const query = useMemo(() => parseMapQuery(params.toString()), [params]);

  const poiIndex = useMemo(() => {
    const index = new Map<string, POI>();
    pois.forEach(poi => {
      index.set(poi.id, poi);
    });
    return index;
  }, [pois]);

  const filteredPois = useMemo(() => {
    return pois.filter(poi => {
      const matchesCategory = query.cat
        ? query.cat.includes(poi.category)
        : query.poi
          ? poi.id === query.poi
          : false;
      const matchesRegion = query.region ? query.region.includes(poi.region) : true;
      return matchesCategory && matchesRegion;
    });
  }, [pois, query.cat, query.region, query.poi]);

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
    if (mapRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const finalStyle = styleUrl ??
      (process.env.NEXT_PUBLIC_MAPTILER_KEY
        ? `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
        : 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_D6rA4zTHduk6KOKTXzGB');

    const map = new maplibregl.Map({
      container,
      style: finalStyle,
      center: [query.lng ?? -65.423, query.lat ?? -24.787],
      zoom: query.z ?? 6,
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

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    const handleLoad = () => {
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

      if (query.poi) {
        const poiData = poiIndex.get(query.poi);
        if (poiData) {
          const coordinates: [number, number] = [poiData.coords.lng, poiData.coords.lat];
          showPoiPopup(poiData.id, coordinates, { updateQuery: false, flyTo: true });
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
  }, [styleUrl, query.lng, query.lat, query.z, poiIndex, locale, router, features, query.poi]);

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
    const popup = popupRef.current;
    if (!map || !map.isStyleLoaded() || !popup || !query.poi) return;

    const poiData = poiIndex.get(query.poi);
    if (!poiData) return;

    const coordinates: [number, number] = [poiData.coords.lng, poiData.coords.lat];
    map.flyTo({ center: coordinates, zoom: 12 });

    const content = createPopupContent(poiData, locale);
    popup.setLngLat(coordinates).setDOMContent(content).addTo(map);
  }, [query.poi, poiIndex, locale]);

  return <div ref={containerRef} className="h-[64vh] w-full rounded-2xl shadow" />;
}

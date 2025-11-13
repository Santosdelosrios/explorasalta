'use client';

import {useCallback, useEffect, useMemo, useRef} from 'react';
import maplibregl, {Map as MapInstance} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useRouter, useSearchParams} from 'next/navigation';
import type {FeatureCollection, Point} from 'geojson';

import type {Locale} from '@/lib/i18n/config';
import {CATEGORY_METADATA, getCategoryLabel} from '@/lib/content/categories';
import type {POI} from '@/lib/schema';
import {parseMapQuery} from '@/lib/url';

const DEFAULT_CENTER: [number, number] = [-65.423, -24.787];
const DEFAULT_ZOOM = 6;

const RATING_COPY: Record<Locale, { visitorsLabel: string; reviewCount: (count: number) => string }> = {
  es: {
    visitorsLabel: 'Valoración de visitantes',
    reviewCount: count => `${count} ${count === 1 ? 'reseña' : 'reseñas'}`
  },
  en: {
    visitorsLabel: 'Visitor rating',
    reviewCount: count => `${count} ${count === 1 ? 'review' : 'reviews'}`
  }
};

const DIRECTIONS_COPY: Record<Locale, { label: string; attribution: string }> = {
  es: {
    label: 'Cómo llegar',
    attribution: 'Basado en datos de Google Maps'
  },
  en: {
    label: 'Get directions',
    attribution: 'Powered by Google Maps data'
  }
};

type Props = {
  pois: POI[];
  styleUrl?: string;
  locale: Locale;
};

function createStaticStars(value: number) {
  const rating = Math.min(Math.max(value, 0), 5);
  const filled = Math.round(rating);
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

  if (poi.rating) {
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
    stars.textContent = createStaticStars(poi.rating.average);
    stars.style.fontSize = '1rem';
    stars.style.color = '#F59E0B';
    stars.setAttribute('aria-hidden', 'true');
    row.appendChild(stars);

    const average = document.createElement('span');
    average.textContent = `${poi.rating.average.toFixed(1)} · ${RATING_COPY[locale].reviewCount(poi.rating.count)}`;
    average.style.fontSize = '0.8rem';
    average.style.color = '#2C2C2C';
    row.appendChild(average);

    ratingBlock.appendChild(row);
    container.appendChild(ratingBlock);
  }

  const directionsUrl = poi.placeId
    ? `https://www.google.com/maps/dir/?api=1&destination_place_id=${poi.placeId}`
    : `https://www.google.com/maps/dir/?api=1&destination=${poi.coords.lat},${poi.coords.lng}`;

  const directionsButton = document.createElement('a');
  directionsButton.href = directionsUrl;
  directionsButton.target = '_blank';
  directionsButton.rel = 'noopener noreferrer';
  directionsButton.textContent = DIRECTIONS_COPY[locale].label;
  directionsButton.style.display = 'inline-flex';
  directionsButton.style.alignItems = 'center';
  directionsButton.style.justifyContent = 'center';
  directionsButton.style.gap = '0.35rem';
  directionsButton.style.padding = '0.5rem 0.9rem';
  directionsButton.style.borderRadius = '999px';
  directionsButton.style.backgroundColor = '#2563eb';
  directionsButton.style.color = '#fff';
  directionsButton.style.fontSize = '0.85rem';
  directionsButton.style.fontWeight = '600';
  directionsButton.style.textDecoration = 'none';
  directionsButton.setAttribute('aria-label', `${DIRECTIONS_COPY[locale].label} · Google Maps`);
  container.appendChild(directionsButton);

  if (poi.placeId) {
    const attribution = document.createElement('span');
    attribution.textContent = DIRECTIONS_COPY[locale].attribution;
    attribution.style.fontSize = '0.7rem';
    attribution.style.color = '#6B7280';
    attribution.style.display = 'block';
    container.appendChild(attribution);
  }

  return container;
}

export default function MapLibre({pois, styleUrl, locale}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const router = useRouter();
  const params = useSearchParams();
  const search = params.toString();
  const query = useMemo(() => parseMapQuery(search), [search]);
  const {lng, lat, z, poi: selectedPoi, cat, region} = query;

  const poiIndex = useMemo(() => {
    const map = new Map<string, POI>();
    pois.forEach(poi => map.set(poi.id, poi));
    return map;
  }, [pois]);

  const filteredPois = useMemo(() => {
    const hasCategories = Boolean(cat?.length);
    const hasRegions = Boolean(region?.length);

    return pois.filter(candidate => {
      if (selectedPoi && candidate.id === selectedPoi) {
        return true;
      }

      if (!hasCategories && !hasRegions) {
        return false;
      }

      if (hasCategories && !cat!.includes(candidate.category)) {
        return false;
      }

      if (hasRegions && !region!.includes(candidate.region)) {
        return false;
      }

      return true;
    });
  }, [pois, cat, region, selectedPoi]);

  const features = useMemo<FeatureCollection<Point>>(() => ({
    type: 'FeatureCollection',
    features: filteredPois.map(poi => ({
      type: 'Feature',
      properties: {
        id: poi.id,
        category: poi.category,
        region: poi.region,
        title: poi.title[locale],
        summary: poi.summary[locale]
      },
      geometry: {type: 'Point', coordinates: [poi.coords.lng, poi.coords.lat]}
    }))
  }), [filteredPois, locale]);

  const featuresRef = useRef<FeatureCollection<Point>>(features);

  useEffect(() => {
    featuresRef.current = features;
  }, [features]);

  const openPoiPopup = useCallback(
    (
      poiId: string,
      coordinates: [number, number],
      options?: {updateQuery?: boolean}
    ) => {
      const map = mapRef.current;
      const popup = popupRef.current;
      if (!map || !popup) return;

      const poi = poiIndex.get(poiId);
      if (!poi) return;

      const currentZoom = map.getZoom();
      map.easeTo({
        center: coordinates,
        zoom: currentZoom,
        bearing: map.getBearing(),
        pitch: map.getPitch(),
        duration: 600
      });

      popup.setLngLat(coordinates).setDOMContent(createPopupContent(poi, locale)).addTo(map);

      if (options?.updateQuery !== false && typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('poi', poiId);
        router.replace(`${window.location.pathname}?${searchParams.toString()}`, {scroll: false});
      }
    },
    [locale, poiIndex, router]
  );

  useEffect(() => {
    if (mapRef.current) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const baseStyle =
      styleUrl ??
      (process.env.NEXT_PUBLIC_MAPTILER_KEY
        ? `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
        : 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_D6rA4zTHduk6KOKTXzGB');

    const map = new maplibregl.Map({
      container,
      style: baseStyle,
      center: [lng ?? DEFAULT_CENTER[0], lat ?? DEFAULT_CENTER[1]],
      zoom: z ?? DEFAULT_ZOOM,
      attributionControl: false,
      refreshExpiredTiles: false
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({visualizePitch: true}), 'top-right');
    map.addControl(new maplibregl.AttributionControl({compact: true}), 'bottom-right');

    const popup = new maplibregl.Popup({closeButton: true, closeOnClick: true, maxWidth: '320px'});
    popupRef.current = popup;

    function handleLoad() {
      map.addSource('pois', {
        type: 'geojson',
        data: featuresRef.current ?? {type: 'FeatureCollection', features: []},
        cluster: true,
        clusterRadius: 40
      });
    };

    const showPoiPopup = (
      poiId: string,
      coordinates: [number, number],
      options?: {updateQuery?: boolean}
    ) => {
      const poi = poiIndex.get(poiId);
      if (!poi) return;

      panToCoordinates(coordinates);
      popup.setLngLat(coordinates).setDOMContent(createPopupContent(poi, locale)).addTo(map);

      if (options?.updateQuery !== false && typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('poi', poiId);
        router.replace(`${window.location.pathname}?${searchParams.toString()}`, {scroll: false});
      }
    };

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'pois',
        filter: ['has', 'point_count'],
        paint: {'circle-radius': 18, 'circle-color': '#7B2D26'}
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'pois',
        filter: ['has', 'point_count'],
        layout: {'text-field': '{point_count_abbreviated}', 'text-size': 12},
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

      if (selectedPoi) {
        const poi = poiIndex.get(selectedPoi);
        if (poi) {
          const coordinates: [number, number] = [poi.coords.lng, poi.coords.lat];
          openPoiPopup(poi.id, coordinates, {updateQuery: false});
        }
      }
    }

    function handlePoiClick(event: maplibregl.MapLayerMouseEvent) {
      const feature = event.features?.[0];
      if (!feature) return;
      const {id} = feature.properties as {id?: string};
      const coordinates = (feature.geometry as Point).coordinates as [number, number];
      if (!id) return;
      openPoiPopup(id, coordinates);
    }

    map.on('load', handleLoad);
    map.on('click', 'poi', handlePoiClick);

    map.getCanvas().setAttribute(
      'aria-label',
      locale === 'es' ? 'Mapa interactivo de Salta' : 'Interactive map of Salta'
    );
    map.getCanvas().setAttribute('role', 'application');

    return () => {
      map.off('load', handleLoad);
      map.off('click', 'poi', handlePoiClick);
      popup.remove();
      map.remove();
      popupRef.current = null;
      mapRef.current = null;
    };
  }, [styleUrl, lng, lat, z, locale, poiIndex, router, selectedPoi, openPoiPopup]);

  useEffect(() => {
    featuresRef.current = features;

    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource('pois') as maplibregl.GeoJSONSource | undefined;
    if (map.isStyleLoaded() && source) {
      source.setData(featuresRef.current ?? {type: 'FeatureCollection', features: []});
      return;
    }

    const applyOnLoad = () => {
      const loadedSource = map.getSource('pois') as maplibregl.GeoJSONSource | undefined;
      loadedSource?.setData(featuresRef.current ?? {type: 'FeatureCollection', features: []});
    };

    map.once('load', applyOnLoad);
    return () => {
      map.off('load', applyOnLoad);
    };
  }, [features]);

  useEffect(() => {
    if (!selectedPoi) {
      return;
    }

    const map = mapRef.current;
    const popup = popupRef.current;
    if (!map || !popup) {
      return;
    }

    const poi = poiIndex.get(selectedPoi);
    if (!poi) {
      return;
    }

    const showSelected = () => {
      const coordinates: [number, number] = [poi.coords.lng, poi.coords.lat];
      const currentZoom = map.getZoom();
      map.easeTo({
        center: coordinates,
        zoom: currentZoom,
        bearing: map.getBearing(),
        pitch: map.getPitch(),
        duration: 600
      });
      popup.setLngLat(coordinates).setDOMContent(createPopupContent(poi, locale)).addTo(map);
    };

    if (map.isStyleLoaded()) {
      showSelected();
      return;
    }

    map.once('load', showSelected);
    return () => {
      map.off('load', showSelected);
    };
  }, [selectedPoi, poiIndex, locale, openPoiPopup]);

  return <div ref={containerRef} className="h-[64vh] w-full rounded-2xl shadow" />;
}

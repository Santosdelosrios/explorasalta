'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import type {Category, POI} from '@/lib/schema';
import type {Locale} from '@/lib/i18n/config';
import {CATEGORY_METADATA} from '@/lib/content/categories';

const FALLBACK_STYLE = 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_D6rA4zTHduk6KOKTXzGB';
const BACKUP_STYLE = 'https://demotiles.maplibre.org/style.json';

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

const COPY: Record<
  Locale,
  {
    filters: string;
    searchPlaceholder: string;
    clear: string;
    listTitle: string;
    empty: string;
    ratingLabel: string;
    directions: string;
    reviews: (rating?: number, count?: number) => string;
  }
> = {
  es: {
    filters: 'Filtros activos',
    searchPlaceholder: 'Buscar por nombre o descripción…',
    clear: 'Limpiar',
    listTitle: 'Lugares destacados',
    empty: 'Ajustá los filtros para ver resultados.',
    ratingLabel: 'Calificación',
    directions: 'Cómo llegar',
    reviews: (rating, count) =>
      rating && count ? `${rating.toFixed(1)} · ${count} reseñas` : 'Sin reseñas registradas'
  },
  en: {
    filters: 'Active filters',
    searchPlaceholder: 'Search by name or description…',
    clear: 'Reset',
    listTitle: 'Highlighted places',
    empty: 'Try different filters to see results.',
    ratingLabel: 'Rating',
    directions: 'Get directions',
    reviews: (rating, count) =>
      rating && count ? `${rating.toFixed(1)} · ${count} reviews` : 'No public reviews yet'
  }
};

const DEFAULT_VIEW = {lng: -65.4, lat: -24.6, zoom: 6.2};

interface MapExplorerProps {
  pois: POI[];
  locale: Locale;
}

export default function MapExplorer({pois, locale}: MapExplorerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const fallbackAppliedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [activePoiId, setActivePoiId] = useState<string | null>(null);

const styleBase = 'https://api.maptiler.com/maps/hybrid/style.json';
const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? 'get_your_own_D6rA4zTHduk6KOKTXzGB';

const styleUrl = `${styleBase}?key=${apiKey}`;


  const copy = COPY[locale];

  const filteredPois = useMemo(() => {
    const categories = new Set(activeCategories);
    const query = search.trim().toLowerCase();

    return pois
      .filter((poi) => (categories.size ? categories.has(poi.category) : true))
      .filter((poi) => {
        if (!query) return true;
        const text = `${poi.title[locale]} ${poi.summary[locale]}`.toLowerCase();
        return text.includes(query);
      })
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  }, [activeCategories, locale, pois, search]);

  // Ensure the active POI always exists within the filtered results
  useEffect(() => {
    if (!filteredPois.length) {
      setActivePoiId(null);
      return;
    }

    if (!activePoiId || !filteredPois.some((poi) => poi.id === activePoiId)) {
      setActivePoiId(filteredPois[0].id);
    }
  }, [activePoiId, filteredPois]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [DEFAULT_VIEW.lng, DEFAULT_VIEW.lat],
      zoom: DEFAULT_VIEW.zoom,
      pitch: 20,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({visualizePitch: true}), 'top-right');
    map.addControl(new maplibregl.ScaleControl({maxWidth: 120, unit: 'metric'}), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({compact: true}));

    const handleLoad = () => setMapReady(true);
    map.on('load', handleLoad);

    map.on('error', (event) => {
      if (!fallbackAppliedRef.current && styleUrl !== FALLBACK_STYLE) {
        console.warn('Map style failed to load, falling back to hybrid demo tiles', event.error);
        fallbackAppliedRef.current = true;
        map.setStyle(FALLBACK_STYLE);
      }
    });

    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '320px'
    });

    return () => {
      setMapReady(false);
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
      popupRef.current?.remove();
      popupRef.current = null;
      map.off('load', handleLoad);
      map.remove();
      mapRef.current = null;
    };
  }, [styleUrl]);

  // Render markers based on filtered POIs
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    filteredPois.forEach((poi) => {
      const el = document.createElement('button');
      el.className = 'poi-marker focus:outline-none';
      el.setAttribute('aria-label', poi.title[locale]);
      el.style.setProperty('--marker-color', CATEGORY_COLORS[poi.category]);

      el.addEventListener('click', () => setActivePoiId(poi.id));

      const marker = new maplibregl.Marker({element: el, anchor: 'bottom'})
        .setLngLat([poi.coords.lng, poi.coords.lat])
        .addTo(map);

      markersRef.current[poi.id] = marker;
    });
  }, [filteredPois, locale, mapReady]);

  const directionsUrl = useCallback(
    (poi: POI) => {
      if (poi.plusCode) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.plusCode)}`;
      }

      if (poi.placeId) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          poi.title[locale]
        )}&query_place_id=${poi.placeId}`;
      }

      return `https://www.google.com/maps/dir/?api=1&destination=${poi.coords.lat},${poi.coords.lng}`;
    },
    [locale]
  );

  // Keep the currently visible markers in view as filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (!filteredPois.length) {
      map.easeTo({center: [DEFAULT_VIEW.lng, DEFAULT_VIEW.lat], zoom: DEFAULT_VIEW.zoom, duration: 500});
      return;
    }

    if (filteredPois.length === 1) {
      const [{coords}] = filteredPois;
      map.easeTo({center: [coords.lng, coords.lat], zoom: Math.max(DEFAULT_VIEW.zoom + 2, 10), duration: 700});
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    filteredPois.forEach((poi) => bounds.extend([poi.coords.lng, poi.coords.lat]));
    map.fitBounds(bounds, {padding: 60, maxZoom: 12.5, duration: 700});
  }, [filteredPois, mapReady]);

  // Sync popup with active POI
  useEffect(() => {
    const map = mapRef.current;
    const popup = popupRef.current;
    if (!map || !popup || !activePoiId) {
      if (popupRef.current) {
        popupRef.current.remove();
      }
      return;
    }

    const poi = pois.find((item) => item.id === activePoiId);
    if (!poi) {
      popup.remove();
      return;
    }

    const rating = poi.rating?.average;
    const count = poi.rating?.count;
    const ratingCopy = copy.reviews(rating, count);

    const html = `
      <div class="poi-popup">
        <p class="poi-popup__eyebrow">${CATEGORY_METADATA[poi.category].label[locale]}</p>
        <h3>${poi.title[locale]}</h3>
        <p class="poi-popup__summary">${poi.summary[locale]}</p>
        <p class="poi-popup__rating">${ratingCopy}</p>
        <a class="poi-popup__button" href="${directionsUrl(poi)}" target="_blank" rel="noopener noreferrer">
          ${copy.directions}
        </a>
      </div>
    `;

    popup
      .setLngLat([poi.coords.lng, poi.coords.lat])
      .setHTML(html)
      .addTo(map);

    const currentZoom = map.getZoom();
    map.easeTo({center: [poi.coords.lng, poi.coords.lat], zoom: currentZoom, duration: 600});
  }, [activePoiId, copy, directionsUrl, locale, pois]);

  const toggleCategory = (category: Category) => {
    setActiveCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }
      return [...prev, category];
    });
  };

  const resetFilters = () => {
    setActiveCategories([]);
    setSearch('');
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
              {copy.filters}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-semibold text-ochre transition hover:text-ochre/80"
            >
              {copy.clear}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_METADATA) as Category[]).map((category) => {
              const active = activeCategories.includes(category);
              const {icon, label} = CATEGORY_METADATA[category];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                    active
                      ? 'border-transparent bg-ochre text-white shadow'
                      : 'border-ink/20 bg-white/90 text-ink/70 hover:text-ink'
                  }`}
                >
                  <span className="mr-1">{icon}</span>
                  {label[locale]}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <label htmlFor="map-search" className="sr-only">
              {copy.searchPlaceholder}
            </label>
            <input
              id="map-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-xl border border-ink/10 bg-white/90 px-4 py-2 text-base text-ink shadow-inner focus:border-ochre focus:outline-none"
            />
          </div>
        </div>

        <div
          ref={mapContainerRef}
          className="h-[520px] w-full overflow-hidden rounded-3xl border border-white/30 bg-arena shadow-xl"
        />
      </div>

      <aside className="rounded-3xl border border-white/40 bg-white/80 p-4 shadow backdrop-blur">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/40">{copy.listTitle}</p>
            <p className="text-2xl font-semibold text-poncho">{filteredPois.length}</p>
          </div>
          <div className="text-right text-xs text-ink/50">
            {filteredPois.length !== pois.length && (
              <span>
                {filteredPois.length} / {pois.length}
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
          {filteredPois.length === 0 && (
            <p className="rounded-xl bg-arena/40 px-3 py-4 text-sm text-ink/70">{copy.empty}</p>
          )}

          {filteredPois.map((poi) => {
            const active = poi.id === activePoiId;
            const category = CATEGORY_METADATA[poi.category];
            const ratingLabel = copy.reviews(poi.rating?.average, poi.rating?.count);

            return (
              <article
                key={poi.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => setActivePoiId(poi.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActivePoiId(poi.id);
                  }
                }}
                className={`group w-full rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ochre ${
                  active
                    ? 'border-ochre/60 bg-ochre/10 shadow-lg'
                    : 'border-white/30 bg-white/80 hover:border-ochre/30'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-ink/40">
                  {category.label[locale]}
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <p className="text-lg font-semibold text-poncho">
                    {category.icon} {poi.title[locale]}
                  </p>
                  {poi.rating?.average && (
                    <p className="text-sm font-semibold text-ochre" aria-label={copy.ratingLabel}>
                      {poi.rating.average.toFixed(1)}★
                    </p>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink/70">{poi.summary[locale]}</p>
                <p className="mt-3 text-xs font-medium text-ink/60">{ratingLabel}</p>
                <a
                  href={directionsUrl(poi)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ochre transition hover:text-ochre/80"
                  onClick={(event) => event.stopPropagation()}
                >
                  {copy.directions}
                  <span aria-hidden>↗</span>
                </a>
              </article>
            );
          })}
        </div>
      </aside>
    </section>
  );
}

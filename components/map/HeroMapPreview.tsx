'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Puntos turísticos de Salta para el tour automático
const TOUR_POINTS = [
  { name: 'Cafayate', coords: [-65.9767, -26.0733], zoom: 11 },
  { name: 'Cachi', coords: [-66.1667, -25.1167], zoom: 11.5 },
  { name: 'San Antonio de los Cobres', coords: [-66.3208, -24.2167], zoom: 10.5 },
  { name: 'Salta Capital', coords: [-65.4117, -24.7829], zoom: 11 },
  { name: 'Coronel Moldes', coords: [-65.4786, -25.2922], zoom: 12 },
  { name: 'Rosario de la Frontera', coords: [-64.9667, -25.8], zoom: 11 },
  { name: 'Las Lajitas', coords: [-64.1667, -24.7333], zoom: 11.5 },
  { name: 'Iruya', coords: [-65.2172, -22.7833], zoom: 12 },
] as const;


// Vista general de Salta
const SALTA_CENTER: [number, number] = [-65.4, -24.8];
const INITIAL_ZOOM = 6.5;

const FALLBACK_HYBRID_STYLE = 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_D6rA4zTHduk6KOKTXzGB';

export default function HeroMapPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const tourIndexRef = useRef(0);

  useEffect(() => {
    // Evitar doble inicialización
    if (!containerRef.current || mapRef.current) return;

    // Estilo con tonos naturales (puedes usar tu key de MapTiler)
    const styleUrl = process.env.NEXT_PUBLIC_MAPTILER_KEY
      ? `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
      : FALLBACK_HYBRID_STYLE;

    // Inicializar mapa
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: SALTA_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 45, // Inclinación 3D sutil
      bearing: 0,
      // CRÍTICO: Deshabilitar toda interacción
      interactive: false,
      attributionControl: false,
      refreshExpiredTiles: false,
    });

    mapRef.current = map;

    // Manejar errores silenciosamente
    map.on('error', (e) => {
      if (e.error?.name !== 'AbortError') {
        console.error('Map error:', e.error);
      }
    });

    map.on('load', () => {
      setIsLoaded(true);
      
      // Iniciar tour automático después de 2 segundos
      setTimeout(() => {
        startAutoTour(map);
      }, 2000);
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Función para el tour automático entre puntos
  const startAutoTour = (map: Map) => {
    const flyToNextPoint = () => {
      if (!mapRef.current) return;

      const point = TOUR_POINTS[tourIndexRef.current];
      
      // Volar al siguiente punto
      map.flyTo({
        center: point.coords as [number, number],
        zoom: point.zoom,
        duration: 6000, // 6 segundos de transición suave
        essential: true,
        pitch: 50, // Perspectiva 3D durante el vuelo
        bearing: Math.random() * 60 - 30, // Rotación aleatoria sutil
      });

      // Después de llegar, esperar 4 segundos y continuar
      setTimeout(() => {
        // Siguiente punto (loop circular)
        tourIndexRef.current = (tourIndexRef.current + 1) % TOUR_POINTS.length;
        flyToNextPoint();
      }, 10000); // 6s volando + 4s mostrando = 10s total
    };

    flyToNextPoint();
  };

  return (
    <div className="relative w-full h-[360px] rounded-2xl shadow-soft overflow-hidden md:h-[420px] lg:h-[480px]">
      {/* Contenedor del mapa */}
      <div
        ref={containerRef}
        className={`w-full h-full transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Badge opcional "Vista Previa" */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-poncho shadow-sm">
        Vista Previa
      </div>
      
      {/* Indicador de carga */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-arena/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-poncho border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-poncho font-medium">Cargando mapa...</p>
          </div>
        </div>
      )}
      
      {/* Texto de llamada a la acción (opcional) */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
        <p className="text-xs text-ink/70 font-medium">
          Explorá el mapa interactivo →
        </p>
      </div>
    </div>
  );
}

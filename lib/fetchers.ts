import type { POI, Region, Experiencia, Evento, POIRating } from './schema';
import { encodePlusCode } from './pluscode';
import poisData from '@/data/pois.json';
import regionesData from '@/data/regiones.json';
import experienciasData from '@/data/experiencias.json';
import eventosData from '@/data/eventos.json';

function deriveRatingFromPopularity(popularity?: number): POIRating {
  const normalized = typeof popularity === 'number'
    ? Math.min(Math.max(popularity, 0), 100) / 100
    : 0.65;

  const averageRaw = 3.7 + normalized * 1.3; // 3.7 .. 5.0 range
  const average = Math.min(4.9, Math.max(3.6, Math.round(averageRaw * 10) / 10));
  const count = Math.max(18, Math.round(45 + normalized * 220));

  return { average, count };
}

export async function getPOIs(): Promise<POI[]> {
  const pois = [...(poisData as POI[])];
  const seen = new Set<string>();

  return pois
    .filter((poi) => {
      if (seen.has(poi.id)) {
        return false;
      }
      seen.add(poi.id);
      return true;
    })
    .map((poi) => {
      const rating = poi.rating ?? deriveRatingFromPopularity(poi.popularity);
      const plusCode = poi.plusCode ?? encodePlusCode(poi.coords.lat, poi.coords.lng);

      return {
        ...poi,
        rating,
        plusCode
      };
    });
}
export async function getRegiones(): Promise<Region[]> {
  return regionesData as Region[];
}
export async function getExperiencias(): Promise<Experiencia[]> {
  return experienciasData as Experiencia[];
}
export async function getEventos(): Promise<Evento[]> {
  return eventosData as Evento[];
}

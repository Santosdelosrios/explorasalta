import path from 'node:path';
import { promises as fs } from 'node:fs';
import type { POI, Region, Experiencia, Evento, POIRating } from './schema';
import { encodePlusCode } from './pluscode';

function deriveRatingFromPopularity(popularity?: number): POIRating {
  const normalized = typeof popularity === 'number'
    ? Math.min(Math.max(popularity, 0), 100) / 100
    : 0.65;

  const averageRaw = 3.7 + normalized * 1.3; // 3.7 .. 5.0 range
  const average = Math.min(4.9, Math.max(3.6, Math.round(averageRaw * 10) / 10));
  const count = Math.max(18, Math.round(45 + normalized * 220));

  return { average, count };
}

async function readJson<T>(rel: string, fallback: T): Promise<T> {
  const abs = path.join(process.cwd(), rel);
  try {
    const raw = await fs.readFile(abs, 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to read JSON file: ${abs}`, error);
    return fallback;
  }
}

export async function getPOIs(): Promise<POI[]> {
  const pois = await readJson<POI[]>('data/pois.json', []);
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
  return readJson<Region[]>('data/regiones.json', []);
}
export async function getExperiencias(): Promise<Experiencia[]> {
  return readJson<Experiencia[]>('data/experiencias.json', []);
}
export async function getEventos(): Promise<Evento[]> {
  return readJson<Evento[]>('data/eventos.json', []);
}

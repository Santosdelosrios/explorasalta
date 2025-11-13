import path from 'node:path';
import { promises as fs } from 'node:fs';
import type { POI, Region, Experiencia, Evento, POIRating } from './schema';

function deriveRatingFromPopularity(popularity?: number): POIRating {
  const normalized = typeof popularity === 'number'
    ? Math.min(Math.max(popularity, 0), 100) / 100
    : 0.65;

  const averageRaw = 3.7 + normalized * 1.3; // 3.7 .. 5.0 range
  const average = Math.min(4.9, Math.max(3.6, Math.round(averageRaw * 10) / 10));
  const count = Math.max(18, Math.round(45 + normalized * 220));

  return { average, count };
}

async function readJson<T = unknown>(rel: string): Promise<T> {
  const abs = path.join(process.cwd(), rel);
  const raw = await fs.readFile(abs, 'utf8');
  return JSON.parse(raw) as T;
}

export async function getPOIs(): Promise<POI[]> {
  const pois = await readJson<POI[]>('data/pois.json');
  return pois.map(poi => {
    if (poi.rating) {
      return poi;
    }

    const derived = deriveRatingFromPopularity(poi.popularity);
    return {
      ...poi,
      rating: derived
    };
  });
}
export async function getRegiones(): Promise<Region[]> {
  return readJson<Region[]>('data/regiones.json');
}
export async function getExperiencias(): Promise<Experiencia[]> {
  return readJson<Experiencia[]>('data/experiencias.json');
}
export async function getEventos(): Promise<Evento[]> {
  return readJson<Evento[]>('data/eventos.json');
}

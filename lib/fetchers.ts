import path from 'node:path';
import { promises as fs } from 'node:fs';
import type { POI, Region, Experiencia, Evento } from './schema';

async function readJson<T = unknown>(rel: string): Promise<T> {
  const abs = path.join(process.cwd(), rel);
  const raw = await fs.readFile(abs, 'utf8');
  return JSON.parse(raw) as T;
}

export async function getPOIs(): Promise<POI[]> {
  return readJson<POI[]>('data/pois.json');
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

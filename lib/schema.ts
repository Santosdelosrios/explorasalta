export type RegionId = 'valles' | 'puna' | 'yungas' | 'ciudad' | 'lerma' | 'anta' | 'orán';
export type Category = 'pueblo' | 'mirador' | 'ruta' | 'fiesta' | 'museo' | 'gastronomia' | 'sendero' | 'patrimonio';
export type Translated<T> = { es: T; en: T };

export interface POIRating {
  average: number; // 0..5 scale
  count: number; // number of reviews backing the average
}

export interface POI {
  id: string;
  title: Translated<string>;
  summary: Translated<string>;
  category: Category;
  region: RegionId;
  coords: { lat: number; lng: number };
  images?: string[];
  tags?: string[];
  popularity?: number; // 0..100
  url?: string;
  rating?: POIRating;
  placeId?: string;
}

export interface Experiencia {
  id: string;
  title: Translated<string>;
  overview: Translated<string>;
  poiIds: string[];
  durationHours?: number;
  difficulty?: 'easy' | 'moderate' | 'hard';
  cover?: string;
}

export interface Evento {
  id: string;
  title: Translated<string>;
  dateRange: { start: string; end?: string };
  locationPoiId?: string;
  region: RegionId;
  description: Translated<string>;
  website?: string;
}

export interface Region {
  id: RegionId;
  name: Translated<string>;
  cover?: string;
  intro: Translated<string>;
}

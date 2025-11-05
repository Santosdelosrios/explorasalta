import type {RegionId} from './schema';

export type MapQuery = {
  cat?: string[];
  region?: RegionId[];
  lat?: number; lng?: number; z?: number;
  poi?: string;
};

export function parseMapQuery(search: string): MapQuery {
  const q = new URLSearchParams(search);
  const list = (v?: string | null) => (v ? v.split(',').filter(Boolean) : undefined);
  return {
    cat: list(q.get('cat')),
    region: list(q.get('region')) as RegionId[] | undefined,
    lat: q.get('lat') ? Number(q.get('lat')) : undefined,
    lng: q.get('lng') ? Number(q.get('lng')) : undefined,
    z:   q.get('z')   ? Number(q.get('z'))   : undefined,
    poi: q.get('poi') ?? undefined
  };
}

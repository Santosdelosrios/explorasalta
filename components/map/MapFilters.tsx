'use client';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';

const CATS = ['pueblo','mirador','ruta','fiesta'] as const;

export default function MapFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const active = new Set((params.get('cat') ?? '').split(',').filter(Boolean));
  const toggle = (c: string) => {
    const next = new Set(active);
    next.has(c) ? next.delete(c) : next.add(c);
    const sp = new URLSearchParams(params);
    next.size ? sp.set('cat', [...next].join(',')) : sp.delete('cat');
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <div role="group" aria-label="Filtros del mapa" className="flex gap-2 flex-wrap">
      {CATS.map(c => (
        <button key={c}
          onClick={() => toggle(c)}
          className={`cursor-pointer select-none rounded-xl px-3 py-1 border ${active.has(c) ? 'bg-poncho text-white' : 'bg-arena text-poncho'}`}>
          {c}
        </button>
      ))}
    </div>
  );
}

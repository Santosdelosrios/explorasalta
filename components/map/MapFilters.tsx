'use client';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import type {Locale} from '@/lib/i18n/config';
import {CATEGORY_METADATA, getCategoryLabel} from '@/lib/content/categories';
import type {Category} from '@/lib/schema';

type MapFiltersProps = {
  locale: Locale;
};

export default function MapFilters({locale}: MapFiltersProps) {
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

  const label = locale === 'es' ? 'Filtros del mapa' : 'Map filters';

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {(Object.keys(CATEGORY_METADATA) as Category[]).map(category => {
        const isActive = active.has(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => toggle(category)}
            aria-pressed={isActive}
            className={`group inline-flex cursor-pointer select-none items-center gap-2 rounded-xl border px-3 py-1 text-sm transition ${
              isActive
                ? 'border-poncho bg-poncho text-white shadow-soft'
                : 'border-poncho/10 bg-white/80 text-poncho hover:border-poncho/40 hover:bg-arena/60'
            }`}
          >
            <span aria-hidden className="text-base">
              {CATEGORY_METADATA[category].icon}
            </span>
            <span>{getCategoryLabel(category, locale)}</span>
          </button>
        );
      })}
    </div>
  );
}

'use client';
import Link from 'next/link';
import {useMemo} from 'react';
import {usePathname} from 'next/navigation';
import {cn} from '@/lib/utils';
import type {Locale} from '@/lib/i18n/config';

type NavbarProps = {
  locale?: Locale;
};

const NAV_ITEMS: Array<{
  slug: string;
  labels: Record<Locale, string>;
  description: Record<Locale, string>;
}> = [
  {
    slug: 'mapa',
    labels: {es: 'Mapa', en: 'Map'},
    description: {
      es: 'Explorá los puntos imperdibles de la provincia',
      en: 'Explore Salta’s must-see highlights'
    }
  },
  {
    slug: 'regiones',
    labels: {es: 'Regiones', en: 'Regions'},
    description: {
      es: 'Recorré cada paisaje con información clave',
      en: 'Dive into each landscape with essential info'
    }
  },
  {
    slug: 'experiencias',
    labels: {es: 'Experiencias', en: 'Experiences'},
    description: {
      es: 'Arma itinerarios temáticos y combiná actividades',
      en: 'Build themed itineraries and mix activities'
    }
  },
  {
    slug: 'cultura',
    labels: {es: 'Cultura viva', en: 'Living culture'},
    description: {
      es: 'Consultá la agenda cultural actualizada',
      en: 'Check the up-to-date cultural calendar'
    }
  },
  {
    slug: 'blog',
    labels: {es: 'Blog', en: 'Blog'},
    description: {
      es: 'Historias, entrevistas y consejos de viaje',
      en: 'Stories, interviews and travel tips'
    }
  },
  {
    slug: 'contacto',
    labels: {es: 'Contacto', en: 'Contact'},
    description: {
      es: 'Escribinos y sumate a la comunidad exploradora',
      en: 'Write to us and join the explorer community'
    }
  }
];

const DEFAULT_LOCALE: Locale = 'es';

function getLocaleFromPath(pathname: string | null): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  const [, maybeLocale] = pathname.split('/');
  if (maybeLocale === 'en' || maybeLocale === 'es') {
    return maybeLocale;
  }
  return DEFAULT_LOCALE;
}

export function Navbar({locale}: NavbarProps) {
  const pathname = usePathname();
  const activeLocale = locale ?? getLocaleFromPath(pathname);

  const items = useMemo(
    () =>
      NAV_ITEMS.map(item => ({
        ...item,
        label: item.labels[activeLocale],
        hint: item.description[activeLocale],
        href: `/${activeLocale}/${item.slug}`
      })),
    [activeLocale]
  );

  return (
    <nav className="sticky top-0 z-40 border-b bg-arena/80 backdrop-blur">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 md:flex-nowrap">
        <Link
          href={`/${activeLocale}`}
          className="font-heading text-lg font-extrabold text-poncho transition hover:text-cardon"
        >
          Explorá Salta
        </Link>
        <ul
          className="hidden items-start gap-6 md:flex"
          role="menubar"
          aria-label="Secciones principales"
        >
          {items.map(item => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <li key={item.slug} role="none">
                <Link
                  role="menuitem"
                  href={item.href}
                  prefetch
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group flex max-w-[12rem] flex-col items-start gap-1 text-left text-sm leading-tight transition',
                    isActive ? 'text-poncho' : 'text-ink hover:text-poncho'
                  )}
                >
                  <span className="font-heading text-base font-semibold">
                    {item.label}
                  </span>
                  <span className="text-xs font-normal uppercase tracking-[0.18em] text-cardon/70">
                    {item.hint}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

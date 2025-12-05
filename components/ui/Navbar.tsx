'use client';
import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {usePathname} from 'next/navigation';
import {cn} from '@/lib/utils';
import type {Locale} from '@/lib/i18n/config';

type NavbarProps = {
  locale?: Locale;
};

const NAV_ITEMS: Array<{
  slug: string;
  labels: Record<Locale, string>;
}> = [
  {
    slug: 'mapa',
    labels: {es: 'Mapa', en: 'Map'}
  },
  {
    slug: 'regiones',
    labels: {es: 'Regiones', en: 'Regions'}
  },
  {
    slug: 'experiencias',
    labels: {es: 'Experiencias', en: 'Experiences'}
  },
  {
    slug: 'cultura',
    labels: {es: 'Cultura viva', en: 'Living culture'}
  },
  {
    slug: 'blog',
    labels: {es: 'Blog', en: 'Blog'}
  },
  {
    slug: 'contacto',
    labels: {es: 'Contacto', en: 'Contact'}
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
  const [isOpen, setIsOpen] = useState(false);

  const items = useMemo(
    () =>
      NAV_ITEMS.map(item => ({
        ...item,
        label: item.labels[activeLocale],
        href: `/${activeLocale}/${item.slug}`
      })),
    [activeLocale]
  );

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-40 border-b bg-arena/80 backdrop-blur">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 lg:flex-nowrap">
        <Link
          href={`/${activeLocale}`}
          className="font-heading text-lg font-extrabold text-poncho transition hover:text-cardon"
        >
          Explorá Salta
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen(prev => !prev)}
            className="flex items-center gap-2 rounded-xl border border-poncho/30 px-3 py-2 text-cardon transition hover:border-poncho/60 hover:bg-poncho/10 lg:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={cn(
                  'absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform',
                  isOpen ? 'translate-y-1.5 rotate-45' : ''
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-opacity',
                  isOpen ? 'opacity-0' : 'opacity-100'
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-3 h-0.5 w-5 bg-current transition-transform',
                  isOpen ? '-translate-y-1.5 -rotate-45' : ''
                )}
              />
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-poncho">Menú</span>
          </button>

          <ul
            className="hidden items-start gap-6 lg:flex"
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
                    <span className="font-heading text-base font-semibold">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div
        className={cn(
          'border-b border-poncho/10 bg-arena/95 transition-all duration-200 lg:hidden',
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 overflow-hidden opacity-0'
        )}
      >
        <ul className="container mx-auto flex flex-col gap-2 px-4 py-3" role="menubar" aria-label="Navegación móvil">
          {items.map(item => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <li key={item.slug} role="none">
                <Link
                  role="menuitem"
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-poncho/10 text-poncho'
                      : 'text-ink hover:bg-poncho/10 hover:text-poncho'
                  )}
                >
                  <span>{item.label}</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

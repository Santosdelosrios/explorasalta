'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {cn} from '@/lib/utils';

const links = [
  {href: '/es/mapa', label: 'Mapa'},
  {href: '/es/regiones', label: 'Regiones'},
  {href: '/es/experiencias', label: 'Experiencias'},
  {href: '/es/cultura', label: 'Cultura viva'},
  {href: '/es/blog', label: 'Blog'},
  {href: '/es/contacto', label: 'Contacto'}
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-40 bg-arena/80 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/es" className="font-extrabold text-poncho">Explorá Salta</Link>
        <ul className="hidden md:flex gap-5" role="menubar" aria-label="Secciones">
          {links.map(l => (
            <li key={l.href} role="none">
              <Link role="menuitem" href={l.href}
                className={cn('hover:underline', pathname.startsWith(l.href) ? 'text-poncho' : 'text-ink')}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

import '@/styles/globals.css';
import type { Metadata } from 'next';
import {bodyFont, headingFont} from '@/lib/fonts';

export const metadata: Metadata = {
  title: { default: 'Explorá Salta', template: '%s | Explorá Salta' },
  description: 'Mapa interactivo y cultura viva de Salta.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${headingFont.variable} ${bodyFont.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  );
}

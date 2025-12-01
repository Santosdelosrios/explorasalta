import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Overlock } from 'next/font/google';

const overlock = Overlock({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-overlock'
});

export const metadata: Metadata = {
  title: { default: 'Explorá Salta', template: '%s | Explorá Salta' },
  description: 'Mapa interactivo y cultura viva de Salta.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`scroll-smooth ${overlock.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import '@/styles/globals.css';
import { Julius_Sans_One } from 'next/font/google';
import type { Metadata } from 'next';

const juliusSans = Julius_Sans_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-main'
});

export const metadata: Metadata = {
  title: { default: 'Explorá Salta', template: '%s | Explorá Salta' },
  description: 'Mapa interactivo y cultura viva de Salta.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`scroll-smooth ${juliusSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}

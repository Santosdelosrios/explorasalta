import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Lexend_Deca, Tenor_Sans } from 'next/font/google';

const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-heading'
});

const tenorSans = Tenor_Sans({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: { default: 'Explorá Salta', template: '%s | Explorá Salta' },
  description: 'Mapa interactivo y cultura viva de Salta.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${lexendDeca.variable} ${tenorSans.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  );
}

import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Explorá Salta', template: '%s | Explorá Salta' },
  description: 'Mapa interactivo y cultura viva de Salta.'
};

export default function RootLayout({ 
  children,
  params
}: { 
  children: React.ReactNode;
  params?: { locale?: string };
}) {
  // Obtener locale de params o usar 'es' por defecto
  const locale = params?.locale || 'es';
  
  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        {/* Fuentes de Google - aquí en el root */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@700;800&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh">
        {children}
      </body>
    </html>
  );
}

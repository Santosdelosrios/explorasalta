import dynamic from 'next/dynamic';
import Link from 'next/link';

// Importación dinámica para evitar SSR
const HeroMapPreview = dynamic(
  () => import('@/components/map/HeroMapPreview'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-2xl bg-arena/30 animate-pulse" />
    )
  }
);

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center px-4 md:px-8 py-12">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Columna izquierda: Contenido */}
          <div className="space-y-6">
            <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-poncho leading-tight">
              Explorá
              <br />
              <span className="text-cardon">Salta</span>
            </h1>
            
            <p className="text-lg md:text-xl text-ink/80 max-w-xl">
              Descubrí paisajes únicos, cultura viva y experiencias 
              inolvidables en el corazón del noroeste argentino.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/mapa"
                className="inline-flex items-center gap-2 bg-poncho hover:bg-poncho/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-soft hover:shadow-xl"
              >
                Ver Mapa Completo
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link 
                href="/experiencias"
                className="inline-flex items-center gap-2 bg-arena hover:bg-arena/80 text-poncho px-6 py-3 rounded-xl font-semibold transition-all border-2 border-poncho/20"
              >
                Experiencias
              </Link>
            </div>
            
            {/* Stats opcionales */}
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-poncho">50+</p>
                <p className="text-sm text-ink/60">Lugares</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-poncho">7</p>
                <p className="text-sm text-ink/60">Regiones</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-poncho">10+</p>
                <p className="text-sm text-ink/60">Experiencias</p>
              </div>
            </div>
          </div>
          
          {/* Columna derecha: Mapa preview */}
          <div className="relative h-[400px] lg:h-[600px] w-full">
            <HeroMapPreview />
          </div>
          
        </div>
      </div>
      
      {/* Decoración de fondo opcional */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-cielo/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-poncho/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}

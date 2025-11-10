import Link from 'next/link';
import HeroMapWrapper from '@/components/map/HeroMapWrapper';

export default function HomePage() {
  return (
    <main id="main" className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
      {/* Columna izquierda: Texto */}
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-[Montserrat]">
          Explorá <span className="text-poncho">Salta</span>: mapa interactivo y cultura viva
        </h1>
        <p className="mt-4 text-lg text-zinc-700">
          Descubrí paisajes, pueblos, rutas y tradiciones del norte argentino.
        </p>
        <div className="mt-6 flex gap-3">
          <Link 
            className="px-5 py-3 rounded-xl bg-poncho text-white hover:bg-poncho/90 transition-colors font-semibold shadow-soft" 
            href="/es/mapa"
          >
            Ir al mapa
          </Link>
          <Link 
            className="px-5 py-3 rounded-xl border border-poncho/30 hover:border-poncho/50 hover:bg-ink/5 transition-all font-semibold" 
            href="/es/experiencias"
          >
            Ver experiencias
          </Link>
        </div>
      </div>
      
      {/* Columna derecha: MAPA PREVIEW */}
      <div className="aspect-video rounded-2xl shadow-soft overflow-hidden">
        <HeroMapWrapper />
      </div>
    </main>
  );
}

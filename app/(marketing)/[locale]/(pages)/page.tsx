import Link from 'next/link';

export default function HomePage() {
  return (
    <main id="main" className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-[Montserrat]">
          Explorá <span className="text-poncho">Salta</span>: mapa interactivo y cultura viva
        </h1>
        <p className="mt-4 text-lg text-zinc-700">
          Descubrí paisajes, pueblos, rutas y tradiciones del norte argentino.
        </p>
        <div className="mt-6 flex gap-3">
          <Link className="px-5 py-3 rounded-xl bg-poncho text-white" href="/es/mapa">Ir al mapa</Link>
          <Link className="px-5 py-3 rounded-xl border" href="/es/experiencias">Ver experiencias</Link>
        </div>
      </div>
      <div aria-hidden className="aspect-video rounded-2xl shadow-soft bg-[url('/images/branding/hero.jpg')] bg-cover bg-center"/>
    </main>
  );
}

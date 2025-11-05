import {getRegiones} from '@/lib/fetchers';

export default async function Regiones() {
  const regiones = await getRegiones();
  return (
    <main className="container mx-auto px-4 py-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {regiones.map(r => (
        <a key={r.id} className="block rounded-2xl shadow-soft bg-white p-4 hover:shadow"
           href={`#${r.id}`}>
          <h2 className="font-bold text-xl">{r.name.es}</h2>
          <p className="text-sm text-zinc-700 mt-2">{r.intro.es}</p>
        </a>
      ))}
    </main>
  );
}

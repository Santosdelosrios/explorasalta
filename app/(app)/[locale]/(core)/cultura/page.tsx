import {getEventos} from '@/lib/fetchers';

export default async function Cultura() {
  const eventos = await getEventos();
  return (
    <main className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-3xl font-bold text-poncho">Cultura viva</h1>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map(ev => (
          <li key={ev.id} className="rounded-2xl shadow-soft bg-white p-4">
            <h2 className="font-semibold">{ev.title.es}</h2>
            <p className="text-sm text-zinc-700">{ev.description.es}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

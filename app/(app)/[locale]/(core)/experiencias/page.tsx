import {getExperiencias} from '@/lib/fetchers';

export default async function Experiencias() {
  const exps = await getExperiencias();
  return (
    <main className="container mx-auto px-4 py-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {exps.map(e => (
        <article key={e.id} className="rounded-2xl shadow-soft bg-white p-4">
          <h2 className="font-bold text-xl">{e.title.es}</h2>
          <p className="text-sm text-zinc-700 mt-2">{e.overview.es}</p>
        </article>
      ))}
    </main>
  );
}

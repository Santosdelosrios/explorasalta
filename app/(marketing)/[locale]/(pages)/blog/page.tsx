import Link from 'next/link';
import type {Locale} from '@/lib/i18n/config';

type LocalePageProps = { params: Promise<{ locale: Locale }> };

type BlogPost = {
  id: string;
  category: Record<Locale, string>;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  publishedAt: string;
  readingMinutes: number;
  hero?: string;
};

const POSTS: BlogPost[] = [
  {
    id: 'miradores-imperdibles',
    category: {es: 'Inspiración', en: 'Inspiration'},
    title: {
      es: '5 miradores para enamorarte de los valles',
      en: '5 lookouts to fall for the valleys'
    },
    excerpt: {
      es: 'Panorámicas rojizas, atardeceres inolvidables y rutas que combinan vino con aventura.',
      en: 'Crimson panoramas, unforgettable sunsets and wine routes with a dash of adventure.'
    },
    publishedAt: '2024-09-18',
    readingMinutes: 6,
    hero: '/images/branding/hero.jpg'
  },
  {
    id: 'sabores-andinos',
    category: {es: 'Gastronomía', en: 'Food'},
    title: {
      es: 'Sabores andinos para probar en tu próxima escapada',
      en: 'Andean flavours to try on your next escape'
    },
    excerpt: {
      es: 'Comidas de olla, vinos de altura y postres que combinan tradición con ingredientes de estación.',
      en: 'Hearty stews, high-altitude wines and desserts that mix tradition with seasonal produce.'
    },
    publishedAt: '2024-08-02',
    readingMinutes: 5
  },
  {
    id: 'agenda-fiestas-populares',
    category: {es: 'Agenda', en: 'Calendar'},
    title: {
      es: 'Fiestas populares: cómo planificar tu viaje cultural',
      en: 'Popular festivities: plan your cultural journey'
    },
    excerpt: {
      es: 'Consejos para vivir las celebraciones con respeto, qué llevar y cómo moverte por la provincia.',
      en: 'Tips to experience festivities respectfully, what to pack and how to move around the province.'
    },
    publishedAt: '2024-07-12',
    readingMinutes: 7
  }
];

const COPY: Record<Locale, {
  title: string;
  intro: string;
  categoryLabel: string;
  readMore: string;
  readingTime(minutes: number): string;
  published(date: Date): string;
}> = {
  es: {
    title: 'Blog / Novedades',
    intro: 'Historias, entrevistas y guías para explorar Salta con mirada local.',
    categoryLabel: 'Categoría',
    readMore: 'Leer nota',
    readingTime: minutes => `${minutes} min de lectura`,
    published: date => new Intl.DateTimeFormat('es-AR', {dateStyle: 'long'}).format(date)
  },
  en: {
    title: 'Stories & updates',
    intro: 'Stories, interviews and guides to explore Salta with a local lens.',
    categoryLabel: 'Category',
    readMore: 'Read article',
    readingTime: minutes => `${minutes} min read`,
    published: date => new Intl.DateTimeFormat('en-US', {dateStyle: 'long'}).format(date)
  }
};

export default async function BlogPage({ params }: LocalePageProps) {
  const { locale } = await params;
  const copy = COPY[locale];

  return (
    <main id="main" className="container mx-auto flex flex-col gap-10 px-4 py-12">
      <header className="space-y-4 text-center md:text-left">
        <h1 className="font-heading text-4xl font-bold text-poncho">{copy.title}</h1>
        <p className="mx-auto max-w-3xl text-lg text-ink/80 md:mx-0">{copy.intro}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {POSTS.map(post => {
          const published = new Date(post.publishedAt);
          return (
            <article
              key={post.id}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-poncho/10 bg-white/80 shadow-soft"
            >
              <div className="relative h-44 bg-gradient-to-br from-cardon/20 via-transparent to-poncho/20">
                {post.hero ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.hero}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" aria-hidden />
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-cardon/70">
                  <span>{copy.categoryLabel}</span>
                  <span>{post.category[locale]}</span>
                </div>
                <h2 className="font-heading text-2xl font-semibold text-poncho">{post.title[locale]}</h2>
                <p className="text-sm text-ink/70">{post.excerpt[locale]}</p>

                <dl className="mt-auto space-y-1 text-xs uppercase tracking-[0.2em] text-cardon/60">
                  <div>
                    <dt className="sr-only">{locale === 'es' ? 'Publicado' : 'Published'}</dt>
                    <dd>{copy.published(published)}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">{locale === 'es' ? 'Tiempo de lectura' : 'Reading time'}</dt>
                    <dd>{copy.readingTime(post.readingMinutes)}</dd>
                  </div>
                </dl>

                <div>
                  <Link
                    href={`/${locale}/blog/${post.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-poncho/30 px-4 py-2 text-sm font-semibold text-poncho transition hover:border-poncho/60 hover:bg-arena/60"
                  >
                    {copy.readMore}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

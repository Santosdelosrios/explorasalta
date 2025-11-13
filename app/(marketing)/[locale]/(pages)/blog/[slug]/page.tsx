import {notFound} from 'next/navigation';
import type {Locale} from '@/lib/i18n/config';
import type {Metadata} from 'next';

const POSTS = ['miradores-imperdibles', 'sabores-andinos', 'agenda-fiestas-populares'] as const;

type Params = {
  locale: Locale;
  slug: (typeof POSTS)[number];
};

export function generateMetadata({params}: {params: Params}): Metadata {
  const titles: Record<(typeof POSTS)[number], Record<Locale, string>> = {
    'miradores-imperdibles': {
      es: '5 miradores para enamorarte de los valles',
      en: '5 lookouts to fall for the valleys'
    },
    'sabores-andinos': {
      es: 'Sabores andinos para probar en tu próxima escapada',
      en: 'Andean flavours to try on your next escape'
    },
    'agenda-fiestas-populares': {
      es: 'Fiestas populares: cómo planificar tu viaje cultural',
      en: 'Popular festivities: plan your cultural journey'
    }
  };

  const {locale, slug} = params;
  const title = titles[slug]?.[locale] ?? 'Explorá Salta';
  return {
    title
  };
}

export default function BlogPostPage({
  params
}: {
  params: Params;
}) {
  const {slug} = params;
  if (!POSTS.includes(slug)) {
    notFound();
  }

  return (
    <main id="main" className="container mx-auto px-4 py-16">
      <article className="mx-auto max-w-3xl space-y-6 text-left">
        <header className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cardon/70">
            {params.locale === 'es' ? 'Blog' : 'Blog'}
          </p>
          <h1 className="font-heading text-4xl font-bold text-poncho">
            {generateMetadata({params}).title as string}
          </h1>
        </header>
        <p className="text-base text-ink/70">
          {params.locale === 'es'
            ? 'Estamos preparando la versión completa de este artículo. Mientras tanto, podés explorar el mapa y las experiencias recomendadas.'
            : 'We are preparing the full version of this story. In the meantime you can explore the map and recommended experiences.'}
        </p>
        <p className="text-base text-ink/70">
          {params.locale === 'es'
            ? 'Suscribite para recibir novedades cuando publiquemos nuevos contenidos.'
            : 'Subscribe to get updates when we publish new stories.'}
        </p>
      </article>
    </main>
  );
}

import type {Locale} from '@/lib/i18n/config';

type LocalePageProps = { params: Promise<{ locale: Locale }> };

const COPY: Record<Locale, {
  title: string;
  intro: string;
  form: {
    name: string;
    email: string;
    message: string;
    submit: string;
  };
  infoTitle: string;
  infoSubtitle: string;
}> = {
  es: {
    title: 'Contacto',
    intro: 'Escribinos si querés publicar en nuestro blog, compartir una actividad o sumar contenido a la página.',
    form: {
      name: 'Nombre y apellido',
      email: 'Correo electrónico',
      message: 'Mensaje',
      submit: 'Enviar mensaje'
    },
    infoTitle: 'Equipo Explorá Salta',
    infoSubtitle: 'Página creada por Santos de los Ríos.'
  },
  en: {
    title: 'Contact',
    intro: 'Reach out if you want to contribute to our blog, share an activity, or add content to the site.',
    form: {
      name: 'Full name',
      email: 'Email address',
      message: 'Message',
      submit: 'Send message'
    },
    infoTitle: 'Explorá Salta team',
    infoSubtitle: 'Page created by Santos de los Ríos.',
  }
};

const CONTACT_EMAIL = 'santosdelosrios12@gmail.com';

export default async function ContactoPage({ params }: LocalePageProps) {
  const { locale } = await params;
  const copy = COPY[locale];

  return (
    <main id="main" className="container mx-auto flex flex-col gap-10 px-4 py-12 md:flex-row md:items-start">
      <section className="md:w-2/3">
        <header className="space-y-4">
          <h1 className="font-heading text-4xl font-bold text-poncho">{copy.title}</h1>
          <p className="max-w-2xl text-lg text-ink/80">{copy.intro}</p>
        </header>

        <form
          className="mt-8 grid gap-4"
          aria-label={copy.title}
          action={`mailto:${CONTACT_EMAIL}`}
          method="POST"
          encType="text/plain"
        >
          <label className="grid gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-cardon/70">{copy.form.name}</span>
            <input
              name="name"
              className="rounded-2xl border border-poncho/20 bg-white/70 px-4 py-3 shadow-sm focus:border-poncho focus:outline-none"
              required
              autoComplete="name"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-cardon/70">{copy.form.email}</span>
            <input
              type="email"
              name="email"
              className="rounded-2xl border border-poncho/20 bg-white/70 px-4 py-3 shadow-sm focus:border-poncho focus:outline-none"
              required
              autoComplete="email"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-cardon/70">{copy.form.message}</span>
            <textarea
              name="message"
              className="min-h-[160px] rounded-2xl border border-poncho/20 bg-white/70 px-4 py-3 shadow-sm focus:border-poncho focus:outline-none"
              required
            />
          </label>
          <button
            type="submit"
            className="mt-2 inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-poncho px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-cardon"
          >
            {copy.form.submit}
          </button>
        </form>
      </section>

      <aside className="md:w-1/3 space-y-6 rounded-3xl border border-poncho/10 bg-white/80 p-6 shadow-soft">
        <h2 className="font-heading text-2xl font-semibold text-poncho">{copy.infoTitle}</h2>
        <p className="text-sm text-ink/70">{copy.infoSubtitle}</p>
      </aside>
    </main>
  );
}

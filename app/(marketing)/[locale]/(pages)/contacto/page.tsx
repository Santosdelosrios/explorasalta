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
  emailLabel: string;
  phoneLabel: string;
  followLabel: string;
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
    infoSubtitle: 'Página creada por Santos de los Ríos. ¡Sumate si querés escribir en el blog o aportar ideas!',
    emailLabel: 'Correo',
    phoneLabel: 'Teléfono',
    followLabel: 'Seguinos'
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
    infoSubtitle: 'Page created by Santos de los Ríos. Join us if you want to write for the blog or share ideas!',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    followLabel: 'Follow us'
  }
};

const CONTACT_CHANNELS = {
  email: 'hola@explorasalta.ar',
  phone: '+54 387 555-1234',
  social: [
    {label: 'Instagram', handle: '@explorasalta'},
    {label: 'YouTube', handle: 'Explorá Salta'},
    {label: 'TikTok', handle: '@explorasalta'}
  ]
};

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

        <form className="mt-8 grid gap-4" aria-label={copy.title}>
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

        <dl className="space-y-4 text-sm text-ink/80">
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-cardon/70">{copy.emailLabel}</dt>
            <dd>
              <a href={`mailto:${CONTACT_CHANNELS.email}`} className="text-poncho underline">
                {CONTACT_CHANNELS.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-cardon/70">{copy.phoneLabel}</dt>
            <dd>
              <a href={`tel:${CONTACT_CHANNELS.phone.replace(/[^\d+]/g, '')}`} className="text-poncho">
                {CONTACT_CHANNELS.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-cardon/70">{copy.followLabel}</dt>
            <dd>
              <ul className="space-y-1">
                {CONTACT_CHANNELS.social.map(channel => (
                  <li key={channel.label} className="flex items-center justify-between">
                    <span>{channel.label}</span>
                    <span className="font-semibold text-poncho">{channel.handle}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </aside>
    </main>
  );
}

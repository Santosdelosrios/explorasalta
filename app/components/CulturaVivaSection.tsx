// app/components/CulturaVivaSection.tsx
// Next.js (App Router) + React + TailwindCSS
// Drop this component into your project and import it into your home page.
// Example: <CulturaVivaSection />

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

// ---- Palette (kept inline via Tailwind arbitrary colors) ----
// base: #7B2D26 (granate) | #EBD4B7 (arena clara) | #6E8B3D (verde cardón) | #2E1E0F (texto oscuro)

export type CulturaItem = {
  id: string;
  title: string;
  description: string;
  image: string; // URL or public asset path
  ctaLabel?: string; // "Ver más" | "Escuchar" | custom
  ctaHref?: string; // external/internal link
  embedType?: "spotify" | "youtube"; // optional rich media
  embedUrl?: string; // full embed URL
  tags?: string[];
};

const demoItems: CulturaItem[] = [
  {
    id: "cuchi",
    title: "Cuchi Leguizamón",
    description:
      "Pianista y compositor clave del folclore salteño contemporáneo.",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1400&auto=format&fit=crop",
    ctaLabel: "Escuchar",
    embedType: "spotify",
    // Replace with a real embed (album/playlist/track)
    embedUrl:
      "https://open.spotify.com/embed/playlist/37i9dQZF1DX1s9knjP51Oa?utm_source=generator",
    tags: ["música", "folclore"],
  },
  {
    id: "chalchaleros",
    title: "Los Chalchaleros",
    description:
      "Emblema del canto criollo y las peñas que hicieron historia.",
    image:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1400&auto=format&fit=crop",
    ctaLabel: "Ver más",
    ctaHref: "https://es.wikipedia.org/wiki/Los_Chalchaleros",
    embedType: "youtube",
    embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U", // placeholder video id
    tags: ["música", "tradición"],
  },
  {
    id: "coplas",
    title: "Coplas y carnaval",
    description:
      "Rituales del NOA: cajas, coplerxs y el desentierro del diablo.",
    image:
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1400&auto=format&fit=crop",
    ctaLabel: "Ver más",
    ctaHref: "/articulos/coplas-carnaval",
    tags: ["fiestas", "rituales"],
  },
  {
    id: "tejedores",
    title: "Tejedoras de los Valles",
    description:
      "Ponchos y saberes ancestrales con identidad regional contemporánea.",
    image:
      "https://images.unsplash.com/photo-1520975922284-6c0b6b07c6d4?q=80&w=1400&auto=format&fit=crop",
    ctaLabel: "Ver más",
    ctaHref: "/entrevistas/tejedoras-valles",
    tags: ["artesanía", "textil"],
  },
  {
    id: "peñas",
    title: "Peñas en Salta capital",
    description: "Música en vivo, empanadas y guitarreadas hasta tarde.",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1400&auto=format&fit=crop",
    ctaLabel: "Ver agenda",
    ctaHref: "/agenda/penas",
    tags: ["agenda", "nocturno"],
  },
  {
    id: "cocina",
    title: "Cocina criolla",
    description: "Locro, tamales y humitas: sabores que cuentan historias.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop",
    ctaLabel: "Ver recetas",
    ctaHref: "/gastronomia",
    tags: ["comida", "tradición"],
  },
];

function Card({ item }: { item: CulturaItem }) {
  const hasEmbed = !!item.embedType && !!item.embedUrl;

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl bg-[#EBD4B7] shadow-[0_10px_30px_rgba(46,30,15,0.12)] ring-1 ring-[#2E1E0F]/10 transition-transform duration-300 will-change-transform hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(46,30,15,0.18)]"
      aria-label={item.title}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />
        {/* tag chips */}
        {item.tags && item.tags.length > 0 && (
          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-[#7B2D26]/90 px-2.5 py-1 text-xs font-medium text-[#EBD4B7] shadow"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 text-[#2E1E0F]">
        <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
        <p className="line-clamp-2 text-sm/6 opacity-90">
          {item.description}
        </p>

        {hasEmbed && (
          <div className="mt-1 overflow-hidden rounded-xl border border-[#2E1E0F]/10 bg-[#EBD4B7]">
            {item.embedType === "spotify" && (
              <iframe
                title={`${item.title} – Spotify`}
                src={item.embedUrl}
                className="h-[80px] w-full"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              />
            )}
            {item.embedType === "youtube" && (
              <div className="aspect-video w-full">
                <iframe
                  title={`${item.title} – YouTube`}
                  src={item.embedUrl}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-2">
          {item.ctaHref ? (
            <Link
              href={item.ctaHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#7B2D26] bg-[#7B2D26] px-3 py-2 text-sm font-medium text-[#EBD4B7] transition-colors hover:bg-[#6b271f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E8B3D]"
            >
              {item.ctaLabel ?? "Ver más"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M13.5 4.5a1 1 0 1 0-2 0v7.19L7.7 8.88a1 1 0 1 0-1.4 1.43l4.9 4.8a1 1 0 0 0 1.4 0l4.9-4.8a1 1 0 0 0-1.4-1.43l-3.8 2.81V4.5Z" />
                <path d="M4 13.5a8 8 0 1 0 16 0 1 1 0 1 0-2 0 6 6 0 1 1-12 0 1 1 0 1 0-2 0Z" />
              </svg>
            </Link>
          ) : (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#7B2D26] bg-transparent px-3 py-2 text-sm font-medium text-[#7B2D26] transition-colors hover:bg-[#7B2D26]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E8B3D]"
            >
              {item.ctaLabel ?? "Ver más"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function CulturaVivaSection({
  items,
  title = "Cultura viva",
  subtitle = "Historias, música y tradiciones que mantienen viva la identidad salteña.",
}: {
  items?: CulturaItem[];
  title?: string;
  subtitle?: string;
}) {
  const data = useMemo(() => items ?? demoItems, [items]);

  return (
    <section
      aria-labelledby="cultura-viva-title"
      className="relative isolate w-full bg-[#EBD4B7] px-4 py-12 sm:px-6 lg:px-8"
    >
      {/* subtle background ornaments */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-20"
        style={{
          background:
            "radial-gradient(1200px 400px at 10% -10%, rgba(123,45,38,0.15), transparent 60%), radial-gradient(800px 300px at 100% 0%, rgba(110,139,61,0.12), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-8 max-w-3xl text-center">
          <h2
            id="cultura-viva-title"
            className="text-3xl font-extrabold tracking-tight text-[#2E1E0F] sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 text-base/7 text-[#2E1E0F]/80">
            {subtitle}
          </p>
        </header>

        {/* Grid responsive: 1 col mobile, 2 md, 3 xl */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
          {data.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Optional: Skeleton (loading state) ---
export function CulturaVivaSkeleton() {
  return (
    <section className="w-full bg-[#EBD4B7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <div className="mx-auto h-8 w-56 rounded bg-[#2E1E0F]/10" />
          <div className="mx-auto mt-3 h-5 w-96 rounded bg-[#2E1E0F]/10" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-[#2E1E0F]/5"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

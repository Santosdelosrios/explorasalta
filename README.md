# Explora Salta

Explora Salta es un sitio de destino turístico construido con Next.js 15 y soporte total para español e inglés. Combina páginas de marketing con experiencias inmersivas dentro de la app, incluyendo un mapa interactivo, una agenda cultural y catálogos editoriales que se alimentan desde archivos JSON versionados.

## Características principales

- **Mapa interactivo híbrido** con MapLibre + MapTiler que agrupa miradores, rutas, festivales, gastronomía y patrimonio. Permite activar capas por categoría/región y muestra calificaciones resumidas en los popups. (`components/map`)
- **Internacionalización completa** mediante `next-intl`, con rutas localizadas bajo `/[locale]` y contenido bilingüe para cada sección. (`app/(marketing)` y `app/(app)`)
- **Secciones editoriales** para Regiones, Experiencias, Cultura y Blog que consumen datos estructurados desde `data/*.json` y muestran CTA que enlazan al mapa o a formularios de contacto.
- **Tipografía personalizada** con Cinzel Decorative para títulos y Tenor Sans para cuerpo definida vía variables CSS en `styles/globals.css`.

## Requisitos

- Node.js 18.18+ o 20+
- pnpm / npm / yarn (los ejemplos usan `npm`)
- Clave pública de MapTiler para renderizar el estilo híbrido (opcional pero recomendado).

### Variables de entorno

Crea un archivo `.env.local` en la raíz con las variables necesarias:

```
NEXT_PUBLIC_MAPTILER_KEY=tu_api_key
```

Sin esta clave el mapa utiliza el estilo híbrido público por defecto pero con límite de uso.

## Instalación y scripts

```bash
npm install        # instala dependencias
npm run dev        # entorno de desarrollo en http://localhost:3000
npm run build      # compila la app para producción
npm run start      # sirve la build generada
npm run lint       # ejecuta ESLint sobre todo el proyecto
npm run typecheck  # valida los tipos con TypeScript
```

> Nota: el proyecto incluye Husky + lint-staged para ejecutar ESLint sobre los archivos modificados antes de cada commit.

## Estructura del proyecto

```
app/
  (marketing)/[locale]/(pages)/   → páginas públicas (home, blog, contacto, etc.)
  (app)/[locale]/(core)/          → mapa, regiones, experiencias y cultura en modo app
components/                       → UI compartida, mapa y secciones reutilizables
lib/                              → esquemas, fuentes y utilidades
data/                             → contenido editable (POIs, eventos, regiones, experiencias)
styles/                           → estilos globales de Tailwind/PostCSS
```

## Datos y contenido

Los datos se guardan en formato JSON dentro de `data/` para facilitar su edición sin backend:

- `data/pois.json`: puntos de interés con coordenadas, categorías y ratings.
- `data/experiencias.json`: itinerarios curados con duración, dificultad y paradas sugeridas.
- `data/eventos.json`: agenda "Cultura Viva" con fechas y lugares.
- `data/regiones.json`: metadatos regionales para agrupar contenido y filtros del mapa.

Cada archivo sigue un esquema definido en `lib/schema.ts`. Si agregas nuevas entradas asegúrate de respetar las claves multilenguaje (`title`, `title_en`, etc.).

## Estilo y linting

El proyecto usa TypeScript, ESLint 9 con `eslint-config-next` y TailwindCSS. Se recomienda activar el formateo por defecto de tu editor y ejecutar `npm run lint` antes de subir cambios para mantener la consistencia del código.

## Despliegue

Al ejecutar `npm run build`, Next.js generará una aplicación híbrida (SSR + rutas dinámicas) lista para ser desplegada en plataformas como Vercel, Netlify o servidores Node tradicionales. Recuerda configurar las variables de entorno (especialmente `NEXT_PUBLIC_MAPTILER_KEY`) en el proveedor de hosting.

---

Para más información revisa los componentes dentro de `components/` y los fetchers en `lib/fetchers.ts`, donde se centraliza la carga de datos estáticos.

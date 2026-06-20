# Task Breakdown — cge-platform-foundation

**Proyecto**: concenso-hb  
**Versión**: 1.0  
**Fecha**: 2026-06-18  
**Estado**: Listo para apply  

---

## Fases de implementación

Las tareas están agrupadas en 7 fases. Cada fase debe completarse antes de iniciar la siguiente salvo donde se indica que pueden correr en paralelo.

```
Fase 1: Fundación del proyecto
Fase 2: Base de datos + Prisma
Fase 3: Autenticación
Fase 4: Rutas públicas
Fase 5: Dashboards
Fase 6: Radio
Fase 7: Configuración del sitio (SiteConfig)
```

---

## Fase 1 — Fundación del proyecto

> Dependencia: ninguna. Es el punto de partida.

### 1.1 — Inicializar proyecto Next.js
- `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
- Verificar que NO genera `tailwind.config.js` (Tailwind v4 no lo usa)
- Agregar `.nvmrc` con la versión de Node

### 1.2 — Instalar dependencias
```bash
npm install @prisma/client next-auth@beta bcryptjs slugify @tiptap/react @tiptap/starter-kit isomorphic-dompurify
npm install -D prisma @types/bcryptjs @types/node
```

### 1.3 — Configurar `app/globals.css` con `@theme`
- Reemplazar el contenido generado por create-next-app
- Implementar todos los tokens del diseño v1.2:
  - `--color-bg`, `--color-surface`, `--color-surface-offset`, `--color-surface-accent`, `--color-surface-2`
  - `--color-border`, `--color-border-gold`, `--color-divider`
  - `--color-text`, `--color-text-muted`, `--color-text-faint`, `--color-text-inverse`
  - `--color-gold`, `--color-gold-bright`, `--color-gold-dark`, `--color-gold-highlight`
  - `--color-noticias`, `--color-noticias-bg`, `--color-noticias-border` (fallbacks)
  - `--color-wireds`, `--color-wireds-bg`, `--color-wireds-border` (fallbacks)
  - `--color-onair`
  - `--font-display`, `--font-body`, `--font-ui`
  - `--space-*` (1 al 20)
  - `--radius-*`
  - `--shadow-*`
- `@layer base`: reset, grain SVG en `body::before`, `html` scroll-behavior, `::selection`
- `@layer components`: `.gold-line`, `.ornament`, `.btn-primary`, `.btn-secondary`, `.news-tag` (con variantes por departamento)

### 1.4 — Configurar fuentes en `app/layout.tsx`
- Importar `Cinzel`, `Crimson_Pro`, `Inter` desde `next/font/google`
- Asignar `variable: '--font-display'`, `'--font-body'`, `'--font-ui'`
- Aplicar las variables al `<html>` junto con los colores de `SiteConfig` (ver Fase 7)

### 1.5 — Componentes UI base
Implementar en orden (sin dependencias entre ellos — pueden hacerse en paralelo):
- `components/ui/LogoCGE.tsx` — SVG fiel al mockup, acepta prop `size?: number`
- `components/ui/GoldLine.tsx` — `<span className="gold-line" />`
- `components/ui/Ornament.tsx` — acepta `children` (texto o SVG)
- `components/ui/DeptBadge.tsx` — acepta `dept: Departamento`, mapea a clase y label
- `components/ui/StatCounter.tsx` — `"use client"`, IntersectionObserver, animación easeOutCubic

### 1.6 — Header
- `components/layout/Header.tsx` — `"use client"` (active nav link)
- Top bar con lema (viene de `SiteConfig.siteSlogan` — por ahora prop, conectar en Fase 7)
- Logo `<LogoCGE />` + nombre del sitio
- Nav links: Inicio, Noticias, Eventos, Rankings, Ejércitos, Mediación
- CTA "Afiliar Ejército"
- Active state via `usePathname()`

### 1.7 — Footer
- `components/layout/Footer.tsx` — Server Component
- 4 columnas: brand + Organismo + Comunidad + Noticias
- `<GoldLine />` separador
- Copyright dinámico (año de `SiteConfig.foundedYear`)
- Lema `SiteConfig.siteSlogan`

### 1.8 — Root layout
- `app/layout.tsx` — Server Component
- Fuentes, metadata base
- `<Header />`, `{children}`, `<Footer />`
- `<RadioProvider initialConfig={null}>` (conectar en Fase 6)
- Padding bottom `pb-[68px]` para no tapar el radio player

---

## Fase 2 — Base de datos + Prisma

> Dependencia: 1.2 (dependencias instaladas)

### 2.1 — Schema Prisma v1.2
Crear `prisma/schema.prisma` con todos los modelos:
- `User` (con `departamento: Departamento?`)
- `Ejercito` (con relación a `ActividadEjercito`)
- `Noticia` (con `imagenUrl?` e `imagenKey?`)
- `Evento` (con `slug`, `puntos`, relación a `ActividadEjercito`)
- `ActividadEjercito`
- `Mediacion` (con `noticiaId?`)
- `RadioConfig`
- `SiteConfig` (con `colorNoticias`, `colorWireds`, `colorJuzgado`, `colorOficial`)
- Enums: `Role`, `Departamento`, `EstadoMediacion`

### 2.2 — Variables de entorno
Crear `.env.example` con:
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
SEED_ADMIN_USERNAME=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
STORAGE_PROVIDER=none
```
Crear `.env` local (no commitear — agregar a `.gitignore`)

### 2.3 — Cliente Prisma singleton
```ts
// lib/prisma.ts
// PrismaClient singleton para evitar múltiples instancias en dev (hot reload)
```

### 2.4 — Migración inicial
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 2.5 — Seed
`prisma/seed.ts`:
- Lee `SEED_ADMIN_USERNAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` del `.env`
- Falla con mensaje claro si `SEED_ADMIN_PASSWORD` no está definida
- Crea usuario ADMIN con password hasheado con `bcryptjs`
- Crea 4 ejércitos: F.A.M, A.F, F.E.S, G.F.S
- `upsert` de `RadioConfig` con defaults
- `upsert` de `SiteConfig` con defaults (incluyendo colores de departamento)
- Configurar `"prisma": { "seed": "ts-node prisma/seed.ts" }` en `package.json`

---

## Fase 3 — Autenticación

> Dependencia: Fase 2 completa

### 3.1 — Configurar NextAuth v5
`lib/auth.ts`:
- `Credentials` provider: busca usuario por `username`, compara password con `bcryptjs.compare`
- `jwt` callback: agrega `id`, `username`, `role`, `ejercitoId` al token
- `session` callback: expone `user.id`, `user.username`, `user.role`, `user.ejercitoId`
- `pages`: `signIn: '/login'`

### 3.2 — API route NextAuth
`app/api/auth/[...nextauth]/route.ts` — exporta `GET` y `POST` desde `lib/auth`

### 3.3 — Augmentación de tipos
`types/next-auth.d.ts`:
- Extender `Session.user` con `id`, `username`, `role`, `ejercitoId?`
- Extender `JWT` con los mismos campos

### 3.4 — Middleware de protección
`middleware.ts`:
- `export { auth as middleware } from "@/lib/auth"`
- `matcher: ["/dashboard/:path*"]`

### 3.5 — Página de login
`app/login/page.tsx` — `"use client"`:
- Form: `username` + `password`
- Llama a `signIn('credentials', { username, password })`
- Manejo de error "CredentialsSignin"
- Redirect a `/dashboard` si ya hay sesión activa
- Estilo fiel al mockup (superficie oscura, input con borde dorado, botón primario)

---

## Fase 4 — Rutas públicas

> Dependencia: Fase 2 (Prisma). Fase 3 no es requerida para rutas públicas.  
> Las subtareas 4.1 a 4.6 pueden implementarse en paralelo.

### 4.1 — Landing page (`/`)
`app/page.tsx` — Server Component:
- Query paralela: noticia destacada, últimas 4 noticias, ranking top 4, afiliados activos, próximos 3 eventos
- Secciones: Hero, StatsBar, MainLayout (NewsFeed + Sidebar), MissionSection
- `<StatCounter />` para las 4 estadísticas
- Hero: `<LogoCGE size={110} />`, título, subtítulo, descripción, botones CTA
- Sidebar: `<ComunicadoWidget />`, `<AffiliatesWidget />`, `<RankingWidget />`, `<DeptLegend />`, `<EventsWidget />`
- MissionSection: tres pilares (Mediación, Eventos, Prensa Oficial)
- `export const revalidate = 60`

### 4.2 — Widgets del sidebar
Implementar en paralelo (todos Server Components, reciben data como props):
- `components/widgets/ComunicadoWidget.tsx` — comunicado del Concilio (de `SiteConfig` o hardcoded inicial)
- `components/widgets/RankingWidget.tsx` — lista top ejércitos con posición, escudo, puntos
- `components/widgets/AffiliatesWidget.tsx` — lista ejércitos activos con sigla, nombre, dot verde
- `components/widgets/EventsWidget.tsx` — próximos eventos con date box (día/mes)
- `components/widgets/DeptLegend.tsx` — leyenda de colores por departamento

### 4.3 — Noticias (`/noticias` + `/noticias/[slug]`)
- `components/noticias/NewsCardFeatured.tsx` — Server, recibe `Noticia` con autor
- `components/noticias/NewsCardSmall.tsx` — Server, grid 4px dept-bar + thumb + content
- `components/noticias/NewsFeed.tsx` — `"use client"`, filtro de departamento por tab/botón
- `app/noticias/page.tsx` — Server, fetch todas las publicadas, pasa a `<NewsFeed />`
- `app/noticias/[slug]/page.tsx` — Server, fetch por slug, render contenido Tiptap HTML sanitizado con `isomorphic-dompurify`, `generateStaticParams` para publicadas
- `export const revalidate = 60` en ambas páginas

### 4.4 — Eventos (`/eventos` + `/eventos/[slug]`)
- `app/eventos/page.tsx` — lista de eventos ordenados por fecha
- `app/eventos/[slug]/page.tsx` — detalle de evento individual

### 4.5 — Rankings (`/rankings`)
- `app/rankings/page.tsx` — tabla completa de ejércitos por puntos
- Mostrar `ActividadEjercito` count como "actividades"

### 4.6 — Ejércitos (`/ejercitos` + `/ejercitos/[slug]`)
- `components/ejercitos/EjercitoCard.tsx` — Server, card con sigla, nombre, puntos, activo
- `components/ejercitos/EjercitoFicha.tsx` — Server, ficha pública completa
- `app/ejercitos/page.tsx` — grid de todas las EjercitoCard
- `app/ejercitos/[slug]/page.tsx` — slug = `sigla.toLowerCase().replace('.', '')` → `fam`, `af`, `fes`, `gfs`
- `generateStaticParams` para ejércitos activos

### 4.7 — Mediación pública (`/mediacion`)
- `app/mediacion/page.tsx` — `"use client"`
- Form: solicitante, ejército1, ejército2, descripción
- POST a `/api/mediaciones`
- Estado: idle → loading → success/error
- No requiere autenticación

### 4.8 — API Routes públicas
Implementar en paralelo:
- `app/api/noticias/route.ts` — GET (filtros: `dept`, `publicada`, `destacada`, `page`, `limit`)
- `app/api/noticias/[slug]/route.ts` — GET individual
- `app/api/ejercitos/route.ts` — GET (filtro: `activo`)
- `app/api/ejercitos/[slug]/route.ts` — GET individual
- `app/api/eventos/route.ts` — GET (filtro: `upcoming`)
- `app/api/rankings/route.ts` — GET (ordenado por puntos desc)
- `app/api/mediaciones/route.ts` — POST público (crear solicitud)
- `app/api/radio/route.ts` — GET (config actual)
- `app/api/site-config/route.ts` — GET público (colores, nombre, slogan para SSR)

---

## Fase 5 — Dashboards

> Dependencia: Fase 3 completa (auth)

### 5.1 — DashboardLayout
`app/dashboard/layout.tsx` — Server Component:
- `await auth()` → redirect a `/login` si no hay sesión
- `components/layout/DashboardLayout.tsx`: sidebar de navegación por rol, header con usuario, contenido

### 5.2 — Redirect por rol
`app/dashboard/page.tsx`:
- Lee `session.user.role`
- `redirect('/dashboard/admin')` si ADMIN, etc.
- Fallback a `/` si VISITANTE

### 5.3 — Dashboard ADMIN
`app/dashboard/admin/page.tsx` — Server, verifica `role === 'ADMIN'`

Secciones (cada una como componente separado en `app/dashboard/admin/`):
- **Stats**: ejércitos activos, noticias publicadas, mediaciones pendientes, usuarios totales
- **Ejércitos**: tabla con sigla, nombre, activo, puntos — acciones: aprobar, suspender
- **Usuarios**: tabla con username, email, rol, departamento — acción: editar rol/departamento
- **Actividades/Puntos**: form para registrar actividad (ejército, evento opcional, descripción, puntos), tabla historial
- **Mediaciones**: tabla completa con estado y juez asignado
- **Radio**: form con todos los campos de `RadioConfig` (toggle, stream, nombre, DJ, avatar, track)
- Navegación por tabs entre secciones

### 5.4 — Dashboard REPORTERO
`app/dashboard/reportero/page.tsx` — Server, verifica `role === 'REPORTERO'`

- Muestra departamento asignado (`session.user` → query User para `departamento`)
- Lista de sus noticias (borrador / publicada) con filtro de estado
- Botón "+ Nueva Noticia" → abre form en `/dashboard/reportero/nueva`
- `app/dashboard/reportero/nueva/page.tsx`:
  - Tiptap editor con `next/dynamic` sin SSR
  - Campos: título, extracto, contenido (Tiptap), imagen (URL + upload dual), departamento (fijo = su departamento), destacada toggle
  - Acción: guardar borrador / publicar
- `app/dashboard/reportero/[id]/editar/page.tsx`: misma forma, precargada

### 5.5 — Dashboard COMANDANTE
`app/dashboard/comandante/page.tsx` — Server, verifica `role === 'COMANDANTE'`

- Ficha de su ejército: sigla, nombre, descripción, escudo, puntos, ranking
- Historial de `ActividadEjercito` de su ejército
- Form para editar descripción y URL del escudo
- Lista de mediaciones de su ejército (filtradas por `ejercito1` o `ejercito2`)
- Botón "Solicitar mediación" → form modal o subpágina

### 5.6 — Dashboard JUEZ
`app/dashboard/juez/page.tsx` — Server, verifica `role === 'JUEZ'`

- Tabs: Pendientes / Mis casos / Historial
- **Pendientes**: lista de mediaciones con estado PENDIENTE, botón "Tomar caso"
- **Mis casos**: mediaciones donde `juezId === session.user.id`
- **Caso activo**: Tiptap editor para escribir resolución
- Al publicar resolución:
  1. `PATCH /api/mediaciones/[id]` → `{ estado: 'RESUELTO', resolucion, juezId }`
  2. `POST /api/noticias` → crea noticia automática con `departamento: 'JUZGADO'`, `publicada: true`
  3. `PATCH /api/mediaciones/[id]` → agrega `noticiaId` de la noticia creada

### 5.7 — API Routes protegidas
- `app/api/noticias/route.ts` — POST (REPORTERO, ADMIN): crear noticia con slug auto-generado
- `app/api/noticias/[slug]/route.ts` — PATCH/DELETE (autor o ADMIN)
- `app/api/ejercitos/route.ts` — POST (ADMIN): crear ejército
- `app/api/ejercitos/[slug]/route.ts` — PATCH (COMANDANTE propio o ADMIN)
- `app/api/mediaciones/route.ts` — GET (JUEZ/ADMIN/COMANDANTE filtrado por rol)
- `app/api/mediaciones/[id]/route.ts` — PATCH (JUEZ/ADMIN)
- `app/api/actividades/route.ts` — GET/POST (ADMIN)
- `app/api/radio/route.ts` — PATCH (ADMIN)
- `app/api/site-config/route.ts` — PATCH (ADMIN)
- `app/api/usuarios/route.ts` — GET/PATCH (ADMIN): listar usuarios, cambiar rol/departamento

---

## Fase 6 — Módulo Radio

> Dependencia: Fase 2 (RadioConfig en DB), Fase 1.8 (layout raíz)

### 6.1 — useRadio hook
`components/radio/useRadio.ts`:
- Tipos: `RadioState`, `RadioActions`
- No hace nada por sí solo — consume el contexto de `RadioProvider`

### 6.2 — RadioProvider
`components/radio/RadioProvider.tsx` — `"use client"`:
- Recibe `initialConfig: RadioConfig | null` como prop
- `audioRef = useRef<HTMLAudioElement>(null)`
- Estado: `isPlaying`, `isMuted`, `volume` (0-100)
- `play()`: asigna `audio.src = config.streamUrl`, `audio.volume = volume/100`, `audio.play()`
- `pause()`: `audio.pause()`, `audio.src = ""` — CRÍTICO: corta el stream de red
- `setVolume(v)`: actualiza estado y `audio.volume`
- `toggleMute()`: `audio.muted = !audio.muted`
- Render: `{initialConfig?.enabled && <RadioPlayer />}`
- `<audio ref={audioRef} preload="none" />`

### 6.3 — RadioPlayer
`components/radio/RadioPlayer.tsx` — `"use client"`:
- Consume `useRadio()`
- Layout fiel al mockup: 68px fixed bottom, borde superior dorado
- Secciones: ON AIR (dot animado), divider, avatar DJ (pixelado, `image-rendering: pixelated`), info (dj name + track), wave visualizer, divider, controles (play/pause), volumen (mute btn + slider), nombre radio
- Wave visualizer: 6 barras con animación CSS — pausa cuando `!isPlaying`
- Dot ON AIR: animación `pulse-red` definida en `globals.css`
- Todas las animaciones CSS en `@layer base` o `globals.css` (no Tailwind)

### 6.4 — Integrar en layout
`app/layout.tsx`:
- Fetch `radioConfig` y `siteConfig` en paralelo
- `<RadioProvider initialConfig={radioConfig}>` envuelve el contenido

---

## Fase 7 — SiteConfig

> Dependencia: Fase 2 (SiteConfig en DB). Puede hacerse en paralelo con Fase 4 y 5.

### 7.1 — Fetch SiteConfig en layout
`app/layout.tsx`:
- `Promise.all([prisma.radioConfig.findFirst(), prisma.siteConfig.findFirst()])`
- Pasar `siteConfig` a `<Header />` y `<Footer />` como props
- Inyectar colores de departamento como CSS variables inline en `<html>`:
  ```tsx
  const deptColors = {
    '--color-noticias': siteConfig?.colorNoticias ?? '#d46b8a',
    '--color-wireds':   siteConfig?.colorWireds   ?? '#5bb8d4',
    '--color-juzgado':  siteConfig?.colorJuzgado  ?? '#C9A84C',
    '--color-oficial':  siteConfig?.colorOficial  ?? '#7A5C18',
  } as React.CSSProperties
  ```
- `generateMetadata()`: usa `siteConfig.siteName` + `siteConfig.siteDescription`

### 7.2 — Panel de configuración del sitio (Dashboard ADMIN)
`app/dashboard/admin/configuracion/page.tsx` — `"use client"`:
- Form con todos los campos de `SiteConfig`:
  - Nombre del sitio, subtítulo, slogan
  - Descripción (textarea)
  - Texto del footer
  - Año de fundación
  - Color primario (color picker)
  - **Colores de departamento**: 4 color pickers con label (Noticias, Wireds, Juzgado, Oficial) — preview en tiempo real del badge con el color elegido
  - Logo SVG (textarea para pegar SVG custom)
  - URL del favicon
- Submit: PATCH `/api/site-config`
- `revalidatePath('/')` en el server action / route handler para que el layout refetch

### 7.3 — `lib/slugify.ts`
Helper centralizado:
```ts
import slugifyLib from 'slugify'
export function slugify(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, locale: 'es' })
}
```

---

## Resumen de dependencias entre fases

```
Fase 1 (Fundación)
    ↓
Fase 2 (DB + Prisma)
    ↓
Fase 3 (Auth) ──────────────── Fase 4 (Rutas públicas)  ←── puede arrancar junto con Fase 3
    ↓                                    ↓
Fase 5 (Dashboards) ←─────── necesita Fase 3
    ↓
Fase 6 (Radio) ←──────── necesita Fase 2 + Fase 1.8
Fase 7 (SiteConfig) ←─── necesita Fase 2, se integra en Fase 1.4 y 1.8
```

---

## Checklist completo

### Fase 1
- [ ] 1.1 Inicializar proyecto Next.js
- [ ] 1.2 Instalar dependencias
- [ ] 1.3 globals.css con @theme completo
- [ ] 1.4 Fuentes en layout.tsx
- [ ] 1.5 Componentes UI base (LogoCGE, GoldLine, Ornament, DeptBadge, StatCounter)
- [ ] 1.6 Header
- [ ] 1.7 Footer
- [ ] 1.8 Root layout

### Fase 2
- [ ] 2.1 Schema Prisma v1.2
- [ ] 2.2 Variables de entorno (.env.example)
- [ ] 2.3 Cliente Prisma singleton
- [ ] 2.4 Migración inicial
- [ ] 2.5 Seed

### Fase 3
- [ ] 3.1 NextAuth v5 config
- [ ] 3.2 API route auth
- [ ] 3.3 Tipos next-auth.d.ts
- [ ] 3.4 Middleware
- [ ] 3.5 Página de login

### Fase 4
- [ ] 4.1 Landing page
- [ ] 4.2 Widgets del sidebar
- [ ] 4.3 Noticias (feed + artículo)
- [ ] 4.4 Eventos
- [ ] 4.5 Rankings
- [ ] 4.6 Ejércitos (lista + ficha)
- [ ] 4.7 Mediación pública
- [ ] 4.8 API Routes públicas

### Fase 5
- [ ] 5.1 DashboardLayout
- [ ] 5.2 Redirect por rol
- [ ] 5.3 Dashboard ADMIN
- [ ] 5.4 Dashboard REPORTERO
- [ ] 5.5 Dashboard COMANDANTE
- [ ] 5.6 Dashboard JUEZ
- [ ] 5.7 API Routes protegidas

### Fase 6
- [ ] 6.1 useRadio hook
- [ ] 6.2 RadioProvider
- [ ] 6.3 RadioPlayer
- [ ] 6.4 Integrar en layout

### Fase 7
- [ ] 7.1 Fetch SiteConfig en layout + inyección CSS vars
- [ ] 7.2 Panel configuración (dashboard admin)
- [ ] 7.3 lib/slugify.ts

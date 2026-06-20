# Documento de Diseño Arquitectónico
# Concilio General de Ejércitos — cge-platform-foundation

**Proyecto**: concenso-hb  
**Versión**: 2.0  
**Fecha**: 2026-06-18  
**Estado**: Aprobado — en implementación  

---

## 1. Visión General

La plataforma CGE es una aplicación fullstack monorepo construida sobre Next.js 14 App Router. No existe servidor separado — toda la lógica de backend vive en API Routes y Server Components dentro del mismo proyecto, desplegable en Vercel sin configuración adicional de infraestructura.

```
┌─────────────────────────────────────────────────────┐
│                   Vercel Edge                        │
│  ┌─────────────────────────────────────────────┐   │
│  │           Next.js 14 App Router              │   │
│  │  ┌──────────────┐  ┌────────────────────┐   │   │
│  │  │ RSC + Pages  │  │   API Routes       │   │   │
│  │  │  (UI layer)  │  │  /api/**           │   │   │
│  │  └──────────────┘  └────────────────────┘   │   │
│  │              ↕ Prisma Client                 │   │
│  └─────────────────────────────────────────────┘   │
│                       ↕                             │
│           Vercel Postgres / Supabase                 │
└─────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Directorios

```
concenso-hb/
├── app/
│   ├── globals.css                    ← @theme tokens + @layer base/components
│   ├── layout.tsx                     ← Root layout (Server): fonts, RadioProvider, Header, Footer
│   ├── page.tsx                       ← Landing page (Server Component)
│   ├── login/
│   │   └── page.tsx
│   ├── noticias/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── eventos/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── rankings/page.tsx
│   ├── ejercitos/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── mediacion/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                 ← DashboardLayout (Server: verifica auth)
│   │   ├── page.tsx                   ← Redirect por rol
│   │   ├── admin/page.tsx
│   │   ├── reportero/page.tsx
│   │   ├── comandante/page.tsx
│   │   └── juez/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── noticias/
│       │   ├── route.ts
│       │   └── [slug]/route.ts
│       ├── ejercitos/
│       │   ├── route.ts
│       │   └── [slug]/route.ts
│       ├── eventos/route.ts
│       ├── mediaciones/route.ts
│       ├── rankings/route.ts
│       └── radio/route.ts
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx                 ← "use client" (nav active state)
│   │   ├── Footer.tsx                 ← Server Component
│   │   └── DashboardLayout.tsx        ← Server Component
│   ├── ui/
│   │   ├── LogoCGE.tsx                ← Server (pure SVG)
│   │   ├── DeptBadge.tsx              ← Server (presentational)
│   │   ├── StatCounter.tsx            ← "use client" (IntersectionObserver)
│   │   ├── GoldLine.tsx               ← Server
│   │   └── Ornament.tsx               ← Server
│   ├── noticias/
│   │   ├── NewsCardFeatured.tsx       ← Server
│   │   ├── NewsCardSmall.tsx          ← Server
│   │   └── NewsFeed.tsx               ← "use client" (filtro departamento)
│   ├── widgets/
│   │   ├── RankingWidget.tsx          ← Server
│   │   ├── AffiliatesWidget.tsx       ← Server
│   │   ├── EventsWidget.tsx           ← Server
│   │   ├── DeptLegend.tsx             ← Server
│   │   └── ComunicadoWidget.tsx       ← Server
│   ├── ejercitos/
│   │   ├── EjercitoCard.tsx           ← Server
│   │   └── EjercitoFicha.tsx          ← Server
│   └── radio/
│       ├── RadioProvider.tsx          ← "use client" (Context + AudioAPI)
│       ├── RadioPlayer.tsx            ← "use client"
│       └── useRadio.ts                ← hook custom
│
├── lib/
│   ├── prisma.ts                      ← Singleton Prisma client
│   ├── auth.ts                        ← NextAuth v5 config
│   └── slugify.ts                     ← Slugify helper (locale es)
│
├── types/
│   └── next-auth.d.ts                 ← Augmentación Session + JWT
│
├── middleware.ts                       ← Protección /dashboard/*
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
└── openspec/                          ← SDD artifacts
```

---

## 3. Sistema de Estilos — TailwindCSS v4

### Principio crítico
**NO existe `tailwind.config.js`**. Tailwind v4 eliminó este archivo. Toda la configuración de tokens vive en `app/globals.css` usando la directiva `@theme`.

### Estructura de globals.css

```css
@import "tailwindcss";

@theme {
  /* === COLORES === */
  --color-bg:              #080807;
  --color-surface:         #0e0d0b;
  --color-surface-2:       #131210;
  --color-surface-offset:  #181614;
  --color-surface-accent:  #1c1a14;

  --color-border:          oklch(0.85 0.05 75 / 0.10);
  --color-border-gold:     oklch(0.75 0.12 75 / 0.32);
  --color-divider:         oklch(0.85 0.05 75 / 0.07);

  --color-text:            #e8e0cc;
  --color-text-muted:      #9a9080;
  --color-text-faint:      #565048;
  --color-text-inverse:    #080807;

  --color-gold:            #C9A84C;
  --color-gold-bright:     #E4C060;
  --color-gold-dark:       #7A5C18;
  --color-gold-highlight:  oklch(0.75 0.12 75 / 0.10);

  /* Departamentos */
  --color-noticias:        #d46b8a;
  --color-noticias-bg:     oklch(0.55 0.12 0 / 0.10);
  --color-noticias-border: oklch(0.55 0.12 0 / 0.30);
  --color-wireds:          #5bb8d4;
  --color-wireds-bg:       oklch(0.6 0.1 215 / 0.10);
  --color-wireds-border:   oklch(0.6 0.1 215 / 0.28);

  /* Radio */
  --color-onair:           #e05050;

  /* === TIPOGRAFÍA === */
  --font-display: 'Cinzel', Georgia, serif;
  --font-body:    'Crimson Pro', Georgia, serif;
  --font-ui:      'Inter', 'Helvetica Neue', sans-serif;

  /* === ESPACIADO === */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;

  /* === RADIOS === */
  --radius-sm:   0.25rem;
  --radius-md:   0.375rem;
  --radius-lg:   0.5rem;
  --radius-xl:   0.75rem;
  --radius-full: 9999px;

  /* === SOMBRAS === */
  --shadow-sm:   0 1px 3px oklch(0 0 0 / 0.5);
  --shadow-md:   0 4px 16px oklch(0 0 0 / 0.55);
  --shadow-lg:   0 12px 40px oklch(0 0 0 / 0.65);
  --shadow-gold: 0 0 28px oklch(0.75 0.12 75 / 0.18);
}

@layer base {
  /* Reset + grain + fuentes */
}

@layer components {
  /* gold-line, ornament, news-tag, btn-primary, btn-secondary */
}
```

### Fuentes — next/font/google
```tsx
// app/layout.tsx
import { Cinzel, Crimson_Pro, Inter } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-display', weight: ['400','600','700','900'] })
const crimsonPro = Crimson_Pro({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','600'], style: ['normal','italic'] })
const inter = Inter({ subsets: ['latin'], variable: '--font-ui', weight: ['300','400','500','600'] })
```

---

## 4. Autenticación — NextAuth v5

### Flujo completo

```
Usuario POST /api/auth/signin
          ↓
   Credentials Provider
   (validar username + password bcryptjs)
          ↓
   jwt callback → token = { id, username, email, role, ejercitoId }
          ↓
   session callback → session.user = { id, username, role, ejercitoId }
          ↓
   Cookie JWT httpOnly firmada (NextAuth gestiona esto)
```

### Middleware — `/middleware.ts`

```ts
export { auth as middleware } from "@/lib/auth"
export const config = {
  matcher: ["/dashboard/:path*"]
}
```

El middleware de NextAuth v5 rechaza peticiones sin token válido y redirige a `/login`.

### Verificación de rol en page.tsx

```ts
// app/dashboard/admin/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")
  // ...
}
```

### Augmentación TypeScript

```ts
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      role: "ADMIN" | "REPORTERO" | "COMANDANTE" | "JUEZ" | "VISITANTE"
      ejercitoId?: string
    }
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: "ADMIN" | "REPORTERO" | "COMANDANTE" | "JUEZ" | "VISITANTE"
    ejercitoId?: string
  }
}
```

---

## 5. Schema Prisma — Versión Final

Cambios confirmados respecto a spec original:
- `User.departamento: Departamento?` — REPORTERO necesita saber en qué departamento puede publicar
- `Noticia.imagenUrl + imagenKey` — preparado para upload dual (archivo propio + URL externa)
- `Evento.slug` — para ruta `/eventos/[slug]`
- `Mediacion.noticiaId` — link a noticia JUZGADO auto-generada
- `Actividad` — nuevo modelo para el sistema de puntos automático (Q2)
- `SiteConfig` — nuevo modelo singleton para configuración general del sitio (Q3)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  REPORTERO
  COMANDANTE
  JUEZ
  VISITANTE
}

enum Departamento {
  NOTICIAS
  WIREDS
  JUZGADO
  OFICIAL
}

enum EstadoMediacion {
  PENDIENTE
  EN_PROCESO
  RESUELTO
  CERRADO
}

model User {
  id            String        @id @default(cuid())
  username      String        @unique
  email         String        @unique
  password      String
  role          Role          @default(VISITANTE)
  departamento  Departamento? // Solo relevante para REPORTERO
  ejercitoId    String?
  ejercito      Ejercito?     @relation(fields: [ejercitoId], references: [id])
  noticias      Noticia[]
  createdAt     DateTime      @default(now())
  eventos       Evento[]      @relation("EventosAsistentes")
}

model Ejercito {
  id          String      @id @default(cuid())
  sigla       String      @unique
  nombre      String
  descripcion String?
  escudo      String?
  fundador    String
  activo      Boolean     @default(true)
  miembros    User[]
  ranking     Int?
  puntos      Int         @default(0)
  actividades ActividadEjercito[]
  createdAt   DateTime    @default(now())
}

model Noticia {
  id           String       @id @default(cuid())
  titulo       String
  slug         String       @unique
  extracto     String
  contenido    String       @db.Text
  imagenUrl    String?      // URL externa (opción B del upload dual)
  imagenKey    String?      // Clave del archivo subido al storage provider (opción A)
  departamento Departamento
  destacada    Boolean      @default(false)
  publicada    Boolean      @default(false)
  autor        User         @relation(fields: [autorId], references: [id])
  autorId      String
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model Evento {
  id          String    @id @default(cuid())
  nombre      String
  slug        String    @unique
  descripcion String
  fecha       DateTime
  tipo        String
  puntos      Int       @default(0) // Puntos que otorga participar/ganar este evento
  asistentes  User[]    @relation("EventosAsistentes")
  actividades ActividadEjercito[]
  createdAt   DateTime  @default(now())
}

// Registro de puntos por actividad/evento — permite auditoría y recálculo
model ActividadEjercito {
  id         String   @id @default(cuid())
  ejercitoId String
  ejercito   Ejercito @relation(fields: [ejercitoId], references: [id])
  eventoId   String?
  evento     Evento?  @relation(fields: [eventoId], references: [id])
  descripcion String  // Ej: "Participación en torneo", "Premio evento"
  puntos     Int      // Puede ser positivo o negativo
  registradoPor String // userId del admin que lo registró
  createdAt  DateTime @default(now())
}

model Mediacion {
  id          String          @id @default(cuid())
  solicitante String
  ejercito1   String
  ejercito2   String
  descripcion String          @db.Text
  estado      EstadoMediacion @default(PENDIENTE)
  resolucion  String?         @db.Text
  juezId      String?
  noticiaId   String?         // Link a noticia JUZGADO auto-generada al resolver
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model RadioConfig {
  id           String   @id @default(cuid())
  enabled      Boolean  @default(false)
  streamUrl    String   @default("")
  radioName    String   @default("CGE Radio")
  djName       String   @default("DJ")
  djAvatarUrl  String   @default("")
  currentTrack String   @default("En vivo")
  updatedAt    DateTime @updatedAt
}

// Configuración general del sitio — singleton, todo administrable desde panel
model SiteConfig {
  id              String   @id @default(cuid())
  siteName        String   @default("Concilio General de Ejércitos")
  siteSubtitle    String   @default("Organismo Conciliador · Habbo.es")
  siteSlogan      String   @default("⚔ UNIDAD · HONOR · ORDEN ⚔")
  siteDescription String   @default("Organismo independiente y neutral de los ejércitos de Habbo.")
  logoSvg         String?  @db.Text  // SVG custom si el admin quiere reemplazar el logo
  faviconUrl      String?
  metaKeywords    String   @default("habbo, ejércitos, concilio, hispano")
  footerText      String   @default("Organismo independiente, neutral y conciliador de la comunidad de ejércitos de Habbo. Fundado en 2026.")
  foundedYear     Int      @default(2026)
  primaryColor       String   @default("#C9A84C")  // Para futura personalización de tema
  // Colores de departamento — editables desde panel admin
  colorNoticias      String   @default("#d46b8a")
  colorWireds        String   @default("#5bb8d4")
  colorJuzgado       String   @default("#C9A84C")
  colorOficial       String   @default("#7A5C18")
  updatedAt          DateTime @updatedAt
}
```

---

## 6. Módulo Radio

### Arquitectura del módulo

```
app/layout.tsx (Server Component)
   │
   ├── fetch radioConfig from DB
   │
   └── <RadioProvider initialConfig={radioConfig}>   ← "use client"
         │
         ├── Context: { config, isPlaying, isMuted, volume, play, pause, setVolume, toggleMute }
         │
         └── {config?.enabled && <RadioPlayer />}     ← render condicional
```

### RadioProvider — estado y lógica

```
Estado:
  isPlaying: boolean
  isMuted: boolean
  volume: number (0-100)
  config: RadioConfig | null

Refs:
  audioRef: RefObject<HTMLAudioElement>

Lógica play:
  audioRef.current.src = config.streamUrl
  audioRef.current.volume = volume / 100
  audioRef.current.play()
  setIsPlaying(true)
  
Lógica pause:
  audioRef.current.pause()
  audioRef.current.src = ""   ← CRÍTICO: corta el stream de red
  setIsPlaying(false)
```

### RadioPlayer — estructura visual

```
[ON AIR ●] | [Avatar DJ] [DJ Name / Track] [~~~~] | [▶/⏸] [🔊 ────●────] [CGE Radio]
```

Fiel al HTML mockup: 68px altura, fixed bottom, borde superior dorado, grain overlay.

### Admin Dashboard — sección Radio

Form con campos:
- Toggle ON/OFF (enabled)
- URL del stream (streamUrl)
- Nombre de la radio (radioName)
- Nombre del DJ (djName)
- URL del avatar del DJ (djAvatarUrl)
- Track actual (currentTrack)

Al guardar → PATCH `/api/radio` → `prisma.radioConfig.upsert()` → `revalidatePath('/')` para que el layout refetch la config.

---

## 7. API Routes — Contratos

### Convenciones
- Todas las rutas protegidas verifican sesión con `await auth()`
- Respuesta siempre JSON
- Errores: `{ error: string }` con HTTP status apropiado

| Endpoint | Método | Auth requerida | Acción |
|----------|--------|----------------|--------|
| `/api/noticias` | GET | No | Listar publicadas (con filtros) |
| `/api/noticias` | POST | REPORTERO, ADMIN | Crear noticia |
| `/api/noticias/[slug]` | GET | No | Noticia individual |
| `/api/noticias/[slug]` | PATCH | Autor o ADMIN | Actualizar |
| `/api/noticias/[slug]` | DELETE | Autor o ADMIN | Eliminar |
| `/api/ejercitos` | GET | No | Listar activos |
| `/api/ejercitos` | POST | ADMIN | Crear ejército |
| `/api/ejercitos/[slug]` | GET | No | Ficha pública |
| `/api/ejercitos/[slug]` | PATCH | COMANDANTE (propio) o ADMIN | Actualizar |
| `/api/eventos` | GET | No | Listar próximos |
| `/api/eventos` | POST | ADMIN | Crear evento |
| `/api/mediaciones` | GET | JUEZ, ADMIN, COMANDANTE | Listar (filtrado por rol) |
| `/api/mediaciones` | POST | No (form público) | Crear solicitud |
| `/api/mediaciones/[id]` | PATCH | JUEZ, ADMIN | Actualizar estado/resolución |
| `/api/rankings` | GET | No | Rankings por período |
| `/api/radio` | GET | No | Config actual |
| `/api/radio` | PATCH | ADMIN | Actualizar config |

---

## 8. Dashboards — Wireframe Funcional

### Dashboard ADMIN
```
┌─ Panel Admin ──────────────────────────────────────────────────────┐
│ [Stats] Ejércitos | Noticias | Mediaciones | Usuarios | Actividades │
│                                                                     │
│ ┌─ Ejércitos ─┐  ┌─ Usuarios ──┐  ┌─ Actividades / Puntos ───────┐│
│ │ Lista + CRUD│  │ Lista + Rol │  │ Registrar actividad          ││
│ │ Aprobar/    │  │ Asignar rol │  │ Ejército + puntos + evento   ││
│ │ Suspender   │  │ Dept (rep)  │  │ Historial de asignaciones    ││
│ └─────────────┘  └─────────────┘  └──────────────────────────────┘│
│ ┌─ Radio ──────────────────────┐  ┌─ Configuración del Sitio ────┐│
│ │ Toggle ON/OFF                │  │ Nombre, slogan, descripción  ││
│ │ Stream URL, DJ, Avatar       │  │ Logo SVG, favicon, colores   ││
│ │ Track actual                 │  │ Texto del footer             ││
│ └──────────────────────────────┘  └──────────────────────────────┘│
│ ┌─ Mediaciones activas ─────────────────────────────────────────┐ │
│ │ Tabla: solicitante | ejércitos | estado | juez asignado       │ │
│ └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Dashboard REPORTERO
```
┌─ Panel Reportero ─────────────────────────────────┐
│ Departamento asignado: [NOTICIAS / WIREDS]         │
│                                                    │
│ [+ Nueva Noticia]                                  │
│ ┌─ Mis Noticias ────────────────────────────────┐ │
│ │ Título | Dept | Estado | Fecha | Acciones     │ │
│ │ (solo su departamento)                         │ │
│ └───────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

### Dashboard COMANDANTE
```
┌─ Panel Comandante ────────────────────────────────┐
│ [Ficha del ejército: sigla, nombre, escudo, pts]   │
│ [Posición en ranking] [Puntos acumulados]          │
│ [Editar descripción / escudo]                      │
│                                                    │
│ ┌─ Mis Mediaciones ─────────────────────────────┐ │
│ │ Lista historial de mediaciones del ejército   │ │
│ └───────────────────────────────────────────────┘ │
│ [Solicitar nueva mediación]                        │
└───────────────────────────────────────────────────┘
```

### Dashboard JUEZ
```
┌─ Panel Juez ──────────────────────────────────────┐
│ [Casos Pendientes] [Mis Casos] [Historial]         │
│                                                    │
│ ┌─ Pendientes ──────────────────────────────────┐ │
│ │ Ejército 1 vs Ejército 2 | Fecha | [Tomar]    │ │
│ └───────────────────────────────────────────────┘ │
│ [Caso activo: editor de resolución (Tiptap)]       │
│ → Al publicar: genera Noticia JUZGADO automática   │
└───────────────────────────────────────────────────┘
```

---

## 9. Seed — Datos Iniciales

El seed **no hardcodea credenciales**. Las lee de variables de entorno para que sean configurables por el admin antes del primer deploy.

```ts
// prisma/seed.ts
// Credenciales del admin inicial vienen del .env — nunca hardcodeadas
const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin"
const adminEmail    = process.env.SEED_ADMIN_EMAIL    ?? "admin@cge.com"
const adminPassword = process.env.SEED_ADMIN_PASSWORD  // REQUERIDO — falla si no existe

const ejercitos = [
  { sigla: 'F.A.M', nombre: 'Fuerza Armada Mexicana',   fundador: 'Sistema' },
  { sigla: 'A.F',   nombre: 'American Force',            fundador: 'Sistema' },
  { sigla: 'F.E.S', nombre: 'Fuerza Especial Suprema',  fundador: 'Sistema' },
  { sigla: 'G.F.S', nombre: 'Génesis de Fuerza Suprema', fundador: 'Sistema' },
]

// RadioConfig singleton
const radioConfig = { enabled: false, radioName: 'CGE Radio', ... }

// SiteConfig singleton
const siteConfig = {
  siteName:    'Concilio General de Ejércitos',
  siteSubtitle: 'Organismo Conciliador · Habbo.es',
  siteSlogan:  '⚔ UNIDAD · HONOR · ORDEN ⚔',
  ...
}
```

`.env` requerido para seed:
```env
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=admin@cge.com
SEED_ADMIN_PASSWORD=<elige-una-segura>
```

---

## 10. Dependencias del Proyecto

```json
{
  "dependencies": {
    "next": "^14",
    "@prisma/client": "latest",
    "next-auth": "^5",
    "bcryptjs": "latest",
    "slugify": "latest",
    "@tiptap/react": "latest",
    "@tiptap/starter-kit": "latest",
    "isomorphic-dompurify": "latest"
  },
  "devDependencies": {
    "prisma": "latest",
    "typescript": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/bcryptjs": "latest",
    "tailwindcss": "^4"
  }
}
```

**Nota sobre storage de imágenes**: la dependencia de upload (`@vercel/blob` o `cloudinary`) se agrega cuando se confirme el provider. El componente `ImageUpload` acepta ambas modalidades vía variable de entorno `STORAGE_PROVIDER=vercel|cloudinary|none`.

---

## 11. Decisiones Arquitectónicas

| ID | Decisión | Alternativa descartada | Razón |
|----|----------|------------------------|-------|
| AD-1 | JWT puro sin DB sessions | Prisma session adapter | Simplicidad; las sesiones no necesitan persistirse entre deploys |
| AD-2 | RadioConfig singleton + upsert | Múltiples configs | Solo existe una configuración de radio activa en todo momento |
| AD-3 | RadioProvider recibe config como prop inicial | Fetch desde client | Evita waterfall; la config viene del Server Component del layout |
| AD-4 | `audio.src = ""` al pausar | `audio.pause()` solo | Corta efectivamente el stream de red, no solo el audio local |
| AD-5 | Slug de ejércitos = sigla lowercase | ID cuid | URLs más legibles: `/ejercitos/fam`, `/ejercitos/gfs` |
| AD-6 | `User.departamento` agregado al schema | Sin campo | REPORTERO necesita saber en qué departamento puede publicar |
| AD-7 | Tiptap con `next/dynamic` sin SSR | Import estático | Tiptap usa APIs de browser; SSR lo rompe |
| AD-8 | `imagenUrl` + `imagenKey` en Noticia | Solo URL | Dual: `imagenKey` para archivo subido, `imagenUrl` para URL externa |
| AD-9 | Storage provider via `STORAGE_PROVIDER` env var | Hardcodeado | Intercambiable sin tocar código; soporta Vercel Blob, Cloudinary, o ninguno |
| AD-10 | `ActividadEjercito` como tabla de auditoría | Campo `puntos` directo en Ejercito | Permite historial, recálculo, y rollback de puntos |
| AD-11 | `SiteConfig` como singleton en DB | Variables de entorno | Todo administrable desde panel ADMIN sin redeploy |
| AD-12 | Credenciales seed via `.env` | Hardcodeadas | Seguridad; cada instalación tiene sus propias credenciales |

---

## 12. Nuevas Rutas y API Routes — Post-Q2/Q3

### Rutas adicionales dashboard ADMIN
```
/dashboard/admin/configuracion   ← Editor de SiteConfig
/dashboard/admin/actividades     ← Registrar puntos / historial
```

### API Routes adicionales
```
app/api/
├── site-config/route.ts         ← GET (público) + PATCH (ADMIN)
└── actividades/route.ts         ← GET (ADMIN) + POST (ADMIN)
```

### SiteConfig en layout raíz
```tsx
// app/layout.tsx (Server Component)
const [radioConfig, siteConfig] = await Promise.all([
  prisma.radioConfig.findFirst(),
  prisma.siteConfig.findFirst(),
])
// siteConfig se pasa a Header, Footer, metadata
// Los colores de departamento se inyectan como CSS variables inline en <html>
// para que sean dinámicos en runtime sin depender del build de Tailwind
```

### Colores de departamento — inyección runtime
Los colores de departamento viven en `SiteConfig` y se inyectan como CSS custom properties en el `<html>` desde el layout raíz. Esto permite que el admin los cambie desde el panel y se reflejen sin redeploy.

```tsx
// app/layout.tsx
const style = {
  '--color-noticias': siteConfig.colorNoticias,
  '--color-wireds':   siteConfig.colorWireds,
  '--color-juzgado':  siteConfig.colorJuzgado,
  '--color-oficial':  siteConfig.colorOficial,
} as React.CSSProperties

return (
  <html lang="es" style={style}>
    ...
  </html>
)
```

Los valores en `@theme` de `globals.css` actúan como **fallback** (valores por defecto cuando la DB aún no tiene datos o durante el primer render). En runtime, el inline style del `<html>` los sobreescribe con los valores de DB.

### Metadata dinámica
```tsx
// app/layout.tsx
export async function generateMetadata() {
  const config = await prisma.siteConfig.findFirst()
  return {
    title: config?.siteName ?? 'Concilio General de Ejércitos',
    description: config?.siteDescription,
  }
}
```

---

## 13. Addendum v2.0 — Nuevos Sistemas

Esta sección documenta los 6 sistemas agregados al alcance original tras la revisión de producto.

---

### 13.1 Arquitectura de Rutas — Revisada

La landing `/` NO es una página independiente de marketing. Es una **portada-resumen** que muestra las últimas noticias, algunos ejércitos destacados y próximos eventos. Cada sección tiene su propia ruta completa.

```
/                    → Portada resumen (últimas noticias, top ejércitos, próximos eventos)
/noticias            → Feed completo paginado, orden descendente, filtro por departamento
/noticias/[slug]     → Artículo individual
/ejercitos           → Todos los ejércitos ordenados, con descripción e info completa
/ejercitos/[slug]    → Ficha pública detallada de un ejército
/eventos             → Calendario completo
/eventos/[slug]      → Evento individual
/rankings            → Rankings completos
/mediacion           → Formulario público de solicitud
/chat                → Chat interno (requiere autenticación)
/registro            → Registro con código de invitación
```

---

### 13.2 Sistema de Invitaciones

#### Flujo completo
```
ADMIN o COMANDANTE genera código
        ↓
Código tiene: creadorId, ejercitoId (opcional), usosMáximos, usosActuales, expiresAt
        ↓
Usuario va a /registro, ingresa código
        ↓
Sistema valida: existe, no expiró, usosActuales < usosMáximos
        ↓
Usuario se registra → queda vinculado a: invitadoPorId + ejercitoId del código (si tiene)
        ↓
usosActuales++ en el código
```

#### Modelo `CodigoInvitacion`
```prisma
model CodigoInvitacion {
  id             String    @id @default(cuid())
  codigo         String    @unique  // string aleatorio legible, ej: "CGE-FAM-X7K2"
  creadoPor      User      @relation("CodigosCreados", fields: [creadoPorId], references: [id])
  creadoPorId    String
  ejercitoId     String?             // Si es código de un ejército, vincula al registrado
  ejercito       Ejercito? @relation(fields: [ejercitoId], references: [id])
  usoMaximo      Int       @default(1) // Configurable desde SiteConfig.maxEmbajadoresPorCodigo
  usosActuales   Int       @default(0)
  activo         Boolean   @default(true)
  expiresAt      DateTime?            // Opcional — null = no expira
  createdAt      DateTime  @default(now())
  usuarios       User[]    @relation("UsuariosInvitados")
}
```

#### Cambios en `User`
```prisma
// Agregar a model User:
invitadoPorId    String?
invitadoPor      User?    @relation("InvitadoPor", fields: [invitadoPorId], references: [id])
invitados        User[]   @relation("InvitadoPor")
codigosCreados   CodigoInvitacion[] @relation("CodigosCreados")
codigoUsadoId    String?
codigoUsado      CodigoInvitacion? @relation("UsuariosInvitados", fields: [codigoUsadoId], references: [id])
```

#### Cambios en `SiteConfig`
```prisma
// Agregar a model SiteConfig:
maxEmbajadoresPorCodigo Int @default(1)  // Límite de usos por código de invitación
registroAbierto         Boolean @default(false) // Si false, SOLO por código
```

#### Página `/registro`
- Si `registroAbierto = true` → registro libre sin código
- Si `registroAbierto = false` → requiere código válido
- Al registrarse con código de ejército → `user.ejercitoId` se asigna automáticamente y `user.role = VISITANTE` (el COMANDANTE luego puede promoverlo a embajador)

---

### 13.3 Sistema de Embajadores

Un embajador es un `User` vinculado a un ejército que actúa como representante. Se distingue visualmente como `{username} — {sigla del ejército}`.

#### Nuevo enum `RolEjercito`
```prisma
enum RolEjercito {
  COMANDANTE   // Dueño del ejército
  OFICIAL      // Oficial de alto rango
  EMBAJADOR    // Representante registrado
  SOLDADO      // Miembro regular
}
```

#### Cambios en `User`
```prisma
// Agregar a model User:
rolEjercito  RolEjercito? // Rol dentro de su ejército (null si no pertenece a ninguno)
```

#### Lógica de permisos por `rolEjercito`
- Solo el `COMANDANTE` puede generar códigos de invitación para su ejército
- El `COMANDANTE` puede cambiar el `rolEjercito` de sus miembros
- Los `EMBAJADOR` y `OFICIAL` pueden escribir en el chat con su identificación de ejército

---

### 13.4 Chat Interno

#### Decisión de transporte: Server-Sent Events (SSE)
- HTTP puro, soportado nativamente en Next.js Route Handlers
- Sin dependencias externas (costo cero)
- Suficiente para el volumen de esta comunidad
- En producción: si Vercel limita las conexiones SSE largas, migrar a Supabase Realtime solo cambia el transporte, no la UI

#### Arquitectura
```
[Mensaje enviado] → POST /api/chat/[channelId]/messages
                         ↓ guarda en DB
                         ↓ emite evento SSE a todos los suscriptores del canal

[Cliente escucha] → GET /api/chat/[channelId]/stream
                         ↓ EventSource en cliente
                         ↓ recibe nuevos mensajes en tiempo real
```

#### Modelos
```prisma
model CanalChat {
  id          String         @id @default(cuid())
  nombre      String         @unique  // ej: "general", "anuncios", "jueces"
  descripcion String?
  privado     Boolean        @default(false) // Si true, solo roles específicos
  rolesPermitidos Role[]     // Roles que pueden ver/escribir (vacío = todos los autenticados)
  mensajes    MensajeChat[]
  createdAt   DateTime       @default(now())
  creadoPor   String
}

model MensajeChat {
  id          String      @id @default(cuid())
  contenido   String      @db.Text
  fijado      Boolean     @default(false)
  autorId     String
  autor       User        @relation(fields: [autorId], references: [id])
  canalId     String
  canal       CanalChat   @relation(fields: [canalId], references: [id])
  createdAt   DateTime    @default(now())
  editadoAt   DateTime?
  eliminado   Boolean     @default(false)  // Soft delete
}
```

#### Rutas del chat
```
/chat                    → Lista de canales disponibles + último mensaje
/chat/[canalId]          → Canal específico con historial + input
```

#### API Routes del chat
```
GET  /api/chat/canales              → listar canales accesibles para el usuario
POST /api/chat/canales              → crear canal (ADMIN)
DELETE /api/chat/canales/[id]       → eliminar canal (ADMIN)
GET  /api/chat/[canalId]/messages   → historial paginado (últimos 50)
POST /api/chat/[canalId]/messages   → enviar mensaje
GET  /api/chat/[canalId]/stream     → SSE stream de mensajes nuevos
PATCH /api/chat/messages/[id]       → fijar/desfijar mensaje (ADMIN, JUEZ)
DELETE /api/chat/messages/[id]      → eliminar mensaje (soft delete, ADMIN)
```

#### Identificación visual en chat
Cada mensaje muestra:
- Avatar placeholder (iniciales del username)
- `username` + badge de ejército si tiene uno (`— F.A.M`)
- Timestamp relativo
- Indicador de rol (dorado para ADMIN/JUEZ, color del ejército para COMANDANTE/EMBAJADOR)

#### Gestión de canales en dashboard ADMIN
- Crear canal: nombre, descripción, privado (sí/no), roles permitidos
- Eliminar canal (con confirmación — elimina todos los mensajes)
- Ver todos los canales con conteo de mensajes

---

### 13.5 Sistema de Incidencias

Las incidencias son el mecanismo formal de denuncia entre ejércitos. La lógica de privacidad es clave: **el ejército denunciado NO sabe que fue denunciado hasta que los jueces actúen**.

#### Flujo de una incidencia
```
COMANDANTE/OFICIAL crea incidencia privada
  → selecciona ejército denunciado
  → adjunta descripción + pruebas (URLs de imágenes/capturas)
  → opcionalmente menciona miembros específicos del ejército denunciado
        ↓
Estado: ABIERTA — solo visible para JUEZ y ADMIN
        ↓
JUEZ toma el caso → Estado: EN_REVISION
        ↓
JUEZ investiga, puede pedir más pruebas (comentarios internos)
        ↓
JUEZ decide:
  a) DESESTIMAR → se archiva, ninguna parte es notificada públicamente
  b) PROCEDER   → Estado: EN_PROCESO → el ejército denunciado es notificado y puede responder
        ↓
JUEZ emite resolución → Estado: RESUELTA
  → Se genera automáticamente una Noticia JUZGADO con la resolución pública
  → Ambas partes ven la resolución en sus respectivos dashboards
```

#### Modelo `Incidencia`
```prisma
enum EstadoIncidencia {
  ABIERTA       // Solo JUEZ y ADMIN la ven
  EN_REVISION   // JUEZ asignado la está revisando
  EN_PROCESO    // El denunciado ya fue notificado
  RESUELTA
  DESESTIMADA
}

model Incidencia {
  id                  String            @id @default(cuid())
  titulo              String
  descripcion         String            @db.Text
  estado              EstadoIncidencia  @default(ABIERTA)
  // Partes
  denuncianteId       String
  denunciante         User              @relation("IncidenciasDenunciante", fields: [denuncianteId], references: [id])
  ejercitoDenuncianteId String
  ejercitoDenunciante Ejercito          @relation("IncidenciasDenunciante", fields: [ejercitoDenuncianteId], references: [id])
  ejercitoDenunciadoId  String
  ejercitoDenunciado  Ejercito          @relation("IncidenciasDenunciado", fields: [ejercitoDenunciadoId], references: [id])
  // Miembros mencionados del ejército denunciado (opcional)
  miembrosMencionados String[]          // array de userIds
  // Pruebas
  pruebas             PruebaIncidencia[]
  // Gestión judicial
  juezId              String?
  juez                User?             @relation("IncidenciasJuez", fields: [juezId], references: [id])
  comentariosInternos ComentarioIncidencia[]
  resolución          String?           @db.Text
  noticiaId           String?           // Noticia JUZGADO auto-generada al resolver
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

model PruebaIncidencia {
  id           String     @id @default(cuid())
  incidenciaId String
  incidencia   Incidencia @relation(fields: [incidenciaId], references: [id])
  tipo         String     // "imagen", "url", "texto"
  valor        String     @db.Text  // URL, texto o path local
  descripcion  String?
  subidoPor    String     // userId
  createdAt    DateTime   @default(now())
}

// Comentarios internos entre jueces y admins — nunca visibles para los ejércitos
model ComentarioIncidencia {
  id           String     @id @default(cuid())
  incidenciaId String
  incidencia   Incidencia @relation(fields: [incidenciaId], references: [id])
  autorId      String
  contenido    String     @db.Text
  createdAt    DateTime   @default(now())
}
```

#### API Routes de incidencias
```
POST /api/incidencias                    → crear (COMANDANTE, OFICIAL)
GET  /api/incidencias                    → listar (filtrado por rol:
                                           JUEZ/ADMIN: todas;
                                           COMANDANTE: solo las propias — las que creó)
GET  /api/incidencias/[id]               → detalle (JUEZ/ADMIN siempre; COMANDANTE solo si es denunciante
                                           O si ya está EN_PROCESO/RESUELTA como denunciado)
PATCH /api/incidencias/[id]              → actualizar estado/resolución (JUEZ, ADMIN)
POST /api/incidencias/[id]/pruebas       → agregar prueba (denunciante o JUEZ)
POST /api/incidencias/[id]/comentarios   → comentario interno (JUEZ, ADMIN)
```

#### Dashboard — visibilidad por rol
- **ADMIN/JUEZ**: todas las incidencias, todos los estados, comentarios internos
- **COMANDANTE/OFICIAL** (denunciante): ve sus propias incidencias y su estado
- **COMANDANTE/OFICIAL** (denunciado): NO ve que existe la incidencia hasta que pasa a `EN_PROCESO`

---

### 13.6 Cambios al Schema existente — Resumen

Cambios adicionales necesarios al schema de la sección 5:

```prisma
// User — campos adicionales v2.0
model User {
  // ... campos existentes ...
  rolEjercito      RolEjercito?       // Rol dentro del ejército
  invitadoPorId    String?
  invitadoPor      User?              @relation("InvitadoPor", fields: [invitadoPorId], references: [id])
  invitados        User[]             @relation("InvitadoPor")
  codigoUsadoId    String?
  codigoUsado      CodigoInvitacion?  @relation("UsuariosInvitados", fields: [codigoUsadoId], references: [id])
  codigosCreados   CodigoInvitacion[] @relation("CodigosCreados")
  mensajes         MensajeChat[]
  incidenciasCreadas    Incidencia[]  @relation("IncidenciasDenunciante")
  incidenciasComoJuez   Incidencia[]  @relation("IncidenciasJuez")
  comentariosIncidencia ComentarioIncidencia[]
}

// Ejercito — campos adicionales v2.0
model Ejercito {
  // ... campos existentes ...
  // Descripción enriquecida editada por el COMANDANTE desde su dashboard
  descripcionRich  String?  @db.Text  // HTML sanitizado de Tiptap
  banner           String?            // URL de imagen banner para /ejercitos/[slug]
  incidenciasDenunciante Incidencia[] @relation("IncidenciasDenunciante")
  incidenciasDenunciado  Incidencia[] @relation("IncidenciasDenunciado")
  codigosInvitacion      CodigoInvitacion[]
}

// SiteConfig — campos adicionales v2.0
model SiteConfig {
  // ... campos existentes ...
  maxEmbajadoresPorCodigo Int     @default(1)
  registroAbierto         Boolean @default(false)
}
```

---

### 13.7 Nuevas Decisiones Arquitectónicas (v2.0)

| ID | Decisión | Razón |
|----|----------|-------|
| AD-13 | SSE para chat en tiempo real | HTTP puro, sin costo, compatible con Next.js Route Handlers. Migración a Supabase Realtime si Vercel limita en producción |
| AD-14 | Incidencias con privacidad por estado | El denunciado no ve la incidencia hasta `EN_PROCESO` — implementado a nivel de query, no solo UI |
| AD-15 | `registroAbierto` en SiteConfig | Permite alternar entre registro libre y solo-por-invitación sin redeploy |
| AD-16 | `maxEmbajadoresPorCodigo` en SiteConfig | Límite configurable desde panel admin, no hardcodeado |
| AD-17 | `rolEjercito` separado de `role` global | Un usuario puede ser JUEZ del Concilio y OFICIAL de su ejército — son dimensiones independientes |
| AD-18 | Soft delete en mensajes de chat | Los mensajes eliminados se marcan `eliminado: true`, no se borran de DB — permite auditoría |
| AD-19 | `descripcionRich` + `banner` en Ejercito | El COMANDANTE puede editar su ficha pública con Tiptap y subir un banner para `/ejercitos/[slug]` |
| AD-20 | Imágenes locales durante desarrollo | `/public/uploads/` para desarrollo local. `STORAGE_PROVIDER` controla el destino en producción |

# Exploración — cge-platform-foundation

**Proyecto**: concenso-hb  
**Fecha**: 2026-06-18  
**Cambio**: cge-platform-foundation

---

## 1. Arquitectura de Rutas

### Rutas Públicas (VISITANTE + autenticados)

| Ruta | Tipo | Data Source | Notas |
|------|------|-------------|-------|
| `/` | SSR/ISR | Noticia destacada, últimas 4 noticias, ranking, afiliados, eventos próximos, RadioConfig | Revalida cada 60s |
| `/noticias` | SSR + filtro cliente | Noticias publicadas paginadas, filtro por Departamento | Puede usar searchParams para `?dept=` |
| `/noticias/[slug]` | SSG + fallback | Noticia individual por slug | generateStaticParams para noticias publicadas |
| `/eventos` | SSR | Eventos ordenados por fecha | |
| `/eventos/[slug]` | SSG + fallback | Evento individual | |
| `/rankings` | SSR | Ejércitos ordenados por puntos, filtro período | |
| `/ejercitos` | SSR | Todos los ejércitos activos | |
| `/ejercitos/[slug]` | SSG + fallback | Ficha pública de ejército | slug = sigla en minúsculas |
| `/mediacion` | Client | Formulario POST a /api/mediaciones | Sin auth requerida |

### Rutas Protegidas `/dashboard/*`

| Ruta | Rol requerido | Redirección si no autorizado |
|------|--------------|------------------------------|
| `/dashboard` | Cualquier autenticado | `/login` si no hay sesión |
| `/dashboard/admin` | ADMIN | `/dashboard` con mensaje |
| `/dashboard/reportero` | REPORTERO | `/dashboard` con mensaje |
| `/dashboard/comandante` | COMANDANTE | `/dashboard` con mensaje |
| `/dashboard/juez` | JUEZ | `/dashboard` con mensaje |

**Estrategia de middleware**: `middleware.ts` en raíz intercepta `/dashboard/*`, verifica token JWT, redirige a `/login` si no hay sesión. Cada `page.tsx` de dashboard verifica el rol exacto via `auth()` de NextAuth v5 y redirige a `/dashboard` si el rol no coincide.

---

## 2. Modelo de Autenticación

### NextAuth v5 — Decisiones clave

- **Adapter**: Sin DB adapter para sessions (JWT puro). El usuario se carga en token en el callback `jwt`.
- **Session strategy**: `"jwt"` — sin tabla Sessions en DB.
- **Custom fields**: Extender `Session` y `JWT` para incluir `role`, `username`, `ejercitoId`.
- **Providers**: Solo `Credentials` (username/password). Hash con `bcryptjs`.
- **Login**: POST a NextAuth con `username` + `password`. Query a DB, comparar hash, retornar user object.

### Token JWT flow
```
signIn → jwt callback → { id, username, email, role, ejercitoId }
                ↓
         session callback → { user: { id, username, role, ejercitoId } }
```

### TypeScript augmentation requerida
```ts
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: { id: string; username: string; role: Role; ejercitoId?: string }
  }
  interface JWT {
    id: string; username: string; role: Role; ejercitoId?: string
  }
}
```

### Middleware
```ts
// middleware.ts
export { auth as middleware } from "@/auth"
export const config = { matcher: ["/dashboard/:path*"] }
```

---

## 3. Modelo de Datos — Patrones de Query

### Queries críticas por vista

**Landing `/`**
- `prisma.noticia.findFirst({ where: { publicada: true, destacada: true }, orderBy: { createdAt: 'desc' } })`
- `prisma.noticia.findMany({ where: { publicada: true }, take: 4, orderBy: { createdAt: 'desc' } })`
- `prisma.ejercito.findMany({ where: { activo: true }, orderBy: { puntos: 'desc' }, take: 4 })`
- `prisma.evento.findMany({ where: { fecha: { gte: new Date() } }, orderBy: { fecha: 'asc' }, take: 3 })`
- `prisma.radioConfig.findFirst()`

**Feed noticias `/noticias`**
- `prisma.noticia.findMany({ where: { publicada: true, departamento: filter }, orderBy: { createdAt: 'desc' }, skip, take })`

**Dashboard REPORTERO**
- `prisma.noticia.findMany({ where: { autorId: session.user.id } })`

**Dashboard COMANDANTE**
- `prisma.ejercito.findUnique({ where: { id: session.user.ejercitoId } })`
- `prisma.mediacion.findMany({ where: { OR: [{ ejercito1 }, { ejercito2 }] } })`

**Dashboard JUEZ**
- `prisma.mediacion.findMany({ where: { estado: 'PENDIENTE' } })`
- `prisma.mediacion.update({ where: { id }, data: { estado, resolucion, juezId } })`

### Relación Ejercito-User
Un User puede ser COMANDANTE y estar asociado a un Ejercito via `ejercitoId`. El seed debe crear un User ADMIN sin `ejercitoId`.

---

## 4. Jerarquía de Componentes

### Server Components (RSC) — sin estado, data fetch directo
- `app/page.tsx` — Landing
- `app/noticias/page.tsx` — Feed (server, pasa data a client NewsFilter)
- `app/noticias/[slug]/page.tsx` — Artículo
- `components/widgets/RankingWidget.tsx`
- `components/widgets/AffiliatesWidget.tsx`
- `components/widgets/EventsWidget.tsx`
- `components/widgets/ComunicadoWidget.tsx`

### Client Components — interactividad, estado local
- `components/radio/RadioProvider.tsx` — contexto global, `"use client"`
- `components/radio/RadioPlayer.tsx` — `"use client"`, AudioAPI
- `components/radio/useRadio.ts` — hook custom
- `components/noticias/NewsFeed.tsx` — filtro de departamento
- Dashboard forms (crear noticia, editar ejército, etc.)

### Boundary crítica: RadioProvider
`RadioProvider` debe envolver el layout raíz pero ser Client Component. La RadioConfig se fetch en el Server Component del layout y se pasa como prop inicial a RadioProvider. Esto evita waterfall y mantiene el player performante.

```tsx
// app/layout.tsx (Server Component)
const radioConfig = await prisma.radioConfig.findFirst()
return <RadioProvider initialConfig={radioConfig}>{children}</RadioProvider>
```

### Componentes de UI — todos "use client" o "use server" según uso
- `LogoCGE` — Server (puro SVG)
- `DeptBadge` — Server (pure presentational)
- `StatCounter` — Client (animación JS con IntersectionObserver)
- `GoldLine`, `Ornament` — Server

---

## 5. Módulo Radio

### Estado en RadioProvider
```ts
interface RadioState {
  config: RadioConfig | null
  isPlaying: boolean
  isMuted: boolean
  volume: number  // 0-100
}
```

### Lógica crítica
```ts
// Al dar play
audioRef.current.src = config.streamUrl
audioRef.current.play()

// Al pausar
audioRef.current.pause()
audioRef.current.src = ""  // corta el stream de red
```

### Render condicional
```tsx
// app/layout.tsx
{radioConfig?.enabled && <RadioPlayer />}
```

El player NO se renderiza si `enabled === false`. Cuando el admin cambia la config via dashboard, se invalida la cache del layout (revalidatePath).

---

## 6. TailwindCSS v4 — Migración de Tokens

### Estrategia
Todos los CSS custom properties del HTML mockup se migran dentro del bloque `@theme` en `app/globals.css`. Tailwind v4 expone esos tokens como utilidades CSS automáticamente.

### Clases de uso
- Backgrounds: `bg-[--color-bg]`, `bg-[--color-surface]`
- Texto: `text-[--color-text]`, `text-[--color-gold]`
- Bordes: `border-[--color-border-gold]`
- Fuentes: `font-[--font-display]`, `font-[--font-body]`, `font-[--font-ui]`

### Componentes CSS complejos
Para el grain effect del body, las animaciones de las wave bars del radio, y el ornament pattern, usar `@layer base` o `@layer components` dentro de `globals.css`. Los CSS modules se reservan para casos excepcionales.

### oklch() en tokens
El HTML usa `oklch()` para borders y backgrounds semi-transparentes. Tailwind v4 soporta oklch nativo. Los tokens se definen tal cual en `@theme`.

---

## 7. Riesgos e Interrogantes

| # | Riesgo | Severidad | Mitigación |
|---|--------|-----------|------------|
| R1 | Tiptap editor peso en bundle | Media | Importar dinámicamente con `next/dynamic`, no SSR |
| R2 | RadioConfig como singleton (solo 1 row) | Baja | `upsert` en lugar de `create` para configuración de radio |
| R3 | Slugs de noticias con caracteres especiales en español | Media | `slugify` con locale `es`, forzar ASCII |
| R4 | NextAuth v5 + Prisma sin adapter = sin sessions en DB | Baja — intencional | JWT es suficiente; documentar que logout invalida solo el cliente |
| R5 | ISR en Vercel Hobby tier limitado | Baja | Usar `revalidate = 60` conservador; datos no cambian en tiempo real |
| R6 | Avatar Habbo hardcodeado como URL externa | Media | Sanitizar URLs en admin dashboard, fallback a placeholder SVG |
| R7 | `oklch()` no soportado en navegadores antiguos | Baja | Añadir fallback hex en tokens críticos |
| R8 | Tiptap genera HTML crudo como contenido | Media | Sanitizar con `DOMPurify` antes de render o usar `dangerouslySetInnerHTML` con whitelist |

### Preguntas abiertas
- **Imágenes de noticias**: ¿Subir a Vercel Blob, Cloudinary, o URL externa? (Spec no lo define)
- **Período del ranking**: ¿Mensual automático o manual por admin? (Spec dice "manual o fórmula")
- **Departamento del reportero**: ¿Se asigna en creación de usuario o en perfil? El modelo User no tiene campo `departamento`

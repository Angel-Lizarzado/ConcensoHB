# Propuesta — cge-platform-foundation

**Proyecto**: concenso-hb  
**Fecha**: 2026-06-18  
**Estado**: draft

---

## Intent

Construir la plataforma web completa "Concilio General de Ejércitos" como una aplicación Next.js 14+ fullstack, convirtiendo el diseño HTML/CSS estático en una aplicación dinámica con autenticación por roles, dashboards específicos por tipo de usuario, y un módulo de radio configurable desde el panel de administración.

## Scope

### In scope
- Proyecto Next.js 14 con App Router desde cero
- Migración de tokens CSS al sistema `@theme` de TailwindCSS v4
- Todos los componentes React listados en la spec (layout, ui, noticias, widgets, ejercitos, radio)
- Schema Prisma completo con seed inicial
- NextAuth.js v5 con JWT y 5 roles
- Todas las rutas públicas y protegidas
- 4 dashboards completos (ADMIN, REPORTERO, COMANDANTE, JUEZ)
- Módulo de radio configurable (RadioConfig en DB)
- API Routes para todos los recursos
- Middleware de protección para `/dashboard/*`
- Seed: 4 ejércitos + RadioConfig inicial

### Out of scope
- Sistema de upload de imágenes (se usará URL externa como placeholder)
- Notificaciones en tiempo real (WebSocket/SSE)
- Tests automatizados (strict_tdd: false, greenfield)
- CI/CD pipeline (configuración Vercel es automática vía git)
- Internacionalización

## Approach

**Fase 1 — Fundación**: estructura del proyecto, globals.css con @theme, fuentes, layout raíz, Header, Footer, LogoCGE.

**Fase 2 — Datos**: schema Prisma, configuración de DB, seed, cliente Prisma singleton.

**Fase 3 — Auth**: NextAuth v5 config, Credentials provider, middleware, páginas login/register, augmentación de tipos.

**Fase 4 — Rutas públicas**: Landing, Noticias, Eventos, Rankings, Ejércitos, Mediación.

**Fase 5 — Dashboards**: DashboardLayout, 4 paneles por rol con sus respectivas funcionalidades.

**Fase 6 — Radio**: RadioProvider, RadioPlayer, hook useRadio, integración en layout, sección en dashboard admin.

**Fase 7 — API Routes**: todos los endpoints REST para cada recurso.

## Rollback Plan

El proyecto es greenfield. Si se necesita revertir: eliminar el directorio y restaurar desde git. No hay datos de producción en riesgo hasta el deploy en Vercel.

## Key Decisions

1. **Sin DB adapter para NextAuth** — JWT puro, no se persisten sessions en DB. Simplicidad > trazabilidad de sesiones.
2. **RadioConfig como singleton** — solo existe 1 row, usar `upsert` siempre. Simplifica la API.
3. **Imágenes de noticias** — URL externa por ahora. Pendiente decisión sobre Vercel Blob vs Cloudinary.
4. **Departamento del reportero** — agregar campo `departamento` a modelo User como `Departamento?` para que REPORTERO solo pueda publicar en su departamento asignado.
5. **Tiptap** — importar con `next/dynamic` sin SSR para evitar peso en bundle inicial.
6. **Slug de ejércitos** — usar `sigla` en lowercase como slug (`/ejercitos/fam`, `/ejercitos/af`).

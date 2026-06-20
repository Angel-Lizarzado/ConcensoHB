-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'REPORTERO', 'COMANDANTE', 'JUEZ', 'VISITANTE');

-- CreateEnum
CREATE TYPE "RolEjercito" AS ENUM ('COMANDANTE', 'OFICIAL', 'EMBAJADOR', 'SOLDADO');

-- CreateEnum
CREATE TYPE "Departamento" AS ENUM ('NOTICIAS', 'WIREDS', 'JUZGADO', 'OFICIAL');

-- CreateEnum
CREATE TYPE "EstadoMediacion" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoIncidencia" AS ENUM ('ABIERTA', 'EN_REVISION', 'EN_PROCESO', 'RESUELTA', 'DESESTIMADA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VISITANTE',
    "departamento" "Departamento",
    "rolEjercito" "RolEjercito",
    "ejercitoId" TEXT,
    "invitadoPorId" TEXT,
    "codigoUsadoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ejercito" (
    "id" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "descripcionRich" TEXT,
    "escudo" TEXT,
    "banner" TEXT,
    "fundador" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ranking" INTEGER,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ejercito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodigoInvitacion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "creadoPorId" TEXT NOT NULL,
    "ejercitoId" TEXT,
    "usoMaximo" INTEGER NOT NULL DEFAULT 1,
    "usosActuales" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodigoInvitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Noticia" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "extracto" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "imagenKey" TEXT,
    "departamento" "Departamento" NOT NULL,
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActividadEjercito" (
    "id" TEXT NOT NULL,
    "ejercitoId" TEXT NOT NULL,
    "eventoId" TEXT,
    "descripcion" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,
    "registradoPor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActividadEjercito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mediacion" (
    "id" TEXT NOT NULL,
    "solicitante" TEXT NOT NULL,
    "ejercito1" TEXT NOT NULL,
    "ejercito2" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoMediacion" NOT NULL DEFAULT 'PENDIENTE',
    "resolucion" TEXT,
    "juezId" TEXT,
    "noticiaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mediacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incidencia" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoIncidencia" NOT NULL DEFAULT 'ABIERTA',
    "denuncianteId" TEXT NOT NULL,
    "ejercitoDenuncianteId" TEXT NOT NULL,
    "ejercitoDenunciadoId" TEXT NOT NULL,
    "miembrosMencionados" TEXT[],
    "juezId" TEXT,
    "resolucion" TEXT,
    "noticiaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PruebaIncidencia" (
    "id" TEXT NOT NULL,
    "incidenciaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "subidoPor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PruebaIncidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComentarioIncidencia" (
    "id" TEXT NOT NULL,
    "incidenciaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioIncidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanalChat" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "privado" BOOLEAN NOT NULL DEFAULT false,
    "rolesPermitidos" "Role"[],
    "creadoPor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanalChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensajeChat" (
    "id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fijado" BOOLEAN NOT NULL DEFAULT false,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "editadoAt" TIMESTAMP(3),
    "autorId" TEXT NOT NULL,
    "canalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensajeChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioConfig" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "streamUrl" TEXT NOT NULL DEFAULT '',
    "radioName" TEXT NOT NULL DEFAULT 'CGE Radio',
    "djName" TEXT NOT NULL DEFAULT 'DJ',
    "djAvatarUrl" TEXT NOT NULL DEFAULT '',
    "currentTrack" TEXT NOT NULL DEFAULT 'En vivo',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Concilio General de Ejércitos',
    "siteSubtitle" TEXT NOT NULL DEFAULT 'Organismo Conciliador · Habbo.es',
    "siteSlogan" TEXT NOT NULL DEFAULT '⚔ UNIDAD · HONOR · ORDEN ⚔',
    "siteDescription" TEXT NOT NULL DEFAULT 'Organismo independiente y neutral de los ejércitos de Habbo en habla hispana.',
    "logoSvg" TEXT,
    "faviconUrl" TEXT,
    "metaKeywords" TEXT NOT NULL DEFAULT 'habbo, ejércitos, concilio, hispano',
    "footerText" TEXT NOT NULL DEFAULT 'Organismo independiente, neutral y conciliador de la comunidad de ejércitos de Habbo. Fundado en 2026.',
    "foundedYear" INTEGER NOT NULL DEFAULT 2026,
    "primaryColor" TEXT NOT NULL DEFAULT '#C9A84C',
    "colorNoticias" TEXT NOT NULL DEFAULT '#d46b8a',
    "colorWireds" TEXT NOT NULL DEFAULT '#5bb8d4',
    "colorJuzgado" TEXT NOT NULL DEFAULT '#C9A84C',
    "colorOficial" TEXT NOT NULL DEFAULT '#7A5C18',
    "registroAbierto" BOOLEAN NOT NULL DEFAULT false,
    "maxEmbajadoresPorCodigo" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventosAsistentes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventosAsistentes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_ejercitoId_idx" ON "User"("ejercitoId");

-- CreateIndex
CREATE INDEX "User_invitadoPorId_idx" ON "User"("invitadoPorId");

-- CreateIndex
CREATE UNIQUE INDEX "Ejercito_sigla_key" ON "Ejercito"("sigla");

-- CreateIndex
CREATE INDEX "Ejercito_activo_idx" ON "Ejercito"("activo");

-- CreateIndex
CREATE INDEX "Ejercito_puntos_idx" ON "Ejercito"("puntos");

-- CreateIndex
CREATE UNIQUE INDEX "CodigoInvitacion_codigo_key" ON "CodigoInvitacion"("codigo");

-- CreateIndex
CREATE INDEX "CodigoInvitacion_codigo_idx" ON "CodigoInvitacion"("codigo");

-- CreateIndex
CREATE INDEX "CodigoInvitacion_ejercitoId_idx" ON "CodigoInvitacion"("ejercitoId");

-- CreateIndex
CREATE UNIQUE INDEX "Noticia_slug_key" ON "Noticia"("slug");

-- CreateIndex
CREATE INDEX "Noticia_publicada_createdAt_idx" ON "Noticia"("publicada", "createdAt");

-- CreateIndex
CREATE INDEX "Noticia_departamento_publicada_idx" ON "Noticia"("departamento", "publicada");

-- CreateIndex
CREATE INDEX "Noticia_destacada_publicada_idx" ON "Noticia"("destacada", "publicada");

-- CreateIndex
CREATE INDEX "Noticia_slug_idx" ON "Noticia"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Evento_slug_key" ON "Evento"("slug");

-- CreateIndex
CREATE INDEX "Evento_fecha_idx" ON "Evento"("fecha");

-- CreateIndex
CREATE INDEX "ActividadEjercito_ejercitoId_idx" ON "ActividadEjercito"("ejercitoId");

-- CreateIndex
CREATE INDEX "ActividadEjercito_eventoId_idx" ON "ActividadEjercito"("eventoId");

-- CreateIndex
CREATE INDEX "Mediacion_estado_idx" ON "Mediacion"("estado");

-- CreateIndex
CREATE INDEX "Mediacion_juezId_idx" ON "Mediacion"("juezId");

-- CreateIndex
CREATE INDEX "Incidencia_estado_idx" ON "Incidencia"("estado");

-- CreateIndex
CREATE INDEX "Incidencia_denuncianteId_idx" ON "Incidencia"("denuncianteId");

-- CreateIndex
CREATE INDEX "Incidencia_ejercitoDenunciadoId_idx" ON "Incidencia"("ejercitoDenunciadoId");

-- CreateIndex
CREATE INDEX "Incidencia_juezId_idx" ON "Incidencia"("juezId");

-- CreateIndex
CREATE INDEX "PruebaIncidencia_incidenciaId_idx" ON "PruebaIncidencia"("incidenciaId");

-- CreateIndex
CREATE INDEX "ComentarioIncidencia_incidenciaId_idx" ON "ComentarioIncidencia"("incidenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "CanalChat_nombre_key" ON "CanalChat"("nombre");

-- CreateIndex
CREATE INDEX "CanalChat_nombre_idx" ON "CanalChat"("nombre");

-- CreateIndex
CREATE INDEX "MensajeChat_canalId_createdAt_idx" ON "MensajeChat"("canalId", "createdAt");

-- CreateIndex
CREATE INDEX "MensajeChat_autorId_idx" ON "MensajeChat"("autorId");

-- CreateIndex
CREATE INDEX "MensajeChat_fijado_idx" ON "MensajeChat"("fijado");

-- CreateIndex
CREATE INDEX "_EventosAsistentes_B_index" ON "_EventosAsistentes"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ejercitoId_fkey" FOREIGN KEY ("ejercitoId") REFERENCES "Ejercito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_invitadoPorId_fkey" FOREIGN KEY ("invitadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_codigoUsadoId_fkey" FOREIGN KEY ("codigoUsadoId") REFERENCES "CodigoInvitacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodigoInvitacion" ADD CONSTRAINT "CodigoInvitacion_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodigoInvitacion" ADD CONSTRAINT "CodigoInvitacion_ejercitoId_fkey" FOREIGN KEY ("ejercitoId") REFERENCES "Ejercito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActividadEjercito" ADD CONSTRAINT "ActividadEjercito_ejercitoId_fkey" FOREIGN KEY ("ejercitoId") REFERENCES "Ejercito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActividadEjercito" ADD CONSTRAINT "ActividadEjercito_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_denuncianteId_fkey" FOREIGN KEY ("denuncianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_ejercitoDenuncianteId_fkey" FOREIGN KEY ("ejercitoDenuncianteId") REFERENCES "Ejercito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_ejercitoDenunciadoId_fkey" FOREIGN KEY ("ejercitoDenunciadoId") REFERENCES "Ejercito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_juezId_fkey" FOREIGN KEY ("juezId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PruebaIncidencia" ADD CONSTRAINT "PruebaIncidencia_incidenciaId_fkey" FOREIGN KEY ("incidenciaId") REFERENCES "Incidencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioIncidencia" ADD CONSTRAINT "ComentarioIncidencia_incidenciaId_fkey" FOREIGN KEY ("incidenciaId") REFERENCES "Incidencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioIncidencia" ADD CONSTRAINT "ComentarioIncidencia_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensajeChat" ADD CONSTRAINT "MensajeChat_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensajeChat" ADD CONSTRAINT "MensajeChat_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "CanalChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventosAsistentes" ADD CONSTRAINT "_EventosAsistentes_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventosAsistentes" ADD CONSTRAINT "_EventosAsistentes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

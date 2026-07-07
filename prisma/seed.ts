import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // =============================================
  // Validar credenciales requeridas del .env
  // =============================================
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!adminPassword) {
    console.error('\n❌ ERROR: SEED_ADMIN_PASSWORD no está definida en .env')
    console.error('   Agrega esta variable antes de correr el seed.\n')
    process.exit(1)
  }

  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'Mitsukai'

  console.log('🌱 Iniciando seed...\n')

  // =============================================
  // Usuarios iniciales
  // =============================================
  const initialUsers = [
    { username: 'Hyungzero', password: 'Hyungzero', role: 'ADMIN' },
    { username: 'Peco115', password: 'Peco115', role: 'ADMIN' },
    { username: 'Mitsukai', password: 'Mitsukai', role: 'ADMIN' },
    { username: 'Rhea.', password: 'Rhea.', role: 'ADMIN' },
    { username: 'juez1', password: '123456', role: 'JUEZ' },
    { username: 'reportero1', password: '123456', role: 'REPORTERO' },
    { username: 'comandante1', password: '123456', role: 'COMANDANTE' },
  ]

  let admin = null

  for (const u of initialUsers) {
    const hashed = await bcrypt.hash(u.password, 12)
    const created = await prisma.user.upsert({
      where: { username: u.username },
      update: { password: hashed, role: u.role as any },
      create: {
        username: u.username,
        password: hashed,
        role: u.role as any,
      },
    })
    console.log(`✅ Usuario creado: ${created.username} (${created.role})`)
    if (u.username === 'Mitsukai') admin = created
  }

  // =============================================
  // Ejércitos iniciales
  // =============================================
  const ejercitosData = [
    { sigla: 'F.A.M', nombre: 'Fuerza Armada Mexicana',   fundador: 'Sistema' },
    { sigla: 'A.F',   nombre: 'American Force',            fundador: 'Sistema' },
    { sigla: 'F.E.S', nombre: 'Fuerza Especial Suprema',  fundador: 'Sistema' },
    { sigla: 'G.F.S', nombre: 'Génesis de Fuerza Suprema', fundador: 'Sistema' },
  ]

  for (const data of ejercitosData) {
    const ejercito = await prisma.ejercito.upsert({
      where:  { sigla: data.sigla },
      update: {},
      create: { ...data, activo: true },
    })
    console.log(`✅ Ejército: ${ejercito.sigla} — ${ejercito.nombre}`)

    if (data.sigla === 'F.A.M') {
      await prisma.user.update({
        where: { username: 'comandante1' },
        data: { ejercitoId: ejercito.id, rolEjercito: 'COMANDANTE' }
      })
      console.log('✅ Comandante1 enlazado a F.A.M')
    }
  }

  // =============================================
  // RadioConfig singleton
  // =============================================
  const radioConfig = await prisma.radioConfig.upsert({
    where:  { id: 'singleton-radio' },
    update: {},
    create: {
      id:           'singleton-radio',
      enabled:      false,
      radioName:    'CGE Radio',
      djName:       'DJ',
      streamUrl:    '',
      djAvatarUrl:  '',
      currentTrack: 'En vivo',
    },
  })
  console.log(`✅ RadioConfig: ${radioConfig.radioName} (enabled: ${radioConfig.enabled})`)

  // =============================================
  // SiteConfig singleton
  // =============================================
  const siteConfig = await prisma.siteConfig.upsert({
    where:  { id: 'singleton-site' },
    update: {},
    create: {
      id:              'singleton-site',
      siteName:        'Concilio General de Ejércitos',
      siteSubtitle:    'Organismo Conciliador · Habbo.es',
      siteSlogan:      '⚔ UNIDAD · HONOR · ORDEN ⚔',
      siteDescription: 'Organismo independiente y neutral de los ejércitos de Habbo en habla hispana.',
      footerText:      'Organismo independiente, neutral y conciliador de la comunidad de ejércitos de Habbo. Fundado en 2026.',
      foundedYear:     2026,
      primaryColor:    '#C9A84C',
      colorNoticias:   '#d46b8a',
      colorWireds:     '#5bb8d4',
      colorJuzgado:    '#C9A84C',
      colorOficial:    '#7A5C18',
    },
  })
  console.log(`✅ SiteConfig: ${siteConfig.siteName}`)

  // =============================================
  // Canales de chat iniciales
  // =============================================
  const canales = [
    { nombre: 'general',   descripcion: 'Canal general para toda la comunidad', privado: false },
    { nombre: 'anuncios',  descripcion: 'Anuncios oficiales del Concilio',       privado: false },
    { nombre: 'jueces',    descripcion: 'Canal privado para el equipo judicial',  privado: true,  rolesPermitidos: ['ADMIN', 'JUEZ'] },
  ]

  for (const data of canales) {
    const canal = await prisma.canalChat.upsert({
      where:  { nombre: data.nombre },
      update: {},
      create: {
        nombre:          data.nombre,
        descripcion:     data.descripcion,
        privado:         data.privado ?? false,
        rolesPermitidos: (data as any).rolesPermitidos ?? [],
        creadoPor:       admin?.id ?? 'system',
      },
    })
    console.log(`✅ Canal: #${canal.nombre}`)
  }

  console.log('\n🎉 Seed completado exitosamente.\n')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

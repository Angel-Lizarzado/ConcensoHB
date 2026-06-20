import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await hash('123456', 10)

  // Fetch armies to attach users to
  const ejercitos = await prisma.ejercito.findMany({ take: 2 })
  if (ejercitos.length < 2) {
    console.log('Se necesitan al menos 2 ejércitos para las pruebas. Corre npm run seed primero.')
    return
  }

  const e1 = ejercitos[0].id
  const e2 = ejercitos[1].id

  const users = [
    { username: 'admin1', email: 'admin1@test.com', role: 'ADMIN' as any },
    { username: 'juez1', email: 'juez1@test.com', role: 'JUEZ' as any },
    { username: 'reportero1', email: 'reportero1@test.com', role: 'REPORTERO' as any, departamento: 'NOTICIAS' as any },
    { username: 'visitante1', email: 'visitante1@test.com', role: 'VISITANTE' as any },
    
    // Ejército 1
    { username: 'comandante1', email: 'cmd1@test.com', role: 'COMANDANTE' as any, ejercitoId: e1, rolEjercito: 'COMANDANTE' as any },
    { username: 'oficial1', email: 'oficial1@test.com', role: 'VISITANTE' as any, ejercitoId: e1, rolEjercito: 'OFICIAL' as any },
    { username: 'soldado1', email: 'soldado1@test.com', role: 'VISITANTE' as any, ejercitoId: e1, rolEjercito: 'SOLDADO' as any },
    
    // Ejército 2
    { username: 'comandante2', email: 'cmd2@test.com', role: 'COMANDANTE' as any, ejercitoId: e2, rolEjercito: 'COMANDANTE' as any },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        ...u,
        password: passwordHash,
      }
    })
  }

  console.log('Usuarios de prueba creados exitosamente.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() { 
  const ejercito = await prisma.ejercito.findFirst({ where: { sigla: 'F.A.M' } });
  if (ejercito) {
    await prisma.user.update({
      where: { username: 'comandante1' },
      data: { ejercitoId: ejercito.id, rolEjercito: 'COMANDANTE' }
    });
    console.log('Comandante1 assigned to F.A.M');
  }

  const ejercito2 = await prisma.ejercito.findFirst({ where: { sigla: 'A.F' } });
  if (ejercito2) {
    const exists = await prisma.user.findUnique({ where: { username: 'comandante2' } });
    if (!exists) {
      await prisma.user.create({
        data: {
          username: 'comandante2',
          email: 'comandante2@test.com',
          password: 'plainpassword-unused',
          passwordHash: require('bcryptjs').hashSync('123456', 10),
          role: 'COMANDANTE',
          ejercitoId: ejercito2.id,
          rolEjercito: 'COMANDANTE'
        }
      });
      console.log('Created comandante2 and assigned to A.F');
    } else {
      await prisma.user.update({
        where: { username: 'comandante2' },
        data: { ejercitoId: ejercito2.id, rolEjercito: 'COMANDANTE' }
      });
      console.log('Comandante2 updated and assigned to A.F');
    }
  }
}

run().finally(() => prisma.$disconnect());

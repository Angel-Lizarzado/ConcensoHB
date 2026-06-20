const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() { 
  const pass = bcrypt.hashSync('123456', 10);
  const roles = ['ADMIN', 'REPORTERO', 'COMANDANTE', 'JUEZ', 'VISITANTE'];
  for (const role of roles) {
    const username = role.toLowerCase() + '1';
    const email = username + '@test.com';
    const exists = await prisma.user.findUnique({ where: { username } });
    if (!exists) {
      await prisma.user.create({
        data: { username, email, password: pass, role }
      });
      console.log('Created: ' + username);
    } else {
      console.log('Already exists: ' + username);
    }
  }
} 

run().finally(() => prisma.$disconnect());

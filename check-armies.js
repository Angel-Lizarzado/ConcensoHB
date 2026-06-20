const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() { 
  const ej = await prisma.ejercito.findMany(); 
  console.log(ej.length + ' ejercitos'); 
  console.log(ej.map(e => `${e.id} | ${e.nombre} | activo: ${e.activo}`));
} 
run().finally(() => prisma.$disconnect());

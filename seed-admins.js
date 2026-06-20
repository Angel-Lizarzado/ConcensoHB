const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const usersToCreate = [
    { username: 'Hyungzero', role: 'ADMIN' },
    { username: 'Peco115', role: 'ADMIN' },
    { username: 'Mitsukai', role: 'ADMIN' }
  ]

  for (const u of usersToCreate) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } })
    if (!existing) {
      const hashedPassword = await bcrypt.hash(u.username, 10)
      await prisma.user.create({
        data: {
          username: u.username,
          email: `${u.username.toLowerCase()}@cge.com`,
          password: hashedPassword,
          role: u.role
        }
      })
      console.log(`Created user: ${u.username}`)
    } else {
      console.log(`User ${u.username} already exists.`)
    }
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

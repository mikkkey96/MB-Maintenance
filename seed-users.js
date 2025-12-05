const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Creating users...')

  // Boss
  const bossPassword = await bcrypt.hash('password', 10)
  const boss = await prisma.user.create({
    data: {
      email: 'boss@test.com',
      password: bossPassword,
      name: 'Boss User',
      role: 'boss'
    }
  })
  console.log('✅ Created boss:', boss.email)

  // Worker
  const workerPassword = await bcrypt.hash('password', 10)
  const worker = await prisma.user.create({
    data: {
      email: 'worker@test.com',
      password: workerPassword,
      name: 'Worker User',
      role: 'worker'
    }
  })
  console.log('✅ Created worker:', worker.email)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

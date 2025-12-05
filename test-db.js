const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Testing database connection...')
  
  const job = await prisma.job.create({
    data: {
      address: 'Test Street 123',
      postcode: 'TEST456',
      problem: 'Test problem',
      status: 'COMPLETED'
    }
  })
  
  console.log('Created job:', job)
  
  const allJobs = await prisma.job.findMany()
  console.log('All jobs:', allJobs)
}

main()
  .catch(e => {
    console.error('Error:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

  
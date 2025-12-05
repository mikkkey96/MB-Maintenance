import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { address, postcode, problem } = req.body
      
      console.log('📝 Creating job:', { address, postcode, problem })
      
      const job = await prisma.job.create({
        data: {
          address,
          postcode,
          problem,
          status: 'PENDING',
          createdBy: 'boss',
          assignedTo: 'worker'
        }
      })

      console.log('✅ Created job:', job.id)

      return res.status(200).json({ 
        success: true, 
        job,
        message: 'Job created successfully!' 
      })
    } catch (error) {
      console.error('❌ Error:', error)
      return res.status(500).json({ 
        success: false, 
        error: String(error) 
      })
    }
  }
  
  if (req.method === 'GET') {
    try {
      const jobs = await prisma.job.findMany({
        include: {
          report: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json({ success: true, jobs })
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return res.status(500).json({ 
        success: false, 
        error: String(error) 
      })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}

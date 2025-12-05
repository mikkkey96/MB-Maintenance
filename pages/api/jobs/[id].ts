import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const job = await prisma.job.findUnique({
        where: { id: id as string },
        include: {
          report: true
        }
      })

      if (!job) {
        return res.status(404).json({ error: 'Job not found' })
      }

      return res.status(200).json({ success: true, job })
    } catch (error) {
      console.error('Error fetching job:', error)
      return res.status(500).json({ 
        success: false, 
        error: String(error) 
      })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}

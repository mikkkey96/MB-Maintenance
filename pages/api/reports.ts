import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import formidable, { File } from 'formidable'
import { uploadToCloudinary } from '@/lib/cloudinary'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function parseForm(req: NextApiRequest): Promise<{
  fields: formidable.Fields
  files: formidable.Files
}> {
  const form = formidable({ multiples: true })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { fields, files } = await parseForm(req)
      const data = JSON.parse(fields.data as string)

      console.log('📝 Received data:', data)

      const photoUrls: string[] = []
      const photoFiles = Array.isArray(files.photos)
        ? files.photos
        : files.photos
        ? [files.photos]
        : []

      console.log('📸 Uploading', photoFiles.length, 'photos...')

      for (const photo of photoFiles) {
        const file = photo as File
        const fileContent = fs.readFileSync(file.filepath)
        const webFile = new Blob([fileContent], {
          type: file.mimetype || 'image/jpeg',
        }) as any
        webFile.name = file.originalFilename || 'photo.jpg'

        const url = await uploadToCloudinary(webFile)
        photoUrls.push(url)
        console.log('✅ Uploaded:', url)
      }

      const report = await prisma.report.create({
        data: {
          jobId: data.jobId,
          workSummary: JSON.stringify(data.workSummary),
          photos: JSON.stringify(photoUrls),
          startTime: data.startTime || null,
          finishTime: data.finishTime || null,
          requiresFollowUp: data.requiresFollowUp || false,
          postponed: data.postponed || false,
          postponedDate: data.postponedDate || null,
          postponedReason: data.postponedReason || null,
        },
      })

      await prisma.job.update({
        where: { id: data.jobId },
        data: {
          status: data.postponed ? 'PENDING' : 'COMPLETED',
        },
      })

      console.log('✅ Created report:', report.id)

      return res.status(200).json({
        success: true,
        report,
        photoUrls,
        message: 'Report saved successfully!',
      })
    } catch (error) {
      console.error('❌ Error:', error)
      return res.status(500).json({
        success: false,
        error: String(error),
      })
    }
  }

  if (req.method === 'GET') {
    try {
      const reports = await prisma.report.findMany({
        include: {
          job: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return res.status(200).json({ success: true, reports })
    } catch (error) {
      console.error('Error fetching reports:', error)
      return res.status(500).json({
        success: false,
        error: String(error),
      })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}

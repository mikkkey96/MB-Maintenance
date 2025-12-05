import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: id as string },
      include: { job: true }
    })

    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    let y = height - 50
    const line = (text: string, size = 12) => {
      page.drawText(text, { x: 50, y, size, font, color: rgb(0, 0, 0) })
      y -= size + 6
    }

    line('Mersey Bathrooms - Work Report', 18)
    y -= 10
    line(`Report ID: ${report.id}`)
    line(`Job ID: ${report.jobId}`)
    line(`Address: ${report.job.address}, ${report.job.postcode}`)
    line(`Problem: ${report.job.problem}`)
    line(`Status: ${report.job.status}`)
    y -= 10

    const items: string[] = JSON.parse(report.workSummary)
    line('Work Summary:', 14)
    items.forEach((item, idx) => {
      line(`${idx + 1}. ${item}`)
    })

    y -= 10
    if (report.startTime || report.finishTime) {
      line(`Time: ${report.startTime || '-'} - ${report.finishTime || '-'}`)
    }

    if (report.requiresFollowUp) {
      line('Requires follow-up: YES')
    }

    if (report.postponed) {
      line(`Postponed to: ${report.postponedDate || '-'}`)
      if (report.postponedReason) {
        line(`Reason: ${report.postponedReason}`)
      }
    }

    const pdfBytes = await pdfDoc.save()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${report.id}.pdf"`
    )
    return res.send(Buffer.from(pdfBytes))
  } catch (error) {
    console.error('PDF error:', error)
    return res.status(500).json({ error: 'Failed to generate PDF' })
  }
}

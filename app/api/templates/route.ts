import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/src/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const documentType = searchParams.get('documentType') || ''
    const companyName = searchParams.get('companyName') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'

    const appIdFilter = searchParams.get('appId')
    const where: any = {}

    if (appIdFilter) {
      where.OR = [
        { appId: null },
        { appId: appIdFilter }
      ]
    } else {
      where.appId = null
    }

    // Dynamic search filter across templateName, companyName, documentType
    if (search) {
      // If we already have OR filter, merge them under AND
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          {
            OR: [
              { templateName: { contains: search } },
              { companyName: { contains: search } },
              { documentType: { contains: search } }
            ]
          }
        ]
        delete where.OR
      } else {
        where.OR = [
          { templateName: { contains: search } },
          { companyName: { contains: search } },
          { documentType: { contains: search } }
        ]
      }
    }

    if (status) {
      where.status = status
    }
    if (category) {
      where.category = category
    }
    if (documentType) {
      where.documentType = documentType
    }
    if (companyName) {
      where.companyName = companyName
    }

    // Dynamic sorting
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sortBy === 'alphabetical') {
      orderBy = { templateName: 'asc' }
    } else if (sortBy === 'recently_updated') {
      orderBy = { updatedAt: 'desc' }
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy
    })

    const docTypeMapping: Record<string, string> = {
      'invoice': 'Invoice',
      'offer-letter': 'Offer Letter',
      'hr-documents': 'HR Documents',
      'certificates': 'Certificate',
      'resume-analyzer': 'Resume',
      'experience-letter': 'Experience Letter',
      'appointment-letter': 'Appointment Letter',
      'salary-slip': 'Salary Slip'
    }

    const mapped = templates.map((t: any) => ({
      ...t,
      templateName: t.templateName || t.name || 'Untitled Template',
      previewImage: t.previewImage || t.preview || null,
      companyName: t.companyName || 'DocFlow AI',
      documentType: t.documentType || (t.appId ? docTypeMapping[t.appId] : 'Invoice') || 'Invoice'
    }))

    return NextResponse.json(mapped)
  } catch (error: any) {
    console.error('Error listing templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

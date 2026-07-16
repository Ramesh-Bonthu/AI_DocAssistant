import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/src/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    const templates = await prisma.template.findMany({
      where: {
        appId: null,
        OR: [
          { templateName: { contains: query } },
          { companyName: { contains: query } },
          { documentType: { contains: query } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error: any) {
    console.error('Error searching templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

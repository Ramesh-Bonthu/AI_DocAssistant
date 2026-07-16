import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/src/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const documentType = searchParams.get('documentType')
    const companyName = searchParams.get('companyName')

    const where: any = {
      appId: null
    }
    if (status) where.status = status
    if (category) where.category = category
    if (documentType) where.documentType = documentType
    if (companyName) where.companyName = companyName

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error: any) {
    console.error('Error filtering templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

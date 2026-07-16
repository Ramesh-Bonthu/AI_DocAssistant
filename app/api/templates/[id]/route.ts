import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/src/client'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const template = await prisma.template.findUnique({
      where: { id }
    })
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

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

    const mapped = {
      ...template,
      templateName: template.templateName || template.name || 'Untitled Template',
      previewImage: template.previewImage || template.preview || null,
      companyName: template.companyName || 'DocFlow AI',
      documentType: template.documentType || (template.appId ? docTypeMapping[template.appId] : 'Invoice') || 'Invoice'
    }

    return NextResponse.json(mapped)
  } catch (error: any) {
    console.error('Error fetching template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    
    const {
      templateName,
      companyName,
      documentType,
      description,
      category,
      tags,
      paperSize,
      orientation,
      status,
      version
    } = body

    // Validate required fields
    if (!templateName || !companyName || !documentType) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
    }

    // Check duplicate name excluding current record
    const duplicate = await prisma.template.findFirst({
      where: {
        templateName,
        NOT: { id }
      }
    })
    if (duplicate) {
      return NextResponse.json({ error: 'Another template with this name already exists' }, { status: 400 })
    }

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        templateName,
        companyName,
        documentType,
        description,
        category,
        tags,
        paperSize,
        orientation,
        status,
        version
      }
    })

    return NextResponse.json(updatedTemplate)
  } catch (error: any) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const template = await prisma.template.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    await prisma.template.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

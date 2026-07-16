import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import prisma from '@/backend/src/client'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    
    // Handle duplication (JSON request)
    if (contentType.includes('application/json')) {
      const body = await req.json()
      const { duplicateFromId } = body

      if (!duplicateFromId) {
        return NextResponse.json({ error: 'Missing duplicateFromId' }, { status: 400 })
      }

      const sourceTemplate = await prisma.template.findUnique({
        where: { id: duplicateFromId }
      })

      if (!sourceTemplate) {
        return NextResponse.json({ error: 'Source template not found' }, { status: 404 })
      }

      // Generate copy name
      let newName = `${sourceTemplate.templateName} - Copy`
      let nameCollision = await prisma.template.findFirst({ where: { templateName: newName } })
      let counter = 1
      while (nameCollision) {
        newName = `${sourceTemplate.templateName} - Copy (${counter})`
        nameCollision = await prisma.template.findFirst({ where: { templateName: newName } })
        counter++
      }

      const clonedTemplate = await prisma.template.create({
        data: {
          templateName: newName,
          companyName: sourceTemplate.companyName,
          documentType: sourceTemplate.documentType,
          description: sourceTemplate.description,
          category: sourceTemplate.category,
          tags: sourceTemplate.tags,
          paperSize: sourceTemplate.paperSize,
          orientation: sourceTemplate.orientation,
          originalFile: sourceTemplate.originalFile,
          previewImage: sourceTemplate.previewImage,
          status: sourceTemplate.status,
          version: sourceTemplate.version
        }
      })

      return NextResponse.json(clonedTemplate, { status: 201 })
    }

    // Handle standard file upload (FormData request)
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const templateName = (formData.get('templateName') as string) || ''
    const companyName = (formData.get('companyName') as string) || ''
    const documentType = (formData.get('documentType') as string) || 'Custom'
    const description = formData.get('description') as string || ''
    const category = formData.get('category') as string || 'General'
    const tags = formData.get('tags') as string || ''
    const paperSize = (formData.get('paperSize') as string) || 'A4'
    const orientation = (formData.get('orientation') as string) || 'Portrait'
    const status = (formData.get('status') as string) || 'Active'
    const version = (formData.get('version') as string) || '1.0'

    // Validate required fields
    if (!templateName || !companyName || !documentType) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 })
    }

    // Validate duplicate template names
    const duplicate = await prisma.template.findFirst({
      where: { templateName }
    })
    if (duplicate) {
      return NextResponse.json({ error: 'A template with this name already exists' }, { status: 400 })
    }

    // Validate supported file types (PDF, PNG, JPG, JPEG)
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg']
    const ext = path.extname(file.name).toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file type. Upload PDF, PNG, or JPG/JPEG.' }, { status: 400 })
    }

    // Validate max file size (20 MB)
    const maxBytes = 20 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File size exceeds the 20MB limit' }, { status: 400 })
    }

    // Save file to disk
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    const filePath = path.join(uploadDir, safeName)
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const originalFileUrl = `/uploads/${safeName}`
    
    // Determine preview image
    let previewImageUrl = originalFileUrl
    if (ext === '.pdf') {
      // Use standard generic placeholder cover image for PDFs
      previewImageUrl = '/templates/invoice-1.jpg' 
    }

    // Create prisma record
    const template = await prisma.template.create({
      data: {
        templateName,
        companyName,
        documentType,
        description,
        category,
        tags,
        paperSize,
        orientation,
        originalFile: originalFileUrl,
        previewImage: previewImageUrl,
        status,
        version
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading template:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getTemplates, createTemplate } from '@/backend/src/services'

export async function GET(
  request: Request,
  { params }: { params: { appId: string } }
) {
  const appId = params.appId

  try {
    const data = await getTemplates(appId)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`Error loading templates for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to load templates' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { appId: string } }
) {
  const appId = params.appId

  try {
    const body = await request.json()
    const { name, description, tags } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }

    const template = await createTemplate(appId, { name, description, tags })
    return NextResponse.json(template)
  } catch (error: any) {
    console.error(`Error creating template for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}

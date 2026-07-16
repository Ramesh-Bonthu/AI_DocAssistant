import { NextResponse } from 'next/server'
import { deleteTemplate, updateTemplate } from '@/backend/src/services'

export async function DELETE(
  request: Request,
  { params }: { params: { appId: string; templateId: string } }
) {
  const { appId, templateId } = params

  try {
    const deleted = await deleteTemplate(appId, templateId)
    return NextResponse.json(deleted)
  } catch (error: any) {
    console.error(`Error deleting template ${templateId} for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { appId: string; templateId: string } }
) {
  const { appId, templateId } = params

  try {
    const body = await request.json()
    const updated = await updateTemplate(appId, templateId, body)
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error(`Error updating template ${templateId} for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}


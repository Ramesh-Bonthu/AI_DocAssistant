import { NextResponse } from 'next/server'
import { deleteTemplate } from '@/backend/src/services'

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

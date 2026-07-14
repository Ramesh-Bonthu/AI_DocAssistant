import { NextResponse } from 'next/server'
import { getTemplates } from '@/backend/src/services'

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

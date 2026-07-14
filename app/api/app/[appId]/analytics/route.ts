import { NextResponse } from 'next/server'
import { getAnalytics } from '@/backend/src/services'

export async function GET(
  request: Request,
  { params }: { params: { appId: string } }
) {
  const appId = params.appId

  try {
    const data = await getAnalytics(appId)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`Error loading analytics for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to load analytics' },
      { status: 500 }
    )
  }
}

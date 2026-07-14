import { NextResponse } from 'next/server'
import { getDashboardData } from '@/backend/src/services'

export async function GET(
  request: Request,
  { params }: { params: { appId: string } }
) {
  const appId = params.appId

  try {
    const data = await getDashboardData(appId)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`Error loading dashboard for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}

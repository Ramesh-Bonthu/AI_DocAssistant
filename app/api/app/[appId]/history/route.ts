import { NextResponse } from 'next/server'
import { getHistory } from '@/backend/src/services'

export async function GET(
  request: Request,
  { params }: { params: { appId: string } }
) {
  const appId = params.appId

  try {
    const data = await getHistory(appId)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`Error loading history for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to load history' },
      { status: 500 }
    )
  }
}

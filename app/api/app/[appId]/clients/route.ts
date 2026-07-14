import { NextResponse } from 'next/server'
import { getClients, createClient } from '@/backend/src/services'

export async function GET(
  request: Request,
  { params }: { params: { appId: string } }
) {
  const appId = params.appId
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  try {
    const data = await getClients(appId, search)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`Error loading clients for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to load clients' },
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
    const newClient = await createClient(appId, body)
    return NextResponse.json(newClient, { status: 201 })
  } catch (error: any) {
    console.error(`Error creating client for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: 500 }
    )
  }
}

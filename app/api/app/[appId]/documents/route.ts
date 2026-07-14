import { NextResponse } from 'next/server'
import { getDocuments, createDocument, deleteDocument } from '@/backend/src/services'

export async function GET(
  request: Request,
  { params }: { params: { appId: string } }
) {
  const appId = params.appId
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'

  try {
    const data = await getDocuments(appId, search, status)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error(`Error loading documents for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to load documents' },
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
    const newDoc = await createDocument(appId, body)
    return NextResponse.json(newDoc, { status: 201 })
  } catch (error: any) {
    console.error(`Error creating document for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to create document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { appId: string } }
) {
  const appId = params.appId
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
  }

  try {
    const result = await deleteDocument(appId, id)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error(`Error deleting document for ${appId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { updateClient, deleteClient } from '@/backend/src/services'

export async function PUT(
  request: Request,
  { params }: { params: { appId: string; clientId: string } }
) {
  const { clientId } = params

  try {
    const body = await request.json()
    const updatedClient = await updateClient(clientId, body)
    return NextResponse.json(updatedClient)
  } catch (error: any) {
    console.error(`Error updating client ${clientId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { appId: string; clientId: string } }
) {
  const { appId, clientId } = params

  try {
    const result = await deleteClient(appId, clientId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error(`Error deleting client ${clientId}:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete client' },
      { status: 500 }
    )
  }
}


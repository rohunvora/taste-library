import { NextRequest, NextResponse } from 'next/server'

const ARENA_TOKEN = process.env.ARENA_TOKEN!

async function deleteBlock(blockId: number) {
  // Are.na doesn't have a direct block delete - we disconnect from all channels
  // First, get the block to find its connections
  const res = await fetch(`https://api.are.na/v2/blocks/${blockId}`, {
    headers: {
      'Authorization': `Bearer ${ARENA_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!res.ok) {
    throw new Error(`Failed to fetch block: ${res.status}`)
  }
  
  const block = await res.json()
  
  // Disconnect from all channels
  const connections = block.connections || []
  
  for (const connection of connections) {
    const channelSlug = connection.slug
    if (!channelSlug) continue
    
    const deleteRes = await fetch(
      `https://api.are.na/v2/channels/${channelSlug}/blocks/${blockId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ARENA_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!deleteRes.ok) {
      console.warn(`Failed to disconnect from ${channelSlug}: ${deleteRes.status}`)
    }
  }
  
  return { disconnectedFrom: connections.length }
}

export async function POST(request: NextRequest) {
  try {
    if (!ARENA_TOKEN) {
      return NextResponse.json({ error: 'ARENA_TOKEN not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { blockId } = body

    if (!blockId) {
      return NextResponse.json({ error: 'Missing blockId' }, { status: 400 })
    }

    const result = await deleteBlock(blockId)

    return NextResponse.json({ 
      success: true, 
      ...result,
    })
  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'

const ARENA_TOKEN = process.env.ARENA_TOKEN!
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG || 'frank-degods'

const SKIPPED_CHANNEL_TITLE = 'Classifier - Skipped'

async function arenaFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`https://api.are.na/v2${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ARENA_TOKEN}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  return res
}

async function getOrCreateSkippedChannel(): Promise<string | null> {
  // First, try to find existing channel
  const res = await arenaFetch(`/users/${ARENA_USER_SLUG}/channels?per=100`)
  if (!res.ok) return null
  
  const data = await res.json()
  const existing = data.channels?.find(
    (ch: any) => ch.title === SKIPPED_CHANNEL_TITLE
  )
  
  if (existing) {
    return existing.slug
  }
  
  // Create it if it doesn't exist
  const createRes = await arenaFetch('/channels', {
    method: 'POST',
    body: JSON.stringify({
      title: SKIPPED_CHANNEL_TITLE,
      status: 'private',
    }),
  })
  
  if (!createRes.ok) return null
  
  const newChannel = await createRes.json()
  return newChannel.slug || null
}

async function connectBlockToChannel(blockId: number, channelSlug: string) {
  const res = await arenaFetch(`/channels/${channelSlug}/connections`, {
    method: 'POST',
    body: JSON.stringify({
      connectable_type: 'Block',
      connectable_id: blockId,
    }),
  })
  
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to connect: ${res.status} ${text}`)
  }
  
  return res.json()
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

    // Get or create the skipped channel
    const channelSlug = await getOrCreateSkippedChannel()
    if (!channelSlug) {
      return NextResponse.json({ error: 'Failed to get/create skipped channel' }, { status: 500 })
    }

    // Connect the block to the skipped channel
    await connectBlockToChannel(blockId, channelSlug)

    return NextResponse.json({ 
      success: true, 
      channel: SKIPPED_CHANNEL_TITLE,
      slug: channelSlug,
    })
  } catch (error) {
    console.error('Error skipping block:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


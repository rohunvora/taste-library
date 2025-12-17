import { NextRequest, NextResponse } from 'next/server'

const ARENA_TOKEN = process.env.ARENA_TOKEN!
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG || 'frank-degods'

// Map our category keys to Are.na channel titles
const CHANNEL_MAP: Record<string, string> = {
  'ui-ux': 'UI/UX',
  'writing': 'Writing',
  'code': 'Code',
  'thinking': 'Frameworks',
}

async function getChannelSlug(title: string): Promise<string | null> {
  const res = await fetch(
    `https://api.are.na/v2/users/${ARENA_USER_SLUG}/channels?per=100`,
    {
      headers: {
        'Authorization': `Bearer ${ARENA_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  )
  
  if (!res.ok) return null
  
  const data = await res.json()
  const channel = data.channels?.find(
    (ch: any) => ch.title.toLowerCase() === title.toLowerCase()
  )
  
  return channel?.slug || null
}

async function createChannel(title: string): Promise<string | null> {
  const res = await fetch(
    `https://api.are.na/v2/channels`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ARENA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        status: 'private',
      }),
    }
  )
  
  if (!res.ok) return null
  
  const data = await res.json()
  return data.slug || null
}

async function connectBlockToChannel(blockId: number, channelSlug: string) {
  const res = await fetch(
    `https://api.are.na/v2/channels/${channelSlug}/connections`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ARENA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connectable_type: 'Block',
        connectable_id: blockId,
      }),
    }
  )
  
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
    const { blockId, channel, customChannel, createNew } = body

    if (!blockId) {
      return NextResponse.json({ error: 'Missing blockId' }, { status: 400 })
    }

    let channelTitle: string
    let channelSlug: string | null

    if (createNew && customChannel) {
      // Create a new channel
      channelTitle = customChannel
      channelSlug = await createChannel(customChannel)
      if (!channelSlug) {
        return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
      }
    } else if (customChannel) {
      // Use existing custom channel by name
      channelTitle = customChannel
      channelSlug = await getChannelSlug(customChannel)
      if (!channelSlug) {
        return NextResponse.json({ error: `Channel "${customChannel}" not found` }, { status: 404 })
      }
    } else if (channel) {
      // Use predefined channel
      channelTitle = CHANNEL_MAP[channel]
      if (!channelTitle) {
        return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
      }
      channelSlug = await getChannelSlug(channelTitle)
      if (!channelSlug) {
        return NextResponse.json({ error: `Channel "${channelTitle}" not found` }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'Missing channel' }, { status: 400 })
    }

    // Connect the block
    await connectBlockToChannel(blockId, channelSlug)

    return NextResponse.json({ 
      success: true, 
      channel: channelTitle,
      slug: channelSlug,
      created: createNew || false,
    })
  } catch (error) {
    console.error('Error classifying block:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

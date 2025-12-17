import { NextRequest, NextResponse } from 'next/server'

const ARENA_TOKEN = process.env.ARENA_TOKEN!
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG || 'frank-degods'

// Map our category keys to Are.na channel titles
const CHANNEL_MAP: Record<string, string> = {
  'ui-ux': 'UI/UX',
  'writing': 'Writing',
  'code': 'Code',
  'thinking': 'Frameworks',
  'skip': 'Classifier - Skipped',
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

async function disconnectBlockFromChannel(blockId: number, channelSlug: string) {
  const res = await fetch(
    `https://api.are.na/v2/channels/${channelSlug}?per=100`,
    {
      headers: {
        'Authorization': `Bearer ${ARENA_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  )
  
  if (!res.ok) {
    throw new Error(`Failed to fetch channel: ${res.status}`)
  }
  
  const data = await res.json()
  
  const connection = data.contents?.find((item: any) => item.id === blockId)
  
  if (!connection) {
    throw new Error('Block not found in channel')
  }
  
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
    const text = await deleteRes.text()
    throw new Error(`Failed to disconnect: ${deleteRes.status} ${text}`)
  }
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    if (!ARENA_TOKEN) {
      return NextResponse.json({ error: 'ARENA_TOKEN not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { blockId, channel, customChannel, isSkip } = body

    if (!blockId) {
      return NextResponse.json({ error: 'Missing blockId' }, { status: 400 })
    }

    let channelTitle: string
    let channelSlug: string | null

    if (isSkip) {
      // Undoing a skip - disconnect from Skipped channel
      channelTitle = CHANNEL_MAP['skip']
      channelSlug = await getChannelSlug(channelTitle)
    } else if (customChannel) {
      // Custom channel - use the title directly
      channelTitle = customChannel
      channelSlug = await getChannelSlug(customChannel)
    } else if (channel) {
      // Predefined channel
      channelTitle = CHANNEL_MAP[channel]
      if (!channelTitle) {
        return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
      }
      channelSlug = await getChannelSlug(channelTitle)
    } else {
      return NextResponse.json({ error: 'Missing channel' }, { status: 400 })
    }

    if (!channelSlug) {
      return NextResponse.json({ error: `Channel "${channelTitle}" not found` }, { status: 404 })
    }

    // Disconnect the block
    await disconnectBlockFromChannel(blockId, channelSlug)

    return NextResponse.json({ success: true, channel: channelTitle })
  } catch (error) {
    console.error('Error undoing classification:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

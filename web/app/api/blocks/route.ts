import { NextResponse } from 'next/server'

const ARENA_TOKEN = process.env.ARENA_TOKEN!
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG || 'frank-degods'

// Default category channels
const DEFAULT_CHANNELS = ['UI/UX', 'Writing', 'Code', 'Frameworks']

// System channels that filter blocks out of the queue
const SYSTEM_CHANNELS = [...DEFAULT_CHANNELS, 'Classifier - Skipped']

interface ArenaBlock {
  id: number
  title: string | null
  description: string | null
  content: string | null
  class: string
  source?: {
    url: string | null
    title: string | null
  }
  image?: {
    display?: { url: string }
    thumb?: { url: string }
  }
}

interface ArenaChannel {
  id: number
  title: string
  slug: string
  length: number
  created_at: string
}

async function arenaFetch(endpoint: string) {
  const res = await fetch(`https://api.are.na/v2${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${ARENA_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Are.na API error: ${res.status}`)
  }
  return res.json()
}

async function getChannels(): Promise<ArenaChannel[]> {
  const data = await arenaFetch(`/users/${ARENA_USER_SLUG}/channels?per=100`)
  return data.channels || []
}

async function getChannelBlocks(slug: string, limit: number = 100): Promise<ArenaBlock[]> {
  const data = await arenaFetch(`/channels/${slug}/contents?per=${limit}`)
  if (!data.contents) return []
  return data.contents.filter((b: any) => b.class !== 'Channel')
}

export async function GET() {
  try {
    if (!ARENA_TOKEN) {
      return NextResponse.json({ error: 'ARENA_TOKEN not configured' }, { status: 500 })
    }

    const channels = await getChannels()
    const systemChannelsLower = SYSTEM_CHANNELS.map(c => c.toLowerCase())
    
    // Separate system channels from content channels
    const systemChannelsList = channels.filter(ch => 
      systemChannelsLower.includes(ch.title.toLowerCase())
    )
    const contentChannels = channels.filter(ch => 
      !systemChannelsLower.includes(ch.title.toLowerCase()) && ch.length > 0
    )

    // Fetch system channels (to know what to exclude) and content channels IN PARALLEL
    const [systemBlocksResults, contentBlocksResults] = await Promise.all([
      // Fetch all system channel blocks
      Promise.all(
        systemChannelsList
          .filter(ch => ch.length > 0)
          .map(ch => getChannelBlocks(ch.slug, 200).then(blocks => ({ channel: ch, blocks })))
      ),
      // Fetch content channel blocks (limit to first 50 blocks per channel for speed)
      Promise.all(
        contentChannels
          .slice(0, 20) // Limit to 20 channels for speed
          .map(ch => getChannelBlocks(ch.slug, 50).then(blocks => ({ channel: ch, blocks })))
      ),
    ])

    // Build set of block IDs that are in system channels (already classified)
    const classifiedBlockIds = new Set<number>()
    for (const { blocks } of systemBlocksResults) {
      for (const block of blocks) {
        classifiedBlockIds.add(block.id)
      }
    }

    // Build map of unclassified blocks
    const blockMap = new Map<number, { block: ArenaBlock; channels: string[] }>()
    
    for (const { channel, blocks } of contentBlocksResults) {
      for (const block of blocks) {
        // Skip if already classified
        if (classifiedBlockIds.has(block.id)) continue
        
        if (!blockMap.has(block.id)) {
          blockMap.set(block.id, { block, channels: [] })
        }
        blockMap.get(block.id)!.channels.push(channel.title)
      }
    }

    // Convert to array
    const unclassified = Array.from(blockMap.values()).map(({ block, channels }) => ({
      id: block.id,
      title: block.title,
      description: block.description,
      content: block.content,
      class: block.class,
      source: block.source || null,
      image: block.image,
      sourceChannels: channels,
    }))

    // Return all channels for the modal
    const allChannels = channels.map(ch => ({ 
      title: ch.title, 
      slug: ch.slug,
      count: ch.length,
      isSystem: systemChannelsLower.includes(ch.title.toLowerCase()),
    }))

    return NextResponse.json({ 
      blocks: unclassified,
      total: unclassified.length,
      channels: allChannels,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'

const ARENA_TOKEN = process.env.ARENA_TOKEN!
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG || 'frank-degods'

// Channels to clear
const TARGET_CHANNEL_TITLES = ['UI/UX', 'Web', 'Writing', 'Code', 'Frameworks']

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

async function getChannelByTitle(title: string): Promise<{ slug: string; id: number } | null> {
  const res = await arenaFetch(`/users/${ARENA_USER_SLUG}/channels?per=100`)
  if (!res.ok) return null
  
  const data = await res.json()
  const channel = data.channels?.find(
    (ch: any) => ch.title.toLowerCase() === title.toLowerCase()
  )
  
  return channel ? { slug: channel.slug, id: channel.id } : null
}

async function getChannelBlocks(slug: string): Promise<Array<{ id: number }>> {
  const blocks: Array<{ id: number }> = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const res = await arenaFetch(`/channels/${slug}/contents?page=${page}&per=50`)
    if (!res.ok) break
    
    const data = await res.json()
    if (data.contents && data.contents.length > 0) {
      const nonChannelBlocks = data.contents.filter((b: any) => b.class !== 'Channel')
      blocks.push(...nonChannelBlocks.map((b: any) => ({ id: b.id })))
      hasMore = data.contents.length === 50
      page++
    } else {
      hasMore = false
    }
  }

  return blocks
}

async function disconnectBlock(channelSlug: string, blockId: number): Promise<boolean> {
  const res = await arenaFetch(`/channels/${channelSlug}/blocks/${blockId}`, {
    method: 'DELETE',
  })
  return res.ok
}

export async function POST() {
  try {
    if (!ARENA_TOKEN) {
      return NextResponse.json({ error: 'ARENA_TOKEN not configured' }, { status: 500 })
    }

    const results: Array<{ channel: string; disconnected: number; failed: number }> = []

    for (const title of TARGET_CHANNEL_TITLES) {
      console.log(`Processing channel: ${title}`)
      
      const channel = await getChannelByTitle(title)
      if (!channel) {
        console.log(`  Channel not found: ${title}`)
        continue
      }

      const blocks = await getChannelBlocks(channel.slug)
      console.log(`  Found ${blocks.length} blocks in ${title}`)

      let disconnected = 0
      let failed = 0

      for (const block of blocks) {
        const success = await disconnectBlock(channel.slug, block.id)
        if (success) {
          disconnected++
        } else {
          failed++
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      results.push({ channel: title, disconnected, failed })
      console.log(`  Disconnected: ${disconnected}, Failed: ${failed}`)
    }

    return NextResponse.json({
      success: true,
      results,
      total: results.reduce((sum, r) => sum + r.disconnected, 0),
    })
  } catch (error) {
    console.error('Error nuking channels:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


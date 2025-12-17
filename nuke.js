const ARENA_TOKEN = '2GYcGOkPNoYCMbBO7_WBwnAZ6miKiRQldZhuLlR8h7A';
const ARENA_USER_SLUG = 'frank-degods';
const TARGET_CHANNEL_TITLES = ['UI/UX', 'Web', 'Writing', 'Code', 'Frameworks'];

async function arenaFetch(endpoint, options = {}) {
  const res = await fetch(`https://api.are.na/v2${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ARENA_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res;
}

async function getChannelByTitle(title) {
  const res = await arenaFetch(`/users/${ARENA_USER_SLUG}/channels?per=100`);
  if (!res.ok) return null;
  const data = await res.json();
  const channel = data.channels?.find(ch => ch.title.toLowerCase() === title.toLowerCase());
  return channel ? { slug: channel.slug, id: channel.id } : null;
}

async function getChannelBlocks(slug) {
  const blocks = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const res = await arenaFetch(`/channels/${slug}/contents?page=${page}&per=50`);
    if (!res.ok) break;
    const data = await res.json();
    if (data.contents && data.contents.length > 0) {
      const nonChannelBlocks = data.contents.filter(b => b.class !== 'Channel');
      blocks.push(...nonChannelBlocks.map(b => ({ id: b.id })));
      hasMore = data.contents.length === 50;
      page++;
    } else {
      hasMore = false;
    }
  }
  return blocks;
}

async function disconnectBlock(channelSlug, blockId) {
  const res = await arenaFetch(`/channels/${channelSlug}/blocks/${blockId}`, { method: 'DELETE' });
  return res.ok;
}

async function main() {
  console.log('🔥 Nuking auto-classified connections...\n');
  
  for (const title of TARGET_CHANNEL_TITLES) {
    console.log(`📁 Processing: ${title}`);
    const channel = await getChannelByTitle(title);
    if (!channel) {
      console.log(`   ⚠️  Channel not found\n`);
      continue;
    }
    
    const blocks = await getChannelBlocks(channel.slug);
    console.log(`   Found ${blocks.length} blocks`);
    
    let disconnected = 0;
    for (const block of blocks) {
      const success = await disconnectBlock(channel.slug, block.id);
      if (success) disconnected++;
      process.stdout.write(`\r   Disconnecting: ${disconnected}/${blocks.length}`);
      await new Promise(r => setTimeout(r, 150));
    }
    console.log(`\n   ✅ Done: ${disconnected} disconnected\n`);
  }
  
  console.log('🎉 Nuke complete!');
}

main().catch(console.error);

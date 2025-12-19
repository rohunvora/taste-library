// Cleanup script: Remove blocks from non-protected channels
import 'dotenv/config';

const ARENA_TOKEN = process.env.ARENA_TOKEN;
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG || 'frank-degods';

// Channels to KEEP - everything else gets emptied
const PROTECTED_SLUGS = [
  'frameworks-r-dqkw8yxcm',
  'ui-ux-uqgmlf-rw1i',        // Correct UI/UX from classifier
  'writing-jnqfq9dx_ki',
  'code-vbpxtv0724c',
  'frank-core',
  'good-channels-hobzmosioa8',
  'scroll-stoppers',
  'classifier-skipped',
  'archive-nyvis-omhbs',       // Keep archive
];

async function arenaFetch(endpoint, options = {}) {
  const res = await fetch(`https://api.are.na/v2${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ARENA_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Are.na API error: ${res.status} ${text}`);
  }
  return res.json();
}

async function getChannels() {
  const channels = [];
  let page = 1;
  while (true) {
    const data = await arenaFetch(`/users/${ARENA_USER_SLUG}/channels?page=${page}&per=100`);
    if (!data.channels || data.channels.length === 0) break;
    channels.push(...data.channels);
    if (data.channels.length < 100) break;
    page++;
  }
  return channels;
}

async function getChannelBlocks(slug) {
  const blocks = [];
  let page = 1;
  while (true) {
    const data = await arenaFetch(`/channels/${slug}/contents?page=${page}&per=100`);
    if (!data.contents || data.contents.length === 0) break;
    const onlyBlocks = data.contents.filter(b => b.class !== 'Channel');
    blocks.push(...onlyBlocks);
    if (data.contents.length < 100) break;
    page++;
  }
  return blocks;
}

async function disconnectBlockFromChannel(blockId, channelSlug) {
  const res = await fetch(`https://api.are.na/v2/channels/${channelSlug}/blocks/${blockId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${ARENA_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to disconnect: ${res.status}`);
  }
}

async function main() {
  console.log('=== Cleanup Script ===\n');
  console.log('This will REMOVE blocks from non-protected channels.\n');
  
  if (!ARENA_TOKEN) {
    console.error('Missing ARENA_TOKEN in .env');
    process.exit(1);
  }
  
  // Get all channels
  console.log('Fetching all channels...');
  const allChannels = await getChannels();
  console.log(`Found ${allChannels.length} channels\n`);
  
  // Identify channels to clean
  const protectedSet = new Set(PROTECTED_SLUGS.map(s => s.toLowerCase()));
  const channelsToClean = [];
  
  console.log('Protected channels:');
  for (const ch of allChannels) {
    if (protectedSet.has(ch.slug.toLowerCase())) {
      console.log(`  ✓ ${ch.title} (${ch.slug})`);
    } else {
      channelsToClean.push(ch);
    }
  }
  
  console.log(`\nChannels to clean (${channelsToClean.length}):`);
  for (const ch of channelsToClean) {
    console.log(`  ✗ ${ch.title} (${ch.slug}) - ${ch.length} items`);
  }
  
  // Clean each non-protected channel
  console.log('\n--- Removing blocks from non-protected channels ---\n');
  
  let totalRemoved = 0;
  let totalErrors = 0;
  
  for (const ch of channelsToClean) {
    if (ch.length === 0) {
      console.log(`${ch.title}: empty, skipping`);
      continue;
    }
    
    console.log(`${ch.title}: fetching ${ch.length} items...`);
    const blocks = await getChannelBlocks(ch.slug);
    
    for (const block of blocks) {
      try {
        await disconnectBlockFromChannel(block.id, ch.slug);
        totalRemoved++;
        // Rate limit
        await new Promise(r => setTimeout(r, 50));
      } catch (e) {
        console.error(`  Error removing block ${block.id}: ${e.message}`);
        totalErrors++;
      }
    }
    console.log(`  Removed ${blocks.length} blocks`);
  }
  
  console.log(`\n=== Done ===`);
  console.log(`Total blocks removed from old channels: ${totalRemoved}`);
  console.log(`Errors: ${totalErrors}`);
  console.log('\nYour protected channels are untouched.');
  console.log('Blocks are still in Archive for reference.');
}

main().catch(console.error);


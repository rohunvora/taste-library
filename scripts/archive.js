// One-time script to move all blocks not in protected channels to Archive
import 'dotenv/config';

const ARENA_TOKEN = process.env.ARENA_TOKEN;
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG || 'frank-degods';

// Channels to NOT touch - blocks here stay where they are
const PROTECTED_CHANNELS = [
  'frameworks',
  'ui-ux',
  'writing', 
  'code',
  'frank-core',
  'good-channels',
  'scroll-stoppers',
  'classifier-skipped', // System channel
];

const ARCHIVE_CHANNEL_TITLE = 'Archive';

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
    // Filter out channels (we only want blocks)
    const onlyBlocks = data.contents.filter(b => b.class !== 'Channel');
    blocks.push(...onlyBlocks);
    if (data.contents.length < 100) break;
    page++;
  }
  return blocks;
}

async function getOrCreateArchiveChannel() {
  // Check if Archive channel exists
  const channels = await getChannels();
  const existing = channels.find(ch => ch.title.toLowerCase() === ARCHIVE_CHANNEL_TITLE.toLowerCase());
  
  if (existing) {
    console.log(`Found existing Archive channel: ${existing.slug}`);
    return existing.slug;
  }
  
  // Create it
  console.log('Creating Archive channel...');
  const data = await arenaFetch('/channels', {
    method: 'POST',
    body: JSON.stringify({
      title: ARCHIVE_CHANNEL_TITLE,
      status: 'private',
    }),
  });
  console.log(`Created Archive channel: ${data.slug}`);
  return data.slug;
}

async function connectBlockToChannel(blockId, channelSlug) {
  await arenaFetch(`/channels/${channelSlug}/connections`, {
    method: 'POST',
    body: JSON.stringify({
      connectable_type: 'Block',
      connectable_id: blockId,
    }),
  });
}

async function main() {
  console.log('=== Archive Script ===\n');
  
  if (!ARENA_TOKEN) {
    console.error('Missing ARENA_TOKEN in .env');
    process.exit(1);
  }
  
  // Get all channels
  console.log('Fetching all channels...');
  const allChannels = await getChannels();
  console.log(`Found ${allChannels.length} channels\n`);
  
  // Identify protected channels (by slug, case-insensitive)
  const protectedSlugs = new Set();
  const protectedTitles = PROTECTED_CHANNELS.map(c => c.toLowerCase().replace(/-/g, ' '));
  
  for (const ch of allChannels) {
    const slugNorm = ch.slug.toLowerCase();
    const titleNorm = ch.title.toLowerCase();
    
    if (PROTECTED_CHANNELS.includes(slugNorm) || 
        protectedTitles.includes(titleNorm) ||
        protectedTitles.includes(slugNorm.replace(/-/g, ' '))) {
      protectedSlugs.add(ch.slug);
      console.log(`Protected: ${ch.title} (${ch.slug})`);
    }
  }
  
  console.log(`\n${protectedSlugs.size} protected channels\n`);
  
  // Get or create Archive channel
  const archiveSlug = await getOrCreateArchiveChannel();
  protectedSlugs.add(archiveSlug); // Don't process Archive itself
  
  // Collect all blocks from protected channels (these should NOT be archived)
  console.log('\nFetching blocks from protected channels...');
  const protectedBlockIds = new Set();
  
  for (const slug of protectedSlugs) {
    const blocks = await getChannelBlocks(slug);
    for (const block of blocks) {
      protectedBlockIds.add(block.id);
    }
    console.log(`  ${slug}: ${blocks.length} blocks`);
  }
  console.log(`\n${protectedBlockIds.size} blocks in protected channels (will NOT archive)\n`);
  
  // Collect all blocks from non-protected channels
  console.log('Fetching blocks from other channels...');
  const blocksToArchive = new Map(); // blockId -> block
  
  for (const ch of allChannels) {
    if (protectedSlugs.has(ch.slug)) continue;
    if (ch.length === 0) continue;
    
    const blocks = await getChannelBlocks(ch.slug);
    for (const block of blocks) {
      // Only archive if not in a protected channel
      if (!protectedBlockIds.has(block.id)) {
        blocksToArchive.set(block.id, block);
      }
    }
    console.log(`  ${ch.title}: ${blocks.length} blocks`);
  }
  
  console.log(`\n${blocksToArchive.size} unique blocks to archive\n`);
  
  if (blocksToArchive.size === 0) {
    console.log('Nothing to archive! All blocks are already in protected channels.');
    return;
  }
  
  // Connect blocks to Archive
  console.log(`Connecting ${blocksToArchive.size} blocks to Archive...`);
  let count = 0;
  let errors = 0;
  
  for (const [blockId, block] of blocksToArchive) {
    try {
      await connectBlockToChannel(blockId, archiveSlug);
      count++;
      if (count % 10 === 0) {
        console.log(`  ${count}/${blocksToArchive.size} archived...`);
      }
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      console.error(`  Failed to archive block ${blockId}: ${e.message}`);
      errors++;
    }
  }
  
  console.log(`\n=== Done ===`);
  console.log(`Archived: ${count} blocks`);
  console.log(`Errors: ${errors}`);
  console.log(`Archive channel: ${archiveSlug}`);
}

main().catch(console.error);

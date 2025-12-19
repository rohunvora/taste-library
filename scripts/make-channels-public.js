#!/usr/bin/env node

/**
 * Make channels public
 * 
 * Updates the visibility of target channels to public on Are.na.
 * 
 * Usage:
 *   ARENA_TOKEN=xxx ARENA_USER=rohun node scripts/make-channels-public.js
 */

const ARENA_API_BASE = 'https://api.are.na/v2';

// Channels to make public (by slug)
const CHANNELS_TO_MAKE_PUBLIC = [
  'ui-ux',
  'web',
  'writing',
  'code',
  'frameworks',
  'index',
];

async function updateChannel(token, slug, status) {
  const res = await fetch(`${ARENA_API_BASE}/channels/${slug}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'no body');
    throw new Error(`Failed to update ${slug}: ${res.status} ${res.statusText} - ${errBody.slice(0, 200)}`);
  }

  return res.json();
}

async function getChannels(token, userSlug) {
  const res = await fetch(`${ARENA_API_BASE}/users/${userSlug}/channels?per=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch channels: ${res.status}`);
  }

  const data = await res.json();
  return data.channels || [];
}

async function main() {
  const token = process.env.ARENA_TOKEN;
  const userSlug = process.env.ARENA_USER;

  if (!token || !userSlug) {
    console.error('❌ Missing environment variables');
    console.error('   Usage: ARENA_TOKEN=xxx ARENA_USER=rohun node scripts/make-channels-public.js');
    process.exit(1);
  }

  console.log('🔍 Fetching channels...');
  const channels = await getChannels(token, userSlug);
  
  console.log(`📂 Found ${channels.length} channels`);
  console.log('');

  // Find and update target channels
  for (const targetSlug of CHANNELS_TO_MAKE_PUBLIC) {
    const channel = channels.find(ch => ch.slug === targetSlug || ch.slug.includes(targetSlug));
    
    if (!channel) {
      console.log(`⚠️  Channel "${targetSlug}" not found, skipping`);
      continue;
    }

    if (channel.status === 'public') {
      console.log(`✅ ${channel.title} (${channel.slug}) - already public`);
      continue;
    }

    try {
      console.log(`🔄 Making "${channel.title}" (${channel.slug}) public...`);
      await updateChannel(token, channel.slug, 'public');
      console.log(`✅ ${channel.title} - now public!`);
    } catch (error) {
      console.error(`❌ Failed to update ${channel.title}: ${error.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('');
  console.log('✨ Done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

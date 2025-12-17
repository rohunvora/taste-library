import 'dotenv/config';
import { ArenaClient } from './arena-client.js';
import { classifyBlocks } from './classifier.js';
import { generateLabelsForBlocks } from './labeler.js';
import { TARGET_CHANNELS, CHANNEL_TITLES } from './config.js';
import type { ClassificationResult, OrganizeReport, ArenaChannel } from './types.js';

// Parse command line arguments
const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const fetchMetadata = args.includes('--fetch-metadata');

async function main() {
  // Validate environment
  const token = process.env.ARENA_TOKEN;
  const userSlug = process.env.ARENA_USER_SLUG;

  if (!token || !userSlug) {
    console.error('❌ Missing ARENA_TOKEN or ARENA_USER_SLUG in .env file');
    console.error('   Create a .env file with:');
    console.error('   ARENA_TOKEN=your_token_here');
    console.error('   ARENA_USER_SLUG=your_username');
    process.exit(1);
  }

  console.log('\n🗂️  Are.na Organizer');
  console.log('━'.repeat(50));
  console.log(`Mode: ${shouldApply ? '🔴 APPLY (making changes)' : '🟢 DRY RUN (preview only)'}`);
  console.log(`User: ${userSlug}`);
  console.log('━'.repeat(50) + '\n');

  const client = new ArenaClient(token, userSlug);

  // Step 1: Fetch all channels
  const channels = await client.getChannels();

  if (channels.length === 0) {
    console.log('No channels found. Nothing to organize.');
    return;
  }

  // Step 2: Fetch all blocks across channels
  console.log('\n📚 Fetching blocks from all channels...');
  const blockMap = await client.getAllBlocks(channels);
  console.log(`\n   Total unique blocks: ${blockMap.size}`);

  // Step 3: Classify blocks
  console.log('\n🏷️  Classifying blocks...');
  const results = classifyBlocks(blockMap);

  // Step 4: Generate report
  const report = generateReport(results, channels);

  // Step 5: Display results
  displayReport(report);

  // Step 6: Apply changes if requested
  if (shouldApply) {
    await applyChanges(client, report, channels, fetchMetadata);
  } else {
    console.log('\n💡 To apply these changes, run:');
    console.log('   npm run organize:apply');
    console.log('\n   Or with auto-labeling:');
    console.log('   npm run organize:apply -- --fetch-metadata');
  }
}

// Helper to find an existing channel by our internal key
function findExistingChannel(
  key: string,
  existingChannels: ArenaChannel[]
): ArenaChannel | undefined {
  const title = CHANNEL_TITLES[key] || key;
  // Match by title (case-insensitive) or slug containing our key
  return existingChannels.find(
    (ch) =>
      ch.title.toLowerCase() === title.toLowerCase() ||
      ch.slug.toLowerCase() === key.toLowerCase() ||
      ch.slug.toLowerCase().replace(/-/g, '') === key.toLowerCase().replace(/-/g, '')
  );
}

function generateReport(
  results: ClassificationResult[],
  existingChannels: ArenaChannel[]
): OrganizeReport {
  const classified = results.filter((r) => r.targetChannels.length > 0);
  const skipped = results.filter((r) => r.targetChannels.length === 0);

  // Determine which target channels need to be created
  const neededChannels = new Set<string>();

  for (const result of classified) {
    for (const target of result.targetChannels) {
      neededChannels.add(target);
    }
  }

  const channelsToCreate = Array.from(neededChannels).filter(
    (key) => !findExistingChannel(key, existingChannels)
  );

  return {
    totalBlocks: results.length,
    classified: classified.length,
    skipped: skipped.length,
    results: classified,
    channelsToCreate,
  };
}

function displayReport(report: OrganizeReport) {
  console.log('\n📊 Classification Report');
  console.log('━'.repeat(50));
  console.log(`Total blocks:     ${report.totalBlocks}`);
  console.log(`To be organized:  ${report.classified}`);
  console.log(`Skipped:          ${report.skipped}`);
  console.log('━'.repeat(50));

  if (report.channelsToCreate.length > 0) {
    console.log('\n📁 Channels to create:');
    for (const slug of report.channelsToCreate) {
      console.log(`   + ${CHANNEL_TITLES[slug] || slug}`);
    }
  }

  // Group by target channel for summary
  const byTarget = new Map<string, ClassificationResult[]>();
  for (const result of report.results) {
    for (const target of result.targetChannels) {
      if (!byTarget.has(target)) {
        byTarget.set(target, []);
      }
      byTarget.get(target)!.push(result);
    }
  }

  console.log('\n📋 Blocks by target channel:');
  for (const [target, blocks] of byTarget) {
    console.log(`\n   ${CHANNEL_TITLES[target] || target} (${blocks.length} blocks)`);
    // Show first 5 examples
    const examples = blocks.slice(0, 5);
    for (const result of examples) {
      const title = result.block.title || result.block.source?.title || '[Untitled]';
      const truncated = title.length > 50 ? title.slice(0, 47) + '...' : title;
      console.log(`      • ${truncated}`);
    }
    if (blocks.length > 5) {
      console.log(`      ... and ${blocks.length - 5} more`);
    }
  }
}

async function applyChanges(
  client: ArenaClient,
  report: OrganizeReport,
  existingChannels: ArenaChannel[],
  fetchMetadata: boolean
) {
  console.log('\n🚀 Applying changes...');

  // Build channel map using our internal keys
  const channelMap = new Map<string, ArenaChannel>();
  
  // Map existing channels to our internal keys
  for (const key of Object.values(TARGET_CHANNELS)) {
    const existing = findExistingChannel(key, existingChannels);
    if (existing) {
      channelMap.set(key, existing);
    }
  }

  for (const key of report.channelsToCreate) {
    const title = CHANNEL_TITLES[key] || key;
    console.log(`   📁 Creating channel: ${title}`);
    try {
      const newChannel = await client.createChannel(title, 'private');
      channelMap.set(key, newChannel);
    } catch (error) {
      console.error(`   ❌ Failed to create channel ${title}:`, error);
    }
  }

  // Connect blocks to channels
  let connected = 0;
  let failed = 0;

  for (const result of report.results) {
    for (const targetSlug of result.targetChannels) {
      const targetChannel = channelMap.get(targetSlug);
      if (!targetChannel) {
        console.error(`   ⚠️  Channel not found: ${targetSlug}`);
        failed++;
        continue;
      }

      try {
        console.log(`   🔗 Connecting block ${result.block.id} to ${targetChannel.title}`);
        await client.connectBlockToChannel(result.block.id, targetChannel.slug);
        connected++;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`   ❌ Failed to connect block ${result.block.id}:`, error);
        failed++;
      }
    }
  }

  // Generate and apply labels if requested
  if (fetchMetadata) {
    console.log('\n📝 Generating labels...');
    const blocksNeedingLabels = report.results
      .filter((r) => !r.block.description || r.block.description.trim().length < 20)
      .map((r) => r.block);

    const labels = await generateLabelsForBlocks(blocksNeedingLabels, { fetchMetadata: true });

    for (const [blockId, label] of labels) {
      try {
        console.log(`   📝 Labeling block ${blockId}`);
        await client.updateBlockDescription(blockId, label);
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`   ❌ Failed to label block ${blockId}:`, error);
      }
    }
  }

  console.log('\n✅ Done!');
  console.log(`   Connected: ${connected}`);
  console.log(`   Failed: ${failed}`);
}

main().catch(console.error);


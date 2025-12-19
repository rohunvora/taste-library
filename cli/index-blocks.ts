import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArenaClient } from './arena-client.js';
import type { ArenaBlock } from './types.js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ARENA_TOKEN = process.env.ARENA_TOKEN;
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const INDEX_DIR = 'taste-profiles';

// ============================================================================
// TAG TAXONOMY (see TAGS.md for full descriptions)
// ============================================================================

const TAG_PROMPT = `You are a design librarian. Analyze this UI/UX reference and output tags.

## Tag Categories

### component (what UI elements are shown)
Options: hero, navbar, footer, sidebar, cards, dashboard, metrics, charts, form, modal, toast, button, cta, pricing, testimonials, feature-grid, bento, gallery, profile, settings, onboarding, empty-state, error-state, loading, search, filters, table, list, timeline, calendar, map

### style (visual treatment)
Options: dark-mode, light-mode, glassmorphism, neumorphism, brutalist, minimal, maximal, rounded, sharp, gradient, flat, 3d, illustrated, photographic, geometric, organic, high-contrast, muted, neon, pastel, monochrome, duotone

### context (where would this be used)
Options: landing-page, saas, mobile-app, desktop-app, marketing, e-commerce, fintech, health, productivity, social, media, developer-tools, b2b, b2c, enterprise, startup, portfolio, blog, docs

### vibe (emotional quality)
Options: playful, serious, premium, budget, trustworthy, edgy, calm, energetic, friendly, professional, futuristic, retro, warm, cold, confident, humble, bold, subtle

## Rules
- Output 2-5 tags per category (only what clearly applies)
- Skip categories if uncertain
- Be specific over generic
- Output valid JSON only

## Output Format
{
  "component": ["..."],
  "style": ["..."],
  "context": ["..."],
  "vibe": ["..."],
  "one_liner": "One sentence describing what this is"
}`;

// ============================================================================
// TYPES
// ============================================================================

interface BlockIndex {
  id: number;
  title: string | null;
  arena_url: string;
  image_url: string | null;
  tags: {
    component?: string[];
    style?: string[];
    context?: string[];
    vibe?: string[];
  };
  one_liner: string;
  indexed_at: string;
}

interface ChannelIndex {
  channel_slug: string;
  channel_title: string;
  indexed_at: string;
  blocks: BlockIndex[];
}

// ============================================================================
// HELPERS
// ============================================================================

async function downloadImage(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (contentType.includes('gif')) return null; // Skip GIFs
    
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    return { base64, mimeType: contentType.split(';')[0] };
  } catch {
    return null;
  }
}

function loadExistingIndex(channelSlug: string): ChannelIndex | null {
  const indexPath = path.join(INDEX_DIR, channelSlug, 'index.json');
  if (fs.existsSync(indexPath)) {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  }
  return null;
}

function saveIndex(channelSlug: string, index: ChannelIndex): void {
  const dir = path.join(INDEX_DIR, channelSlug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 2));
}

// ============================================================================
// MAIN INDEXER
// ============================================================================

async function indexBlocks(channelSlug: string, options: { force?: boolean; dryRun?: boolean } = {}) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    BLOCK INDEXER                              ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!ARENA_TOKEN || !ARENA_USER_SLUG || !GEMINI_API_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const client = new ArenaClient(ARENA_TOKEN, ARENA_USER_SLUG);
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  console.log(`📂 Target channel: ${channelSlug}`);
  if (options.dryRun) console.log('🔍 DRY RUN - no changes will be made\n');
  if (options.force) console.log('⚠️  FORCE MODE - re-indexing all blocks\n');

  // Load existing index
  const existingIndex = loadExistingIndex(channelSlug);
  const existingBlockIds = new Set(existingIndex?.blocks.map(b => b.id) || []);

  // Fetch channel info
  const channel = await client.getChannel(channelSlug);
  if (!channel) {
    console.log('❌ Channel not found');
    return;
  }

  // Fetch blocks
  console.log('\n📥 Fetching blocks...');
  const blocks = await client.getChannelBlocks(channelSlug);
  console.log(`   Found ${blocks.length} blocks`);

  // Filter to only image/attachment blocks (visual references)
  const visualBlocks = blocks.filter(b => 
    b.class === 'Image' || b.class === 'Attachment'
  );
  console.log(`   ${visualBlocks.length} visual blocks to index`);

  // Filter out already-indexed (unless force)
  const toIndex = options.force 
    ? visualBlocks 
    : visualBlocks.filter(b => !existingBlockIds.has(b.id));
  
  console.log(`   ${toIndex.length} blocks need indexing\n`);

  // Start with existing blocks (unless force)
  const indexedBlocks: BlockIndex[] = options.force 
    ? [] 
    : (existingIndex?.blocks || []);

  if (toIndex.length === 0) {
    console.log('✅ All blocks already indexed!');
    console.log(`   Index location: ${INDEX_DIR}/${channelSlug}/index.json`);
    return;
  }

  // Index each block
  let indexed = 0;
  let failed = 0;

  for (let i = 0; i < toIndex.length; i++) {
    const block = toIndex[i];
    const imageUrl = block.image?.display?.url || block.image?.thumb?.url;
    
    console.log(`[${i + 1}/${toIndex.length}] ${block.title || '(untitled)'}`);

    if (!imageUrl) {
      console.log('   ⚠️ No image URL, skipping');
      failed++;
      continue;
    }

    // Download image
    const imageData = await downloadImage(imageUrl);
    if (!imageData) {
      console.log('   ⚠️ Failed to download image');
      failed++;
      continue;
    }

    // Call Gemini
    try {
      const result = await model.generateContent([
        { text: TAG_PROMPT },
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.base64,
          },
        },
      ]);

      const response = result.response.text();
      
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('   ⚠️ No valid JSON in response');
        failed++;
        continue;
      }

      const tags = JSON.parse(jsonMatch[0]);
      
      console.log(`   ✅ ${tags.component?.join(', ') || 'tagged'}`);

      // Add to index
      const blockEntry: BlockIndex = {
        id: block.id,
        title: block.title,
        arena_url: `https://www.are.na/block/${block.id}`,
        image_url: imageUrl,
        tags: {
          component: tags.component,
          style: tags.style,
          context: tags.context,
          vibe: tags.vibe,
        },
        one_liner: tags.one_liner || '',
        indexed_at: new Date().toISOString(),
      };

      if (!options.dryRun) {
        indexedBlocks.push(blockEntry);
      } else {
        console.log(`   📝 Would add: ${tags.one_liner?.slice(0, 50) || '...'}...`);
      }

      indexed++;

      // Rate limit
      await new Promise(r => setTimeout(r, 200));
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }

  // Save index
  if (!options.dryRun) {
    const channelIndex: ChannelIndex = {
      channel_slug: channelSlug,
      channel_title: channel.title,
      indexed_at: new Date().toISOString(),
      blocks: indexedBlocks,
    };
    saveIndex(channelSlug, channelIndex);
    console.log(`\n📁 Saved to: ${INDEX_DIR}/${channelSlug}/index.json`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`                    ✅ COMPLETE                                `);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📊 Results:`);
  console.log(`   Indexed: ${indexed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Skipped (already indexed): ${visualBlocks.length - toIndex.length}`);
  console.log(`   Total in index: ${indexedBlocks.length}`);
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);
const channelArg = args.find(a => a.startsWith('--channel='));
const channelSlug = channelArg?.split('=')[1] || 'ui-ux-uqgmlf-rw1i';
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');

indexBlocks(channelSlug, { force, dryRun });


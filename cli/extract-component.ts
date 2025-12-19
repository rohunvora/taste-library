import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArenaClient } from './arena-client.js';
import * as fs from 'fs';
import * as path from 'path';
import { 
  ExtractedComponent, 
  ComponentIndex, 
  SCHEMA_VERSION,
  isValidComponent 
} from '../schema/component.js';
import { SCREEN_TYPES, COMPONENT_TYPES, AESTHETIC_FAMILIES } from '../schema/taxonomy.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ARENA_TOKEN = process.env.ARENA_TOKEN;
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const COMPONENTS_DIR = 'components';

// ============================================================================
// EXTRACTION PROMPT
// ============================================================================

const EXTRACTION_PROMPT = `You are a design system architect extracting components from UI screenshots.

Your job is to analyze a UI screenshot and output structured JSON that enables someone to:
1. Replicate this design without seeing the original
2. Understand when to use (and not use) this pattern
3. Extract composable atoms that can mix with other patterns

=== OUTPUT JSON SCHEMA ===

{
  "name": "string - Memorable 2-4 word name (e.g., 'Ethereal Pricing Card', 'Dark Budget Dashboard')",
  "description": "string - One sentence describing what this is and why it works",
  
  "screen_type": "one of: ${SCREEN_TYPES.join(' | ')}",
  
  "component_types": ["array of featured components: ${COMPONENT_TYPES.join(' | ')}"],
  
  "aesthetic_family": "one of: ${Object.keys(AESTHETIC_FAMILIES).join(' | ')}",
  
  "tags": ["array of additional searchable tags like: light-mode, dark-mode, mobile, desktop, b2c, b2b, fintech, health, etc."],
  
  "tokens": {
    "colors": {
      "background": "CSS value - can be gradient like 'linear-gradient(to bottom, #E6F0FF, #FFF0F5)' or solid like '#FFFFFF'",
      "surface": "hex color for card/container backgrounds",
      "text_primary": "hex color for main text",
      "text_secondary": "hex color for secondary/muted text",
      "accent": "hex color for primary accent/action color"
    },
    "radius": {
      "containers": "e.g., '24px', '12px', '8px', '0px'",
      "buttons": "e.g., '9999px' for pills, '8px' for rounded"
    },
    "shadows": {
      "default": "CSS box-shadow value like '0 4px 16px rgba(0,0,0,0.04)'"
    },
    "spacing": {
      "base_unit": "grid unit like '8px' or '4px'",
      "container_padding": "internal padding like '24px', '16px'",
      "element_gap": "gap between elements like '16px', '12px'"
    },
    "typography": {
      "heading_weight": "e.g., '700', '600', '500'",
      "body_weight": "e.g., '400', '500'",
      "heading_size": "largest heading size like '32px', '24px'",
      "body_size": "body text size like '16px', '14px'",
      "line_height": "e.g., '1.5', '1.6'",
      "font_style": "one of: geometric-sans | humanist-sans | neo-grotesque | serif | mono | rounded-sans"
    }
  },
  
  "atoms": [
    {
      "type": "one of: surface | button | card | typography | navigation | input | icon | spacing | color | shadow",
      "name": "Memorable name for this atom",
      "description": "What makes this atom distinctive",
      "css": "CSS rules to replicate this atom"
    }
  ],
  
  "code": {
    "css": "Full CSS to replicate the main visual patterns (container, key components)",
    "tailwind": "Tailwind classes that approximate the design"
  },
  
  "usage": {
    "best_for": ["array of 3-5 specific situations where this excels"],
    "avoid_for": ["array of 3-5 situations where this would fail"]
  }
}

=== EXTRACTION RULES ===

1. **APPROXIMATE COLORS FROM VISUALS**
   Analyze the screenshot and extract approximate hex colors. Be precise within reason.

2. **PROVIDE REAL CSS VALUES**
   Don't say "rounded" - say "border-radius: 16px"
   Extract values that would actually replicate the visual.

3. **IDENTIFY 2-4 COMPOSABLE ATOMS**
   Each screenshot should yield 2-4 distinct atoms that could be mixed with other patterns.

4. **CLASSIFY ACCURATELY**
   Pick the closest match for screen_type, component_types, and aesthetic_family.

5. **USAGE GUIDANCE IS CRITICAL**
   Be specific about when to use and when to avoid.

6. **OUTPUT VALID JSON ONLY**
   Your entire response must be a single valid JSON object. No markdown, no explanation, just the JSON.

=== AESTHETIC FAMILY GUIDE ===

- **soft-gradient**: Light backgrounds with subtle color gradients, very rounded corners (16px+)
- **dark-premium**: Dark/black backgrounds, high contrast text, sleek minimal styling
- **flat-minimal**: White/light backgrounds, minimal shadows, clean lines
- **neo-skeuomorphic**: Layered shadows creating depth, tactile buttons
- **playful-colorful**: Bold saturated colors, illustrations, energetic
- **editorial**: Typography-driven, magazine-like layouts
- **technical-dense**: Compact spacing, data-heavy, functional
- **glass-morphism**: Frosted glass effects, blur, translucent overlays
- **warm-organic**: Earth tones, natural textures
- **brutalist**: Raw, stark, unconventional`;

// ============================================================================
// HELPERS
// ============================================================================

async function downloadImage(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (contentType.includes('gif')) {
      console.log('      ⚠️ Skipping GIF (unsupported)');
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    return { base64, mimeType: contentType.split(';')[0] };
  } catch (error) {
    return null;
  }
}

function loadExistingComponents(): Set<string> {
  if (!fs.existsSync(COMPONENTS_DIR)) return new Set();
  
  const files = fs.readdirSync(COMPONENTS_DIR);
  const ids = new Set<string>();
  
  for (const file of files) {
    if (file.endsWith('.json') && file !== 'index.json') {
      ids.add(file.replace('.json', ''));
    }
  }
  
  return ids;
}

function saveComponent(component: ExtractedComponent): string {
  if (!fs.existsSync(COMPONENTS_DIR)) {
    fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
  }
  
  const filepath = path.join(COMPONENTS_DIR, `${component.id}.json`);
  fs.writeFileSync(filepath, JSON.stringify(component, null, 2));
  return filepath;
}

function parseExtraction(response: string, blockId: number, imageUrl: string, title: string | null): ExtractedComponent | null {
  try {
    // Try to extract JSON from the response
    let jsonStr = response;
    
    // Handle markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Also try to find raw JSON
    const rawJsonMatch = response.match(/\{[\s\S]*\}/);
    if (rawJsonMatch && !jsonMatch) {
      jsonStr = rawJsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Construct full component with source info
    const component: ExtractedComponent = {
      id: String(blockId),
      name: parsed.name || 'Untitled',
      description: parsed.description || '',
      screen_type: parsed.screen_type || 'other',
      component_types: parsed.component_types || [],
      aesthetic_family: parsed.aesthetic_family || 'flat-minimal',
      tags: parsed.tags || [],
      tokens: parsed.tokens || {
        colors: { background: '#FFFFFF', surface: '#FFFFFF', text_primary: '#000000', text_secondary: '#666666', accent: '#000000' },
        radius: { containers: '8px', buttons: '8px' },
        shadows: { default: 'none' },
        spacing: { base_unit: '8px', container_padding: '16px', element_gap: '16px' },
        typography: { heading_weight: '700', body_weight: '400', heading_size: '24px', body_size: '16px', line_height: '1.5', font_style: 'geometric-sans' }
      },
      atoms: parsed.atoms || [],
      code: parsed.code || { css: '', tailwind: '' },
      usage: parsed.usage || { best_for: [], avoid_for: [] },
      source: {
        arena_id: blockId,
        arena_url: `https://www.are.na/block/${blockId}`,
        image_url: imageUrl,
        title: title,
      },
      extracted_at: new Date().toISOString(),
      extraction_version: SCHEMA_VERSION,
    };
    
    return component;
  } catch (error) {
    console.error('      ❌ Failed to parse JSON:', error);
    return null;
  }
}

function buildIndex(components: ExtractedComponent[]): ComponentIndex {
  const index: ComponentIndex = {
    version: SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    total_components: components.length,
    by_aesthetic: {} as Record<string, string[]>,
    by_type: {} as Record<string, string[]>,
    by_screen: {} as Record<string, string[]>,
    components: [],
  };
  
  for (const comp of components) {
    index.components.push(comp.id);
    
    // By aesthetic
    if (!index.by_aesthetic[comp.aesthetic_family]) {
      index.by_aesthetic[comp.aesthetic_family] = [];
    }
    index.by_aesthetic[comp.aesthetic_family].push(comp.id);
    
    // By component type
    for (const type of comp.component_types) {
      if (!index.by_type[type]) {
        index.by_type[type] = [];
      }
      index.by_type[type].push(comp.id);
    }
    
    // By screen type
    if (!index.by_screen[comp.screen_type]) {
      index.by_screen[comp.screen_type] = [];
    }
    index.by_screen[comp.screen_type].push(comp.id);
  }
  
  return index;
}

function saveIndex(index: ComponentIndex): void {
  if (!fs.existsSync(COMPONENTS_DIR)) {
    fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'index.json'), JSON.stringify(index, null, 2));
}

// ============================================================================
// EXTRACTION
// ============================================================================

async function extractComponent(
  model: any,
  blockId: number,
  imageUrl: string,
  title: string | null
): Promise<ExtractedComponent | null> {
  const imageData = await downloadImage(imageUrl);
  if (!imageData) {
    return null;
  }

  try {
    const result = await model.generateContent([
      { text: EXTRACTION_PROMPT },
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.base64,
        },
      },
    ]);

    const response = result.response.text();
    return parseExtraction(response, blockId, imageUrl, title);
  } catch (error: any) {
    console.error(`      ❌ Gemini error: ${error.message}`);
    return null;
  }
}

// ============================================================================
// COMMANDS
// ============================================================================

async function extractSingle(blockId: number, channelSlug: string) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('          COMPONENT EXTRACTION (Single)                         ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!ARENA_TOKEN || !ARENA_USER_SLUG || !GEMINI_API_KEY) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }

  const client = new ArenaClient(ARENA_TOKEN, ARENA_USER_SLUG);
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.3,  // Lower temp for more consistent JSON
      maxOutputTokens: 4096,
    }
  });

  console.log(`📦 Fetching block ${blockId}...`);
  
  const blocks = await client.getChannelBlocks(channelSlug);
  const block = blocks.find(b => b.id === blockId);
  
  if (!block) {
    console.error(`❌ Block ${blockId} not found`);
    process.exit(1);
  }

  const imageUrl = block.image?.display?.url || block.image?.thumb?.url;
  if (!imageUrl) {
    console.error('❌ Block has no image');
    process.exit(1);
  }

  console.log(`   Title: ${block.title || '(untitled)'}`);
  console.log('\n🤖 Extracting component...');

  const component = await extractComponent(model, blockId, imageUrl, block.title);
  
  if (!component) {
    console.error('❌ Failed to extract');
    process.exit(1);
  }

  const filepath = saveComponent(component);
  
  console.log(`\n✅ Saved to: ${filepath}`);
  console.log(`   Name: ${component.name}`);
  console.log(`   Aesthetic: ${component.aesthetic_family}`);
  console.log(`   Types: ${component.component_types.join(', ')}`);
  console.log(`   Atoms: ${component.atoms.length}`);
}

async function extractChannel(channelSlug: string, options: { force?: boolean; limit?: number } = {}) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('          COMPONENT EXTRACTION (Channel)                        ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!ARENA_TOKEN || !ARENA_USER_SLUG || !GEMINI_API_KEY) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }

  const client = new ArenaClient(ARENA_TOKEN, ARENA_USER_SLUG);
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    }
  });

  console.log(`📂 Channel: ${channelSlug}`);
  if (options.force) console.log('⚠️  Force mode: re-extracting all');
  if (options.limit) console.log(`📊 Limit: ${options.limit}`);

  const existingIds = options.force ? new Set<string>() : loadExistingComponents();
  console.log(`   ${existingIds.size} existing components found`);

  console.log('\n📥 Fetching blocks from Are.na...');
  const allBlocks = await client.getChannelBlocks(channelSlug);
  
  const visualBlocks = allBlocks.filter(b => 
    (b.class === 'Image' || b.class === 'Attachment') &&
    (b.image?.display?.url || b.image?.thumb?.url)
  );
  
  console.log(`   ${visualBlocks.length} visual blocks in channel`);

  let toProcess = visualBlocks.filter(b => !existingIds.has(String(b.id)));
  console.log(`   ${toProcess.length} blocks need processing`);

  if (options.limit && toProcess.length > options.limit) {
    toProcess = toProcess.slice(0, options.limit);
  }

  if (toProcess.length === 0) {
    console.log('\n✅ All blocks already extracted!');
    return;
  }

  console.log('\n🚀 Starting extraction...\n');
  
  const extracted: ExtractedComponent[] = [];
  let success = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const block = toProcess[i];
    const imageUrl = block.image?.display?.url || block.image?.thumb?.url;
    
    console.log(`[${i + 1}/${toProcess.length}] ${block.title || '(untitled)'}`);

    if (!imageUrl) {
      console.log('   ⚠️ No image URL');
      failed++;
      continue;
    }

    console.log('   Downloading...');
    console.log('   Extracting...');

    const component = await extractComponent(model, block.id, imageUrl, block.title);
    
    if (component) {
      saveComponent(component);
      extracted.push(component);
      console.log(`   ✅ ${component.name} (${component.aesthetic_family})`);
      success++;
    } else {
      console.log('   ❌ Failed');
      failed++;
    }

    // Rate limit
    if (i < toProcess.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Load all components and rebuild index
  console.log('\n📊 Building index...');
  const allComponents: ExtractedComponent[] = [];
  
  const files = fs.readdirSync(COMPONENTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(COMPONENTS_DIR, file), 'utf-8'));
    allComponents.push(data);
  }
  
  const index = buildIndex(allComponents);
  saveIndex(index);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                         ✅ COMPLETE                            ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📊 Results:`);
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${allComponents.length}`);
  console.log(`\n📁 Output: ${COMPONENTS_DIR}/`);
}

// ============================================================================
// CLI
// ============================================================================

function printUsage() {
  console.log(`
Usage:
  npx tsx cli/extract-component.ts --channel=<slug>              Extract all blocks
  npx tsx cli/extract-component.ts --channel=<slug> --block=<id> Extract single block
  npx tsx cli/extract-component.ts --channel=<slug> --force      Re-extract all
  npx tsx cli/extract-component.ts --channel=<slug> --limit=<n>  Limit to N blocks

Examples:
  npx tsx cli/extract-component.ts --channel=ui-ux-uqgmlf-rw1i
  npx tsx cli/extract-component.ts --channel=ui-ux-uqgmlf-rw1i --limit=5
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const channelArg = args.find(a => a.startsWith('--channel='));
  const blockArg = args.find(a => a.startsWith('--block='));
  const limitArg = args.find(a => a.startsWith('--limit='));
  const force = args.includes('--force');

  if (!channelArg) {
    console.error('❌ Missing --channel');
    printUsage();
    process.exit(1);
  }

  const channelSlug = channelArg.split('=')[1];

  if (blockArg) {
    const blockId = parseInt(blockArg.split('=')[1], 10);
    await extractSingle(blockId, channelSlug);
  } else {
    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
    await extractChannel(channelSlug, { force, limit });
  }
}

main().catch(console.error);


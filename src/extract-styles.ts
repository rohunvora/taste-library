import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const INDEX_DIR = 'taste-profiles';

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

interface ExtractedStyles {
  colors: {
    background_primary: string;
    background_secondary: string;
    background_card: string;
    text_primary: string;
    text_secondary: string;
    text_muted: string;
    accent_primary: string;
    accent_secondary: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    family_vibe: 'geometric-sans' | 'humanist-sans' | 'neo-grotesque' | 'serif' | 'mono' | 'mixed';
    heading_weight: string;
    body_weight: string;
    size_hierarchy: 'subtle' | 'moderate' | 'dramatic';
    letter_spacing: 'tight' | 'normal' | 'tracked';
  };
  spacing: {
    density: 'compact' | 'balanced' | 'airy';
    card_padding: 'tight' | 'medium' | 'generous';
    element_gap: 'tight' | 'medium' | 'generous';
    section_margin: 'tight' | 'medium' | 'generous';
  };
  elevation: {
    shadow_presence: 'none' | 'subtle' | 'soft' | 'pronounced';
    shadow_color: 'neutral' | 'tinted' | 'colored';
    layering: 'flat' | 'subtle-depth' | 'stacked';
  };
  borders: {
    radius_px: number;
    radius_category: 'sharp' | 'slightly-rounded' | 'rounded' | 'pill';
    border_usage: 'none' | 'subtle' | 'prominent';
    divider_style: 'none' | 'light' | 'medium';
  };
  motion: {
    expected: boolean;
    duration_ms: number;
    easing: 'linear' | 'ease-out' | 'ease-in-out' | 'spring';
    hover_effect: 'none' | 'lift' | 'glow' | 'scale';
  };
  icons: {
    style: 'outlined' | 'filled' | 'duotone' | 'mixed';
    corners: 'rounded' | 'sharp';
  };
}

interface AggregatedStyleGuide {
  common: Partial<ExtractedStyles>;
  contexts: {
    [key: string]: Partial<ExtractedStyles>;
  };
  anti_patterns: string[];
  confidence_notes: {
    [key: string]: {
      confidence: 'high' | 'medium' | 'low';
      sample_size: number;
      note: string;
    };
  };
  raw_extractions: Array<{
    block_id: number;
    context: string[];
    styles: Partial<ExtractedStyles>;
  }>;
}

// ============================================================================
// EXTRACTION PROMPT
// ============================================================================

const STYLE_EXTRACTION_PROMPT = `You are a senior UI designer analyzing a screenshot to extract precise styling details. Be specific and concrete.

Analyze this UI and extract the following. Output ONLY valid JSON.

{
  "colors": {
    "background_primary": "#hex (main page background)",
    "background_secondary": "#hex (secondary sections)",
    "background_card": "#hex (card/container background)",
    "text_primary": "#hex (main text)",
    "text_secondary": "#hex (secondary text)",
    "text_muted": "#hex (disabled/placeholder)",
    "accent_primary": "#hex (buttons, links, CTAs)",
    "accent_secondary": "#hex (secondary actions)",
    "success": "#hex (positive states)",
    "warning": "#hex (warning states)",
    "error": "#hex (error states)"
  },
  "typography": {
    "family_vibe": "geometric-sans|humanist-sans|neo-grotesque|serif|mono|mixed",
    "heading_weight": "300|400|500|600|700|800",
    "body_weight": "300|400|500",
    "size_hierarchy": "subtle|moderate|dramatic (how much bigger are headings)",
    "letter_spacing": "tight|normal|tracked"
  },
  "spacing": {
    "density": "compact|balanced|airy",
    "card_padding": "tight|medium|generous",
    "element_gap": "tight|medium|generous",
    "section_margin": "tight|medium|generous"
  },
  "elevation": {
    "shadow_presence": "none|subtle|soft|pronounced",
    "shadow_color": "neutral|tinted|colored",
    "layering": "flat|subtle-depth|stacked"
  },
  "borders": {
    "radius_px": 0-24 (estimate in pixels),
    "radius_category": "sharp|slightly-rounded|rounded|pill",
    "border_usage": "none|subtle|prominent",
    "divider_style": "none|light|medium"
  },
  "icons": {
    "style": "outlined|filled|duotone|mixed",
    "corners": "rounded|sharp"
  }
}

Rules:
- Extract actual hex values you see, not guesses
- If a color isn't visible, use "N/A"
- Be precise about radius - estimate actual pixels
- Consider the overall impression, not just one element`;

// ============================================================================
// HELPERS
// ============================================================================

async function downloadImage(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (contentType.includes('gif')) return null;
    
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    return { base64, mimeType: contentType.split(';')[0] };
  } catch {
    return null;
  }
}

function loadIndex(channelSlug: string): ChannelIndex | null {
  const indexPath = path.join(INDEX_DIR, channelSlug, 'index.json');
  if (fs.existsSync(indexPath)) {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  }
  return null;
}

function loadAntiRules(channelSlug: string): string[] {
  const antiRulesPath = path.join(INDEX_DIR, channelSlug, 'anti-rules.md');
  if (fs.existsSync(antiRulesPath)) {
    const content = fs.readFileSync(antiRulesPath, 'utf-8');
    // Extract anti-patterns from markdown
    const patterns: string[] = [];
    const regex = /### ❌ (.+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      patterns.push(match[1]);
    }
    return patterns;
  }
  return [];
}

function saveStyleGuide(channelSlug: string, guide: AggregatedStyleGuide): void {
  const dir = path.join(INDEX_DIR, channelSlug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(dir, 'style-guide.json'),
    JSON.stringify(guide, null, 2)
  );
}

// ============================================================================
// AGGREGATION LOGIC
// ============================================================================

function mostCommon<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const counts = new Map<T, number>();
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  let maxCount = 0;
  let result: T | undefined;
  for (const [item, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      result = item;
    }
  }
  return result;
}

function averageNumber(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function aggregateColors(extractions: Partial<ExtractedStyles>[]): Partial<ExtractedStyles['colors']> {
  const colorKeys = [
    'background_primary', 'background_secondary', 'background_card',
    'text_primary', 'text_secondary', 'text_muted',
    'accent_primary', 'accent_secondary', 'success', 'warning', 'error'
  ] as const;

  const result: Partial<ExtractedStyles['colors']> = {};
  
  for (const key of colorKeys) {
    const values = extractions
      .map(e => e.colors?.[key])
      .filter(v => v && v !== 'N/A') as string[];
    
    if (values.length > 0) {
      // For now, take most common. Could cluster similar colors.
      result[key] = mostCommon(values) || values[0];
    }
  }
  
  return result;
}

function aggregateTypography(extractions: Partial<ExtractedStyles>[]): Partial<ExtractedStyles['typography']> {
  const familyVibes = extractions.map(e => e.typography?.family_vibe).filter(Boolean) as string[];
  const headingWeights = extractions.map(e => e.typography?.heading_weight).filter(Boolean) as string[];
  const bodyWeights = extractions.map(e => e.typography?.body_weight).filter(Boolean) as string[];
  const hierarchies = extractions.map(e => e.typography?.size_hierarchy).filter(Boolean) as string[];
  const spacings = extractions.map(e => e.typography?.letter_spacing).filter(Boolean) as string[];

  return {
    family_vibe: mostCommon(familyVibes) as ExtractedStyles['typography']['family_vibe'],
    heading_weight: mostCommon(headingWeights) || '600',
    body_weight: mostCommon(bodyWeights) || '400',
    size_hierarchy: mostCommon(hierarchies) as ExtractedStyles['typography']['size_hierarchy'],
    letter_spacing: mostCommon(spacings) as ExtractedStyles['typography']['letter_spacing'],
  };
}

function aggregateSpacing(extractions: Partial<ExtractedStyles>[]): Partial<ExtractedStyles['spacing']> {
  const densities = extractions.map(e => e.spacing?.density).filter(Boolean) as string[];
  const paddings = extractions.map(e => e.spacing?.card_padding).filter(Boolean) as string[];
  const gaps = extractions.map(e => e.spacing?.element_gap).filter(Boolean) as string[];
  const margins = extractions.map(e => e.spacing?.section_margin).filter(Boolean) as string[];

  return {
    density: mostCommon(densities) as ExtractedStyles['spacing']['density'],
    card_padding: mostCommon(paddings) as ExtractedStyles['spacing']['card_padding'],
    element_gap: mostCommon(gaps) as ExtractedStyles['spacing']['element_gap'],
    section_margin: mostCommon(margins) as ExtractedStyles['spacing']['section_margin'],
  };
}

function aggregateElevation(extractions: Partial<ExtractedStyles>[]): Partial<ExtractedStyles['elevation']> {
  const presences = extractions.map(e => e.elevation?.shadow_presence).filter(Boolean) as string[];
  const colors = extractions.map(e => e.elevation?.shadow_color).filter(Boolean) as string[];
  const layers = extractions.map(e => e.elevation?.layering).filter(Boolean) as string[];

  return {
    shadow_presence: mostCommon(presences) as ExtractedStyles['elevation']['shadow_presence'],
    shadow_color: mostCommon(colors) as ExtractedStyles['elevation']['shadow_color'],
    layering: mostCommon(layers) as ExtractedStyles['elevation']['layering'],
  };
}

function aggregateBorders(extractions: Partial<ExtractedStyles>[]): Partial<ExtractedStyles['borders']> {
  const radii = extractions.map(e => e.borders?.radius_px).filter(v => typeof v === 'number') as number[];
  const categories = extractions.map(e => e.borders?.radius_category).filter(Boolean) as string[];
  const usages = extractions.map(e => e.borders?.border_usage).filter(Boolean) as string[];
  const dividers = extractions.map(e => e.borders?.divider_style).filter(Boolean) as string[];

  return {
    radius_px: averageNumber(radii),
    radius_category: mostCommon(categories) as ExtractedStyles['borders']['radius_category'],
    border_usage: mostCommon(usages) as ExtractedStyles['borders']['border_usage'],
    divider_style: mostCommon(dividers) as ExtractedStyles['borders']['divider_style'],
  };
}

function aggregateIcons(extractions: Partial<ExtractedStyles>[]): Partial<ExtractedStyles['icons']> {
  const styles = extractions.map(e => e.icons?.style).filter(Boolean) as string[];
  const corners = extractions.map(e => e.icons?.corners).filter(Boolean) as string[];

  return {
    style: mostCommon(styles) as ExtractedStyles['icons']['style'],
    corners: mostCommon(corners) as ExtractedStyles['icons']['corners'],
  };
}

function aggregateAll(extractions: Partial<ExtractedStyles>[]): Partial<ExtractedStyles> {
  return {
    colors: aggregateColors(extractions) as ExtractedStyles['colors'],
    typography: aggregateTypography(extractions) as ExtractedStyles['typography'],
    spacing: aggregateSpacing(extractions) as ExtractedStyles['spacing'],
    elevation: aggregateElevation(extractions) as ExtractedStyles['elevation'],
    borders: aggregateBorders(extractions) as ExtractedStyles['borders'],
    icons: aggregateIcons(extractions) as ExtractedStyles['icons'],
    // Motion inferred from anti-rules, not images
    motion: {
      expected: true, // From anti-rule "no static UI"
      duration_ms: 200,
      easing: 'ease-out',
      hover_effect: 'lift',
    },
  };
}

function calculateConfidence(
  extractions: Partial<ExtractedStyles>[],
  key: string
): { confidence: 'high' | 'medium' | 'low'; sample_size: number; note: string } {
  const sampleSize = extractions.length;
  
  if (sampleSize >= 15) {
    return { confidence: 'high', sample_size: sampleSize, note: 'Strong signal from many samples' };
  } else if (sampleSize >= 8) {
    return { confidence: 'medium', sample_size: sampleSize, note: 'Moderate signal, more samples would help' };
  } else {
    return { confidence: 'low', sample_size: sampleSize, note: 'Limited samples, treat as directional' };
  }
}

// ============================================================================
// MAIN EXTRACTOR
// ============================================================================

async function extractStyles(channelSlug: string) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    STYLE EXTRACTOR                            ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!GEMINI_API_KEY) {
    console.log('❌ Missing GEMINI_API_KEY');
    return;
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Load existing index
  const index = loadIndex(channelSlug);
  if (!index) {
    console.log(`❌ No index found for ${channelSlug}`);
    console.log('   Run index-blocks first: npm run index-blocks -- --channel=' + channelSlug);
    return;
  }

  console.log(`📂 Channel: ${index.channel_title}`);
  console.log(`   ${index.blocks.length} blocks in index\n`);

  // Load anti-rules for motion inference
  const antiPatterns = loadAntiRules(channelSlug);
  console.log(`📜 Loaded ${antiPatterns.length} anti-patterns\n`);

  // Extract styles from each block
  const rawExtractions: Array<{
    block_id: number;
    context: string[];
    styles: Partial<ExtractedStyles>;
  }> = [];

  let processed = 0;
  let failed = 0;

  for (let i = 0; i < index.blocks.length; i++) {
    const block = index.blocks[i];
    
    console.log(`[${i + 1}/${index.blocks.length}] ${block.title || block.one_liner.slice(0, 40)}...`);

    if (!block.image_url) {
      console.log('   ⚠️ No image URL');
      failed++;
      continue;
    }

    // Download image
    const imageData = await downloadImage(block.image_url);
    if (!imageData) {
      console.log('   ⚠️ Failed to download');
      failed++;
      continue;
    }

    // Call Gemini
    try {
      const result = await model.generateContent([
        { text: STYLE_EXTRACTION_PROMPT },
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.base64,
          },
        },
      ]);

      const response = result.response.text();
      
      // Parse JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('   ⚠️ No valid JSON');
        failed++;
        continue;
      }

      const styles = JSON.parse(jsonMatch[0]) as Partial<ExtractedStyles>;
      
      rawExtractions.push({
        block_id: block.id,
        context: block.tags.context || [],
        styles,
      });

      console.log(`   ✅ radius: ${styles.borders?.radius_px}px, accent: ${styles.colors?.accent_primary}`);
      processed++;

      // Rate limit
      await new Promise(r => setTimeout(r, 300));
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n📊 Aggregating results...\n');

  // Group by context
  const contextGroups: { [key: string]: Partial<ExtractedStyles>[] } = {};
  const allStyles: Partial<ExtractedStyles>[] = [];

  for (const extraction of rawExtractions) {
    allStyles.push(extraction.styles);
    
    for (const ctx of extraction.context) {
      if (!contextGroups[ctx]) {
        contextGroups[ctx] = [];
      }
      contextGroups[ctx].push(extraction.styles);
    }
  }

  // Aggregate common styles
  const commonStyles = aggregateAll(allStyles);

  // Aggregate per-context styles
  const contextStyles: { [key: string]: Partial<ExtractedStyles> } = {};
  for (const [ctx, styles] of Object.entries(contextGroups)) {
    if (styles.length >= 3) { // Only if enough samples
      contextStyles[ctx] = aggregateAll(styles);
    }
  }

  // Calculate confidence
  const confidenceNotes: AggregatedStyleGuide['confidence_notes'] = {
    colors: calculateConfidence(allStyles, 'colors'),
    typography: calculateConfidence(allStyles, 'typography'),
    spacing: calculateConfidence(allStyles, 'spacing'),
    elevation: calculateConfidence(allStyles, 'elevation'),
    borders: calculateConfidence(allStyles, 'borders'),
    motion: {
      confidence: antiPatterns.length > 0 ? 'medium' : 'low',
      sample_size: antiPatterns.length,
      note: 'Inferred from anti-rules, not direct observation',
    },
  };

  // Build final guide
  const styleGuide: AggregatedStyleGuide = {
    common: commonStyles,
    contexts: contextStyles,
    anti_patterns: antiPatterns,
    confidence_notes: confidenceNotes,
    raw_extractions: rawExtractions,
  };

  // Save
  saveStyleGuide(channelSlug, styleGuide);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    ✅ COMPLETE                                ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📊 Results:`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Context groups: ${Object.keys(contextStyles).join(', ') || 'none'}`);
  console.log(`\n📁 Saved to: ${INDEX_DIR}/${channelSlug}/style-guide.json`);
  
  // Print summary
  console.log('\n📋 Style Summary:');
  console.log(`   Background: ${commonStyles.colors?.background_primary}`);
  console.log(`   Accent: ${commonStyles.colors?.accent_primary}`);
  console.log(`   Radius: ${commonStyles.borders?.radius_px}px (${commonStyles.borders?.radius_category})`);
  console.log(`   Density: ${commonStyles.spacing?.density}`);
  console.log(`   Shadows: ${commonStyles.elevation?.shadow_presence}`);
  console.log(`   Typography: ${commonStyles.typography?.family_vibe}`);
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);
const channelArg = args.find(a => a.startsWith('--channel='));
const channelSlug = channelArg?.split('=')[1] || 'ui-ux-uqgmlf-rw1i';

extractStyles(channelSlug);


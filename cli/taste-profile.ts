import 'dotenv/config';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { ArenaClient } from './arena-client.js';
import { ArenaBlock } from './types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ARENA_TOKEN = process.env.ARENA_TOKEN;
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Channel to analyze (can be overridden via CLI)
const DEFAULT_CHANNEL = 'frameworks';

// Channel-specific analysis prompts
const PROMPTS: Record<string, string> = {
  // Default/Frameworks prompt
  default: `You are analyzing a curated collection of mental frameworks, thinking tools, strategic concepts, and decision-making approaches saved by one person over time on Are.na.

Your job is NOT to describe each individual item.
Your job is to find what this COLLECTION reveals about the curator's thinking style.

Analyze all the content (images, text, links) as a unified body of work and identify:

1. **PATTERNS**: What thinking styles, approaches, or frameworks do they consistently gravitate toward?
2. **IMPLICIT PRINCIPLES**: What unspoken rules seem to guide their curation?
3. **TENSIONS**: Where do they hold productive contradictions?
4. **BLINDSPOTS**: What's conspicuously missing?
5. **SYSTEM PROMPT**: Write detailed instructions for an AI assistant to match this thinking style.

Output as JSON:
{
  "core_principles": ["Principle 1: explanation", ...],
  "thinking_style": {
    "summary": "One paragraph describing their overall approach",
    "preferences": ["list of preferences"],
    "aversions": ["list of things they avoid"]
  },
  "scenario_modules": {
    "decision_making": "Guidance for decisions",
    "strategy": "Guidance for strategic planning",
    "problem_solving": "Guidance for problems",
    "learning": "Guidance for learning"
  },
  "edge_cases": ["If X, then Y because Z", ...],
  "challenge_prompts": ["Questions to push thinking", ...],
  "blindspots": ["Missing areas", ...],
  "system_prompt": "Complete 300-500 word system prompt"
}

Be specific. Reference actual patterns you observe. Don't be generic.`,

  // UI/UX specific prompt
  'ui-ux': `You are analyzing a curated collection of UI/UX screenshots, design references, and visual inspiration saved by one person over time on Are.na.

Your job is NOT to describe each individual screenshot.
Your job is to find what this COLLECTION reveals about the curator's VISUAL TASTE and DESIGN PREFERENCES.

Look at all the images as a unified body of work and identify:

1. **AESTHETIC PATTERNS**: What visual styles appear repeatedly? (typography, color, spacing, density, mood)
2. **COMPONENT PREFERENCES**: What UI patterns do they gravitate toward? (navigation styles, card layouts, button styles, etc.)
3. **IMPLICIT RULES**: What design principles seem to guide their curation? What makes something "worth saving"?
4. **ANTI-PATTERNS**: What's conspicuously absent? What mainstream design trends do they seem to avoid?
5. **CONTEXT-SPECIFIC GUIDANCE**: Different guidance for different design contexts (landing pages, dashboards, mobile, etc.)

Output as JSON:
{
  "aesthetic_principles": [
    "Principle 1: specific visual rule with examples",
    "Principle 2: specific visual rule with examples"
  ],
  "design_style": {
    "summary": "One paragraph describing their overall visual taste",
    "gravitates_toward": ["specific visual elements they prefer"],
    "avoids": ["specific visual elements they dislike or are absent"]
  },
  "component_preferences": {
    "typography": "Specific typography preferences observed",
    "color": "Color usage patterns observed",
    "spacing": "Spacing and density preferences",
    "navigation": "Navigation patterns they favor",
    "cards_and_containers": "How they prefer content to be contained",
    "buttons_and_ctas": "Button and CTA style preferences"
  },
  "scenario_modules": {
    "landing_pages": "Specific guidance for designing landing pages",
    "dashboards": "Specific guidance for data-heavy interfaces",
    "mobile": "Specific guidance for mobile design",
    "marketing_sites": "Specific guidance for marketing/promotional pages"
  },
  "anti_patterns": [
    "Never do X because it contradicts their taste",
    "Avoid Y - it's notably absent from their saves"
  ],
  "blindspots": [
    "Design areas underrepresented in their collection"
  ],
  "system_prompt": "A complete system prompt (300-500 words) for an AI to design interfaces matching this person's taste. Be SPECIFIC about colors, typography, spacing, and patterns to use/avoid."
}

Be extremely specific. Reference exact visual patterns you observe across multiple screenshots. Vague guidance like "clean and modern" is useless - say exactly what that means in terms of specific choices.`
};

function getPromptForChannel(channelSlug: string): string {
  if (channelSlug.includes('ui-ux') || channelSlug.includes('design')) {
    return PROMPTS['ui-ux'];
  }
  // Add more channel type detection as needed
  return PROMPTS['default'];
}

interface ProcessedBlock {
  id: number;
  type: 'image' | 'text' | 'link';
  title: string | null;
  content: string;
  base64?: string;
  mimeType?: string;
}

async function downloadImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Skip GIFs - Gemini doesn't support them
    if (contentType.includes('gif')) {
      console.log(`      ⚠️ Skipping GIF (unsupported by Gemini)`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return { base64, mimeType: contentType };
  } catch (error) {
    console.error(`Failed to download image: ${url}`, error);
    return null;
  }
}

async function scrapeLink(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArenaBot/1.0)'
      }
    });
    if (!response.ok) return `[Link: ${url}]`;
    
    const html = await response.text();
    
    // Simple text extraction - remove scripts, styles, and HTML tags
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit to first 2000 chars to avoid token bloat
    if (text.length > 2000) {
      text = text.substring(0, 2000) + '...';
    }
    
    return text || `[Link: ${url}]`;
  } catch (error) {
    return `[Link: ${url}]`;
  }
}

async function processBlocks(blocks: ArenaBlock[]): Promise<ProcessedBlock[]> {
  const processed: ProcessedBlock[] = [];
  
  console.log(`\n📦 Processing ${blocks.length} blocks...`);
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    console.log(`   [${i + 1}/${blocks.length}] ${block.class}: ${block.title || '(untitled)'}`);
    
    if (block.class === 'Image' && block.image?.display?.url) {
      const imageData = await downloadImageAsBase64(block.image.display.url);
      if (imageData) {
        processed.push({
          id: block.id,
          type: 'image',
          title: block.title,
          content: block.description || block.title || 'Image',
          base64: imageData.base64,
          mimeType: imageData.mimeType
        });
      }
    } else if (block.class === 'Text') {
      processed.push({
        id: block.id,
        type: 'text',
        title: block.title,
        content: block.content || block.description || ''
      });
    } else if (block.class === 'Link' && block.source?.url) {
      const linkContent = await scrapeLink(block.source.url);
      processed.push({
        id: block.id,
        type: 'link',
        title: block.title || block.source.title || block.source.url,
        content: `Title: ${block.source.title || block.title || 'Untitled'}\nURL: ${block.source.url}\n\nContent:\n${linkContent}`
      });
    } else if (block.class === 'Media' || block.class === 'Attachment') {
      // For media/attachments, just use the description/title
      processed.push({
        id: block.id,
        type: 'text',
        title: block.title,
        content: block.description || block.title || `[${block.class}]`
      });
    }
    
    // Small delay to be nice to servers
    await new Promise(r => setTimeout(r, 100));
  }
  
  return processed;
}

function buildGeminiPayload(blocks: ProcessedBlock[], channelSlug: string): Part[] {
  const parts: Part[] = [];
  
  // Start with the channel-specific analysis prompt
  const prompt = getPromptForChannel(channelSlug);
  parts.push({ text: prompt });
  
  // Add a separator
  parts.push({ text: '\n\n=== BEGIN COLLECTION ===\n\n' });
  
  // Add each block
  for (const block of blocks) {
    if (block.type === 'image' && block.base64 && block.mimeType) {
      // Add image context
      parts.push({ 
        text: `\n[IMAGE${block.title ? `: ${block.title}` : ''}${block.content && block.content !== block.title ? `\nDescription: ${block.content}` : ''}]\n` 
      });
      // Add the image
      parts.push({
        inlineData: {
          mimeType: block.mimeType,
          data: block.base64
        }
      });
    } else {
      // Text or link content
      parts.push({
        text: `\n[${block.type.toUpperCase()}${block.title ? `: ${block.title}` : ''}]\n${block.content}\n`
      });
    }
  }
  
  parts.push({ text: '\n=== END COLLECTION ===\n\nNow analyze this collection and output the JSON as specified.' });
  
  return parts;
}

async function callGemini(parts: Part[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY in .env');
  }
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3-pro-preview',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 16384,
    }
  });
  
  console.log('\n🤖 Calling Gemini 2.5 Pro...');
  console.log(`   Sending ${parts.length} parts (text + images)`);
  
  const result = await model.generateContent(parts);
  const response = result.response;
  const text = response.text();
  
  return text;
}

function parseGeminiResponse(response: string): any {
  // Try to extract JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not find JSON in Gemini response');
  }
  
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse JSON:', jsonMatch[0].substring(0, 500));
    throw new Error('Invalid JSON in Gemini response');
  }
}

function writeOutputFiles(channelSlug: string, analysis: any, rawResponse: string) {
  const outputDir = path.join(__dirname, '..', 'taste-profiles', channelSlug);
  
  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Write raw response
  fs.writeFileSync(
    path.join(outputDir, 'raw-analysis.json'),
    JSON.stringify(analysis, null, 2)
  );
  
  // Write raw Gemini output (for debugging)
  fs.writeFileSync(
    path.join(outputDir, 'raw-gemini-response.txt'),
    rawResponse
  );
  
  // Write core.md
  const coreContent = `# ${channelSlug.charAt(0).toUpperCase() + channelSlug.slice(1)} - Core Principles

## Thinking Style

${analysis.thinking_style?.summary || 'Not available'}

### Preferences
${(analysis.thinking_style?.preferences || []).map((p: string) => `- ${p}`).join('\n')}

### Aversions
${(analysis.thinking_style?.aversions || []).map((a: string) => `- ${a}`).join('\n')}

## Core Principles

${(analysis.core_principles || []).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n\n')}

## Edge Cases & Overrides

${(analysis.edge_cases || []).map((e: string) => `- ${e}`).join('\n')}

## Challenge Prompts

Use these to push your thinking:

${(analysis.challenge_prompts || []).map((c: string) => `- ${c}`).join('\n')}

## Blindspots to Watch

${(analysis.blindspots || []).map((b: string) => `- ${b}`).join('\n')}
`;
  
  fs.writeFileSync(path.join(outputDir, 'core.md'), coreContent);
  
  // Write scenario modules
  if (analysis.scenario_modules) {
    for (const [scenario, guidance] of Object.entries(analysis.scenario_modules)) {
      const scenarioContent = `# ${scenario.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}

${guidance}
`;
      fs.writeFileSync(
        path.join(outputDir, `${scenario.replace(/_/g, '-')}.md`),
        scenarioContent
      );
    }
  }
  
  // Write system prompt
  if (analysis.system_prompt) {
    const systemPromptContent = `# System Prompt for ${channelSlug.charAt(0).toUpperCase() + channelSlug.slice(1)}

Use this as a system prompt or add to your .cursorrules:

---

${analysis.system_prompt}

---
`;
    fs.writeFileSync(path.join(outputDir, 'system-prompt.md'), systemPromptContent);
  }
  
  console.log(`\n📁 Output written to: taste-profiles/${channelSlug}/`);
  console.log('   - core.md');
  console.log('   - system-prompt.md');
  if (analysis.scenario_modules) {
    for (const scenario of Object.keys(analysis.scenario_modules)) {
      console.log(`   - ${scenario.replace(/_/g, '-')}.md`);
    }
  }
  console.log('   - raw-analysis.json');
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    TASTE PROFILE GENERATOR                      ');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Validate environment
  if (!ARENA_TOKEN || !ARENA_USER_SLUG) {
    console.error('❌ Missing ARENA_TOKEN or ARENA_USER_SLUG in .env');
    process.exit(1);
  }
  
  if (!GEMINI_API_KEY) {
    console.error('❌ Missing GEMINI_API_KEY in .env');
    process.exit(1);
  }
  
  // Get channel from CLI args or use default
  const channelArg = process.argv.find(arg => arg.startsWith('--channel='));
  const channelSlug = channelArg ? channelArg.split('=')[1] : DEFAULT_CHANNEL;
  
  console.log(`\n📂 Target channel: ${channelSlug}`);
  
  // Initialize Are.na client
  const client = new ArenaClient(ARENA_TOKEN, ARENA_USER_SLUG);
  
  // Fetch blocks from channel
  console.log('\n📥 Fetching blocks from Are.na...');
  const blocks = await client.getChannelBlocks(channelSlug);
  console.log(`   Found ${blocks.length} blocks`);
  
  if (blocks.length === 0) {
    console.error('❌ No blocks found in channel');
    process.exit(1);
  }
  
  // Process blocks (download images, scrape links)
  const processedBlocks = await processBlocks(blocks);
  console.log(`\n✅ Processed ${processedBlocks.length} blocks`);
  console.log(`   - Images: ${processedBlocks.filter(b => b.type === 'image').length}`);
  console.log(`   - Text: ${processedBlocks.filter(b => b.type === 'text').length}`);
  console.log(`   - Links: ${processedBlocks.filter(b => b.type === 'link').length}`);
  
  // Build Gemini payload
  const payload = buildGeminiPayload(processedBlocks, channelSlug);
  
  // Call Gemini
  const rawResponse = await callGemini(payload);
  
  // Parse response
  console.log('\n📊 Parsing Gemini response...');
  const analysis = parseGeminiResponse(rawResponse);
  
  // Write output files
  writeOutputFiles(channelSlug, analysis, rawResponse);
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                         ✅ COMPLETE                            ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nYour taste profile is ready at: taste-profiles/${channelSlug}/`);
  console.log('Start with core.md and system-prompt.md');
}

main().catch(console.error);


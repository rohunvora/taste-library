import 'dotenv/config';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { ArenaClient } from './arena-client.js';
import { ArenaBlock } from './types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARENA_TOKEN = process.env.ARENA_TOKEN;
const ARENA_USER_SLUG = process.env.ARENA_USER_SLUG;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Get channel from CLI
const channelArg = process.argv.find(arg => arg.startsWith('--channel='));
const CHANNEL_SLUG = channelArg ? channelArg.split('=')[1] : 'ui-ux-uqgmlf-rw1i';

const ANTI_PATTERN_PROMPT = `You are analyzing a curated collection saved by one person on Are.na.

Your job is to identify what this person AVOIDS — the anti-patterns, the things they clearly don't like based on what's ABSENT from their collection.

This is detective work. Look at what they saved and infer what they would NEVER want.

## Rules for your analysis:

1. **Only include anti-patterns you have HIGH CONFIDENCE about.** If you're unsure, don't include it.

2. **Cite your evidence.** For each anti-pattern, explain WHAT in the collection leads you to this conclusion.

3. **Be sparse.** 5-10 high-confidence anti-patterns are better than 20 speculative ones.

4. **Focus on the ABSENCE.** What design patterns are conspicuously missing? What does the collection consistently NOT include?

5. **Be specific.** "Avoid bad design" is useless. "Never use more than 2 font families" is actionable.

## Output as JSON:

{
  "anti_patterns": [
    {
      "rule": "Never do X",
      "confidence": "high" | "medium",
      "evidence": "Based on the collection, I observe Y and Z, which suggests they avoid X because..."
    }
  ],
  "insufficient_evidence": [
    "Things I considered but couldn't conclude with confidence"
  ],
  "summary": "One paragraph summary of what this person's taste REJECTS"
}

Be honest. If the collection doesn't give you enough signal, say so. A short list of high-confidence anti-patterns is more valuable than a long list of guesses.`;

async function downloadImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    if (contentType.includes('gif')) {
      console.log(`      ⚠️ Skipping GIF`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return { base64, mimeType: contentType };
  } catch (error) {
    return null;
  }
}

async function scrapeLink(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      console.log(`      ⚠️ Failed to fetch (${response.status})`);
      return '';
    }
    
    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Extract main content - strip scripts, styles, nav, footer, etc.
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Truncate to reasonable length
    const maxLength = 3000;
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    // Combine title, description, and content
    let result = '';
    if (title) result += `Title: ${title}\n`;
    if (description) result += `Description: ${description}\n`;
    if (text) result += `Content:\n${text}`;
    
    return result || '[Could not extract content]';
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`      ⚠️ Timeout fetching link`);
    } else {
      console.log(`      ⚠️ Error: ${error.message}`);
    }
    return '';
  }
}

interface ProcessedBlock {
  id: number;
  type: 'image' | 'text' | 'link';
  title: string | null;
  content: string;
  base64?: string;
  mimeType?: string;
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
      console.log(`      🔗 Scraping: ${block.source.url.substring(0, 50)}...`);
      const scrapedContent = await scrapeLink(block.source.url);
      processed.push({
        id: block.id,
        type: 'link',
        title: block.title || block.source.title || block.source.url,
        content: scrapedContent || `[Link: ${block.source.url}]`
      });
    }
    
    await new Promise(r => setTimeout(r, 100));
  }
  
  return processed;
}

function buildPayload(blocks: ProcessedBlock[]): Part[] {
  const parts: Part[] = [];
  
  parts.push({ text: ANTI_PATTERN_PROMPT });
  parts.push({ text: '\n\n=== BEGIN COLLECTION ===\n\n' });
  
  for (const block of blocks) {
    if (block.type === 'image' && block.base64 && block.mimeType) {
      parts.push({ 
        text: `\n[IMAGE${block.title ? `: ${block.title}` : ''}]\n` 
      });
      parts.push({
        inlineData: {
          mimeType: block.mimeType,
          data: block.base64
        }
      });
    } else {
      parts.push({
        text: `\n[${block.type.toUpperCase()}${block.title ? `: ${block.title}` : ''}]\n${block.content}\n`
      });
    }
  }
  
  parts.push({ text: '\n=== END COLLECTION ===\n\nNow analyze for ANTI-PATTERNS. Be selective and cite evidence.' });
  
  return parts;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                   ANTI-PATTERN EXTRACTION                       ');
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (!ARENA_TOKEN || !ARENA_USER_SLUG || !GEMINI_API_KEY) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }
  
  const channelSlug = CHANNEL_SLUG;
  console.log(`\n📂 Target channel: ${channelSlug}`);
  
  const client = new ArenaClient(ARENA_TOKEN, ARENA_USER_SLUG);
  
  console.log('\n📥 Fetching blocks...');
  const blocks = await client.getChannelBlocks(channelSlug);
  console.log(`   Found ${blocks.length} blocks`);
  
  const processedBlocks = await processBlocks(blocks);
  console.log(`\n✅ Processed ${processedBlocks.length} blocks`);
  
  const payload = buildPayload(processedBlocks);
  
  console.log('\n🤖 Calling Gemini 3 Pro for anti-pattern analysis...');
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3-pro-preview',
    generationConfig: {
      temperature: 0.5, // Lower temperature for more focused analysis
      maxOutputTokens: 4096,
    }
  });
  
  const result = await model.generateContent(payload);
  const response = result.response.text();
  
  console.log('\n📊 Results:\n');
  console.log(response);
  
  // Save output
  const outputDir = path.join(__dirname, '..', 'taste-profiles', channelSlug);
  fs.mkdirSync(outputDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(outputDir, `anti-patterns-${timestamp}.md`),
    `# Anti-Pattern Analysis: UI/UX\n\n**Generated:** ${new Date().toISOString()}\n\n## Raw Output\n\n${response}`
  );
  
  // Try to parse and format nicely
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      let formatted = `# Anti-Rules: UI/UX\n\n`;
      formatted += `**Summary:** ${parsed.summary}\n\n`;
      formatted += `## High-Confidence Anti-Patterns\n\n`;
      
      for (const ap of parsed.anti_patterns) {
        formatted += `### ❌ ${ap.rule}\n`;
        formatted += `**Confidence:** ${ap.confidence}\n\n`;
        formatted += `**Evidence:** ${ap.evidence}\n\n`;
        formatted += `---\n\n`;
      }
      
      if (parsed.insufficient_evidence?.length > 0) {
        formatted += `## Insufficient Evidence\n\n`;
        formatted += `These were considered but couldn't be confirmed:\n`;
        for (const item of parsed.insufficient_evidence) {
          formatted += `- ${item}\n`;
        }
      }
      
      fs.writeFileSync(
        path.join(outputDir, 'anti-rules.md'),
        formatted
      );
      
      console.log(`\n📁 Saved to: taste-profiles/${channelSlug}/anti-rules.md`);
    }
  } catch (e) {
    console.log('\n⚠️ Could not parse JSON, raw output saved.');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                         ✅ COMPLETE                            ');
  console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(console.error);


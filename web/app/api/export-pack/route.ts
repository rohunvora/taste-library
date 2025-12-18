import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

interface MatchedBlock {
  block: {
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
  };
  score: number;
  matchedTags: {
    component: string[];
    style: string[];
    context: string[];
    vibe: string[];
  };
}

interface ExportRequest {
  matches: MatchedBlock[];
  extractedTags: {
    component?: string[];
    style?: string[];
    context?: string[];
    vibe?: string[];
  };
  imageCount: number;
}

interface StyleGuide {
  common: {
    colors: Record<string, string>;
    typography: Record<string, string>;
    spacing: Record<string, string>;
    elevation: Record<string, string>;
    borders: Record<string, string | number>;
    motion: Record<string, string | number | boolean>;
  };
  contexts: Record<string, any>;
}

interface DistinctiveFeature {
  what_stands_out: string;
  specific_values: string[];
  borrow_this: string;
}

// ============================================================================
// PROMPTS
// ============================================================================

const DISTINCTIVE_FEATURES_PROMPT = `You are a design systems expert. Analyze this UI reference image and identify what makes it DISTINCTIVE.

Focus on specific, actionable details that could be replicated:

1. **what_stands_out**: One sentence about the most unique visual element
2. **specific_values**: Extract 3-5 specific CSS-like values you can see:
   - Border radius (estimate in px)
   - Spacing between elements (estimate in px)
   - Shadow treatment (none/subtle/prominent)
   - Any distinctive colors (hex if visible)
   - Typography weight/size relationships
3. **borrow_this**: One specific technique to borrow (e.g., "the way icons are tinted to match accent color")

Output valid JSON only:
{
  "what_stands_out": "...",
  "specific_values": ["radius ~16px", "card gap 12px", "no shadows, depth from borders only"],
  "borrow_this": "..."
}`;

// ============================================================================
// HELPERS
// ============================================================================

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Failed to download image:', url, error);
    return null;
  }
}

function getImageExtension(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
  return match ? match[1].toLowerCase() : 'png';
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

async function analyzeDistinctiveFeatures(
  imageBuffer: Buffer,
  genAI: GoogleGenerativeAI
): Promise<DistinctiveFeature | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const base64 = imageBuffer.toString('base64');
    
    const result = await model.generateContent([
      { text: DISTINCTIVE_FEATURES_PROMPT },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64,
        },
      },
    ]);

    const response = result.response.text();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to analyze image:', error);
    return null;
  }
}

function loadStyleGuide(): StyleGuide | null {
  try {
    const stylePath = path.join(process.cwd(), '..', 'taste-profiles', 'ui-ux-uqgmlf-rw1i', 'style-guide.json');
    if (!fs.existsSync(stylePath)) return null;
    return JSON.parse(fs.readFileSync(stylePath, 'utf-8'));
  } catch {
    return null;
  }
}

function loadAntiRules(): string | null {
  try {
    const rulesPath = path.join(process.cwd(), '..', 'taste-profiles', 'ui-ux-uqgmlf-rw1i', 'anti-rules.md');
    if (!fs.existsSync(rulesPath)) return null;
    return fs.readFileSync(rulesPath, 'utf-8');
  } catch {
    return null;
  }
}

function extractAntiPatterns(antiRulesContent: string): string[] {
  const patterns: string[] = [];
  
  // Extract high-confidence anti-patterns
  const antiPatternRegex = /### ❌ (.+?)\n\*\*Confidence:\*\* high/g;
  let match;
  while ((match = antiPatternRegex.exec(antiRulesContent)) !== null) {
    patterns.push(match[1]);
  }
  
  return patterns;
}

function generateDesignSpec(
  matches: MatchedBlock[],
  extractedTags: ExportRequest['extractedTags'],
  imageCount: number,
  styleGuide: StyleGuide | null,
  antiPatterns: string[],
  distinctiveFeatures: Map<number, DistinctiveFeature>
): string {
  // Tags summary - concise header
  const allTags = [
    ...(extractedTags.component || []),
    ...(extractedTags.style || []),
    ...(extractedTags.context || []),
    ...(extractedTags.vibe || []),
  ];
  let spec = `## Reference Images for: ${allTags.slice(0, 6).join(', ')}\n\n`;

  matches.forEach((match, i) => {
    const priority = i === 0 ? 'PRIMARY (match this 80%)' : i === 1 ? 'SECONDARY' : 'CONTEXT';
    const filename = `ref-${i + 1}-${sanitizeFilename(match.block.one_liner)}.${getImageExtension(match.block.image_url || '')}`;
    
    spec += `### ${filename} [${priority}]\n`;
    spec += `${match.block.one_liner}\n`;
    
    // Add distinctive features if available - this is the valuable part
    const features = distinctiveFeatures.get(match.block.id);
    if (features) {
      spec += `\n**Key details:**\n`;
      features.specific_values.forEach(v => {
        spec += `- ${v}\n`;
      });
      spec += `\n**Borrow:** ${features.borrow_this}\n`;
    }
    
    spec += `\n`;
  });

  // Anti-patterns section - compact
  if (antiPatterns.length > 0) {
    spec += `---\n\n**Avoid:** ${antiPatterns.join(' · ')}\n`;
  }

  return spec;
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { matches, extractedTags, imageCount } = body;

    if (!matches || matches.length === 0) {
      return NextResponse.json({ error: 'No matches provided' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Limit to top 4 references (more is noisy)
    const topMatches = matches.slice(0, 4);

    // Create ZIP
    const zip = new JSZip();

    // Download images and analyze distinctive features in parallel
    const imageDownloads: Promise<{ match: MatchedBlock; buffer: Buffer | null; features: DistinctiveFeature | null }>[] = [];

    for (const match of topMatches) {
      if (match.block.image_url) {
        imageDownloads.push(
          (async () => {
            const buffer = await downloadImage(match.block.image_url!);
            let features: DistinctiveFeature | null = null;
            
            if (buffer) {
              features = await analyzeDistinctiveFeatures(buffer, genAI);
            }
            
            return { match, buffer, features };
          })()
        );
      }
    }

    const downloadResults = await Promise.all(imageDownloads);

    // Add images to ZIP and collect features
    const distinctiveFeatures = new Map<number, DistinctiveFeature>();
    
    downloadResults.forEach((result, i) => {
      if (result.buffer) {
        const ext = getImageExtension(result.match.block.image_url || '');
        const filename = `ref-${i + 1}-${sanitizeFilename(result.match.block.one_liner)}.${ext}`;
        zip.file(filename, result.buffer);
        
        if (result.features) {
          distinctiveFeatures.set(result.match.block.id, result.features);
        }
      }
    });

    // Load style guide and anti-rules
    const styleGuide = loadStyleGuide();
    const antiRulesContent = loadAntiRules();
    const antiPatterns = antiRulesContent ? extractAntiPatterns(antiRulesContent) : [];

    // Generate the design spec
    const spec = generateDesignSpec(
      topMatches,
      extractedTags,
      imageCount,
      styleGuide,
      antiPatterns,
      distinctiveFeatures
    );

    // Generate ZIP buffer (images only - no MD file needed since we copy spec separately)
    const zipBuffer = await zip.generateAsync({ type: 'base64' });

    // Return both ZIP (base64) and spec text for auto-copy
    return NextResponse.json({
      zip: zipBuffer,
      spec: spec,
      imageCount: downloadResults.filter(r => r.buffer).length,
    });

  } catch (error: any) {
    console.error('Export pack error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

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

interface MatchResult {
  block: BlockIndex;
  score: number;
  matchedTags: {
    component: string[];
    style: string[];
    context: string[];
    vibe: string[];
  };
  relevanceNote: string;
}

// ============================================================================
// TAG EXTRACTION PROMPT (same taxonomy as indexer)
// ============================================================================

const TAG_PROMPT = `You are a design librarian. Analyze this UI/UX screenshot and output tags.

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
// MATCHING LOGIC
// ============================================================================

const WEIGHTS = {
  component: 3,    // Most important for relevance
  context: 2,      // Where it's used matters
  style: 1.5,      // Visual treatment
  vibe: 1,         // Emotional quality
};

function calculateMatchScore(
  queryTags: BlockIndex['tags'],
  blockTags: BlockIndex['tags']
): { score: number; matched: { component: string[]; style: string[]; context: string[]; vibe: string[] } } {
  let totalScore = 0;
  const matched = {
    component: [] as string[],
    style: [] as string[],
    context: [] as string[],
    vibe: [] as string[],
  };

  // For each category
  for (const category of ['component', 'style', 'context', 'vibe'] as const) {
    const querySet = new Set(queryTags[category] || []);
    const blockSet = blockTags[category] || [];
    
    for (const tag of blockSet) {
      if (querySet.has(tag)) {
        totalScore += WEIGHTS[category];
        matched[category].push(tag);
      }
    }
  }

  return { score: totalScore, matched };
}

function generateRelevanceNote(matched: { component: string[]; style: string[]; context: string[]; vibe: string[] }): string {
  const parts: string[] = [];
  
  if (matched.component.length > 0) {
    parts.push(`Shares ${matched.component.join(', ')} components`);
  }
  if (matched.style.length > 0) {
    parts.push(`similar ${matched.style.join(', ')} style`);
  }
  if (matched.context.length > 0) {
    parts.push(`same ${matched.context.join('/')} context`);
  }
  if (matched.vibe.length > 0) {
    parts.push(`${matched.vibe.join(', ')} vibe`);
  }
  
  return parts.join('; ') || 'General relevance';
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Extract base64 data and mime type
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }
    const [, mimeType, base64Data] = matches;

    // Call Gemini to extract tags
    const result = await model.generateContent([
      { text: TAG_PROMPT },
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const response = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to extract tags' }, { status: 500 });
    }

    const extractedTags = JSON.parse(jsonMatch[0]) as {
      component?: string[];
      style?: string[];
      context?: string[];
      vibe?: string[];
      one_liner?: string;
    };

    // Load the index
    const indexPath = path.join(process.cwd(), '..', 'taste-profiles', 'ui-ux-uqgmlf-rw1i', 'index.json');
    
    if (!fs.existsSync(indexPath)) {
      return NextResponse.json({ 
        error: 'Index not found. Run: npm run index-blocks -- --channel=ui-ux-uqgmlf-rw1i' 
      }, { status: 500 });
    }

    const index: ChannelIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

    // Score all blocks
    const matches: MatchResult[] = [];
    
    for (const block of index.blocks) {
      const { score, matched } = calculateMatchScore(extractedTags, block.tags);
      
      if (score > 0) {
        matches.push({
          block,
          score,
          matchedTags: matched,
          relevanceNote: generateRelevanceNote(matched),
        });
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    // Return top 6
    const topMatches = matches.slice(0, 6);

    return NextResponse.json({
      extractedTags,
      oneLiner: extractedTags.one_liner,
      matches: topMatches,
      totalIndexed: index.blocks.length,
    });

  } catch (error: any) {
    console.error('Match error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


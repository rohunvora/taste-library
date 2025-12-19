/**
 * Reference Matcher
 * 
 * Platform-agnostic module for matching images to references.
 * Uses Gemini for tag extraction, then scores against indexed blocks.
 * 
 * Usage:
 *   import { matchImageToReferences, calculateMatchScore } from 'arena-refs/core'
 *   
 *   const matches = await matchImageToReferences(base64Image, index, geminiKey)
 */

import type { 
  TagSet, 
  IndexedBlock, 
  ChannelIndex, 
  MatchResult, 
  MatchedTags,
  MatchResponse 
} from './types';

// ============================================================================
// TAG EXTRACTION
// ============================================================================

/**
 * Prompt for extracting semantic tags from a UI screenshot
 */
export const TAG_EXTRACTION_PROMPT = `You are a design librarian. Analyze this UI/UX screenshot and output tags.

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

/**
 * Prompt for generating human-readable explanations
 */
export const EXPLANATION_PROMPT_TEMPLATE = `You are helping a designer understand why a reference image matches their work-in-progress.

Given:
- What they're building: "{queryDescription}"
- Reference description: "{matchDescription}"
- Overlapping qualities: {matchedTags}

Write ONE short sentence (max 12 words) explaining why this reference is relevant.

Rules:
- Be specific about what's similar (layout, spacing, visual treatment, etc.)
- Avoid generic phrases like "similar design" or "matches well"
- Focus on actionable visual qualities they could borrow
- Don't mention the tag names directly, describe what they mean visually

Examples of good explanations:
- "Clean card layout with generous whitespace and thin borders"
- "Same metrics-heavy dashboard with subtle grid structure"
- "Matching dark theme with high-contrast accent colors"

Output ONLY the explanation sentence, nothing else.`;

// ============================================================================
// SCORING LOGIC
// ============================================================================

/**
 * Weights for different tag categories when scoring matches
 */
export const TAG_WEIGHTS = {
  component: 3,    // Most important for relevance
  context: 2,      // Where it's used matters
  style: 1.5,      // Visual treatment
  vibe: 1,         // Emotional quality
};

/**
 * Calculate match score between query tags and a block's tags
 * Returns both the numeric score and which tags matched
 */
export function calculateMatchScore(
  queryTags: TagSet,
  blockTags: TagSet
): { score: number; matched: MatchedTags } {
  let totalScore = 0;
  const matched: MatchedTags = {
    component: [],
    style: [],
    context: [],
    vibe: [],
  };

  for (const category of ['component', 'style', 'context', 'vibe'] as const) {
    const querySet = new Set(queryTags[category] || []);
    const blockSet = blockTags[category] || [];

    for (const tag of blockSet) {
      if (querySet.has(tag)) {
        totalScore += TAG_WEIGHTS[category];
        matched[category].push(tag);
      }
    }
  }

  return { score: totalScore, matched };
}

/**
 * Score and rank all blocks against query tags
 * Returns top N matches sorted by score
 */
export function findTopMatches(
  queryTags: TagSet,
  blocks: IndexedBlock[],
  limit: number = 6
): Array<{ block: IndexedBlock; score: number; matchedTags: MatchedTags }> {
  const scoredMatches: Array<{
    block: IndexedBlock;
    score: number;
    matchedTags: MatchedTags;
  }> = [];

  for (const block of blocks) {
    const { score, matched } = calculateMatchScore(queryTags, block.tags);
    if (score > 0) {
      scoredMatches.push({ block, score, matchedTags: matched });
    }
  }

  scoredMatches.sort((a, b) => b.score - a.score);
  return scoredMatches.slice(0, limit);
}

// ============================================================================
// HIGH-LEVEL MATCHING FUNCTION
// ============================================================================

/**
 * Configuration for the Gemini client
 */
export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

/**
 * Match an image to references using Gemini for tag extraction
 * 
 * This is the main function external integrations would use.
 * 
 * @param imageBase64 - Base64-encoded image data (with or without data URL prefix)
 * @param index - The channel index containing blocks to match against
 * @param gemini - Gemini configuration
 * @returns Matching results with scores and explanations
 */
export async function matchImageToReferences(
  imageBase64: string,
  index: ChannelIndex,
  gemini: GeminiConfig
): Promise<MatchResponse> {
  // Dynamically import Gemini to keep this module lightweight for non-matching use cases
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: gemini.model || 'gemini-2.0-flash' });

  // Extract base64 data and mime type
  let mimeType = 'image/jpeg';
  let base64Data = imageBase64;

  const dataUrlParts = imageBase64.match(/^data:(.+);base64,(.+)$/);
  if (dataUrlParts) {
    mimeType = dataUrlParts[1];
    base64Data = dataUrlParts[2];
  }

  // Extract tags from the image
  const result = await model.generateContent([
    { text: TAG_EXTRACTION_PROMPT },
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
  ]);

  const response = result.response.text();
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract tags from image');
  }

  const extractedTags = JSON.parse(jsonMatch[0]) as TagSet & { one_liner?: string };
  const oneLiner = extractedTags.one_liner || 'UI design';

  // Find top matches
  const topMatches = findTopMatches(extractedTags, index.blocks, 6);

  // Generate human-readable explanations
  const explanationPromises = topMatches.map(async (match) => {
    const matchedTagsList = [
      ...match.matchedTags.component,
      ...match.matchedTags.style,
      ...match.matchedTags.context,
      ...match.matchedTags.vibe,
    ];

    const prompt = EXPLANATION_PROMPT_TEMPLATE
      .replace('{queryDescription}', oneLiner)
      .replace('{matchDescription}', match.block.one_liner)
      .replace('{matchedTags}', matchedTagsList.join(', '));

    try {
      const expResult = await model.generateContent(prompt);
      const explanation = expResult.response.text().trim().replace(/^["']|["']$/g, '');
      return { id: match.block.id, explanation };
    } catch {
      const fallback = matchedTagsList.length > 0
        ? `Similar ${matchedTagsList.slice(0, 3).join(', ')} approach`
        : 'Related visual reference';
      return { id: match.block.id, explanation: fallback };
    }
  });

  const explanations = await Promise.all(explanationPromises);
  const explanationMap = new Map(explanations.map(e => [e.id, e.explanation]));

  // Build final results
  const matches: MatchResult[] = topMatches.map(match => ({
    block: match.block,
    score: match.score,
    matchedTags: match.matchedTags,
    relevanceNote: explanationMap.get(match.block.id) || 'Related visual reference',
  }));

  return {
    extractedTags,
    oneLiner,
    matches,
    totalIndexed: index.blocks.length,
  };
}


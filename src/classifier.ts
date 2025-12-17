import { TARGET_CHANNELS, CHANNEL_TITLES, URL_PATTERNS, CONTENT_KEYWORDS } from './config.js';
import type { ArenaBlock, ArenaChannel, ClassificationResult } from './types.js';

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

/**
 * Check if URL matches any pattern for a target channel
 */
function matchUrlPattern(url: string | null): string[] {
  if (!url) return [];

  const domain = extractDomain(url);
  if (!domain) return [];

  const matches: string[] = [];

  for (const [channel, patterns] of Object.entries(URL_PATTERNS)) {
    for (const pattern of patterns) {
      if (domain.includes(pattern) || pattern.includes(domain)) {
        matches.push(channel);
        break;
      }
    }
  }

  return matches;
}

/**
 * Check if content matches keywords for target channels
 */
function matchKeywords(text: string | null): string[] {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const matches: string[] = [];

  for (const [channel, keywords] of Object.entries(CONTENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matches.push(channel);
        break;
      }
    }
  }

  return matches;
}

/**
 * Generate a suggested label based on block content
 */
function generateLabel(block: ArenaBlock): string | undefined {
  // If block already has a description, don't suggest a new one
  if (block.description && block.description.trim().length > 10) {
    return undefined;
  }

  const parts: string[] = [];

  // Add source info
  if (block.source?.provider?.name) {
    parts.push(`[${block.source.provider.name}]`);
  }

  // Add block type
  if (block.class === 'Link' && block.source?.url) {
    const domain = extractDomain(block.source.url);
    if (domain && !parts.length) {
      parts.push(`[${domain}]`);
    }
  } else if (block.class === 'Text') {
    parts.push('[Text]');
  } else if (block.class === 'Image') {
    parts.push('[Image]');
  }

  // Add title-based hint if source title exists
  if (block.source?.title && block.source.title !== block.title) {
    // Truncate if too long
    const title = block.source.title.length > 60
      ? block.source.title.slice(0, 57) + '...'
      : block.source.title;
    parts.push(title);
  }

  return parts.length > 0 ? parts.join(' ') : undefined;
}

/**
 * Check if block is already in target channel system
 */
function isAlreadyOrganized(existingChannels: ArenaChannel[]): boolean {
  const targetSlugs = Object.values(TARGET_CHANNELS);
  const targetTitles = Object.values(CHANNEL_TITLES).map((t) => t.toLowerCase());
  
  return existingChannels.some((ch) => {
    const slugLower = ch.slug.toLowerCase();
    const titleLower = ch.title.toLowerCase();
    return (
      targetSlugs.some((slug) => slugLower.includes(slug)) ||
      targetTitles.some((title) => titleLower === title)
    );
  });
}

/**
 * Classify a single block
 */
export function classifyBlock(
  block: ArenaBlock,
  sourceChannel: ArenaChannel,
  existingChannels: ArenaChannel[]
): ClassificationResult {
  const targetChannels: string[] = [];
  const reasons: string[] = [];

  // Skip if already in target system
  if (isAlreadyOrganized(existingChannels)) {
    return {
      block,
      sourceChannel,
      targetChannels: [],
      reasoning: 'Already organized in target channels',
    };
  }

  // 1. Check URL patterns
  const url = block.source?.url || null;
  const urlMatches = matchUrlPattern(url);
  if (urlMatches.length > 0) {
    targetChannels.push(...urlMatches);
    reasons.push(`URL pattern: ${extractDomain(url!)}`);
  }

  // 2. Check title keywords
  const titleMatches = matchKeywords(block.title);
  for (const match of titleMatches) {
    if (!targetChannels.includes(match)) {
      targetChannels.push(match);
      reasons.push(`Title keyword match`);
    }
  }

  // 3. Check description keywords
  const descMatches = matchKeywords(block.description);
  for (const match of descMatches) {
    if (!targetChannels.includes(match)) {
      targetChannels.push(match);
      reasons.push(`Description keyword match`);
    }
  }

  // 4. Check content (for text blocks)
  if (block.class === 'Text' && block.content) {
    const contentMatches = matchKeywords(block.content);
    for (const match of contentMatches) {
      if (!targetChannels.includes(match)) {
        targetChannels.push(match);
        reasons.push(`Content keyword match`);
      }
    }
  }

  // 5. Check source title
  const sourceTitleMatches = matchKeywords(block.source?.title || null);
  for (const match of sourceTitleMatches) {
    if (!targetChannels.includes(match)) {
      targetChannels.push(match);
      reasons.push(`Source title keyword match`);
    }
  }

  // Generate suggested label
  const suggestedLabel = generateLabel(block);

  return {
    block,
    sourceChannel,
    targetChannels,
    reasoning: reasons.length > 0 ? reasons.join('; ') : 'No classification match',
    suggestedLabel,
  };
}

/**
 * Classify all blocks
 */
export function classifyBlocks(
  blockMap: Map<number, { block: ArenaBlock; channels: ArenaChannel[] }>
): ClassificationResult[] {
  const results: ClassificationResult[] = [];

  for (const [blockId, { block, channels }] of blockMap) {
    // Use the first channel as "source" for display purposes
    const sourceChannel = channels[0];
    const result = classifyBlock(block, sourceChannel, channels);
    results.push(result);
  }

  return results;
}


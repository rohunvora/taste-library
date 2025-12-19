import type { ArenaBlock } from './types.js';

/**
 * Fetch metadata from a URL for auto-labeling
 * Note: This is a simple implementation that works without external dependencies.
 * For production, you might want to use a proper metadata extraction library.
 */
export async function fetchPageMetadata(url: string): Promise<{
  title?: string;
  description?: string;
} | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArenaOrganizer/1.0)',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);

    // Extract description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

    return {
      title: ogTitleMatch?.[1] || titleMatch?.[1] || undefined,
      description: ogDescMatch?.[1] || descMatch?.[1] || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Generate a label for a block based on its content and fetched metadata
 */
export function generateBlockLabel(
  block: ArenaBlock,
  metadata?: { title?: string; description?: string } | null
): string | undefined {
  // Don't overwrite existing descriptions
  if (block.description && block.description.trim().length > 20) {
    return undefined;
  }

  const parts: string[] = [];

  // Determine category tag from block type or source
  if (block.class === 'Link') {
    if (block.source?.url) {
      try {
        const domain = new URL(block.source.url).hostname.replace('www.', '');
        parts.push(`[${domain}]`);
      } catch {
        parts.push('[Link]');
      }
    }
  } else if (block.class === 'Image') {
    parts.push('[Image]');
  } else if (block.class === 'Text') {
    parts.push('[Text]');
  } else if (block.class === 'Media') {
    parts.push('[Media]');
  }

  // Use metadata description if available and different from existing content
  if (metadata?.description) {
    const desc = metadata.description.length > 100
      ? metadata.description.slice(0, 97) + '...'
      : metadata.description;

    // Avoid duplication with title
    if (desc.toLowerCase() !== block.title?.toLowerCase()) {
      parts.push(desc);
    }
  } else if (metadata?.title && metadata.title !== block.title) {
    // Fall back to title if no description
    const title = metadata.title.length > 80
      ? metadata.title.slice(0, 77) + '...'
      : metadata.title;
    parts.push(title);
  }

  return parts.length > 1 ? parts.join(' — ') : undefined;
}

/**
 * Batch process blocks that need labels
 */
export async function generateLabelsForBlocks(
  blocks: ArenaBlock[],
  options: { fetchMetadata?: boolean } = {}
): Promise<Map<number, string>> {
  const labels = new Map<number, string>();

  for (const block of blocks) {
    // Skip blocks that already have good descriptions
    if (block.description && block.description.trim().length > 20) {
      continue;
    }

    let metadata: { title?: string; description?: string } | null = null;

    // Optionally fetch metadata for links
    if (options.fetchMetadata && block.class === 'Link' && block.source?.url) {
      console.log(`   🔍 Fetching metadata: ${block.source.url.slice(0, 50)}...`);
      metadata = await fetchPageMetadata(block.source.url);
      // Small delay to be nice to servers
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const label = generateBlockLabel(block, metadata);
    if (label) {
      labels.set(block.id, label);
    }
  }

  return labels;
}


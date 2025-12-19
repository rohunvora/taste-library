/**
 * Block Classifier
 * 
 * Platform-agnostic module for classifying Arena blocks into channels.
 * 
 * Usage:
 *   import { classifyBlock, createChannelIfNeeded } from 'arena-refs/core'
 *   
 *   await classifyBlock(client, blockId, 'UI/UX')
 */

import { ArenaClient } from './arena-client';
import type { ClassifyResult } from './types';

// ============================================================================
// CHANNEL MAPPING
// ============================================================================

/**
 * Default category channels that map to slugs
 */
export const DEFAULT_CATEGORY_CHANNELS: Record<string, string> = {
  'ui-ux': 'UI/UX',
  'writing': 'Writing',
  'code': 'Code',
  'thinking': 'Frameworks',
};

/**
 * System channels used for classification workflow
 */
export const SYSTEM_CHANNELS = [
  'UI/UX',
  'Writing',
  'Code',
  'Frameworks',
  'Classifier - Skipped',
];

// ============================================================================
// CLASSIFICATION FUNCTIONS
// ============================================================================

/**
 * Convert a channel title to a URL-safe slug
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Classify a block into a category channel
 * 
 * @param client - ArenaClient instance
 * @param blockId - ID of the block to classify
 * @param category - Category key (e.g., 'ui-ux') or channel title
 * @returns Result indicating success/failure
 */
export async function classifyBlock(
  client: ArenaClient,
  blockId: number,
  category: string
): Promise<ClassifyResult> {
  try {
    // Resolve category to channel title
    const channelTitle = DEFAULT_CATEGORY_CHANNELS[category] || category;
    const channelSlug = titleToSlug(channelTitle);

    await client.addBlockToChannel(channelSlug, blockId);

    return {
      blockId,
      channel: channelTitle,
      success: true,
    };
  } catch (error) {
    console.error(`Failed to classify block ${blockId}:`, error);
    return {
      blockId,
      channel: category,
      success: false,
    };
  }
}

/**
 * Skip a block (add to "Classifier - Skipped" channel)
 */
export async function skipBlock(
  client: ArenaClient,
  blockId: number
): Promise<ClassifyResult> {
  try {
    await client.addBlockToChannel('classifier-skipped', blockId);
    return {
      blockId,
      channel: 'Classifier - Skipped',
      success: true,
    };
  } catch (error) {
    console.error(`Failed to skip block ${blockId}:`, error);
    return {
      blockId,
      channel: 'Classifier - Skipped',
      success: false,
    };
  }
}

/**
 * Undo a classification (remove from channel)
 */
export async function undoClassification(
  client: ArenaClient,
  blockId: number,
  channelSlug: string
): Promise<boolean> {
  try {
    await client.removeBlockFromChannel(channelSlug, blockId);
    return true;
  } catch (error) {
    console.error(`Failed to undo classification for block ${blockId}:`, error);
    return false;
  }
}

/**
 * Add block to a custom channel, creating it if needed
 */
export async function classifyToCustomChannel(
  client: ArenaClient,
  blockId: number,
  channelTitle: string,
  createNew: boolean = false
): Promise<ClassifyResult> {
  try {
    const channelSlug = titleToSlug(channelTitle);

    if (createNew) {
      // Try to create the channel (will fail if it exists, which is fine)
      try {
        await client.createChannel(channelTitle, 'closed');
      } catch {
        // Channel likely already exists, continue
      }
    }

    await client.addBlockToChannel(channelSlug, blockId);

    return {
      blockId,
      channel: channelTitle,
      success: true,
    };
  } catch (error) {
    console.error(`Failed to classify block ${blockId} to ${channelTitle}:`, error);
    return {
      blockId,
      channel: channelTitle,
      success: false,
    };
  }
}

/**
 * Delete a block from Arena entirely
 */
export async function deleteBlock(
  client: ArenaClient,
  blockId: number
): Promise<boolean> {
  try {
    await client.deleteBlock(blockId);
    return true;
  } catch (error) {
    console.error(`Failed to delete block ${blockId}:`, error);
    return false;
  }
}


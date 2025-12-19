/**
 * Arena API Client
 * 
 * Platform-agnostic wrapper for Are.na's API.
 * Can be used by web apps, CLI tools, Telegram bots, etc.
 * 
 * Usage:
 *   const client = new ArenaClient({ token: 'xxx', userSlug: 'rohun' })
 *   const channels = await client.getChannels()
 *   const blocks = await client.getChannelBlocks('my-channel')
 */

import type { 
  ArenaBlock, 
  ArenaChannel, 
  ArenaClientConfig,
  ClassifiableBlock 
} from './types';

const ARENA_API_BASE = 'https://api.are.na/v2';

export class ArenaClient {
  private token: string;
  private userSlug: string;

  constructor(config: ArenaClientConfig) {
    this.token = config.token;
    this.userSlug = config.userSlug;
  }

  /**
   * Make an authenticated request to the Arena API
   */
  private async fetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${ARENA_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => 'no body');
      throw new Error(`Are.na API error: ${res.status} ${res.statusText} - ${errBody.slice(0, 100)}`);
    }

    return res.json();
  }

  /**
   * Make an authenticated POST request
   */
  private async post<T>(endpoint: string, body: object): Promise<T> {
    const res = await fetch(`${ARENA_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => 'no body');
      throw new Error(`Are.na API error: ${res.status} ${res.statusText} - ${errBody.slice(0, 100)}`);
    }

    return res.json();
  }

  /**
   * Make an authenticated PUT request
   */
  private async put<T>(endpoint: string, body: object): Promise<T> {
    const res = await fetch(`${ARENA_API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => 'no body');
      throw new Error(`Are.na API error: ${res.status} ${res.statusText} - ${errBody.slice(0, 100)}`);
    }

    return res.json();
  }

  /**
   * Make an authenticated DELETE request
   */
  private async delete(endpoint: string): Promise<void> {
    const res = await fetch(`${ARENA_API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => 'no body');
      throw new Error(`Are.na API error: ${res.status} ${res.statusText} - ${errBody.slice(0, 100)}`);
    }
  }

  // ============================================================================
  // CHANNEL OPERATIONS
  // ============================================================================

  /**
   * Get all channels for the configured user
   */
  async getChannels(limit: number = 100): Promise<ArenaChannel[]> {
    const data = await this.fetch<{ channels: ArenaChannel[] }>(
      `/users/${this.userSlug}/channels?per=${limit}`
    );
    return data.channels || [];
  }

  /**
   * Get blocks from a specific channel
   */
  async getChannelBlocks(slug: string, limit: number = 100): Promise<ArenaBlock[]> {
    const data = await this.fetch<{ contents: ArenaBlock[] }>(
      `/channels/${slug}/contents?per=${limit}`
    );
    if (!data.contents) return [];
    // Filter out nested channels
    return data.contents.filter((b) => b.class !== 'Channel');
  }

  /**
   * Create a new channel
   */
  async createChannel(title: string, status: 'public' | 'closed' | 'private' = 'closed'): Promise<ArenaChannel> {
    return this.post<ArenaChannel>('/channels', { title, status });
  }

  /**
   * Get channel by slug
   */
  async getChannel(slug: string): Promise<ArenaChannel & { contents: ArenaBlock[] }> {
    return this.fetch(`/channels/${slug}`);
  }

  /**
   * Update a channel's settings (title, status, etc.)
   */
  async updateChannel(slug: string, updates: { title?: string; status?: 'public' | 'closed' | 'private' }): Promise<ArenaChannel> {
    return this.put<ArenaChannel>(`/channels/${slug}`, updates);
  }

  // ============================================================================
  // BLOCK OPERATIONS
  // ============================================================================

  /**
   * Add a block to a channel
   */
  async addBlockToChannel(channelSlug: string, blockId: number): Promise<void> {
    await this.put(`/channels/${channelSlug}/blocks/${blockId}`, {});
  }

  /**
   * Remove a block from a channel
   */
  async removeBlockFromChannel(channelSlug: string, blockId: number): Promise<void> {
    await this.delete(`/channels/${channelSlug}/blocks/${blockId}`);
  }

  /**
   * Delete a block entirely
   */
  async deleteBlock(blockId: number): Promise<void> {
    await this.delete(`/blocks/${blockId}`);
  }

  // ============================================================================
  // CLASSIFIER HELPERS
  // ============================================================================

  /**
   * Get unclassified blocks (blocks not in any system channel)
   */
  async getUnclassifiedBlocks(
    systemChannels: string[] = ['UI/UX', 'Writing', 'Code', 'Frameworks', 'Classifier - Skipped']
  ): Promise<{ blocks: ClassifiableBlock[]; allChannels: ArenaChannel[] }> {
    const channels = await this.getChannels();
    const systemChannelsLower = systemChannels.map(c => c.toLowerCase());

    // Separate system channels from content channels
    const systemChannelsList = channels.filter(ch =>
      systemChannelsLower.includes(ch.title.toLowerCase())
    );
    const contentChannels = channels.filter(ch =>
      !systemChannelsLower.includes(ch.title.toLowerCase()) && ch.length > 0
    );

    // Fetch in parallel
    const [systemBlocksResults, contentBlocksResults] = await Promise.all([
      Promise.all(
        systemChannelsList
          .filter(ch => ch.length > 0)
          .map(ch => this.getChannelBlocks(ch.slug, 200).then(blocks => ({ channel: ch, blocks })))
      ),
      Promise.all(
        contentChannels
          .slice(0, 20)
          .map(ch => this.getChannelBlocks(ch.slug, 50).then(blocks => ({ channel: ch, blocks })))
      ),
    ]);

    // Build set of classified block IDs
    const classifiedBlockIds = new Set<number>();
    for (const { blocks } of systemBlocksResults) {
      for (const block of blocks) {
        classifiedBlockIds.add(block.id);
      }
    }

    // Build map of unclassified blocks
    const blockMap = new Map<number, { block: ArenaBlock; channels: string[] }>();

    for (const { channel, blocks } of contentBlocksResults) {
      for (const block of blocks) {
        if (classifiedBlockIds.has(block.id)) continue;

        if (!blockMap.has(block.id)) {
          blockMap.set(block.id, { block, channels: [] });
        }
        blockMap.get(block.id)!.channels.push(channel.title);
      }
    }

    // Convert to array
    const unclassified: ClassifiableBlock[] = Array.from(blockMap.values()).map(({ block, channels }) => ({
      ...block,
      sourceChannels: channels,
    }));

    return {
      blocks: unclassified,
      allChannels: channels,
    };
  }
}


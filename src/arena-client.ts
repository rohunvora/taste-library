import Arena from 'are.na';
import type { ArenaChannel, ArenaBlock, ArenaUser } from './types.js';

export class ArenaClient {
  private arena: Arena;
  private userSlug: string;

  constructor(token: string, userSlug: string) {
    this.arena = new Arena({ accessToken: token });
    this.userSlug = userSlug;
  }

  /**
   * Get all channels for the user
   */
  async getChannels(): Promise<ArenaChannel[]> {
    const channels: ArenaChannel[] = [];
    let page = 1;
    const perPage = 50;
    let hasMore = true;

    console.log('📂 Fetching channels...');

    while (hasMore) {
      try {
        const response = await this.arena.user(this.userSlug).channels({
          page,
          per: perPage,
        });

        if (response && Array.isArray(response)) {
          channels.push(...(response as ArenaChannel[]));
          hasMore = response.length === perPage;
          page++;
        } else if (response && response.channels) {
          channels.push(...response.channels);
          hasMore = response.channels.length === perPage;
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching channels page ${page}:`, error);
        hasMore = false;
      }
    }

    console.log(`   Found ${channels.length} channels`);
    return channels;
  }

  /**
   * Get all blocks in a channel (with pagination)
   */
  async getChannelBlocks(channelSlug: string): Promise<ArenaBlock[]> {
    const blocks: ArenaBlock[] = [];
    let page = 1;
    const perPage = 50;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.arena.channel(channelSlug).contents({
          page,
          per: perPage,
        });

        if (response && Array.isArray(response)) {
          // Filter out channel connections (we only want blocks)
          const blockItems = response.filter(
            (item: any) => item.class !== 'Channel'
          ) as ArenaBlock[];
          blocks.push(...blockItems);
          hasMore = response.length === perPage;
          page++;
        } else if (response && response.contents) {
          const blockItems = response.contents.filter(
            (item: any) => item.class !== 'Channel'
          );
          blocks.push(...blockItems);
          hasMore = response.contents.length === perPage;
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching blocks for ${channelSlug} page ${page}:`, error);
        hasMore = false;
      }
    }

    return blocks;
  }

  /**
   * Get channel by slug (returns null if not found)
   */
  async getChannel(slug: string): Promise<ArenaChannel | null> {
    try {
      const channel = await this.arena.channel(slug).get();
      return channel as ArenaChannel;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a new channel
   */
  async createChannel(title: string, status: 'public' | 'closed' | 'private' = 'private'): Promise<ArenaChannel> {
    const channel = await this.arena.channel().create(title, status);
    return channel as ArenaChannel;
  }

  /**
   * Add an existing block to a channel (creates a connection)
   * Note: The are.na npm package doesn't support this directly,
   * so we use the underlying axios instance
   */
  async connectBlockToChannel(blockId: number, channelSlug: string): Promise<void> {
    // Access the internal axios instance to make a raw API call
    // POST /v2/channels/:slug/connections with connectable_type and connectable_id
    const arena = this.arena as any;
    await arena._req('POST', `channels/${channelSlug}/connections`, {
      connectable_type: 'Block',
      connectable_id: blockId,
    });
  }

  /**
   * Update a block's description
   */
  async updateBlockDescription(blockId: number, description: string): Promise<void> {
    await this.arena.block(blockId).update({ description });
  }

  /**
   * Get all blocks across all channels (deduplicated by block ID)
   */
  async getAllBlocks(channels: ArenaChannel[]): Promise<Map<number, { block: ArenaBlock; channels: ArenaChannel[] }>> {
    const blockMap = new Map<number, { block: ArenaBlock; channels: ArenaChannel[] }>();

    for (const channel of channels) {
      console.log(`   📖 Reading: ${channel.title} (${channel.length} items)`);
      const blocks = await this.getChannelBlocks(channel.slug);

      for (const block of blocks) {
        const existing = blockMap.get(block.id);
        if (existing) {
          existing.channels.push(channel);
        } else {
          blockMap.set(block.id, { block, channels: [channel] });
        }
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return blockMap;
  }
}


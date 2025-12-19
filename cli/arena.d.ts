declare module 'are.na' {
  interface ArenaOptions {
    accessToken?: string;
  }

  interface PaginationOptions {
    page?: number;
    per?: number;
  }

  interface ChannelMethods {
    get(): Promise<any>;
    contents(options?: PaginationOptions): Promise<any>;
    create(title: string, status?: 'public' | 'closed' | 'private'): Promise<any>;
    connect: {
      block(blockId: number): Promise<any>;
    };
  }

  interface BlockMethods {
    get(): Promise<any>;
    update(data: { description?: string; title?: string; content?: string }): Promise<any>;
    create(channelSlug: string, data: { source?: string; content?: string }): Promise<any>;
  }

  interface UserMethods {
    get(): Promise<any>;
    channels(options?: PaginationOptions): Promise<any>;
  }

  class Arena {
    constructor(options?: ArenaOptions);
    channel(slug?: string): ChannelMethods;
    block(id?: number): BlockMethods;
    user(slug: string): UserMethods;
  }

  export = Arena;
}


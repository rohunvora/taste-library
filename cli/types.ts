// Are.na API types (subset of what we need)

export interface ArenaUser {
  id: number;
  slug: string;
  username: string;
  full_name: string;
  channel_count: number;
}

export interface ArenaChannel {
  id: number;
  title: string;
  slug: string;
  status: 'public' | 'closed' | 'private';
  user_id: number;
  length: number;
  created_at: string;
  updated_at: string;
  contents?: ArenaBlock[];
}

export interface ArenaBlock {
  id: number;
  title: string | null;
  description: string | null;
  content: string | null;
  source: {
    url: string | null;
    title: string | null;
    provider: {
      name: string | null;
    } | null;
  } | null;
  image?: {
    filename?: string;
    display?: {
      url: string;
    };
    thumb?: {
      url: string;
    };
  };
  class: 'Image' | 'Text' | 'Link' | 'Media' | 'Attachment' | 'Channel';
  created_at: string;
  updated_at: string;
  connected_at?: string;
  connection_id?: number;
}

export interface ClassificationResult {
  block: ArenaBlock;
  sourceChannel: ArenaChannel;
  targetChannels: string[];
  reasoning: string;
  suggestedLabel?: string;
}

export interface OrganizeReport {
  totalBlocks: number;
  classified: number;
  skipped: number;
  results: ClassificationResult[];
  channelsToCreate: string[];
}


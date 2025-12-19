/**
 * Shared types for Arena Refs
 * 
 * These types are platform-agnostic and can be used by:
 * - Web app (Next.js)
 * - CLI tools
 * - Telegram bots
 * - Any other integration
 */

// ============================================================================
// ARENA API TYPES
// ============================================================================

export interface ArenaBlock {
  id: number;
  title: string | null;
  description: string | null;
  content: string | null;
  class: 'Image' | 'Link' | 'Text' | 'Media' | 'Attachment' | 'Channel';
  source?: {
    url: string | null;
    title: string | null;
  };
  image?: {
    display?: { url: string };
    thumb?: { url: string };
  };
}

export interface ArenaChannel {
  id: number;
  title: string;
  slug: string;
  length: number;
  created_at: string;
}

// ============================================================================
// INDEXED BLOCK (for matching)
// ============================================================================

export interface TagSet {
  component?: string[];
  style?: string[];
  context?: string[];
  vibe?: string[];
}

export interface IndexedBlock {
  id: number;
  title: string | null;
  arena_url: string;
  image_url: string | null;
  tags: TagSet;
  one_liner: string;
  indexed_at: string;
}

export interface ChannelIndex {
  channel_slug: string;
  channel_title: string;
  indexed_at: string;
  blocks: IndexedBlock[];
}

// ============================================================================
// MATCHING TYPES
// ============================================================================

export interface MatchedTags {
  component: string[];
  style: string[];
  context: string[];
  vibe: string[];
}

export interface MatchResult {
  block: IndexedBlock;
  score: number;
  matchedTags: MatchedTags;
  relevanceNote: string;
}

export interface MatchResponse {
  extractedTags: TagSet;
  oneLiner: string;
  matches: MatchResult[];
  totalIndexed: number;
}

// ============================================================================
// CLASSIFICATION TYPES
// ============================================================================

export interface ClassifiableBlock extends ArenaBlock {
  sourceChannels: string[];
}

export interface ClassifyResult {
  blockId: number;
  channel: string;
  success: boolean;
}

// ============================================================================
// CLIENT CONFIG
// ============================================================================

export interface ArenaClientConfig {
  token: string;
  userSlug: string;
}


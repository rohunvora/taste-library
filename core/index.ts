/**
 * Arena Refs - Core Module
 * 
 * Platform-agnostic core functionality for Arena-based tools.
 * 
 * This module can be imported by:
 * - Web apps (Next.js, React)
 * - CLI tools
 * - Telegram bots
 * - Any Node.js/Deno/Bun application
 * 
 * Example usage:
 * 
 *   import { ArenaClient, matchImageToReferences } from 'arena-refs/core'
 *   
 *   const client = new ArenaClient({ 
 *     token: process.env.ARENA_TOKEN, 
 *     userSlug: 'your-username' 
 *   })
 *   
 *   // Get unclassified blocks
 *   const { blocks } = await client.getUnclassifiedBlocks()
 *   
 *   // Match an image to references
 *   const matches = await matchImageToReferences(imageBase64, index, { 
 *     apiKey: process.env.GEMINI_API_KEY 
 *   })
 */

// Arena API Client
export { ArenaClient } from './arena-client';

// Reference Matcher
export { 
  matchImageToReferences,
  calculateMatchScore,
  findTopMatches,
  TAG_EXTRACTION_PROMPT,
  TAG_WEIGHTS,
  type GeminiConfig,
} from './matcher';

// Block Classifier
export {
  classifyBlock,
  skipBlock,
  undoClassification,
  classifyToCustomChannel,
  deleteBlock,
  titleToSlug,
  DEFAULT_CATEGORY_CHANNELS,
  SYSTEM_CHANNELS,
} from './classifier';

// Types
export type {
  // Arena API types
  ArenaBlock,
  ArenaChannel,
  ArenaClientConfig,
  
  // Indexed block types
  TagSet,
  IndexedBlock,
  ChannelIndex,
  
  // Matching types
  MatchedTags,
  MatchResult,
  MatchResponse,
  
  // Classification types
  ClassifiableBlock,
  ClassifyResult,
} from './types';


/**
 * Schema for extracted component data
 * This is the structure AI outputs for each are.na block
 */

import type { ScreenType, ComponentType, AestheticFamily, AtomType } from './taxonomy';

// Design tokens extracted from visual analysis
export interface DesignTokens {
  colors: {
    background: string;      // Main background (can be gradient CSS)
    surface: string;         // Card/container background
    text_primary: string;    // Main text color
    text_secondary: string;  // Secondary/muted text
    accent: string;          // Primary accent/action color
    accent_secondary?: string; // Secondary accent if present
  };
  radius: {
    containers: string;      // e.g., "24px", "12px", "0px"
    buttons: string;         // e.g., "9999px" for pills, "8px"
    inputs?: string;         // Form input radius
  };
  shadows: {
    default: string;         // CSS box-shadow value
    elevated?: string;       // Hover/elevated state
    inset?: string;          // Inner shadows if present
  };
  spacing: {
    base_unit: string;       // Grid unit, e.g., "8px", "4px"
    container_padding: string;
    element_gap: string;
    section_gap?: string;
  };
  typography: {
    heading_weight: string;  // e.g., "700", "600"
    body_weight: string;     // e.g., "400", "500"
    heading_size: string;    // Largest heading size
    body_size: string;       // Body text size
    line_height: string;     // e.g., "1.5", "1.6"
    font_style: string;      // e.g., "geometric-sans", "humanist", "serif"
  };
}

// A composable atom extracted from the design
export interface ExtractedAtom {
  type: AtomType;
  name: string;              // Memorable name, e.g., "Ethereal Gradient"
  description: string;       // What makes it distinctive
  css: string;               // CSS to replicate this atom
  tailwind?: string;         // Tailwind classes if applicable
}

// Generated code to replicate the component
export interface GeneratedCode {
  css: string;               // Full CSS to replicate main patterns
  tailwind?: string;         // Tailwind equivalent
  css_variables?: string;    // CSS custom properties version
}

// Usage guidance
export interface UsageGuidance {
  best_for: string[];        // Situations where this excels
  avoid_for: string[];       // Situations where this fails
  pairs_with?: AestheticFamily[];  // Aesthetic families it works with
  notes?: string;            // Additional guidance
}

// Source information from are.na
export interface SourceInfo {
  arena_id: number;
  arena_url: string;
  image_url: string;
  title: string | null;
  added_at?: string;         // When added to are.na
}

// The main component extraction schema
export interface ExtractedComponent {
  // Identity
  id: string;                // are.na block ID as string
  name: string;              // AI-generated memorable name
  description: string;       // One-line description

  // Classification
  screen_type: ScreenType;
  component_types: ComponentType[];
  aesthetic_family: AestheticFamily;
  tags: string[];            // Additional searchable tags

  // Design tokens
  tokens: DesignTokens;

  // Composable atoms
  atoms: ExtractedAtom[];

  // Generated code
  code: GeneratedCode;

  // Usage guidance
  usage: UsageGuidance;

  // Source
  source: SourceInfo;

  // Metadata
  extracted_at: string;      // ISO timestamp
  extraction_version: string; // Schema version for migrations
}

// Index file structure for all components
export interface ComponentIndex {
  version: string;
  generated_at: string;
  total_components: number;
  
  // Pre-computed aggregations for the website
  by_aesthetic: Record<AestheticFamily, string[]>;  // aesthetic -> component ids
  by_type: Record<ComponentType, string[]>;          // type -> component ids
  by_screen: Record<ScreenType, string[]>;           // screen -> component ids
  
  // All component IDs
  components: string[];
}

// Schema version for future migrations
export const SCHEMA_VERSION = '1.0.0';

// Type guard to validate extracted component
export function isValidComponent(obj: unknown): obj is ExtractedComponent {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const c = obj as Record<string, unknown>;
  
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.screen_type === 'string' &&
    Array.isArray(c.component_types) &&
    typeof c.aesthetic_family === 'string' &&
    typeof c.tokens === 'object' &&
    Array.isArray(c.atoms) &&
    typeof c.code === 'object' &&
    typeof c.usage === 'object' &&
    typeof c.source === 'object'
  );
}


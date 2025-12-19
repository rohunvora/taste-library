/**
 * Taxonomy for component classification
 * Used by AI extraction to categorize screenshots
 */

// Screen Types - what kind of screen is this?
export const SCREEN_TYPES = [
  'dashboard',
  'landing-page',
  'mobile-screen',
  'settings',
  'auth',
  'marketing',
  'product-detail',
  'data-visualization',
  'onboarding',
  'profile',
  'other',
] as const;

export type ScreenType = (typeof SCREEN_TYPES)[number];

// Component Types - what UI elements are featured?
export const COMPONENT_TYPES = [
  'navigation',
  'card',
  'button',
  'input',
  'data-display',
  'modal',
  'pricing',
  'hero',
  'feature-section',
  'testimonial',
  'footer',
  'chart',
  'table',
  'list',
  'form',
  'toast',
  'empty-state',
  'loading',
  'avatar',
  'badge',
  'tabs',
  'sidebar',
  'header',
  'metric',
  'calendar',
  'timeline',
  'progress',
  'dropdown',
  'tooltip',
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

// Aesthetic Families - the overall vibe
export const AESTHETIC_FAMILIES = {
  'soft-gradient': {
    name: 'Soft Gradient',
    description: 'Light, airy, gradient backgrounds, very rounded corners',
    keywords: ['light', 'airy', 'gradient', 'rounded', 'soft', 'pastel'],
  },
  'dark-premium': {
    name: 'Dark Premium',
    description: 'Dark mode, high contrast, sleek and sophisticated',
    keywords: ['dark', 'contrast', 'sleek', 'premium', 'sophisticated'],
  },
  'flat-minimal': {
    name: 'Flat Minimal',
    description: 'Clean, lots of white space, simple shapes',
    keywords: ['clean', 'minimal', 'whitespace', 'simple', 'flat'],
  },
  'neo-skeuomorphic': {
    name: 'Neo-Skeuomorphic',
    description: 'Tactile, layered shadows, depth, physical feel',
    keywords: ['tactile', 'shadow', 'depth', 'layered', 'physical'],
  },
  'playful-colorful': {
    name: 'Playful Colorful',
    description: 'Bold colors, illustrations, fun and energetic',
    keywords: ['bold', 'colorful', 'fun', 'energetic', 'illustration'],
  },
  'editorial': {
    name: 'Editorial',
    description: 'Typography-focused, magazine-like, content-first',
    keywords: ['typography', 'magazine', 'editorial', 'serif', 'content'],
  },
  'technical-dense': {
    name: 'Technical Dense',
    description: 'Data-heavy, compact, functional, information-rich',
    keywords: ['dense', 'data', 'compact', 'functional', 'technical'],
  },
  'glass-morphism': {
    name: 'Glass Morphism',
    description: 'Frosted glass, blur effects, translucent layers',
    keywords: ['glass', 'blur', 'translucent', 'frosted', 'overlay'],
  },
  'warm-organic': {
    name: 'Warm Organic',
    description: 'Earth tones, natural textures, warm and inviting',
    keywords: ['warm', 'organic', 'earth', 'natural', 'texture'],
  },
  'brutalist': {
    name: 'Brutalist',
    description: 'Raw, bold, unconventional, stark contrasts',
    keywords: ['raw', 'bold', 'unconventional', 'stark', 'brutalist'],
  },
} as const;

export type AestheticFamily = keyof typeof AESTHETIC_FAMILIES;

// Atom Types - composable design pieces
export const ATOM_TYPES = [
  'surface',      // Background and container treatments
  'button',       // Button styles
  'card',         // Card/container patterns
  'typography',   // Text styling approach
  'navigation',   // Nav patterns
  'input',        // Form input styles
  'icon',         // Icon treatment
  'spacing',      // Spacing system
  'color',        // Color usage pattern
  'shadow',       // Shadow/depth system
  'animation',    // Motion patterns (for GIFs)
] as const;

export type AtomType = (typeof ATOM_TYPES)[number];

// Helper to get aesthetic family info
export function getAestheticInfo(family: AestheticFamily) {
  return AESTHETIC_FAMILIES[family];
}

// Export all for use in prompts
export const TAXONOMY = {
  screenTypes: SCREEN_TYPES,
  componentTypes: COMPONENT_TYPES,
  aestheticFamilies: Object.keys(AESTHETIC_FAMILIES) as AestheticFamily[],
  atomTypes: ATOM_TYPES,
};


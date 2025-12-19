/**
 * Arena Refs - Design Tokens (JS Version)
 * 
 * These tokens mirror the CSS variables in globals.css
 * Use these when you need tokens in JavaScript/React inline styles.
 * 
 * For new components, prefer CSS variables when possible.
 */

export const theme = {
  colors: {
    bgPrimary: '#F2F0EC',
    bgSecondary: '#FFFFFF',
    bgTertiary: '#F5F5F5',
    
    textPrimary: '#000000',
    textSecondary: '#434343',
    textMuted: '#A3A3A3',
    
    accent: '#000000',
    accentHover: '#333333',
    success: '#4CAF50',
    danger: '#DC2626',
    warning: '#F59E0B',
    
    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.15)',
    
    // Category colors for Classifier
    category: {
      ui: '#7c3aed',
      writing: '#d97706',
      code: '#059669',
      thinking: '#db2777',
    },
  },
  
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '20px',
    lg: '32px',
    xl: '48px',
  },
  
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
  
  shadow: {
    subtle: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    lifted: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
    heavy: '0 10px 40px rgba(0,0,0,0.15)',
  },
  
  transition: {
    fast: '100ms ease-out',
    base: '200ms ease-out',
    slow: '300ms ease-out',
  },
  
  typography: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  zIndex: {
    dropdown: 50,
    modal: 100,
    overlay: 150,
    toast: 200,
  },
} as const;

// Type helper for theme values
export type Theme = typeof theme;

// Shorthand accessors
export const colors = theme.colors;
export const spacing = theme.spacing;
export const radius = theme.radius;
export const shadow = theme.shadow;
export const transition = theme.transition;


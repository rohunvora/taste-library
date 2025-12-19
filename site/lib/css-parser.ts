/**
 * CSS Parser - Convert CSS strings to React style objects
 * 
 * Takes extracted CSS like:
 *   "background-color: #000; border-radius: 12px;"
 * And converts to:
 *   { backgroundColor: '#000', borderRadius: '12px' }
 */

// Convert kebab-case to camelCase
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Parse a single CSS property
function parseProperty(prop: string): [string, string] | null {
  const colonIndex = prop.indexOf(':');
  if (colonIndex === -1) return null;
  
  const key = prop.slice(0, colonIndex).trim();
  const value = prop.slice(colonIndex + 1).trim();
  
  if (!key || !value) return null;
  
  return [kebabToCamel(key), value];
}

/**
 * Convert a CSS string to a React style object
 */
export function cssToStyleObject(css: string): React.CSSProperties {
  if (!css) return {};
  
  const style: Record<string, string> = {};
  
  // Handle both semicolon-separated and newline-separated CSS
  const properties = css
    .split(/[;\n]/)
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('/*') && !p.startsWith('//'));
  
  for (const prop of properties) {
    const parsed = parseProperty(prop);
    if (parsed) {
      const [key, value] = parsed;
      style[key] = value;
    }
  }
  
  return style as React.CSSProperties;
}

/**
 * Extract specific CSS properties from a CSS string
 */
export function extractCSSProperty(css: string, property: string): string | null {
  const style = cssToStyleObject(css);
  const camelProperty = kebabToCamel(property);
  return (style as Record<string, string>)[camelProperty] || null;
}

/**
 * Merge multiple CSS strings into one style object
 */
export function mergeCSSStrings(...cssStrings: (string | undefined)[]): React.CSSProperties {
  const merged: Record<string, string> = {};
  
  for (const css of cssStrings) {
    if (css) {
      Object.assign(merged, cssToStyleObject(css));
    }
  }
  
  return merged as React.CSSProperties;
}

/**
 * Check if a color value is "dark" (for determining text contrast)
 */
export function isDarkColor(color: string): boolean {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const fullHex = hex.length === 3 
      ? hex.split('').map(c => c + c).join('')
      : hex;
    
    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  
  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  
  // Default to assuming light for gradients and unknown formats
  return false;
}

/**
 * Get contrasting text color for a background
 */
export function getContrastingTextColor(backgroundColor: string): string {
  // For gradients, try to extract the first color
  if (backgroundColor.includes('gradient')) {
    const colorMatch = backgroundColor.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)/);
    if (colorMatch) {
      return isDarkColor(colorMatch[0]) ? '#ffffff' : '#000000';
    }
    return '#000000'; // Default for complex gradients
  }
  
  return isDarkColor(backgroundColor) ? '#ffffff' : '#000000';
}

/**
 * Parse a box-shadow value and return a simplified version for preview
 */
export function parseBoxShadow(shadow: string): {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread?: string;
  color: string;
} | null {
  if (!shadow || shadow === 'none') return null;
  
  // Simple regex for common shadow formats
  const match = shadow.match(
    /(-?\d+px)\s+(-?\d+px)\s+(-?\d+px)(?:\s+(-?\d+px))?\s+(rgba?\([^)]+\)|#[0-9a-fA-F]+)/
  );
  
  if (match) {
    return {
      offsetX: match[1],
      offsetY: match[2],
      blur: match[3],
      spread: match[4],
      color: match[5],
    };
  }
  
  return null;
}


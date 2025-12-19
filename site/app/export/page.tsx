import { getAllComponents, getStats } from "@/lib/components";
import { ExportClient } from "./export-client";

export default function ExportPage() {
  const stats = getStats();
  const components = getAllComponents();
  
  // Pre-generate all exports on server
  const cursorrules = generateCursorrules(components);
  const cssVariables = generateCSSVariables(components);
  const tailwindConfig = generateTailwindConfig(components);
  const jsonExport = generateJSONExport(components);
  
  return (
    <ExportClient
      stats={stats}
      cursorrules={cursorrules}
      cssVariables={cssVariables}
      tailwindConfig={tailwindConfig}
      jsonExport={jsonExport}
    />
  );
}

// Generate .cursorrules content
function generateCursorrules(components: ReturnType<typeof getAllComponents>): string {
  // Get most common aesthetics
  const aestheticCounts: Record<string, number> = {};
  for (const c of components) {
    aestheticCounts[c.aesthetic_family] = (aestheticCounts[c.aesthetic_family] || 0) + 1;
  }
  const topAesthetics = Object.entries(aestheticCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  // Get most common radii
  const radiusCounts: Record<string, number> = {};
  for (const c of components) {
    const r = c.tokens.radius.containers;
    radiusCounts[r] = (radiusCounts[r] || 0) + 1;
  }
  const topRadius = Object.entries(radiusCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '12px';

  // Get button radius
  const buttonRadiusCounts: Record<string, number> = {};
  for (const c of components) {
    const r = c.tokens.radius.buttons;
    buttonRadiusCounts[r] = (buttonRadiusCounts[r] || 0) + 1;
  }
  const topButtonRadius = Object.entries(buttonRadiusCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '8px';

  return `# Design System Preferences

Based on ${components.length} curated UI components, follow these design guidelines:

## Aesthetic Direction
Primary styles: ${topAesthetics.map(a => formatName(a)).join(', ')}

## Visual Tokens

### Border Radius
- Containers/cards: ${topRadius}
- Buttons: ${topButtonRadius}
- Inputs: 8px

### Typography
- Use geometric or humanist sans-serif fonts
- Heading weight: 600-700
- Body weight: 400
- Line height: 1.5-1.6

### Shadows
Prefer subtle shadows:
- Cards: 0 4px 16px rgba(0,0,0,0.04)
- Elevated: 0 8px 32px rgba(0,0,0,0.08)

### Spacing
- Base unit: 8px
- Container padding: 16-24px
- Element gap: 12-16px

## Component Patterns

### Cards
- Use generous padding (24px)
- Subtle shadows over borders
- ${topRadius} border radius

### Buttons
- Primary: solid background, ${topButtonRadius} radius
- Full-width for mobile CTAs
- Clear hover states

### Color Usage
- High contrast for primary text
- Muted colors for secondary information
- Use accent sparingly for actions

## What to Avoid
- Heavy drop shadows
- Harsh color contrasts
- Cluttered layouts
- Default browser styling
- Generic UI patterns

## Reference Components
${components.slice(0, 5).map(c => `- ${c.name} (${c.aesthetic_family})`).join('\n')}
`;
}

// Generate CSS variables
function generateCSSVariables(components: ReturnType<typeof getAllComponents>): string {
  // Get most common radius
  const radiusCounts: Record<string, number> = {};
  for (const c of components) {
    radiusCounts[c.tokens.radius.containers] = (radiusCounts[c.tokens.radius.containers] || 0) + 1;
  }
  const commonRadius = Object.entries(radiusCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '12px';

  return `:root {
  /* From your component library */
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-8: 48px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: ${commonRadius};
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.08);
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
  
  /* Colors - Light Mode */
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-muted: #a3a3a3;
  --color-border: #e5e5e5;
  --color-accent: #000000;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0a0a0a;
    --color-surface: #171717;
    --color-text: #fafafa;
    --color-text-secondary: #a3a3a3;
    --color-text-muted: #737373;
    --color-border: #262626;
    --color-accent: #ffffff;
  }
}
`;
}

// Generate Tailwind config
function generateTailwindConfig(components: ReturnType<typeof getAllComponents>): string {
  // Get most common radius
  const radiusCounts: Record<string, number> = {};
  for (const c of components) {
    radiusCounts[c.tokens.radius.containers] = (radiusCounts[c.tokens.radius.containers] || 0) + 1;
  }
  const commonRadius = Object.entries(radiusCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '12px';

  return `// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      // Border radius from your components
      borderRadius: {
        'card': '${commonRadius}',
        'button': '9999px', // pill buttons
      },
      
      // Shadows from your components
      boxShadow: {
        'card': '0 4px 16px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      
      // Spacing that matches your designs
      spacing: {
        '4.5': '18px',
        '18': '72px',
      },
      
      // Font sizes
      fontSize: {
        'heading': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'subheading': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
      },
      
      // Animation
      transitionDuration: {
        'fast': '150ms',
      },
    },
  },
  plugins: [],
}

export default config
`;
}

// Generate JSON export
function generateJSONExport(components: ReturnType<typeof getAllComponents>): string {
  const exportData = {
    meta: {
      exported_at: new Date().toISOString(),
      total_components: components.length,
    },
    components: components.map(c => ({
      id: c.id,
      name: c.name,
      aesthetic: c.aesthetic_family,
      types: c.component_types,
      tokens: c.tokens,
      atoms: c.atoms,
      usage: c.usage,
    })),
  };
  
  return JSON.stringify(exportData, null, 2);
}

function formatName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

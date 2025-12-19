"use client";

import { cssToStyleObject } from "@/lib/css-parser";
import type { DesignTokens } from "@/lib/components";

interface TypographyPreviewProps {
  css?: string;
  tokens?: DesignTokens;
  name?: string;
  showLabel?: boolean;
  className?: string;
}

export function TypographyPreview({ 
  css, 
  tokens,
  name,
  showLabel = true,
  className = ""
}: TypographyPreviewProps) {
  // Build typography style from CSS or tokens
  const baseStyle: React.CSSProperties = css 
    ? cssToStyleObject(css)
    : {};
  
  const headingStyle: React.CSSProperties = {
    ...baseStyle,
    fontWeight: baseStyle.fontWeight || tokens?.typography?.heading_weight || '600',
    fontSize: baseStyle.fontSize || tokens?.typography?.heading_size || '24px',
    lineHeight: tokens?.typography?.line_height || '1.2',
    color: baseStyle.color || 'var(--text-primary)',
    marginBottom: '12px',
  };
  
  const bodyStyle: React.CSSProperties = {
    fontWeight: tokens?.typography?.body_weight || '400',
    fontSize: tokens?.typography?.body_size || '16px',
    lineHeight: tokens?.typography?.line_height || '1.5',
    color: 'var(--text-secondary)',
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 style={headingStyle}>
        {name || "Typography Sample"}
      </h3>
      <p style={bodyStyle}>
        The quick brown fox jumps over the lazy dog. 
        This text demonstrates the body style.
      </p>
      {showLabel && name && (
        <span 
          className="text-xs block mt-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {name}
        </span>
      )}
    </div>
  );
}

// Type scale preview
interface TypeScalePreviewProps {
  tokens: DesignTokens;
  className?: string;
}

export function TypeScalePreview({ tokens, className = "" }: TypeScalePreviewProps) {
  const baseStyle = {
    fontWeight: tokens.typography.heading_weight,
    lineHeight: tokens.typography.line_height,
    color: 'var(--text-primary)',
  };
  
  const scales = [
    { label: 'Heading', size: tokens.typography.heading_size, weight: tokens.typography.heading_weight },
    { label: 'Subheading', size: '18px', weight: '600' },
    { label: 'Body', size: tokens.typography.body_size, weight: tokens.typography.body_weight },
    { label: 'Caption', size: '12px', weight: '400' },
  ];
  
  return (
    <div className={`space-y-4 ${className}`}>
      {scales.map((scale) => (
        <div key={scale.label} className="flex items-baseline gap-4">
          <span 
            className="w-24 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {scale.label}
          </span>
          <span 
            style={{ 
              ...baseStyle, 
              fontSize: scale.size, 
              fontWeight: scale.weight 
            }}
          >
            Aa Bb Cc
          </span>
          <span 
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {scale.size} / {scale.weight}
          </span>
        </div>
      ))}
    </div>
  );
}

// Font style indicator
interface FontStyleBadgeProps {
  fontStyle: string;
  className?: string;
}

export function FontStyleBadge({ fontStyle, className = "" }: FontStyleBadgeProps) {
  const fontMap: Record<string, { display: string; sample: string }> = {
    'geometric-sans': { display: 'Geometric Sans', sample: 'Futura, Avenir' },
    'humanist-sans': { display: 'Humanist Sans', sample: 'Gill Sans, Frutiger' },
    'neo-grotesque': { display: 'Neo-Grotesque', sample: 'Helvetica, Inter' },
    'serif': { display: 'Serif', sample: 'Georgia, Times' },
    'mono': { display: 'Monospace', sample: 'Menlo, Monaco' },
    'rounded-sans': { display: 'Rounded Sans', sample: 'Nunito, Varela' },
  };
  
  const font = fontMap[fontStyle] || { display: fontStyle, sample: '' };
  
  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${className}`}
      style={{ 
        background: 'var(--bg-inset)',
        color: 'var(--text-secondary)',
      }}
    >
      <span className="font-medium">{font.display}</span>
      {font.sample && (
        <span style={{ color: 'var(--text-muted)' }}>
          ({font.sample})
        </span>
      )}
    </div>
  );
}


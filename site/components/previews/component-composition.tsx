"use client";

import { cssToStyleObject, getContrastingTextColor } from "@/lib/css-parser";
import type { ExtractedComponent, ExtractedAtom } from "@/lib/components";

interface ComponentCompositionProps {
  component: ExtractedComponent;
  showLabels?: boolean;
  className?: string;
}

/**
 * Renders a live composition of a component using its extracted atoms and tokens
 * This is the magic - turning extraction data into actual UI
 */
export function ComponentComposition({ 
  component, 
  showLabels = false,
  className = "" 
}: ComponentCompositionProps) {
  const { tokens, atoms } = component;
  
  // Find specific atoms
  const surfaceAtom = atoms.find(a => a.type === 'surface');
  const cardAtom = atoms.find(a => a.type === 'card');
  const buttonAtom = atoms.find(a => a.type === 'button');
  const typographyAtom = atoms.find(a => a.type === 'typography');
  
  // Build styles
  const surfaceStyle: React.CSSProperties = surfaceAtom 
    ? cssToStyleObject(surfaceAtom.css)
    : { background: tokens.colors.background };
  
  const cardStyle: React.CSSProperties = cardAtom 
    ? cssToStyleObject(cardAtom.css)
    : {
        background: tokens.colors.surface,
        borderRadius: tokens.radius.containers,
        boxShadow: tokens.shadows.default,
        padding: tokens.spacing.container_padding,
      };
  
  const buttonStyle: React.CSSProperties = buttonAtom 
    ? cssToStyleObject(buttonAtom.css)
    : {
        background: tokens.colors.accent,
        color: getContrastingTextColor(tokens.colors.accent),
        borderRadius: tokens.radius.buttons,
        padding: '12px 24px',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
      };
  
  const headingStyle: React.CSSProperties = typographyAtom
    ? cssToStyleObject(typographyAtom.css)
    : {
        color: tokens.colors.text_primary,
        fontWeight: tokens.typography.heading_weight,
        fontSize: tokens.typography.heading_size,
        marginBottom: '8px',
      };
  
  const bodyStyle: React.CSSProperties = {
    color: tokens.colors.text_secondary,
    fontWeight: tokens.typography.body_weight,
    fontSize: tokens.typography.body_size,
    lineHeight: tokens.typography.line_height,
  };
  
  return (
    <div 
      className={`
        relative
        aspect-[4/3]
        rounded-xl
        overflow-hidden
        flex items-center justify-center
        p-8
        ${className}
      `}
      style={surfaceStyle}
    >
      {/* Live rendered card */}
      <div 
        className="w-full max-w-sm"
        style={cardStyle}
      >
        <h3 style={headingStyle}>
          {component.name}
        </h3>
        <p style={bodyStyle} className="mb-4">
          Live preview generated from extracted design tokens
        </p>
        
        {buttonAtom && (
          <button 
            style={buttonStyle}
            className="transition-opacity hover:opacity-90"
          >
            Action
          </button>
        )}
      </div>
      
      {/* Atom labels (optional) */}
      {showLabels && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          {atoms.slice(0, 4).map((atom, i) => (
            <span 
              key={i}
              className="text-xs px-2 py-1 rounded bg-black/20 text-white backdrop-blur-sm"
            >
              {atom.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Mini composition for grid views
 */
export function ComponentCompositionMini({ 
  component, 
  className = "" 
}: ComponentCompositionProps) {
  const { tokens, atoms } = component;
  
  const surfaceAtom = atoms.find(a => a.type === 'surface');
  const cardAtom = atoms.find(a => a.type === 'card');
  
  const surfaceStyle: React.CSSProperties = surfaceAtom 
    ? cssToStyleObject(surfaceAtom.css)
    : { background: tokens.colors.background };
  
  const cardStyle: React.CSSProperties = cardAtom 
    ? cssToStyleObject(cardAtom.css)
    : {
        background: tokens.colors.surface,
        borderRadius: tokens.radius.containers,
        boxShadow: tokens.shadows.default,
      };
  
  const textColor = getContrastingTextColor(
    (cardStyle.background as string) || tokens.colors.surface
  );
  const mutedColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  
  return (
    <div 
      className={`
        aspect-video
        rounded-lg
        overflow-hidden
        flex items-center justify-center
        p-4
        transition-transform duration-200
        hover:scale-[1.02]
        ${className}
      `}
      style={surfaceStyle}
    >
      {/* Simplified card preview */}
      <div 
        className="w-3/4 p-3 space-y-2"
        style={cardStyle}
      >
        <div 
          className="h-2 rounded w-1/2"
          style={{ background: mutedColor }}
        />
        <div 
          className="h-1.5 rounded w-full"
          style={{ background: mutedColor, opacity: 0.5 }}
        />
        <div 
          className="h-1.5 rounded w-3/4"
          style={{ background: mutedColor, opacity: 0.5 }}
        />
      </div>
    </div>
  );
}

/**
 * Atom breakdown view - shows each atom separately
 */
interface AtomBreakdownProps {
  atoms: ExtractedAtom[];
  tokens: ExtractedComponent['tokens'];
  className?: string;
}

export function AtomBreakdown({ atoms, tokens, className = "" }: AtomBreakdownProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {atoms.map((atom, i) => (
        <AtomPreview key={i} atom={atom} tokens={tokens} />
      ))}
    </div>
  );
}

/**
 * Single atom preview based on type
 */
function AtomPreview({ 
  atom, 
  tokens 
}: { 
  atom: ExtractedAtom; 
  tokens: ExtractedComponent['tokens'];
}) {
  const style = cssToStyleObject(atom.css);
  
  switch (atom.type) {
    case 'surface':
      return (
        <div className="flex items-center gap-4">
          <div 
            className="w-24 h-16 rounded-lg"
            style={style}
          />
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {atom.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Surface
            </div>
          </div>
        </div>
      );
    
    case 'button':
      return (
        <div className="flex items-center gap-4">
          <button 
            className="transition-opacity hover:opacity-90"
            style={{ ...style, cursor: 'pointer' }}
          >
            Button
          </button>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {atom.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Button
            </div>
          </div>
        </div>
      );
    
    case 'card':
      const cardBg = style.background || style.backgroundColor || tokens.colors.surface;
      const cardTextColor = getContrastingTextColor(cardBg as string);
      return (
        <div className="flex items-center gap-4">
          <div 
            className="w-32 h-20 rounded-lg p-3"
            style={style}
          >
            <div 
              className="h-2 rounded w-1/2 mb-2"
              style={{ background: cardTextColor, opacity: 0.3 }}
            />
            <div 
              className="h-1.5 rounded w-full"
              style={{ background: cardTextColor, opacity: 0.2 }}
            />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {atom.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Card
            </div>
          </div>
        </div>
      );
    
    case 'typography':
      return (
        <div className="flex items-center gap-4">
          <div className="w-32">
            <span style={style}>Aa Bb Cc</span>
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {atom.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Typography
            </div>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-lg"
            style={{ background: 'var(--bg-inset)' }}
          />
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {atom.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {atom.type}
            </div>
          </div>
        </div>
      );
  }
}


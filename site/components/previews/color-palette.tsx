"use client";

import { getContrastingTextColor } from "@/lib/css-parser";
import type { DesignTokens } from "@/lib/components";

interface ColorSwatchProps {
  color: string;
  label: string;
  showHex?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ColorSwatch({ 
  color, 
  label, 
  showHex = true,
  size = "md",
  className = ""
}: ColorSwatchProps) {
  const isGradient = color.includes('gradient');
  const textColor = getContrastingTextColor(color);
  
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };
  
  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-lg 
          flex items-center justify-center
          border border-black/5
          transition-transform duration-200
          hover:scale-105
        `}
        style={{ background: color }}
        title={color}
      >
        {isGradient && (
          <span 
            className="text-xs opacity-70"
            style={{ color: textColor }}
          >
            ∇
          </span>
        )}
      </div>
      <div className="text-center">
        <span 
          className="text-xs font-medium block"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
        {showHex && !isGradient && (
          <span 
            className="text-xs font-mono block"
            style={{ color: 'var(--text-muted)' }}
          >
            {color}
          </span>
        )}
      </div>
    </div>
  );
}

// Full color palette from tokens
interface ColorPaletteProps {
  tokens: DesignTokens;
  className?: string;
}

export function ColorPalette({ tokens, className = "" }: ColorPaletteProps) {
  const colors = [
    { key: 'background', label: 'Background', color: tokens.colors.background },
    { key: 'surface', label: 'Surface', color: tokens.colors.surface },
    { key: 'text_primary', label: 'Text', color: tokens.colors.text_primary },
    { key: 'text_secondary', label: 'Secondary', color: tokens.colors.text_secondary },
    { key: 'accent', label: 'Accent', color: tokens.colors.accent },
  ];
  
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {colors.map(({ key, label, color }) => (
        <ColorSwatch 
          key={key}
          color={color}
          label={label}
          size="md"
        />
      ))}
    </div>
  );
}

// Compact color strip
interface ColorStripProps {
  tokens: DesignTokens;
  className?: string;
}

export function ColorStrip({ tokens, className = "" }: ColorStripProps) {
  const colors = [
    tokens.colors.background,
    tokens.colors.surface,
    tokens.colors.text_primary,
    tokens.colors.accent,
  ];
  
  return (
    <div className={`flex h-4 rounded overflow-hidden ${className}`}>
      {colors.map((color, i) => (
        <div 
          key={i}
          className="flex-1"
          style={{ background: color }}
          title={color}
        />
      ))}
    </div>
  );
}

// Background preview with content overlay
interface BackgroundPreviewProps {
  background: string;
  surface?: string;
  textPrimary?: string;
  textSecondary?: string;
  className?: string;
}

export function BackgroundPreview({ 
  background, 
  surface = '#ffffff',
  textPrimary = '#000000',
  textSecondary = '#666666',
  className = ""
}: BackgroundPreviewProps) {
  return (
    <div 
      className={`
        aspect-[4/3] rounded-xl p-6
        flex items-center justify-center
        ${className}
      `}
      style={{ background }}
    >
      <div 
        className="rounded-lg p-4 w-full max-w-xs"
        style={{ 
          background: surface,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <div 
          className="text-sm font-semibold mb-1"
          style={{ color: textPrimary }}
        >
          Sample Card
        </div>
        <div 
          className="text-xs"
          style={{ color: textSecondary }}
        >
          Preview of the color scheme
        </div>
      </div>
    </div>
  );
}

// Full theme preview
interface ThemePreviewProps {
  tokens: DesignTokens;
  className?: string;
}

export function ThemePreview({ tokens, className = "" }: ThemePreviewProps) {
  return (
    <BackgroundPreview
      background={tokens.colors.background}
      surface={tokens.colors.surface}
      textPrimary={tokens.colors.text_primary}
      textSecondary={tokens.colors.text_secondary}
      className={className}
    />
  );
}


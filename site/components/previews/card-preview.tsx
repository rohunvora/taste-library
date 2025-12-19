"use client";

import { cssToStyleObject, getContrastingTextColor } from "@/lib/css-parser";
import type { DesignTokens } from "@/lib/components";

interface CardPreviewProps {
  css?: string;
  tokens?: DesignTokens;
  name?: string;
  showLabel?: boolean;
  showContent?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CardPreview({ 
  css, 
  tokens,
  name,
  showLabel = true,
  showContent = true,
  size = "md",
  className = ""
}: CardPreviewProps) {
  // Build card style from CSS or tokens
  const cardStyle: React.CSSProperties = css 
    ? cssToStyleObject(css)
    : {
        background: tokens?.colors?.surface || '#ffffff',
        borderRadius: tokens?.radius?.containers || '12px',
        boxShadow: tokens?.shadows?.default || '0 4px 16px rgba(0,0,0,0.04)',
        padding: tokens?.spacing?.container_padding || '24px',
      };
  
  // Get text colors
  const bgColor = cardStyle.background as string || cardStyle.backgroundColor as string || '#ffffff';
  const textColor = getContrastingTextColor(bgColor);
  const mutedColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  
  const sizeClasses = {
    sm: "w-48",
    md: "w-64",
    lg: "w-80",
  };
  
  return (
    <div 
      className={`
        ${sizeClasses[size]}
        transition-all duration-200
        hover:scale-[1.01]
        ${className}
      `}
      style={cardStyle}
    >
      {showContent && (
        <div className="space-y-3">
          {/* Simulated card content */}
          <div 
            className="h-3 rounded"
            style={{ 
              background: mutedColor,
              width: '60%',
            }}
          />
          <div 
            className="h-2 rounded"
            style={{ 
              background: mutedColor,
              opacity: 0.5,
              width: '90%',
            }}
          />
          <div 
            className="h-2 rounded"
            style={{ 
              background: mutedColor,
              opacity: 0.5,
              width: '75%',
            }}
          />
        </div>
      )}
      
      {showLabel && name && (
        <div 
          className="mt-4 pt-3"
          style={{ borderTop: `1px solid ${mutedColor}` }}
        >
          <span 
            className="text-xs font-medium"
            style={{ color: mutedColor }}
          >
            {name}
          </span>
        </div>
      )}
    </div>
  );
}

// Card with actual content
interface CardWithContentProps {
  css?: string;
  tokens?: DesignTokens;
  title?: string;
  description?: string;
  className?: string;
}

export function CardWithContent({ 
  css, 
  tokens,
  title = "Card Title",
  description = "This is a preview of the card component with real content.",
  className = ""
}: CardWithContentProps) {
  const cardStyle: React.CSSProperties = css 
    ? cssToStyleObject(css)
    : {
        background: tokens?.colors?.surface || '#ffffff',
        borderRadius: tokens?.radius?.containers || '12px',
        boxShadow: tokens?.shadows?.default || '0 4px 16px rgba(0,0,0,0.04)',
        padding: tokens?.spacing?.container_padding || '24px',
      };
  
  const bgColor = cardStyle.background as string || cardStyle.backgroundColor as string || '#ffffff';
  const textColor = getContrastingTextColor(bgColor);
  const mutedColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  
  // Typography from tokens
  const headingStyle: React.CSSProperties = {
    color: textColor,
    fontWeight: tokens?.typography?.heading_weight || '600',
    fontSize: '18px',
    marginBottom: '8px',
  };
  
  const bodyStyle: React.CSSProperties = {
    color: mutedColor,
    fontWeight: tokens?.typography?.body_weight || '400',
    fontSize: tokens?.typography?.body_size || '14px',
    lineHeight: tokens?.typography?.line_height || '1.5',
  };
  
  return (
    <div 
      className={`max-w-sm transition-all duration-200 hover:scale-[1.01] ${className}`}
      style={cardStyle}
    >
      <h3 style={headingStyle}>{title}</h3>
      <p style={bodyStyle}>{description}</p>
    </div>
  );
}

// Grid of cards
interface CardGridProps {
  cards: Array<{
    css: string;
    name: string;
    componentId: string;
  }>;
  onSelect?: (card: { css: string; name: string; componentId: string }) => void;
}

export function CardGrid({ cards, onSelect }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <button
          key={i}
          onClick={() => onSelect?.(card)}
          className="text-left group"
        >
          <CardPreview 
            css={card.css} 
            name={card.name}
            size="lg"
            className="w-full"
          />
        </button>
      ))}
    </div>
  );
}


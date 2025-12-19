"use client";

import { cssToStyleObject, getContrastingTextColor } from "@/lib/css-parser";
import type { DesignTokens } from "@/lib/components";

interface SurfacePreviewProps {
  css?: string;
  tokens?: DesignTokens;
  name?: string;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SurfacePreview({ 
  css, 
  tokens, 
  name,
  showLabel = true,
  className = "",
  size = "md"
}: SurfacePreviewProps) {
  // Build the surface style from CSS string or tokens
  const surfaceStyle: React.CSSProperties = css 
    ? cssToStyleObject(css)
    : {
        background: tokens?.colors?.background || '#f5f5f5',
      };
  
  // Determine text color for contrast
  const bgColor = surfaceStyle.background as string || tokens?.colors?.background || '#f5f5f5';
  const textColor = getContrastingTextColor(bgColor);
  
  const sizeClasses = {
    sm: "h-20 w-32",
    md: "h-32 w-48",
    lg: "h-48 w-full max-w-md",
  };
  
  return (
    <div 
      className={`
        ${sizeClasses[size]}
        rounded-xl
        flex items-end justify-start
        p-3
        transition-transform duration-200
        hover:scale-[1.02]
        ${className}
      `}
      style={surfaceStyle}
    >
      {showLabel && name && (
        <span 
          className="text-xs font-medium opacity-80"
          style={{ color: textColor }}
        >
          {name}
        </span>
      )}
    </div>
  );
}

// Grid of multiple surfaces
interface SurfaceGridProps {
  surfaces: Array<{
    css: string;
    name: string;
    componentId: string;
  }>;
  onSelect?: (surface: { css: string; name: string; componentId: string }) => void;
}

export function SurfaceGrid({ surfaces, onSelect }: SurfaceGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {surfaces.map((surface, i) => (
        <button
          key={i}
          onClick={() => onSelect?.(surface)}
          className="group relative"
        >
          <SurfacePreview 
            css={surface.css} 
            name={surface.name}
            size="md"
          />
          <div 
            className="
              absolute inset-0 rounded-xl
              bg-black/0 group-hover:bg-black/10
              transition-colors duration-200
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
            "
          >
            <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
              View
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}


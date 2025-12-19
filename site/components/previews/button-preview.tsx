"use client";

import { useState } from "react";
import { cssToStyleObject } from "@/lib/css-parser";

interface ButtonPreviewProps {
  css: string;
  name?: string;
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ButtonPreview({ 
  css, 
  name,
  label = "Button",
  showLabel = true,
  size = "md",
  className = ""
}: ButtonPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const baseStyle = cssToStyleObject(css);
  
  // Add interactive states
  const style: React.CSSProperties = {
    ...baseStyle,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    transform: isPressed ? 'scale(0.97)' : isHovered ? 'scale(1.02)' : 'scale(1)',
    opacity: isHovered ? 0.9 : 1,
    border: baseStyle.border || 'none',
  };
  
  const sizeStyles = {
    sm: { fontSize: '12px', padding: baseStyle.padding || '6px 12px' },
    md: { fontSize: '14px', padding: baseStyle.padding || '10px 20px' },
    lg: { fontSize: '16px', padding: baseStyle.padding || '14px 28px' },
  };
  
  return (
    <div className={`inline-flex flex-col items-start gap-2 ${className}`}>
      <button
        style={{ ...style, ...sizeStyles[size] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className="whitespace-nowrap"
      >
        {label}
      </button>
      {showLabel && name && (
        <span 
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {name}
        </span>
      )}
    </div>
  );
}

// Row of buttons showing variations
interface ButtonRowProps {
  buttons: Array<{
    css: string;
    name: string;
    componentId: string;
  }>;
  onSelect?: (button: { css: string; name: string; componentId: string }) => void;
}

export function ButtonRow({ buttons, onSelect }: ButtonRowProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      {buttons.map((button, i) => (
        <div 
          key={i} 
          className="group cursor-pointer"
          onClick={() => onSelect?.(button)}
        >
          <ButtonPreview 
            css={button.css} 
            name={button.name}
            label="Action"
            size="md"
          />
        </div>
      ))}
    </div>
  );
}

// Multiple button sizes preview
interface ButtonSizesPreviewProps {
  css: string;
  name?: string;
}

export function ButtonSizesPreview({ css, name }: ButtonSizesPreviewProps) {
  return (
    <div className="flex items-end gap-3">
      <ButtonPreview css={css} label="Small" size="sm" showLabel={false} />
      <ButtonPreview css={css} label="Medium" size="md" showLabel={false} />
      <ButtonPreview css={css} label="Large" size="lg" showLabel={false} />
      {name && (
        <span 
          className="text-xs ml-2"
          style={{ color: 'var(--text-muted)' }}
        >
          {name}
        </span>
      )}
    </div>
  );
}


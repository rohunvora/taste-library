/**
 * Shared Card Component
 * 
 * Base card wrapper with consistent styling.
 * Extend with specific card types like ReferenceCard and BlockCard.
 */

'use client';

import { theme } from '../lib/theme';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  onDoubleClick?: () => void;
  /** Whether the card is currently selected */
  selected?: boolean;
  /** Whether this is the primary selected item */
  primary?: boolean;
  /** Whether the card should have hover effects */
  interactive?: boolean;
  style?: React.CSSProperties;
}

export function Card({ 
  children, 
  onClick, 
  onDoubleClick,
  selected = false, 
  primary = false,
  interactive = false,
  style,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.radius.md,
        overflow: 'hidden',
        cursor: interactive || onClick ? 'pointer' : 'default',
        boxShadow: selected ? theme.shadow.lifted : theme.shadow.subtle,
        border: primary 
          ? `2px solid ${theme.colors.accent}` 
          : selected 
            ? `2px solid ${theme.colors.success}` 
            : '2px solid transparent',
        transition: `all ${theme.transition.base}`,
        opacity: interactive && !selected ? 0.7 : 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}


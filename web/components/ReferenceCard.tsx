/**
 * Reference Card Component
 * 
 * Displays a matched reference from the Are.na library.
 * Used by the Reference Matcher to show search results.
 */

'use client';

import { theme } from '../lib/theme';
import { Card } from './Card';

interface ReferenceCardProps {
  imageUrl: string | null;
  title: string | null;
  arenaUrl: string;
  relevanceNote: string;
  selected?: boolean;
  primary?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export function ReferenceCard({
  imageUrl,
  title,
  arenaUrl,
  relevanceNote,
  selected = false,
  primary = false,
  onClick,
  onDoubleClick,
}: ReferenceCardProps) {
  return (
    <Card
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      selected={selected}
      primary={primary}
      interactive
    >
      {/* Large Image */}
      {imageUrl && (
        <div style={{
          aspectRatio: '16/10',
          overflow: 'hidden',
          backgroundColor: '#F5F5F5',
          position: 'relative',
        }}>
          <img
            src={imageUrl}
            alt={title || 'Reference'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Selection indicator */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: selected ? theme.colors.success : 'rgba(255,255,255,0.9)',
              border: selected ? 'none' : `2px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#fff',
              fontWeight: '600',
            }}>
              {selected && '✓'}
            </div>
            {primary && (
              <span style={{
                backgroundColor: theme.colors.accent,
                color: '#fff',
                padding: '4px 10px',
                borderRadius: theme.radius.full,
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Primary
              </span>
            )}
          </div>

          {/* Open in Are.na */}
          <a
            href={arenaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: theme.radius.sm,
              fontSize: '11px',
              textDecoration: 'none',
              opacity: 0.8,
              transition: `opacity ${theme.transition.base}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}
          >
            Are.na ↗
          </a>
        </div>
      )}

      {/* Human-readable explanation */}
      <div style={{ padding: theme.spacing.md }}>
        <p style={{
          fontSize: '14px',
          fontWeight: theme.typography.weight.normal,
          margin: 0,
          lineHeight: 1.5,
          color: theme.colors.textPrimary,
        }}>
          {relevanceNote}
        </p>
      </div>
    </Card>
  );
}


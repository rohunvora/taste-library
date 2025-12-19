/**
 * Shared Header Component
 * 
 * Navigation bar used across all pages.
 * Provides consistent branding and navigation links.
 */

'use client';

import { theme } from '../lib/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Navigation items to show on the right */
  navItems?: Array<{
    label: string;
    href: string;
    icon?: string;
  }>;
  /** Extra content to show on the right side */
  rightContent?: React.ReactNode;
}

export function Header({ title, subtitle, navItems, rightContent }: HeaderProps) {
  return (
    <header style={{
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.bgSecondary,
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        {/* Left side - Title */}
        <div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: theme.typography.weight.semibold,
            margin: 0,
            color: theme.colors.textPrimary,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              margin: '4px 0 0 0',
            }}>
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Right side - Navigation */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {navItems?.map((item) => (
            <a 
              key={item.href}
              href={item.href}
              style={{
                backgroundColor: theme.colors.bgPrimary,
                color: theme.colors.textSecondary,
                fontSize: '13px',
                fontWeight: theme.typography.weight.medium,
                padding: '8px 14px',
                borderRadius: theme.radius.sm,
                textDecoration: 'none',
                border: `1px solid ${theme.colors.border}`,
                transition: `all ${theme.transition.base}`,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </a>
          ))}
          {rightContent}
        </div>
      </div>
    </header>
  );
}


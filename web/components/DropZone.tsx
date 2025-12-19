/**
 * Shared DropZone Component
 * 
 * File upload area with drag-and-drop support.
 * Used by the Reference Matcher for image uploads.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { theme } from '../lib/theme';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** Show compact version when files already uploaded */
  compact?: boolean;
  /** Custom placeholder content */
  placeholder?: React.ReactNode;
  disabled?: boolean;
}

export function DropZone({ 
  onFiles, 
  accept = 'image/*', 
  multiple = true,
  compact = false,
  placeholder,
  disabled = false,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const filtered = accept === '*' 
      ? fileArray 
      : fileArray.filter(f => {
          const [type] = accept.split('/');
          return f.type.startsWith(type);
        });
    
    if (filtered.length > 0) {
      onFiles(multiple ? filtered : [filtered[0]]);
    }
  }, [onFiles, accept, multiple]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        border: `2px dashed ${isDragging ? theme.colors.accent : theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: compact ? theme.spacing.md : theme.spacing.xl,
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: isDragging ? 'rgba(0,0,0,0.02)' : 'transparent',
        transition: `all ${theme.transition.base}`,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      {placeholder ? placeholder : compact ? (
        <p style={{
          fontSize: '14px',
          color: theme.colors.textSecondary,
          margin: 0,
        }}>
          + Drop more files or click to add
        </p>
      ) : (
        <>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            backgroundColor: theme.colors.border,
            borderRadius: theme.radius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>
            📸
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: theme.typography.weight.semibold,
            margin: '0 0 8px 0',
            color: theme.colors.textPrimary,
          }}>
            Drop your files here
          </p>
          <p style={{
            fontSize: '14px',
            color: theme.colors.textMuted,
            margin: 0,
          }}>
            or click to browse{multiple && ' · supports multiple files'}
          </p>
        </>
      )}
    </div>
  );
}


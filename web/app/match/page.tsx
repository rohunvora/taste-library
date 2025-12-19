/**
 * Reference Matcher UI
 * 
 * Drop a WIP screenshot → get relevant references from your indexed Are.na library.
 * 
 * User flow:
 * 1. Drop/upload screenshot(s)
 * 2. See matched references with human-readable explanations
 * 3. Click to toggle selection, double-click to set as primary
 * 4. Download selected images + copy minimal prompt for Claude
 * 
 * The output is designed for Claude: actual images + minimal context.
 * Claude interprets the images directly rather than through extracted specs.
 */

'use client';

import { useState, useCallback, useRef, useMemo } from 'react';

// ============================================================================
// STYLE TOKENS (derived from taste-profiles/ui-ux-*/style-guide.json)
// 
// Source: 21 images analyzed, high confidence
// Context: developer-tools/saas (Reference Matcher is a dev tool)
// 
// Key findings from extraction:
// - radius_px: 11 (rounded) → using 12px for cleaner numbers
// - density: balanced → medium padding
// - shadow_presence: subtle for saas/developer-tools context
// - typography.family_vibe: neo-grotesque → system-ui (SF Pro on Mac)
// - motion: 200ms ease-out, hover_effect: lift
// - colors.background_primary: #F2F0EC (developer-tools context)
// - colors.accent_primary: #000000 (minimal, using for buttons)
// ============================================================================

const STYLES = {
  colors: {
    bgPrimary: '#F2F0EC',      // Warm off-white (developer-tools context)
    bgSecondary: '#FFFFFF',    // Card backgrounds
    textPrimary: '#000000',    
    textSecondary: '#434343',  // developer-tools secondary
    textMuted: '#A3A3A3',      
    accent: '#000000',         // Minimal accent from common extraction
    accentHover: '#333333',
    border: 'rgba(0,0,0,0.08)',
    success: '#4CAF50',        // From saas context
  },
  radius: {
    sm: '8px',    // slightly-rounded for dev-tools
    md: '12px',   // rounded (common)
    lg: '16px',
    full: '9999px',
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '20px',    // medium padding
    lg: '32px',
    xl: '48px',
  },
  shadow: {
    subtle: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    lifted: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
  },
  motion: {
    duration: '200ms',
    easing: 'ease-out',
  },
  typography: {
    // neo-grotesque → system fonts (SF Pro on Mac, Segoe on Windows)
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headingWeight: '600',
    bodyWeight: '400',
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface MatchedBlock {
  block: {
    id: number;
    title: string | null;
    arena_url: string;
    image_url: string | null;
    tags: {
      component?: string[];
      style?: string[];
      context?: string[];
      vibe?: string[];
    };
    one_liner: string;
  };
  score: number;
  matchedTags: {
    component: string[];
    style: string[];
    context: string[];
    vibe: string[];
  };
  relevanceNote: string;
}

interface MatchResponse {
  extractedTags: {
    component?: string[];
    style?: string[];
    context?: string[];
    vibe?: string[];
  };
  oneLiner: string;
  matches: MatchedBlock[];
  totalIndexed: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: MatchResponse;
  error?: string;
}

export default function MatchPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Selection state for references
  const [selectedRefs, setSelectedRefs] = useState<Set<number>>(new Set());
  const [primaryRef, setPrimaryRef] = useState<number | null>(null);

  const isLoading = images.some(img => img.status === 'processing');
  const hasResults = images.some(img => img.status === 'done');
  const error = images.find(img => img.status === 'error')?.error || null;

  const processImage = useCallback(async (image: UploadedImage) => {
    setImages(prev => prev.map(img => 
      img.id === image.id ? { ...img, status: 'processing' as const } : img
    ));

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image.previewUrl }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to match');
      }

      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'done' as const, result: data } : img
      ));
    } catch (err: any) {
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'error' as const, error: err.message } : img
      ));
    }
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      return;
    }

    // Create preview URLs and add to state
    // FIX: Resize large images to avoid stack overflow when JSON.stringify-ing large base64 strings
    const newImages: UploadedImage[] = await Promise.all(
      imageFiles.map(async (file) => {
        const previewUrl = await new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            // Resize if too large (max 1200px on longest side)
            const MAX_SIZE = 1200;
            let { width, height } = img;
            
            if (width > MAX_SIZE || height > MAX_SIZE) {
              if (width > height) {
                height = Math.round((height * MAX_SIZE) / width);
                width = MAX_SIZE;
              } else {
                width = Math.round((width * MAX_SIZE) / height);
                height = MAX_SIZE;
              }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Use JPEG for smaller size (quality 0.8)
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = () => {
            // Fallback to original if image loading fails
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          };
          // Load image from file
          img.src = URL.createObjectURL(file);
        });
        
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl,
          status: 'pending' as const,
        };
      })
    );

    setImages(prev => [...prev, ...newImages]);

    // Process all new images in parallel
    newImages.forEach(img => processImage(img));
  }, [processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // Aggregate all results for combined view
  const aggregatedResult = useMemo(() => {
    const completedImages = images.filter(img => img.status === 'done' && img.result);
    if (completedImages.length === 0) return null;

    // Get the one-liner describing what user is building
    const queryOneLiner = completedImages[0]?.result?.oneLiner || 'UI design';

    // Combine all matches, dedupe by block id, re-sort by score
    const matchMap = new Map<number, MatchedBlock>();
    completedImages.forEach(img => {
      img.result?.matches.forEach(match => {
        const existing = matchMap.get(match.block.id);
        if (!existing || match.score > existing.score) {
          matchMap.set(match.block.id, match);
        }
      });
    });

    const combinedMatches = Array.from(matchMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return {
      queryOneLiner,
      matches: combinedMatches,
      imageCount: completedImages.length,
    };
  }, [images]);

  // Auto-select top 4 refs when results change
  const prevMatchIds = useRef<string>('');
  useMemo(() => {
    if (!aggregatedResult) return;
    const currentIds = aggregatedResult.matches.map(m => m.block.id).join(',');
    if (currentIds !== prevMatchIds.current) {
      prevMatchIds.current = currentIds;
      // Auto-select top 4
      const top4Ids = aggregatedResult.matches.slice(0, 4).map(m => m.block.id);
      setSelectedRefs(new Set(top4Ids));
      // Set first as primary
      if (top4Ids.length > 0) {
        setPrimaryRef(top4Ids[0]);
      }
    }
  }, [aggregatedResult]);

  // Generate minimal prompt for Claude
  const generatePrompt = useCallback(() => {
    if (!aggregatedResult) return '';

    // Get selected matches in order
    const selectedMatches = aggregatedResult.matches
      .filter(m => selectedRefs.has(m.block.id))
      .map((match, i) => ({
        ...match,
        refNum: i + 1,
        isPrimary: match.block.id === primaryRef,
      }));

    if (selectedMatches.length === 0) return '';

    let prompt = `I'm building ${aggregatedResult.queryOneLiner}. Here are references from my collection:\n\n`;

    selectedMatches.forEach((match) => {
      const primaryTag = match.isPrimary ? ' (PRIMARY)' : '';
      prompt += `${match.refNum}. [attach ref-${match.refNum}.jpg] - ${match.relevanceNote}${primaryTag}\n`;
    });

    prompt += `\nMatch the aesthetic of #1${primaryRef ? '' : ' primarily'}. `;
    if (selectedMatches.length > 1) {
      prompt += `Use the others as supporting context.`;
    }

    return prompt;
  }, [aggregatedResult, selectedRefs, primaryRef]);

  // Copy minimal prompt to clipboard
  const handleCopyPrompt = useCallback(async () => {
    const prompt = generatePrompt();
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatePrompt]);

  // Download selected images
  const downloadImages = useCallback(async () => {
    if (!aggregatedResult || isExporting) return;

    const selectedMatches = aggregatedResult.matches.filter(m => selectedRefs.has(m.block.id));
    if (selectedMatches.length === 0) return;

    setIsExporting(true);
    try {
      const response = await fetch('/api/export-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: selectedMatches,
          queryOneLiner: aggregatedResult.queryOneLiner,
          primaryId: primaryRef,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to download images');
      }

      // Download the ZIP
      const binaryString = atob(data.zip);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/zip' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `refs-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert('Failed to download: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  }, [aggregatedResult, selectedRefs, primaryRef, isExporting]);

  // Toggle selection
  const toggleSelection = useCallback((id: number) => {
    setSelectedRefs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // If we unselected the primary, clear it
        if (primaryRef === id) {
          setPrimaryRef(null);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  }, [primaryRef]);

  // Set as primary
  const setAsPrimary = useCallback((id: number) => {
    // Ensure it's selected
    setSelectedRefs(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPrimaryRef(id);
  }, []);

  const reset = useCallback(() => {
    setImages([]);
    setSelectedRefs(new Set());
    setPrimaryRef(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: STYLES.colors.bgPrimary,
      fontFamily: STYLES.typography.family,
      color: STYLES.colors.textPrimary,
    }}>
      {/* Header */}
      <header style={{
        padding: `${STYLES.spacing.md} ${STYLES.spacing.lg}`,
        borderBottom: `1px solid ${STYLES.colors.border}`,
        backgroundColor: STYLES.colors.bgSecondary,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: STYLES.typography.headingWeight,
              margin: 0,
            }}>
              Reference Matcher
            </h1>
            <p style={{
              fontSize: '14px',
              color: STYLES.colors.textSecondary,
              margin: '4px 0 0 0',
            }}>
              Drop a screenshot of your WIP → get relevant references from your Are.na
            </p>
          </div>
          <a 
            href="/" 
            style={{
              backgroundColor: STYLES.colors.bgPrimary,
              color: STYLES.colors.textSecondary,
              fontSize: '13px',
              fontWeight: '500',
              padding: '8px 14px',
              borderRadius: STYLES.radius.sm,
              textDecoration: 'none',
              border: `1px solid ${STYLES.colors.border}`,
              transition: `all ${STYLES.motion.duration} ${STYLES.motion.easing}`,
            }}
          >
            ← Classifier
          </a>
        </div>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: STYLES.spacing.lg,
      }}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Drop Zone - always visible for adding more images */}
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `2px dashed ${isDragging ? STYLES.colors.accent : STYLES.colors.border}`,
            borderRadius: STYLES.radius.md,
            padding: images.length > 0 ? STYLES.spacing.md : STYLES.spacing.xl,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragging ? 'rgba(0,0,0,0.02)' : 'transparent',
            transition: `all ${STYLES.motion.duration} ${STYLES.motion.easing}`,
            marginBottom: images.length > 0 ? STYLES.spacing.lg : 0,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          {images.length === 0 ? (
            <>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                backgroundColor: STYLES.colors.border,
                borderRadius: STYLES.radius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}>
                📸
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: STYLES.typography.headingWeight,
                margin: '0 0 8px 0',
              }}>
                Drop your screenshots here
              </p>
              <p style={{
                fontSize: '14px',
                color: STYLES.colors.textMuted,
                margin: 0,
              }}>
                or click to browse · supports multiple images
              </p>
            </>
          ) : (
            <p style={{
              fontSize: '14px',
              color: STYLES.colors.textSecondary,
              margin: 0,
            }}>
              + Drop more screenshots or click to add
            </p>
          )}
        </div>

        {/* Uploaded Images Grid */}
        {images.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: STYLES.spacing.sm,
            marginBottom: STYLES.spacing.lg,
          }}>
            {images.map((img) => (
              <div
                key={img.id}
                style={{
                  position: 'relative',
                  aspectRatio: '4/3',
                  borderRadius: STYLES.radius.sm,
                  overflow: 'hidden',
                  backgroundColor: '#F5F5F5',
                  border: `1px solid ${STYLES.colors.border}`,
                }}
              >
                <img
                  src={img.previewUrl}
                  alt="Screenshot"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: img.status === 'processing' ? 0.5 : 1,
                    transition: `opacity ${STYLES.motion.duration} ${STYLES.motion.easing}`,
                  }}
                />
                
                {/* Status indicator */}
                {img.status === 'processing' && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: `2px solid ${STYLES.colors.border}`,
                      borderTopColor: STYLES.colors.accent,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                  </div>
                )}
                
                {img.status === 'done' && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: STYLES.colors.success,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#fff',
                  }}>
                    ✓
                  </div>
                )}
                
                {img.status === 'error' && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#DC2626',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#fff',
                  }}>
                    !
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    borderRadius: '50%',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.7,
                    transition: `opacity ${STYLES.motion.duration} ${STYLES.motion.easing}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: STYLES.spacing.md,
            borderRadius: STYLES.radius.sm,
            marginBottom: STYLES.spacing.md,
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {aggregatedResult && (
          <div>
            {/* Actions Bar - simplified */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: STYLES.spacing.md,
                flexWrap: 'wrap',
              gap: STYLES.spacing.sm,
              }}>
              <div>
                <h3 style={{
                    fontSize: '14px',
                    fontWeight: STYLES.typography.headingWeight,
                    color: STYLES.colors.textSecondary,
                  margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                  {aggregatedResult.matches.length} References Found
                  {isLoading && <span style={{ fontWeight: '400', marginLeft: '8px' }}>(analyzing...)</span>}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: STYLES.colors.textMuted,
                  margin: '4px 0 0 0',
                }}>
                  {selectedRefs.size} selected · Click card to toggle · Double-click for primary
                </p>
                </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                  onClick={downloadImages}
                  disabled={isLoading || isExporting || selectedRefs.size === 0}
                    style={{
                    backgroundColor: (isLoading || isExporting || selectedRefs.size === 0) 
                      ? STYLES.colors.textMuted 
                      : STYLES.colors.accent,
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: STYLES.radius.sm,
                      fontSize: '14px',
                      fontWeight: STYLES.typography.headingWeight,
                    cursor: (isLoading || isExporting || selectedRefs.size === 0) ? 'not-allowed' : 'pointer',
                      transition: `all ${STYLES.motion.duration} ${STYLES.motion.easing}`,
                  }}
                >
                  {isExporting ? 'Downloading...' : `Download ${selectedRefs.size} Images`}
                  </button>
                  <button
                  onClick={handleCopyPrompt}
                  disabled={isLoading || selectedRefs.size === 0}
                    style={{
                      backgroundColor: 'transparent',
                      color: STYLES.colors.textPrimary,
                      border: `1px solid ${STYLES.colors.border}`,
                      padding: '10px 20px',
                      borderRadius: STYLES.radius.sm,
                      fontSize: '14px',
                      fontWeight: STYLES.typography.headingWeight,
                    cursor: (isLoading || selectedRefs.size === 0) ? 'not-allowed' : 'pointer',
                      transition: `all ${STYLES.motion.duration} ${STYLES.motion.easing}`,
                    }}
                  >
                  {copied ? '✓ Copied!' : 'Copy Prompt'}
                  </button>
                  <button
                    onClick={reset}
                    style={{
                      backgroundColor: 'transparent',
                      color: STYLES.colors.textSecondary,
                      border: `1px solid ${STYLES.colors.border}`,
                      padding: '10px 20px',
                      borderRadius: STYLES.radius.sm,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: `all ${STYLES.motion.duration} ${STYLES.motion.easing}`,
                    }}
                  >
                  Clear
                  </button>
              </div>
            </div>

            {/* Reference Grid - larger images, simpler cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: STYLES.spacing.md,
            }}>
              {aggregatedResult.matches.map((match) => {
                const isSelected = selectedRefs.has(match.block.id);
                const isPrimary = primaryRef === match.block.id;
                
                return (
                  <div
                  key={match.block.id}
                    onClick={() => toggleSelection(match.block.id)}
                    onDoubleClick={() => setAsPrimary(match.block.id)}
                  style={{
                    backgroundColor: STYLES.colors.bgSecondary,
                    borderRadius: STYLES.radius.md,
                    overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: isSelected ? STYLES.shadow.lifted : STYLES.shadow.subtle,
                      border: isPrimary 
                        ? `2px solid ${STYLES.colors.accent}` 
                        : isSelected 
                          ? `2px solid ${STYLES.colors.success}` 
                          : '2px solid transparent',
                    transition: `all ${STYLES.motion.duration} ${STYLES.motion.easing}`,
                      opacity: isSelected ? 1 : 0.7,
                  }}
                >
                    {/* Large Image */}
                  {match.block.image_url && (
                    <div style={{
                      aspectRatio: '16/10',
                      overflow: 'hidden',
                      backgroundColor: '#F5F5F5',
                        position: 'relative',
                    }}>
                      <img
                        src={match.block.image_url}
                        alt={match.block.title || 'Reference'}
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
                            backgroundColor: isSelected ? STYLES.colors.success : 'rgba(255,255,255,0.9)',
                            border: isSelected ? 'none' : `2px solid ${STYLES.colors.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            color: '#fff',
                            fontWeight: '600',
                          }}>
                            {isSelected && '✓'}
                          </div>
                          {isPrimary && (
                      <span style={{
                        backgroundColor: STYLES.colors.accent,
                              color: '#fff',
                              padding: '4px 10px',
                        borderRadius: STYLES.radius.full,
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
                          href={match.block.arena_url}
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
                            borderRadius: STYLES.radius.sm,
                            fontSize: '11px',
                            textDecoration: 'none',
                            opacity: 0.8,
                            transition: `opacity ${STYLES.motion.duration} ${STYLES.motion.easing}`,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                        >
                          Are.na ↗
                        </a>
                      </div>
                    )}

                    {/* Human-readable explanation */}
                    <div style={{ padding: STYLES.spacing.md }}>
                    <p style={{
                        fontSize: '14px',
                      fontWeight: STYLES.typography.bodyWeight,
                        margin: 0,
                        lineHeight: 1.5,
                      color: STYLES.colors.textPrimary,
                      }}>
                        {match.relevanceNote}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {aggregatedResult.matches.length === 0 && !isLoading && (
              <div style={{
                textAlign: 'center',
                padding: STYLES.spacing.xl,
                color: STYLES.colors.textMuted,
              }}>
                <p>No matching references found.</p>
                <p style={{ fontSize: '14px' }}>
                  Try adding more references to your Are.na UI/UX channel.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


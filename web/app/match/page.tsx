'use client';

import { useState, useCallback, useRef } from 'react';

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

export default function MatchPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewUrl(base64);

      try {
        const response = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to match');
        }

        setResult(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

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
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const generateCursorMarkdown = useCallback(() => {
    if (!result) return '';

    const tagsList = [
      ...(result.extractedTags.component || []),
      ...(result.extractedTags.style || []),
      ...(result.extractedTags.context || []),
      ...(result.extractedTags.vibe || []),
    ].map(t => `\`${t}\``).join(', ');

    let md = `## UI References for Your WIP\n\n`;
    md += `**Your screenshot:** ${result.oneLiner}\n`;
    md += `**Tags:** ${tagsList}\n\n`;
    md += `---\n\n`;

    result.matches.forEach((match, i) => {
      const allMatchedTags = [
        ...match.matchedTags.component,
        ...match.matchedTags.style,
        ...match.matchedTags.context,
        ...match.matchedTags.vibe,
      ];

      md += `### ${i + 1}. ${match.block.title || match.block.one_liner.slice(0, 50)}\n`;
      md += `![reference](${match.block.image_url})\n`;
      md += `- **Match:** ${Math.round(match.score * 10)}% (${allMatchedTags.join(', ')})\n`;
      md += `- **Description:** ${match.block.one_liner}\n`;
      md += `- [View on Are.na](${match.block.arena_url})\n\n`;
    });

    md += `---\n\n`;
    md += `**Common patterns in these references:**\n`;
    
    // Aggregate common tags across matches
    const allComponents = new Set<string>();
    const allStyles = new Set<string>();
    result.matches.forEach(m => {
      m.matchedTags.component.forEach(t => allComponents.add(t));
      m.matchedTags.style.forEach(t => allStyles.add(t));
    });

    if (allComponents.size > 0) {
      md += `- Components: ${Array.from(allComponents).join(', ')}\n`;
    }
    if (allStyles.size > 0) {
      md += `- Style: ${Array.from(allStyles).join(', ')}\n`;
    }

    return md;
  }, [result]);

  const handleCopy = useCallback(async () => {
    const md = generateCursorMarkdown();
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generateCursorMarkdown]);

  const reset = useCallback(() => {
    setResult(null);
    setPreviewUrl(null);
    setError(null);
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: STYLES.spacing.lg,
      }}>
        {/* Drop Zone */}
        {!result && (
          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
              border: `2px dashed ${isDragging ? STYLES.colors.accent : STYLES.colors.border}`,
              borderRadius: STYLES.radius.md,
              padding: STYLES.spacing.xl,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragging ? 'rgba(0,0,0,0.02)' : 'transparent',
              transition: `all ${STYLES.motion.duration} ${STYLES.motion.easing}`,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {isLoading ? (
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  margin: '0 auto 16px',
                  border: `3px solid ${STYLES.colors.border}`,
                  borderTopColor: STYLES.colors.accent,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}>
                  <style>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
                <p style={{ color: STYLES.colors.textSecondary, margin: 0 }}>
                  Analyzing your screenshot...
                </p>
              </div>
            ) : (
              <>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '300px',
                      maxHeight: '200px',
                      borderRadius: STYLES.radius.sm,
                      marginBottom: STYLES.spacing.md,
                    }}
                  />
                ) : (
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
                )}
                <p style={{
                  fontSize: '16px',
                  fontWeight: STYLES.typography.headingWeight,
                  margin: '0 0 8px 0',
                }}>
                  Drop your screenshot here
                </p>
                <p style={{
                  fontSize: '14px',
                  color: STYLES.colors.textMuted,
                  margin: 0,
                }}>
                  or click to browse
                </p>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: STYLES.spacing.md,
            borderRadius: STYLES.radius.sm,
            marginTop: STYLES.spacing.md,
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Your Screenshot + Tags */}
            <div style={{
              display: 'flex',
              gap: STYLES.spacing.lg,
              marginBottom: STYLES.spacing.lg,
              flexWrap: 'wrap',
            }}>
              {/* Preview */}
              {previewUrl && (
                <div style={{
                  flex: '0 0 auto',
                }}>
                  <img
                    src={previewUrl}
                    alt="Your screenshot"
                    style={{
                      width: '200px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: STYLES.radius.md,
                      boxShadow: STYLES.shadow.subtle,
                    }}
                  />
                </div>
              )}

              {/* Extracted Info */}
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: STYLES.typography.headingWeight,
                  margin: '0 0 8px 0',
                }}>
                  Your Screenshot
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: STYLES.colors.textSecondary,
                  margin: '0 0 12px 0',
                }}>
                  {result.oneLiner}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['component', 'style', 'context', 'vibe'].map(category => (
                    (result.extractedTags[category as keyof typeof result.extractedTags] || []).map(tag => (
                      <span
                        key={`${category}-${tag}`}
                        style={{
                          backgroundColor: category === 'component' ? '#E0F2FE' :
                                         category === 'style' ? '#F3E8FF' :
                                         category === 'context' ? '#DCFCE7' :
                                         '#FEF3C7',
                          color: STYLES.colors.textPrimary,
                          padding: '4px 10px',
                          borderRadius: STYLES.radius.full,
                          fontSize: '12px',
                          fontWeight: '500',
                        }}
                      >
                        {tag}
                      </span>
                    ))
                  ))}
                </div>

                {/* Actions */}
                <div style={{ marginTop: STYLES.spacing.md, display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      backgroundColor: STYLES.colors.accent,
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: STYLES.radius.sm,
                      fontSize: '14px',
                      fontWeight: STYLES.typography.headingWeight,
                      cursor: 'pointer',
                      transition: `all ${STYLES.motion.duration} ${STYLES.motion.easing}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = STYLES.colors.accentHover;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = STYLES.colors.accent;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {copied ? (
                      <>
                        <span style={{ color: STYLES.colors.success }}>✓</span>
                        Copied!
                      </>
                    ) : (
                      <>
                        📋 Copy for Cursor
                      </>
                    )}
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = STYLES.colors.textMuted;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = STYLES.colors.border;
                    }}
                  >
                    Try Another
                  </button>
                </div>
              </div>
            </div>

            {/* Matches */}
            <h3 style={{
              fontSize: '14px',
              fontWeight: STYLES.typography.headingWeight,
              color: STYLES.colors.textSecondary,
              margin: `0 0 ${STYLES.spacing.md} 0`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {result.matches.length} Relevant References
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: STYLES.spacing.md,
            }}>
              {result.matches.map((match, i) => (
                <a
                  key={match.block.id}
                  href={match.block.arena_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: STYLES.colors.bgSecondary,
                    borderRadius: STYLES.radius.md,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: STYLES.shadow.subtle,
                    transition: `all ${STYLES.motion.duration} ${STYLES.motion.easing}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = STYLES.shadow.lifted;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = STYLES.shadow.subtle;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image */}
                  {match.block.image_url && (
                    <div style={{
                      aspectRatio: '16/10',
                      overflow: 'hidden',
                      backgroundColor: '#F5F5F5',
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
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: STYLES.spacing.md }}>
                    {/* Match score */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                    }}>
                      <span style={{
                        backgroundColor: STYLES.colors.accent,
                        color: '#FFFFFF',
                        padding: '2px 8px',
                        borderRadius: STYLES.radius.full,
                        fontSize: '11px',
                        fontWeight: '600',
                      }}>
                        #{i + 1}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: STYLES.colors.textMuted,
                      }}>
                        Match: {Math.round(match.score * 10)}%
                      </span>
                    </div>

                    {/* Title */}
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: STYLES.typography.headingWeight,
                      margin: '0 0 6px 0',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {match.block.title || match.block.one_liner.slice(0, 60)}
                    </h4>

                    {/* Relevance note */}
                    <p style={{
                      fontSize: '12px',
                      color: STYLES.colors.textSecondary,
                      margin: '0 0 8px 0',
                      lineHeight: 1.4,
                    }}>
                      {match.relevanceNote}
                    </p>

                    {/* Matched tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {[
                        ...match.matchedTags.component,
                        ...match.matchedTags.style,
                      ].slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            padding: '2px 6px',
                            borderRadius: STYLES.radius.full,
                            fontSize: '10px',
                            color: STYLES.colors.textSecondary,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {result.matches.length === 0 && (
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


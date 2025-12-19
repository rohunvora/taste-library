'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Block {
  id: number
  title: string | null
  description: string | null
  content: string | null
  class: string
  source: {
    url: string | null
    title: string | null
  } | null
  image?: {
    display?: { url: string }
    thumb?: { url: string }
  }
  sourceChannels: string[]
}

interface Category {
  key: string
  label: string
  hint: string
  icon: string
  color: string
  isCustom?: boolean
}

interface LastAction {
  block: Block
  channel: string
  channelLabel: string
  isCustom: boolean
  isSkip: boolean
}

interface CustomChannel {
  title: string
  slug: string
  count: number
  isSystem?: boolean
}

const DEFAULT_CATEGORIES: Category[] = [
  { 
    key: 'ui-ux', 
    label: 'UI/UX', 
    hint: 'Interfaces, apps, websites, visual',
    icon: '📱', 
    color: '#7c3aed',
  },
  { 
    key: 'writing', 
    label: 'Writing', 
    hint: 'Essays, copy, prose, articles',
    icon: '✍️', 
    color: '#d97706',
  },
  { 
    key: 'code', 
    label: 'Code', 
    hint: 'Repos, docs, technical, tools',
    icon: '⌨️', 
    color: '#059669',
  },
  { 
    key: 'thinking', 
    label: 'Thinking', 
    hint: 'Mental models, strategy, process',
    icon: '🧠', 
    color: '#db2777',
  },
]

// Color palette for custom channels
const CUSTOM_COLORS = ['#6366f1', '#0ea5e9', '#14b8a6', '#f97316', '#ef4444', '#8b5cf6']

export default function ClassifyPage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<LastAction | null>(null)
  const [undoing, setUndoing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [allChannels, setAllChannels] = useState<CustomChannel[]>([])
  const [sessionChannels, setSessionChannels] = useState<string[]>([]) // Channels created this session
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [expandedText, setExpandedText] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  

  // Load blocks - this is the single source of truth
  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/blocks')
      if (!res.ok) throw new Error('Failed to load blocks')
      const data = await res.json()
      setBlocks(data.blocks)
      setAllChannels(data.channels || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadBlocks()
  }, [loadBlocks])

  // Haptic feedback helper
  const vibrate = (pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }

  // Build categories list (defaults + channels created this session)
  const categories: Category[] = [
    ...DEFAULT_CATEGORIES,
    ...sessionChannels.map((title, i) => ({
      key: `custom-${title.toLowerCase().replace(/\s+/g, '-')}`,
      label: title,
      hint: 'New channel',
      icon: '📁',
      color: CUSTOM_COLORS[i % CUSTOM_COLORS.length],
      isCustom: true,
    })),
  ]

  // Filter blocks by type
  const filteredBlocks = typeFilter === 'all' 
    ? blocks 
    : blocks.filter(b => {
        if (typeFilter === 'image') return b.class === 'Image'
        if (typeFilter === 'link') return b.class === 'Link'
        if (typeFilter === 'text') return b.class === 'Text'
        if (typeFilter === 'media') return b.class === 'Media' || b.class === 'Attachment'
        return true
      })
  
  // Type filter counts
  const typeCounts = {
    all: blocks.length,
    image: blocks.filter(b => b.class === 'Image').length,
    link: blocks.filter(b => b.class === 'Link').length,
    text: blocks.filter(b => b.class === 'Text').length,
    media: blocks.filter(b => b.class === 'Media' || b.class === 'Attachment').length,
  }

  // Preload next image for instant transitions
  useEffect(() => {
    if (filteredBlocks.length > 1) {
      const nextBlock = filteredBlocks[1]
      const nextImageUrl = nextBlock.image?.display?.url || nextBlock.image?.thumb?.url
      if (nextImageUrl) {
        const img = new Image()
        img.src = nextImageUrl
      }
    }
  }, [filteredBlocks])

  const classify = useCallback((category: string, customChannel?: string, createNew?: boolean) => {
    if (filteredBlocks.length === 0) return
    
    const block = filteredBlocks[0]
    const cat = DEFAULT_CATEGORIES.find(c => c.key === category)
    
    // Instant feedback
    vibrate(10)
    setLastAction({
      block,
      channel: customChannel || category,
      channelLabel: customChannel || cat?.label || category,
      isCustom: !!customChannel,
      isSkip: false,
    })
    
    // Remove from UI immediately (from main blocks array)
    setBlocks(prev => prev.filter(b => b.id !== block.id))
    
    // Fire and forget
    fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        blockId: block.id, 
        channel: customChannel ? undefined : category,
        customChannel,
        createNew,
      }),
    }).catch(console.error)
  }, [filteredBlocks])

  const skip = useCallback(() => {
    if (filteredBlocks.length === 0) return
    
    const block = filteredBlocks[0]
    
    // Instant feedback
    vibrate(10)
    setLastAction({
      block,
      channel: 'skip',
      channelLabel: 'Skipped',
      isCustom: false,
      isSkip: true,
    })
    
    // Remove from UI immediately
    setBlocks(prev => prev.filter(b => b.id !== block.id))
    
    // Fire and forget
    fetch('/api/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: block.id }),
    }).catch(console.error)
  }, [filteredBlocks])

  const deleteBlock = useCallback(() => {
    if (filteredBlocks.length === 0) return
    
    const block = filteredBlocks[0]
    
    // Instant feedback
    vibrate([20, 20])
    setLastAction(null)
    
    // Remove from UI immediately
    setBlocks(prev => prev.filter(b => b.id !== block.id))
    
    // Fire and forget - don't wait for API
    fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId: block.id }),
    }).catch(console.error)
  }, [filteredBlocks])

  const undo = useCallback(() => {
    if (!lastAction || undoing) return
    
    vibrate(10)
    
    // Add block back to local state immediately
    setBlocks(prev => [lastAction.block, ...prev])
    setLastAction(null)
    
    // Fire undo API in background
    fetch('/api/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        blockId: lastAction.block.id, 
        channel: lastAction.isCustom ? undefined : lastAction.channel,
        customChannel: lastAction.isCustom ? lastAction.channel : undefined,
        isSkip: lastAction.isSkip,
      }),
    }).catch(console.error)
  }, [lastAction, undoing])

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return
    const channelName = newChannelName.trim()
    await classify('', channelName, true)
    // Add to session channels so it appears as a button
    if (!sessionChannels.includes(channelName)) {
      setSessionChannels(prev => [...prev, channelName])
    }
    setNewChannelName('')
    setShowCreateModal(false)
  }

  const handleExistingChannel = async (channelTitle: string) => {
    await classify('', channelTitle, false)
    // Add to session channels so it appears as a button for quick access
    if (!sessionChannels.includes(channelTitle)) {
      setSessionChannels(prev => [...prev, channelTitle])
    }
    setShowCreateModal(false)
  }

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 80) {
      if (diff > 0) {
        skip()
      } else if (lastAction) {
        undo()
      }
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Close lightbox on Escape
      if (e.key === 'Escape') {
        if (expandedImage) {
          setExpandedImage(null)
          return
        }
        if (expandedText) {
          setExpandedText(null)
          return
        }
        if (showCreateModal) {
          setShowCreateModal(false)
          return
        }
      }
      
      // Don't process other shortcuts if modal/lightbox open
      if (showCreateModal || expandedImage || expandedText) return
      
      const num = parseInt(e.key)
      if (num >= 1 && num <= categories.length) {
        const cat = categories[num - 1]
        if (cat.isCustom) {
          classify('', cat.label, false)
        } else {
          classify(cat.key)
        }
      } else if (e.key.toLowerCase() === 's') {
        skip()
      } else if (e.key.toLowerCase() === 'd' || e.key === 'Backspace') {
        deleteBlock()
      } else if (e.key.toLowerCase() === 'z') {
        undo()
      } else if (e.key.toLowerCase() === 'n') {
        setShowCreateModal(true)
      } else if (e.key.toLowerCase() === 'r') {
        loadBlocks()
      } else if (e.key.toLowerCase() === 'f') {
        // Cycle through filters
        const filters = ['all', 'image', 'link', 'text', 'media']
        const currentIndex = filters.indexOf(typeFilter)
        setTypeFilter(filters[(currentIndex + 1) % filters.length])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [classify, skip, deleteBlock, undo, categories, showCreateModal, loadBlocks, expandedImage, expandedText, typeFilter])

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingScreen}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading blocks from Are.na...</p>
          <p style={styles.loadingSubtext}>This syncs across all your devices</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorScreen}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Something went wrong</h2>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => { setError(null); loadBlocks(); }} style={styles.retryBtn}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (filteredBlocks.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.doneScreen}>
          <div style={styles.doneIcon}>🎉</div>
          <h1 style={styles.doneTitle}>
            {blocks.length === 0 ? 'All caught up!' : `No ${typeFilter}s left`}
          </h1>
          <p style={styles.doneText}>
            {blocks.length === 0 
              ? 'No more blocks to classify' 
              : `${blocks.length} other blocks remaining`}
          </p>
          {blocks.length > 0 && (
            <button onClick={() => setTypeFilter('all')} style={styles.refreshBtn}>
              Show All
            </button>
          )}
          <button onClick={loadBlocks} style={{...styles.refreshBtn, marginTop: 8}}>
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const block = filteredBlocks[0]
  const title = block.title || block.source?.title || '[Untitled]'
  const imageUrl = block.image?.display?.url || block.image?.thumb?.url

  return (
    <div 
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.remaining}>{filteredBlocks.length} of {blocks.length}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a href="/" style={styles.matchLink}>
            🎯 Match
          </a>
          <button onClick={loadBlocks} style={styles.refreshSmall} disabled={loading}>
            ↻
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div style={styles.filterRow}>
        {[
          { key: 'all', label: 'All', icon: '📋' },
          { key: 'image', label: 'Images', icon: '🖼️' },
          { key: 'link', label: 'Links', icon: '🔗' },
          { key: 'text', label: 'Text', icon: '📝' },
          { key: 'media', label: 'Media', icon: '🎬' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            style={{
              ...styles.filterPill,
              backgroundColor: typeFilter === f.key ? '#000000' : '#FFFFFF',
              color: typeFilter === f.key ? '#FFFFFF' : '#434343',
              borderColor: typeFilter === f.key ? '#000000' : 'rgba(0,0,0,0.08)',
            }}
          >
            <span>{f.icon}</span>
            <span style={styles.filterCount}>
              {typeCounts[f.key as keyof typeof typeCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* Undo toast */}
      {lastAction && (
        <button onClick={undo} disabled={undoing} style={styles.undoToast}>
          <span>→ {lastAction.channelLabel}</span>
          <span style={styles.undoBtn}>{undoing ? '...' : 'UNDO'}</span>
        </button>
      )}

      {/* Card */}
      <div 
        style={{
          ...styles.card,
          transform: slideDirection === 'left' ? 'translateX(-100%)' : 
                     slideDirection === 'right' ? 'translateX(100%)' : 'translateX(0)',
          opacity: slideDirection ? 0 : 1,
        }}
      >
        <div style={styles.cardHeader}>
          <span style={styles.blockType}>{block.class}</span>
          {block.source?.url && (
            <a 
              href={block.source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.urlBadge}
            >
              {(() => {
                try {
                  return new URL(block.source.url).hostname.replace('www.', '')
                } catch {
                  return 'Link'
                }
              })()}
            </a>
          )}
        </div>
        
        <h2 style={styles.title}>{title}</h2>

        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="" 
            style={styles.preview} 
            loading="eager"
            onClick={() => setExpandedImage(imageUrl)}
          />
        )}

        {(block.content || block.description) && (
          <div>
            <p style={styles.content}>
              {(block.content || block.description || '').slice(0, 180)}
              {(block.content || block.description || '').length > 180 && '...'}
            </p>
            <button 
              style={styles.readMoreBtn}
              onClick={() => setExpandedText(block.content || block.description || '')}
            >
              📖 Read full text
            </button>
          </div>
        )}

        {block.class !== 'Text' && block.description && !block.content && (
          <p style={styles.description}>{block.description}</p>
        )}

        <div style={styles.sourceChannels}>
          {block.sourceChannels.slice(0, 3).map(ch => (
            <span key={ch} style={styles.channelTag}>{ch}</span>
          ))}
          {block.sourceChannels.length > 3 && (
            <span style={styles.channelTag}>+{block.sourceChannels.length - 3}</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        {categories.map((cat, index) => (
          <button
            key={cat.key}
            onClick={() => cat.isCustom ? classify('', cat.label, false) : classify(cat.key)}
            style={{
              ...styles.actionBtn,
              backgroundColor: cat.color,
            }}
          >
            <span style={styles.actionIcon}>{cat.icon}</span>
            <div style={styles.actionText}>
              <span style={styles.actionLabel}>{cat.label}</span>
              <span style={styles.actionHint}>{cat.hint}</span>
            </div>
            <span style={styles.shortcutBadge}>{index + 1}</span>
          </button>
        ))}
        
        {/* New channel button */}
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            ...styles.actionBtn,
            ...styles.newChannelBtn,
          }}
        >
          <span style={styles.actionIcon}>➕</span>
          <div style={styles.actionText}>
            <span style={styles.actionLabel}>New Channel</span>
            <span style={styles.actionHint}>Create or pick existing</span>
          </div>
          <span style={styles.shortcutBadge}>N</span>
        </button>

        {/* Bottom row: Skip and Delete */}
        <div style={styles.bottomRow}>
          <button
            onClick={skip}
            style={{
              ...styles.actionBtn,
              ...styles.skipBtn,
              flex: 1,
            }}
          >
            <span style={styles.actionIcon}>⏭️</span>
            <div style={styles.actionText}>
              <span style={styles.actionLabel}>Skip</span>
              <span style={styles.actionHint}>Later</span>
            </div>
            <span style={styles.shortcutBadge}>S</span>
          </button>

          <button
            onClick={deleteBlock}
            style={{
              ...styles.actionBtn,
              ...styles.deleteBtn,
              flex: 1,
            }}
          >
            <span style={styles.actionIcon}>🗑️</span>
            <div style={styles.actionText}>
              <span style={styles.actionLabel}>Delete</span>
              <span style={styles.actionHint}>Remove</span>
            </div>
            <span style={styles.shortcutBadge}>D</span>
          </button>
        </div>
      </div>

      {/* Swipe hint */}
      <p style={styles.swipeHint}>← swipe to skip • swipe to undo →</p>

      {/* Image lightbox */}
      {expandedImage && (
        <div 
          style={styles.lightbox}
          onClick={() => setExpandedImage(null)}
        >
          <img 
            src={expandedImage} 
            alt="" 
            style={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
          <button style={styles.lightboxClose} onClick={() => setExpandedImage(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Text lightbox */}
      {expandedText && (
        <div 
          style={styles.lightbox}
          onClick={() => setExpandedText(null)}
        >
          <div 
            style={styles.textLightbox}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={styles.textLightboxContent}>{expandedText}</p>
          </div>
          <button style={styles.lightboxClose} onClick={() => setExpandedText(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Create channel modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Add to channel</h3>
            
            {/* Create new */}
            <div style={styles.createSection}>
              <input
                type="text"
                placeholder="New channel name..."
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                style={styles.input}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCreateChannel()}
              />
              <button 
                onClick={handleCreateChannel}
                disabled={!newChannelName.trim()}
                style={{
                  ...styles.createBtn,
                  opacity: newChannelName.trim() ? 1 : 0.5,
                }}
              >
                Create
              </button>
            </div>

            {/* Existing channels */}
            <div style={styles.channelList}>
              <p style={styles.channelListLabel}>Or pick existing:</p>
              <div style={styles.channelScroll}>
                {allChannels
                  .filter(ch => !ch.isSystem)
                  .slice(0, 15)
                  .map(ch => (
                    <button
                      key={ch.slug}
                      onClick={() => handleExistingChannel(ch.title)}
                      style={styles.channelOption}
                    >
                      <span>{ch.title}</span>
                      <span style={styles.channelCount}>{ch.count}</span>
                    </button>
                  ))}
              </div>
            </div>

            <button onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ============================================================================
// STYLES - Warm Light Theme (matches Reference Matcher)
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100dvh',
    backgroundColor: '#F2F0EC',
    color: '#000000',
    padding: '12px',
    paddingBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    padding: '8px 0',
  },
  remaining: {
    fontSize: '13px',
    color: '#434343',
    fontWeight: 500,
  },
  refreshSmall: {
    background: 'none',
    border: 'none',
    color: '#A3A3A3',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  matchLink: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
  },
  filterRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '12px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  filterPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '16px',
    fontSize: '12px',
    color: '#434343',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    backgroundColor: '#FFFFFF',
  },
  filterCount: {
    fontSize: '11px',
    opacity: 0.7,
  },
  undoToast: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '13px',
    color: '#434343',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  undoBtn: {
    color: '#4CAF50',
    fontWeight: 600,
    fontSize: '12px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '12px',
    transition: 'transform 0.08s ease-out, opacity 0.08s ease-out',
    willChange: 'transform, opacity',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  blockType: {
    backgroundColor: '#F5F5F5',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    color: '#434343',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  urlBadge: {
    backgroundColor: '#E8F5E9',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    color: '#4CAF50',
    textDecoration: 'none',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#000000',
    margin: 0,
    lineHeight: 1.3,
    wordBreak: 'break-word',
  },
  preview: {
    width: '100%',
    maxHeight: '180px',
    objectFit: 'contain',
    borderRadius: '8px',
    backgroundColor: '#F5F5F5',
    marginTop: '10px',
    cursor: 'zoom-in',
  },
  lightbox: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px',
  },
  lightboxImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '4px',
  },
  lightboxClose: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  textLightbox: {
    maxWidth: '600px',
    maxHeight: '80vh',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    overflowY: 'auto',
    margin: '20px',
  },
  textLightboxContent: {
    fontSize: '16px',
    lineHeight: 1.7,
    color: '#000000',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  content: {
    fontSize: '13px',
    color: '#434343',
    lineHeight: 1.5,
    margin: '10px 0 0 0',
  },
  readMoreBtn: {
    background: 'none',
    border: 'none',
    color: '#000000',
    fontSize: '12px',
    padding: '8px 0',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600,
    textDecoration: 'underline',
  },
  description: {
    fontSize: '12px',
    color: '#A3A3A3',
    marginTop: '8px',
    fontStyle: 'italic',
  },
  sourceChannels: {
    marginTop: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  channelTag: {
    backgroundColor: '#F5F5F5',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    color: '#A3A3A3',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    WebkitTapHighlightColor: 'transparent',
    transition: 'transform 0.1s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  actionIcon: {
    fontSize: '20px',
    width: '28px',
    textAlign: 'center',
  },
  actionText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1px',
    flex: 1,
  },
  actionLabel: {
    fontSize: '15px',
  },
  actionHint: {
    fontSize: '11px',
    opacity: 0.85,
    fontWeight: 400,
  },
  shortcutBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
  },
  newChannelBtn: {
    backgroundColor: '#FFFFFF',
    border: '2px dashed rgba(0,0,0,0.15)',
    color: '#434343',
    boxShadow: 'none',
  },
  bottomRow: {
    display: 'flex',
    gap: '8px',
  },
  skipBtn: {
    backgroundColor: '#E5E5E5',
    color: '#434343',
    boxShadow: 'none',
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#A3A3A3',
    marginTop: '8px',
  },
  loadingScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    gap: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(0,0,0,0.08)',
    borderTopColor: '#000000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#434343',
    fontSize: '14px',
  },
  loadingSubtext: {
    color: '#A3A3A3',
    fontSize: '12px',
  },
  errorScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    textAlign: 'center',
    padding: '20px',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '18px',
    marginBottom: '8px',
    color: '#000000',
  },
  errorText: {
    color: '#434343',
    fontSize: '14px',
    marginBottom: '20px',
  },
  retryBtn: {
    padding: '12px 24px',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  doneScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    textAlign: 'center',
  },
  doneIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  doneTitle: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#000000',
  },
  doneText: {
    color: '#434343',
    marginBottom: '24px',
  },
  refreshBtn: {
    padding: '12px 24px',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px 16px 0 0',
    padding: '20px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    textAlign: 'center',
    color: '#000000',
  },
  createSection: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#F5F5F5',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '8px',
    color: '#000000',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  createBtn: {
    padding: '12px 20px',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  channelList: {
    flex: 1,
    minHeight: 0,
    marginBottom: '16px',
  },
  channelListLabel: {
    fontSize: '12px',
    color: '#A3A3A3',
    marginBottom: '8px',
  },
  channelScroll: {
    maxHeight: '200px',
    overflowY: 'auto',
  },
  channelOption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px',
    backgroundColor: '#F5F5F5',
    border: 'none',
    borderRadius: '8px',
    color: '#000000',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    marginBottom: '6px',
    fontFamily: 'inherit',
  },
  channelCount: {
    fontSize: '12px',
    color: '#A3A3A3',
  },
  cancelBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '8px',
    color: '#434343',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}


# Fix Weak Visual Hierarchy

Paste this when: Everything on the page looks the same weight and importance.

---

## Is This Your Problem?

Squint at your screen. If you can answer YES to any of these, this is your fix:

- [ ] Headlines don't jump out - they blend with body text
- [ ] You can't instantly tell what's most important
- [ ] Multiple buttons look equally clickable
- [ ] The page feels "flat" or "monotonous"
- [ ] Users don't know where to look first

---

## The Fix

### Rule 1: Headlines Must DOMINATE

Headlines should be 2-3x body text size. Not 1.2x. DRAMATIC.

```
Hero headline:    48-72px (3-4x body)     weight: 600-700
Section headline: 30-36px (2x body)       weight: 600
Card title:       20-24px (1.3-1.5x)      weight: 500-600
Body text:        16-18px (baseline)      weight: 400
Caption/meta:     14-16px                 weight: 400
```

**Mobile headlines:** 32-48px for hero (still dominant, just smaller)

### Rule 2: Supporting Text Must RECEDE

The subheadline under your hero? It needs to be:
- Smaller (0.5-0.7x the headline)
- AND lighter (gray-600 instead of gray-900, OR weight 400 instead of 600)

```css
/* Hero example */
.hero-headline {
  font-size: 64px;
  font-weight: 700;
  color: #111827;
}
.hero-subheadline {
  font-size: 20px;      /* Much smaller */
  font-weight: 400;     /* Lighter weight */
  color: #4B5563;       /* Lighter color */
}
```

### Rule 3: One Primary CTA Per Section

If two buttons sit side by side and look equal = FAIL.

```css
/* Primary: filled, large, high contrast */
.btn-primary {
  background: #2563EB;
  color: white;
  padding: 14px 28px;
  font-weight: 600;
}

/* Secondary: outlined or ghost, clearly subordinate */
.btn-secondary {
  background: transparent;
  border: 1px solid #D1D5DB;
  color: #374151;
  padding: 12px 20px;
  font-weight: 500;
}
```

### Rule 4: Create ONE Focal Point Per Screen Section

Each viewport should have exactly one thing that captures attention first.

Focal points are created by combining:
- Size (largest element)
- Color (highest contrast or accent color)
- Position (center or upper-left for LTR readers)
- Whitespace (most breathing room around it)

---

## Anti-Patterns

Things that make hierarchy WORSE:

- Making everything bigger (just makes everything equally loud)
- Using the same font weight throughout
- Centering everything (removes left-edge anchor for scanning)
- Adding more colors (creates visual noise, not hierarchy)
- Making body text larger than 18px (closes the gap with headlines)

---

## Output Format

```
WHERE: [section name]
CURRENT: [e.g., "headline 24px, body 16px (1.5x ratio)"]
FIX: [e.g., "headline 48px, body 16px (3x ratio), add weight 700"]
```

---

## Quick Test

After fixing, squint at the page again:

1. Can you instantly see the #1 thing? (Yes = pass)
2. Does your eye have a clear path? (Yes = pass)
3. Is there one obvious button to click? (Yes = pass)

If any are "no", hierarchy still needs work.

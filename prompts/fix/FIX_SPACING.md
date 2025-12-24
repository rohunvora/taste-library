# Fix Broken Spacing

Paste this when: The page feels either cramped/cluttered OR floating/disconnected.

---

## Is This Your Problem?

- [ ] Elements feel squeezed together (cramped)
- [ ] Elements feel unrelated, like they're floating apart (disconnected)
- [ ] Everything is the same distance apart (monotonous)
- [ ] Cards feel like isolated islands, not a group
- [ ] The page has no visual rhythm

---

## The Fix

### Rule 1: Internal < External (Law of Proximity)

Space WITHIN a group must be SMALLER than space BETWEEN groups.

```
Card padding:        16-20px   (1x baseline)
Gap between cards:   24px      (1.5x baseline)
Gap between sections: 48-64px  (3-4x baseline)
```

**If card padding equals the gap between cards**, they feel like isolated islands instead of a related group.

### Rule 2: Vary Section Spacing (Create Rhythm)

Not every section gets the same padding. The page needs rhythm:

```
Hero section:      80-120px vertical padding (the most generous)
Major sections:    64-80px vertical padding
Subsections:       32-48px vertical padding
Content within:    16-24px gaps
```

**Bad:** Every section has 48px padding (feels like a metronome)
**Good:** Hero (100px) → Features (64px) → Testimonials (48px) → CTA (80px)

### Rule 3: Content Density Drives Spacing

Match whitespace to content density:

| Content Type | Spacing Approach |
|--------------|------------------|
| Dense (paragraphs, tables) | More generous spacing |
| Sparse (icon + label) | Tighter spacing |

A card with just an icon and two words doesn't need 80px padding - the space overwhelms the content.

### Rule 4: Use the 4px Grid

All spacing values should be multiples of 4:

```
GOOD: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
BAD:  13, 17, 23, 50, 75
```

---

## Diagnosis Guide

| Symptom | Cause | Fix |
|---------|-------|-----|
| Floating/disconnected | Gaps too large for content density | Reduce gaps, keep internal padding |
| Cramped/cluttered | Gaps too small | Increase gaps between sections |
| Everything blurs together | Internal ≈ external spacing | Make gaps LARGER than padding |
| Monotonous rhythm | Same spacing everywhere | Vary: hero spacious, subsections tight |

---

## Exact Values Reference

```css
:root {
  /* Card/component spacing */
  --space-card-padding: 1.25rem;     /* 20px */
  --space-card-gap: 1.5rem;          /* 24px */

  /* Section spacing */
  --space-section-hero: 6rem;        /* 96px */
  --space-section-major: 4rem;       /* 64px */
  --space-section-minor: 2rem;       /* 32px */

  /* Content spacing */
  --space-content-gap: 1rem;         /* 16px */
  --space-paragraph-gap: 1.5rem;     /* 24px */

  /* Button/form spacing */
  --space-button-padding: 0.75rem 1.25rem;  /* 12px 20px */
  --space-input-padding: 0.75rem 1rem;      /* 12px 16px */
}
```

---

## Anti-Patterns

Things that make spacing WORSE:

- Adding padding everywhere equally (monotonous)
- Using spacing to "fill space" instead of grouping content
- Matching internal and external spacing exactly
- Ignoring content density (sparse content + huge gaps = floating)
- Arbitrary values not on the 4px grid

---

## Output Format

```
WHERE: [section/component]
CURRENT: [e.g., "card padding 24px, card gap 24px, section gap 24px"]
FIX: [e.g., "card padding 20px, card gap 24px, section gap 64px"]
```

---

## Quick Test

After fixing:

1. Do related items feel grouped? (Yes = pass)
2. Does the page have rhythm (not monotonous)? (Yes = pass)
3. Is there clear separation between major sections? (Yes = pass)

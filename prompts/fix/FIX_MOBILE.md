# Fix Broken Mobile Experience

Paste this when: The mobile version feels cramped, hard to use, or clearly broken.

---

## Is This Your Problem?

- [ ] Text is too small to read on mobile
- [ ] Buttons are impossible to tap accurately
- [ ] Content overflows horizontally (sideways scroll)
- [ ] Important content is buried below the fold
- [ ] Forms are unusable with thumbs

---

## The Fix

### Rule 1: Touch Targets Are LARGER on Mobile

Desktop minimum is 44px. Mobile needs MORE:

```css
/* Mobile buttons */
@media (max-width: 768px) {
  .button {
    min-height: 48px;      /* Not 44px */
    padding: 14px 24px;
  }

  .button-primary {
    min-height: 52px;
    width: 100%;           /* Full-width CTAs */
  }

  .icon-button {
    width: 48px;
    height: 48px;
  }
}
```

### Rule 2: Primary CTAs Go Full-Width

On mobile, primary actions should be impossible to miss:

```css
@media (max-width: 640px) {
  .cta-primary {
    width: 100%;
    min-height: 52px;
    font-size: 18px;
  }
}
```

### Rule 3: Stack Order Matters

Mobile isn't just "smaller desktop." Reorder for mobile priority:

**Good stack order:**
```
1. Headline (immediately visible)
2. Subheadline (brief context)
3. CTA button (within first scroll)
4. Supporting image
5. Additional content
```

**Bad stack order:**
```
1. Large hero image (pushes content down)
2. Headline (below the fold)
3. Lots of text
4. CTA (buried)
```

### Rule 4: Critical Actions in Thumb Zone

The bottom half of the screen is thumb-friendly. Place key actions there:

```css
/* Sticky bottom CTA for mobile */
@media (max-width: 640px) {
  .mobile-cta-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
}
```

### Rule 5: Form Inputs Need Breathing Room

```css
@media (max-width: 640px) {
  input, select, textarea {
    min-height: 48px;
    font-size: 16px;        /* Prevents iOS zoom */
    padding: 12px 16px;
  }

  .form-field + .form-field {
    margin-top: 16px;       /* Gap between fields */
  }
}
```

**Critical:** Input font-size must be 16px+ or iOS will zoom in.

### Rule 6: Reduce Horizontal Padding, Maintain Vertical

```css
@media (max-width: 640px) {
  .section {
    padding: 48px 16px;     /* Less horizontal, same vertical */
  }

  .container {
    padding-left: 16px;
    padding-right: 16px;
  }
}
```

### Rule 7: Single Column Below 640px

```css
@media (max-width: 640px) {
  .grid, .flex-row {
    flex-direction: column;
    grid-template-columns: 1fr;
  }
}
```

---

## Breakpoint Reference

```css
/* Mobile first approach */
.element { /* Mobile styles (default) */ }

@media (min-width: 640px) {
  .element { /* Tablet and up */ }
}

@media (min-width: 1024px) {
  .element { /* Desktop */ }
}

/* Or max-width for mobile overrides */
@media (max-width: 639px) {
  .element { /* Mobile only */ }
}
```

---

## Anti-Patterns

Things that make mobile WORSE:

- Keeping desktop touch target sizes (44px → too small)
- Side-by-side buttons (tap the wrong one)
- Horizontal scrolling galleries without indicators
- Fixed headers that take too much vertical space
- Popups/modals that don't fit mobile viewport
- Hover-dependent interactions (no hover on touch)

---

## Output Format

```
WHERE: [component]
BREAKPOINT: [max-width value]
CURRENT: [e.g., "button height 40px"]
FIX: [e.g., "button height 48px, width 100%"]
```

---

## Quick Test

Test on a real phone (or 375px viewport):

1. Can you tap every button accurately with your thumb? (Yes = pass)
2. Can you read all text without zooming? (Yes = pass)
3. Is the primary CTA visible within first scroll? (Yes = pass)
4. No horizontal scrolling? (Yes = pass)

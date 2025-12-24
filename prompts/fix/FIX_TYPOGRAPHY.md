# Fix Typography Issues

Paste this when: Text feels too small, cramped, or inconsistent.

---

## Is This Your Problem?

- [ ] Body text is smaller than 16px
- [ ] Lines of text feel too close together
- [ ] Paragraphs are too wide (hard to track lines)
- [ ] Font weights look too light
- [ ] Heading sizes feel random

---

## The Fix

### Rule 1: 16px Body Text Minimum

Never go below 16px for readable body content:

```css
body {
  font-size: 16px;            /* 1rem - the baseline */
  line-height: 1.5;           /* Comfortable reading */
}

/* 14px is ONLY for secondary UI elements */
.caption, .metadata, .helper-text {
  font-size: 14px;
}

/* 12px is ONLY for badges and labels */
.badge, .tag {
  font-size: 12px;
}
```

### Rule 2: Line Height By Context

```css
/* Body text: generous spacing */
p, li, .body-text {
  line-height: 1.5;           /* Or 1.6 for dense content */
}

/* Headlines: tighter spacing */
h1, h2, h3 {
  line-height: 1.2;           /* 1.1-1.3 range */
}

/* Buttons: single line, tight */
.button {
  line-height: 1;             /* Or 1.25 */
}
```

### Rule 3: Constrain Line Length

```css
/* Optimal reading width */
.prose,
.content,
article p {
  max-width: 65ch;            /* ~600-700px */
}

/* Full-width text is hard to read */
/* NEVER: max-width: 100% on paragraph text */
```

### Rule 4: Font Weight Minimums

Light weights (300) fail at small sizes:

```css
/* Under 24px: weight 400 minimum */
body {
  font-weight: 400;           /* Never 300 for body */
}

/* 24px+: 300 is acceptable */
.hero-headline {
  font-weight: 300;           /* OK for large display text */
  font-size: 48px;
}

/* Headlines: 600-700 for impact */
h1, h2 {
  font-weight: 600;
}
```

### Rule 5: Use a Consistent Scale

Based on 1.25 ratio (Major Third):

```css
:root {
  --text-xs: 0.75rem;         /* 12px - badges only */
  --text-sm: 0.875rem;        /* 14px - secondary UI */
  --text-base: 1rem;          /* 16px - body */
  --text-lg: 1.125rem;        /* 18px - emphasized */
  --text-xl: 1.25rem;         /* 20px - card titles */
  --text-2xl: 1.5rem;         /* 24px - section headings */
  --text-3xl: 1.875rem;       /* 30px */
  --text-4xl: 2.25rem;        /* 36px - page titles */
  --text-5xl: 3rem;           /* 48px - hero headlines */
}
```

Or use fluid typography:

```css
:root {
  --text-base: clamp(1rem, 0.93rem + 0.33vw, 1.125rem);
  --text-4xl: clamp(2.25rem, 1.96rem + 1.43vw, 3rem);
}
```

### Rule 6: Heading Hierarchy

Apply sizes consistently:

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (hero) | 48-72px | 600-700 | 1.1-1.2 |
| H2 | 30-36px | 600 | 1.2-1.3 |
| H3 | 24-30px | 600 | 1.25-1.35 |
| H4 | 20-24px | 600 | 1.3-1.4 |
| Body | 16-18px | 400 | 1.5-1.6 |
| Small | 14px | 400 | 1.4-1.5 |

---

## Common Violations

| Problem | Fix |
|---------|-----|
| Body text 14px | Increase to 16px |
| Line height 1.2 on body | Use 1.5 |
| font-weight: 300 on body | Use 400 |
| Paragraphs full-width | Add max-width: 65ch |
| Random heading sizes | Use consistent scale |

---

## Anti-Patterns

Things that make typography WORSE:

- Reducing body text "to fit more content"
- Same line height for headlines and body
- Random sizes (17px, 19px, 22px) not on a scale
- Light weights on small text for "elegance"
- Full-width text on large screens

---

## Output Format

```
FILE: [path] LINE: [#]
CURRENT: [e.g., "font-size: 14px; line-height: 1.2"]
FIX: [e.g., "font-size: 16px; line-height: 1.5"]
```

---

## Quick Test

After fixing:

1. Is all body text at least 16px? (Yes = pass)
2. Are paragraphs comfortable to read (not too wide)? (Yes = pass)
3. Do heading sizes follow a consistent scale? (Yes = pass)

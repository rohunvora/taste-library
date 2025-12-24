# UX Foundations: Non-Negotiable Defaults

A universal checklist for ensuring any interface has crisp readability, proper sizing, AND strong visual composition. Technical compliance alone isn't enough—a page can pass every rule and still feel wrong.

---

## How to Use This Document

**For Cursor Agent:** Use the prompt in `prompts/audit/UX_AUDIT.md` (two-phase audit: compositional first, then technical).

**For specific problems:** Use the repair prompts in `prompts/fix/` (e.g., FIX_HIERARCHY.md, FIX_CONTRAST.md).

**Quick version:**
> "Audit this interface in TWO PHASES (do Phase 1 first):
> Phase 1 (Compositional): Fix visual hierarchy - headlines must be 2-3x body text, one obvious primary CTA, varied section spacing, proper spacing relationships (internal < external).
> Phase 2 (Technical): Fix contrast (no gray lighter than #4B5563), typography minimums (16px body), spacing (4px grid), touch targets (44px minimum).
> Phase 1 first because technical fixes can make compositional problems worse."

**For manual review:** Start with Section 7 (Compositional Rules), then work through Sections 1-6.

---

## 1. CONTRAST & LEGIBILITY (Highest Priority)

### The Rules

| Text Type | Minimum Contrast | How to Check |
|-----------|------------------|--------------|
| Body text (< 18px) | 4.5:1 ratio | Must be clearly readable |
| Large text (≥ 18px bold or ≥ 24px) | 3:1 ratio | Still needs to be obvious |
| UI components (buttons, inputs) | 3:1 ratio | Borders/fills must be distinguishable |

### Safe Color Pairings (Use These)

```css
/* LIGHT BACKGROUNDS - Text must be dark enough */
--bg-white: #FFFFFF;
--bg-off-white: #F9FAFB;
--bg-warm: #FDF8F4;

/* Safe text colors on light backgrounds */
--text-primary: #111827;    /* gray-900 - primary body text */
--text-secondary: #374151;  /* gray-700 - secondary text */
--text-tertiary: #4B5563;   /* gray-600 - MINIMUM for readable text */

/* NEVER use these for body text on light backgrounds */
/* ❌ #9CA3AF (gray-400) - 2.9:1 ratio = FAIL */
/* ❌ #D1D5DB (gray-300) - 1.8:1 ratio = FAIL */

/* DARK BACKGROUNDS - Text must be light enough */
--bg-dark: #111827;
--bg-black: #000000;

/* Safe text colors on dark backgrounds */
--text-on-dark-primary: #F9FAFB;   /* gray-50 */
--text-on-dark-secondary: #E5E7EB; /* gray-200 */
--text-on-dark-tertiary: #D1D5DB;  /* gray-300 - MINIMUM */
```

### ⚠️ HIGH-RISK PATTERN: Colored Text on Colored Backgrounds

This deserves special attention because it often "passes" contrast checkers but FAILS perceptually.

**Examples that feel wrong even when technically passing:**
- Coral/salmon text on peach/warm gradient
- Light blue text on light blue background
- Any accent color text on a tinted background

**Why it fails:**
WCAG 2.x contrast ratios don't account for hue similarity. APCA (newer algorithm) handles this better but isn't widely adopted yet. Warm-on-warm especially reduces perceived contrast beyond what the numbers suggest.

**The fix:**
1. **Preferred:** Use neutral text (near-black or white) on colored backgrounds
2. **If you must use colored text:** Go MUCH darker/lighter than the minimum ratio suggests
3. **Test:** Would this be readable at a glance? On a phone in sunlight?

Colored text is decorative. Readability is functional. When they conflict, readability wins.

### Common Violations to Fix

| Problem | Example | Fix |
|---------|---------|-----|
| Light gray text on white | `color: #9CA3AF` on `#FFFFFF` | Change to `#4B5563` or darker |
| Placeholder text too light | `::placeholder { color: #D1D5DB }` | Use `#6B7280` minimum |
| Colored text on colored bg | Orange text on peach background | Use neutral text OR much higher contrast |
| Text over images/gradients | Any text on busy backgrounds | Add semi-transparent overlay or use neutral color |
| "Passes" but feels wrong | Warm text on warm background | Use neutral (black/white) instead |

### Audit Command

Look for these patterns in CSS/Tailwind:
```
❌ text-gray-400, text-gray-300, text-gray-200 (FAIL - never use on light backgrounds)
⚠️ text-gray-500 (borderline - only for non-essential metadata, never for body text)
✓ text-gray-600 and darker (safe for all text)
❌ opacity-50, opacity-60 on text (reduces effective contrast)
❌ font-light, font-extralight on text under 24px
```

---

## 2. TYPOGRAPHY SCALE (Use Fluid Scale)

### The Scale (Copy This)

Based on Utopia.fyi with 1.25 ratio (Major Third):

```css
:root {
  /* Fluid type scale - works from 320px to 1440px viewport */
  --text-xs: clamp(0.75rem, 0.71rem + 0.22vw, 0.875rem);     /* 12-14px */
  --text-sm: clamp(0.875rem, 0.82rem + 0.27vw, 1rem);        /* 14-16px */
  --text-base: clamp(1rem, 0.93rem + 0.33vw, 1.125rem);      /* 16-18px - Body */
  --text-lg: clamp(1.125rem, 1.04rem + 0.42vw, 1.25rem);     /* 18-20px */
  --text-xl: clamp(1.25rem, 1.14rem + 0.54vw, 1.5rem);       /* 20-24px */
  --text-2xl: clamp(1.5rem, 1.36rem + 0.71vw, 1.875rem);     /* 24-30px */
  --text-3xl: clamp(1.875rem, 1.68rem + 0.93vw, 2.25rem);    /* 30-36px */
  --text-4xl: clamp(2.25rem, 1.96rem + 1.43vw, 3rem);        /* 36-48px */
  --text-5xl: clamp(3rem, 2.57rem + 2.14vw, 4rem);           /* 48-64px */
}
```

### Typography Rules

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Body text | `--text-base` (16px min) | 400-500 | 1.5-1.6 |
| Small/caption | `--text-sm` (14px min) | 400-500 | 1.4-1.5 |
| H1 | `--text-4xl` to `--text-5xl` | 600-700 | 1.1-1.2 |
| H2 | `--text-3xl` | 600 | 1.2-1.3 |
| H3 | `--text-2xl` | 600 | 1.25-1.35 |
| H4 | `--text-xl` | 600 | 1.3-1.4 |
| Button text | `--text-sm` to `--text-base` | 500-600 | 1 |

### Common Violations to Fix

| Problem | Fix |
|---------|-----|
| Body text smaller than 16px | Increase to minimum 16px (1rem) |
| Huge headlines with no hierarchy | Use scale steps, not arbitrary values |
| Line height too tight | Body text needs 1.5+, headlines can be tighter |
| Inconsistent sizes | Stick to the scale, no random values |
| font-weight: 300 on body | Use 400 minimum for anything under 24px |

### Line Length (Measure)

```css
/* Optimal reading width */
.prose, .content, .text-container {
  max-width: 65ch; /* ~600-700px depending on font */
}

/* Full-width text is hard to read */
/* ❌ max-width: 100% on a wide container */
```

---

## 3. SPACING SCALE (4px Grid)

### The Scale (Copy This)

Based on Tailwind's battle-tested 4px base:

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### Spacing Guidelines

| Element | Recommended Spacing |
|---------|---------------------|
| Card padding | `--space-4` to `--space-6` (16-24px) |
| Section padding (non-hero) | `--space-12` to `--space-16` (48-64px) |
| Hero section padding | `--space-20` to `--space-24` (80-96px+) |
| Gap between cards | `--space-4` to `--space-6` (16-24px) |
| Gap between form fields | `--space-4` (16px) |
| Button padding | `--space-3` `--space-5` (12px 20px) minimum |
| Text block spacing | `--space-4` to `--space-6` between paragraphs |

### The Law of Proximity (Critical)

**From Gestalt psychology:** Elements that are closer together are perceived as related.

**The rule:** Space WITHIN a group must be SMALLER than space BETWEEN groups.

```
Internal padding < Gap between items < Gap between sections
```

**Specific ratios:**
| Spacing Type | Relationship | Example (16px base) |
|--------------|--------------|---------------------|
| Card padding | 1x (baseline) | 16-20px |
| Gap between related cards | 1.5x | 24px |
| Gap between sections | 2-3x | 48-64px |

**When this breaks:**
- Card padding = gap between cards → Cards feel like isolated islands, not a group
- Section gaps = within-section gaps → Everything blurs, no clear grouping

**Diagnosis:**
- Page feels **disconnected/floating**: Reduce gaps (internal spacing is fine, external is too big)
- Page feels **cramped/cluttered**: Increase gaps (external spacing is too small)
- **Both**: Check if internal ≈ external (they shouldn't be)

### Content Density Affects Spacing

**Whitespace should match content density:**

| Content | Appropriate Spacing |
|---------|---------------------|
| Dense (paragraphs, tables, lots of text) | More generous spacing |
| Sparse (single headline, one icon, few words) | Tighter spacing |

A card with just an icon and two words doesn't need 80px padding—the space overwhelms the content.

### Common Violations to Fix

| Problem | Fix |
|---------|-----|
| Arbitrary values (13px, 17px, 23px) | Round to nearest scale value |
| Insufficient padding on cards | Minimum 16px, prefer 20-24px |
| Cramped buttons | Minimum 12px vertical, 20px horizontal padding |
| Sections feel squished | Add more vertical padding (48px+) |
| Sections feel disconnected/floating | REDUCE gaps between elements |
| Card padding ≈ gap between cards | Gap should be larger than padding |
| Everything feels same distance apart | Vary spacing: tight within groups, loose between |

---

## 4. TOUCH TARGETS & INTERACTIVE ELEMENTS

### Minimum Sizes (Non-Negotiable)

| Element | Minimum Size | Notes |
|---------|--------------|-------|
| All buttons | 44px height | Apple HIG standard. Not 40px. |
| Buttons (mobile) | 48px height | Increase further for touch |
| Icon buttons | 44×44px | Full touch target area |
| Links in text | Sufficient padding or line-height | Must be tappable |
| Form inputs | 44px height | Comfortable for touch |
| Checkboxes/radios | 24×24px visual, 44×44px touch area | Can use padding |

### Button Specifications

```css
.button {
  /* Minimum sizing - 44px is the standard, not 40px */
  min-height: 44px;
  padding: 12px 20px;         /* Comfortable padding, not cramped */
  
  /* Even larger on mobile for thumb-friendly tapping */
  @media (max-width: 768px) {
    min-height: 48px;
    padding: 14px 24px;
  }
}

/* Icon-only buttons need explicit sizing */
.icon-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Primary CTA should be even more prominent */
.button-primary {
  min-height: 48px;
  padding: 14px 28px;
  
  @media (max-width: 768px) {
    min-height: 52px;
    width: 100%; /* Full-width on mobile */
  }
}
```

### Common Violations to Fix

| Problem | Fix |
|---------|-----|
| Tiny buttons (< 44px height) | Increase to 44px minimum (Apple HIG standard) |
| Small icon buttons | Ensure 44×44px touch area |
| Links too close together | Add spacing or padding |
| Input fields too short | Minimum 44px height |

---

## 5. VISUAL HIERARCHY CHECKLIST

### Every Screen Should Have:

- [ ] **One primary action** that's visually dominant (size, color, position)
- [ ] **Clear reading order** - scan from top-left, most important first
- [ ] **Grouped related items** using proximity and containers
- [ ] **Consistent alignment** - elements should align to a grid
- [ ] **Breathing room** - nothing should feel cramped

### Hierarchy Through Size

```
Page title:     --text-4xl to --text-5xl (36-64px)
Section title:  --text-2xl to --text-3xl (24-36px)
Card title:     --text-lg to --text-xl (18-24px)
Body text:      --text-base (16-18px)
Caption/meta:   --text-sm (14-16px)
```

---

## 6. RESPONSIVE CONSIDERATIONS

### Breakpoint Adjustments

```css
/* Mobile (< 640px) */
@media (max-width: 639px) {
  /* Increase touch targets */
  button { min-height: 48px; }
  
  /* Full-width CTAs */
  .cta-button { width: 100%; }
  
  /* Reduce horizontal padding, maintain vertical */
  .section { padding: 48px 16px; }
  
  /* Stack cards vertically */
  .card-grid { grid-template-columns: 1fr; }
}

/* Tablet (640px - 1024px) */
@media (min-width: 640px) and (max-width: 1023px) {
  /* 2-column grids */
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  /* Full layouts */
  .card-grid { grid-template-columns: repeat(3, 1fr); }
  
  /* Constrain content width */
  .content { max-width: 1200px; margin: 0 auto; }
}
```

### Mobile-First Checks

- [ ] Touch targets are 48px on mobile
- [ ] Text is readable without zooming
- [ ] No horizontal scroll
- [ ] Forms are usable with thumb
- [ ] Important content isn't cut off

---

## 7. COMPOSITIONAL RULES (The Missing Piece)

Technical compliance ≠ good design. A page can pass every check above and still feel wrong.

### 7.1 Visual Hierarchy Must Be DRAMATIC

**The problem with subtle hierarchy:**
If headlines are 24px and body is 16px (1.5x ratio), they compete visually. Headlines need to be 2-3x body text to create clear dominance.

**Size relationships that work:**
```
Hero headline:    48-72px (3-4x body)
Section headline: 30-36px (2x body)
Card title:       20-24px (1.3-1.5x body)
Body text:        16-18px (baseline)
```

**The "sameness" test:**
Squint at your page. If everything blurs into the same visual weight, your hierarchy isn't strong enough. You should be able to instantly identify:
1. The most important thing on each screen
2. The second most important thing
3. Everything else

### 7.2 Hero Section Requirements

The above-the-fold hero needs special treatment:

| Element | Requirement |
|---------|-------------|
| Main headline | 48-72px desktop, 32-48px mobile. **Must dominate.** |
| Subheadline | Noticeably smaller AND lighter (color or weight) |
| Badge/label | Small, subtle, doesn't compete with headline |
| Vertical padding | 80-120px minimum. Let it breathe. |
| Primary CTA | Obvious, high contrast, large enough to notice |

**On colored/gradient backgrounds:**
- Strongly prefer neutral text (white or near-black)
- Colored text on colored backgrounds is HIGH RISK
- Even if it passes contrast ratios, warm-on-warm often FEELS unreadable
- When in doubt, use neutral

### 7.3 Section Rhythm (Not Monotonous)

**Bad rhythm:** Every section has 48px padding. Page feels like a metronome.

**Good rhythm:**
- Hero: 80-120px vertical padding
- Major sections: 64-80px vertical padding
- Subsections: 32-48px vertical padding
- Content within sections: 16-24px gaps

The page should have BIG pauses (between major sections) and small pauses (within sections). Not all the same.

### 7.4 Button/CTA Hierarchy

**Every screen needs ONE clear primary action.**

| Button Type | Visual Treatment |
|-------------|------------------|
| Primary | Filled with accent color, largest, most prominent |
| Secondary | Outlined or ghost, clearly subordinate |
| Tertiary | Text-only or very subtle |

**If two buttons sit side by side and look equal = FAIL**
One must be obviously primary. The user shouldn't have to think about which to click.

### 7.5 Card Differentiation

**Not all cards should look identical.**

If you have:
- Feature cards
- Testimonial cards
- Pricing cards
- Content cards

They should have subtle visual differences (padding, border treatment, background tint, layout).

Cards of the SAME type should be consistent. Different TYPES should be distinguishable.

### 7.6 Visual Variety

**Avoid:** Same card → same spacing → same card → same spacing (monotonous)

**Create variety through:**
- Background color changes between sections
- Different container treatments (some cards, some full-bleed)
- Alternating layouts (left-right-left or grid-list-grid)
- Visual "moments" (an illustration, a different component type)

### 7.7 The Squint Test (Final Check)

Before shipping, squint at your page:

- [ ] Can you instantly see what's most important?
- [ ] Does your eye have a clear path through the content?
- [ ] Is there visual variety, or does it all blur together?
- [ ] Are there 2-3 "moments" that catch your attention?
- [ ] Is there one obvious thing to click/do?

If everything looks the same weight, go back and make the hierarchy more dramatic.

---

## QUICK AUDIT CHECKLIST

### Before Shipping, Verify:

**Contrast**
- [ ] All body text passes 4.5:1 contrast
- [ ] No gray text lighter than `#4B5563` on white
- [ ] Placeholder text is readable
- [ ] Text over images/gradients has sufficient contrast
- [ ] Colored text on colored backgrounds is either removed OR extremely high contrast

**Typography**
- [ ] Body text is minimum 16px
- [ ] Line height is 1.5+ for body text
- [ ] Font weight is 400+ for text under 24px
- [ ] Heading hierarchy uses consistent scale
- [ ] Line length is constrained (max ~65ch)
- [ ] Headlines are 2-3x body size (DRAMATIC hierarchy)

**Spacing**
- [ ] All values are multiples of 4px
- [ ] Cards have minimum 16px padding
- [ ] Internal padding < gap between cards < gap between sections
- [ ] Sparse content has tighter spacing; dense content has more
- [ ] Section spacing varies (major vs minor sections)
- [ ] Nothing feels disconnected/floating OR cramped/cluttered

**Touch Targets**
- [ ] Buttons are minimum 44px (48px mobile)
- [ ] Icon buttons are 44×44px
- [ ] Form inputs are 44px height
- [ ] Clickable areas have adequate spacing

**Responsive**
- [ ] Works on 320px width (small phones)
- [ ] Touch targets increase on mobile
- [ ] Content reflows appropriately
- [ ] No horizontal overflow

**Composition (The Squint Test)**
- [ ] ONE clear focal point per screen section
- [ ] Headlines DOMINATE (not just slightly larger)
- [ ] ONE obvious primary CTA (not equal buttons)
- [ ] Visual variety between sections (not all identical cards)
- [ ] Page has rhythm (varied spacing, not monotonous)
- [ ] Clear visual path through the content

---

## APPLYING FIXES

### Priority Order

**Fix compositional issues FIRST, then technical:**

1. **Visual hierarchy** - Make headlines dramatically larger, establish clear focal points
2. **Section rhythm** - Vary spacing between major/minor sections
3. **CTA hierarchy** - Make primary action obvious
4. **Contrast issues** - Fix accessibility problems
5. **Typography scale** - Ensure minimums and consistency
6. **Spacing values** - Normalize to 4px grid
7. **Touch targets** - Ensure adequate sizing

**Why compositional first?**
Phase 1 technical fixes (like "make all text 16px") can make compositional problems WORSE by making everything more same-y. Fix the hierarchy and rhythm first, then ensure the values are technically correct.

### Implementation Pattern

When fixing an existing interface:

```
1. Squint test - identify hierarchy/composition problems
2. Fix headline sizes (make them DRAMATICALLY larger)
3. Fix section spacing (vary major vs minor)
4. Fix CTA hierarchy (one obvious primary)
5. Then audit technical values (contrast, minimums, grid)
6. Test on mobile viewport
7. Final squint test - does it pass?
```

---

## CSS VARIABLES TEMPLATE

Copy this into your `globals.css` or `:root`:

```css
:root {
  /* === TYPOGRAPHY SCALE === */
  --text-xs: clamp(0.75rem, 0.71rem + 0.22vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.82rem + 0.27vw, 1rem);
  --text-base: clamp(1rem, 0.93rem + 0.33vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1.04rem + 0.42vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.14rem + 0.54vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.36rem + 0.71vw, 1.875rem);
  --text-3xl: clamp(1.875rem, 1.68rem + 0.93vw, 2.25rem);
  --text-4xl: clamp(2.25rem, 1.96rem + 1.43vw, 3rem);
  --text-5xl: clamp(3rem, 2.57rem + 2.14vw, 4rem);
  
  /* === SPACING SCALE === */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  
  /* === SAFE COLORS === */
  /* Light mode text (on white/light backgrounds) */
  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-tertiary: #4B5563;
  --color-text-muted: #6B7280; /* Use sparingly, meets 4.5:1 */
  
  /* Dark mode text (on dark backgrounds) */
  --color-text-on-dark: #F9FAFB;
  --color-text-on-dark-secondary: #E5E7EB;
  
  /* === LINE HEIGHTS === */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  
  /* === SIZING === */
  --min-touch-target: 44px;
  --min-button-height: 44px;        /* Not 40px - Apple HIG is 44pt */
  --min-button-height-mobile: 48px;
  --min-button-height-primary: 48px; /* Primary CTAs should be larger */
  --max-content-width: 65ch;
  --max-page-width: 1200px;
  
  /* === HIERARCHY RATIOS === */
  --ratio-headline-to-body: 2.5;    /* Headlines should be 2-3x body */
  --ratio-hero-to-section: 1.5;     /* Hero padding > section padding */
}
```

---

## RESOURCES

- [Utopia.fyi](https://utopia.fyi) - Generate fluid type/space scales
- [Radix Colors](https://www.radix-ui.com/colors) - Accessible color system
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Verify contrast ratios
- [APCA Contrast Calculator](https://www.myndex.com/APCA/) - More accurate contrast algorithm
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Official accessibility standards


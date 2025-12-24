# UX Audit Prompt v3

A behavior-first audit that produces interfaces with strong composition AND technical compliance.

---

## The Complete Prompt

```
Audit and fix this interface using the TWO-PHASE approach below.
Fix Phase 1 (composition) FIRST. Technical fixes can make compositional problems worse.

---

## PHASE 1: COMPOSITION (Do First)

This is where most AI-generated UIs fail. Technical compliance ≠ good design.

### 1.1 Hierarchy Must Be DRAMATIC

The #1 failure mode: everything looks the same.

**Test:** Squint at the page. Can you instantly identify:
- What's most important?
- Where your eye should go first?
- What the primary action is?

If everything blurs together, hierarchy isn't strong enough.

**Rules:**
- Headlines must be 2-3x body text size (not 1.2x)
- Hero headlines DOMINATE: 48-72px desktop, 32-48px mobile, weight 600-700
- Supporting text RECEDES: smaller AND lighter (color or weight, preferably both)
- One primary CTA per screen section - visually dominant (size + color + position)
- If two side-by-side buttons look equal = FAIL

### 1.2 Spacing Creates Rhythm

**Law of Proximity (non-negotiable):**
Space WITHIN a group < space BETWEEN groups.

```
Card padding (16-20px) < card gaps (24px) < section gaps (48-64px)
```

**Spacing must VARY:**
- Hero: 80-120px padding (the most generous)
- Major sections: 64-80px 
- Subsections: 32-48px
- Same spacing everywhere = monotonous rhythm

**Diagnose by feel:**
- Floating/disconnected → gaps too large for content density
- Cramped/cluttered → gaps too small
- Elements feel unrelated → internal padding ≈ external gaps (should differ)

**Content density drives spacing:**
- Sparse (icon + label) → tighter spacing
- Dense (paragraphs, data tables) → more generous spacing

### 1.3 Visual Variety

**Every section cannot be an identical card.**

Differentiate by:
- Size variations (featured items larger)
- Border treatments (some bordered, some borderless, some elevated)
- Background contrasts (alternate white/off-white sections)
- Layout shifts (some full-width, some constrained)
- NOT just color (that's decoration, not differentiation)

**For long pages - create landmarks:**
- Break up scrolling with distinct section treatments
- Use dramatic hero → compact cards → spacious feature → tight list
- The eye needs visual variety to maintain engagement

### 1.4 Color Temperature Contrast

Luminance contrast (WCAG) isn't enough. Warm-on-warm fails perceptually.

**High-risk patterns:**
- Coral/salmon text on peach/warm gradient
- Blue text on blue-tinted background
- Any accent color on non-neutral background

**Safe rule:** Text on colored backgrounds should be NEUTRAL (white or near-black).
Colored text is decorative. Readability is functional.

### 1.5 Mobile Composition

Mobile isn't just "smaller desktop."

**Stack order matters:**
- Headline → subhead → image → CTA (not buried below fold)
- Critical actions within thumb reach (bottom half of screen)

**Touch feedback:**
- Interactive elements need visible pressed/active states
- Buttons should feel responsive (color change, subtle scale)

**Simplify hierarchy:**
- Fewer competing elements per screen
- One focal point, one action, then scroll for more

---

## PHASE 2: TECHNICAL FOUNDATIONS

Apply these AFTER composition is solid.

### 2.1 Contrast & Legibility

**On light backgrounds (#FFF, #F9FAFB):**
- Primary text: #111827 (gray-900) or darker
- Secondary: #374151 (gray-700) or darker
- Tertiary: #4B5563 (gray-600) minimum for readable body
- REJECT: #9CA3AF (gray-400) and lighter

**On dark backgrounds (#111827, #1F2937):**
- Primary: #F9FAFB (gray-50) or lighter
- Secondary: #E5E7EB (gray-200) or lighter

**Font weight:** Body under 24px = weight 400 minimum (never 300/light)

### 2.2 Typography

**Scale (use consistently):**
- 12px: captions, badges only
- 14px: secondary UI, NOT body text  
- 16px: body MINIMUM
- 18-20px: emphasized body, card titles
- 24-30px: section headings
- 36-72px: hero headlines

**Line height:** Body 1.5-1.6. Headlines 1.1-1.3. Buttons 1-1.25.

**Line length:** max-width 65ch (~600px) for readable paragraphs.

### 2.3 Spacing (4px Grid)

All values multiples of 4: ✓ 8, 16, 24, 32, 48, 64 | ✗ 13, 17, 50

**Minimums:**
- Card padding: 16px min (20-24px preferred)
- Button padding: 12px 20px min (8px 16px too tight)
- Gaps: see Phase 1.2 for relationships

### 2.4 Touch Targets

**Non-negotiable:**
- All buttons: 44px height minimum
- Icon buttons: 44×44px
- Form inputs: 44px height
- Mobile primary CTAs: 48-52px, consider full-width

---

## OUTPUT FORMAT

**Phase 1 issues:**
```
WHERE: [section/component]
PROBLEM: [compositional issue]
FIX: [specific change + values]
```

**Phase 2 issues:**
```
FILE: [path] LINE: [#]
CURRENT: [value]
FIX: [exact replacement]
```

---

## IMPLEMENTATION ORDER

1. Fix ALL Phase 1 issues first
2. Then fix Phase 2 issues
3. This order is critical - composition changes affect what technical values should be

---

## FINAL CHECKLIST

After implementing, verify:
- [ ] One clear focal point per section
- [ ] Headlines 2x+ larger than body (dramatic, not subtle)
- [ ] One obvious primary CTA
- [ ] Visual variety between sections (not identical cards)
- [ ] Varied spacing rhythm (hero spacious, subsections tight)
- [ ] Neutral text on colored backgrounds
- [ ] All text passes contrast AND feels readable
```

---

## Quick Reference: The Failures to Avoid

| Pattern | Why It Fails | Fix |
|---------|--------------|-----|
| "Everything is 16px" | No hierarchy | 16px is body MINIMUM; headlines 2-3x larger |
| Same card everywhere | Visual boredom | Vary size, border, background, layout |
| Equal-looking buttons | Unclear action | One button obviously primary |
| Consistent spacing | Monotonous | Hero needs MORE space, subsections less |
| Colored text on colored bg | Warm-on-warm fails | Use neutral text |
| Floating elements | Gaps too large | Tighten gaps to match content density |



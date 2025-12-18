# Taste Implementation Log

This document traces every visual decision in the Reference Matcher (`/match`) back to data extracted from your Are.na UI/UX channel.

## Source Data

- **Channel:** ui-ux-uqgmlf-rw1i (21 blocks)
- **Confidence:** High (21 samples analyzed)
- **Context applied:** `developer-tools` / `saas` (Reference Matcher is a dev tool)
- **Generated:** style-guide.json via extract-styles.ts

---

## Color Decisions

| Element | Value | Source |
|---------|-------|--------|
| Page background | `#F2F0EC` | `contexts.developer-tools.colors.background_primary` |
| Card background | `#FFFFFF` | `common.colors.background_card` |
| Primary text | `#000000` | `common.colors.text_primary` |
| Secondary text | `#434343` | `contexts.developer-tools.colors.text_secondary` |
| Muted text | `#A3A3A3` | `common.colors.text_muted` |
| Accent (buttons) | `#000000` | `common.colors.accent_primary` (minimal aesthetic) |
| Success state | `#4CAF50` | `contexts.saas.colors.success` |

**Note:** The extraction found `accent_primary: #000000` as the most common, reflecting the minimal/professional aesthetic in your references. Context-specific accents varied (productivity: #2563EB, desktop-app: #34D399) but for a dev tool, black felt most aligned.

---

## Border Radius

| Element | Value | Source |
|---------|-------|--------|
| Cards | `12px` | `common.borders.radius_px: 11` → rounded to 12 |
| Small elements | `8px` | `contexts.developer-tools.borders.radius_px: 8` |
| Pills/tags | `9999px` | Full radius (common pattern in references) |

**Anti-pattern avoided:** Sharp corners (0px). Your anti-rules explicitly state: "Avoid sharp, right-angled containers (0px border-radius)"

---

## Spacing

| Element | Value | Source |
|---------|-------|--------|
| Card padding | `20px` | `common.spacing.card_padding: medium` |
| Element gap | `20px` | `common.spacing.element_gap: medium` |
| Page margins | `32px` | `common.spacing.section_margin: medium` |

**Density:** `balanced` (not compact, not airy) — consistent across 100% of extractions.

---

## Typography

| Property | Value | Source |
|----------|-------|--------|
| Font family | System UI (SF Pro) | `common.typography.family_vibe: neo-grotesque` |
| Heading weight | `600` | `common.typography.heading_weight` |
| Body weight | `400` | `common.typography.body_weight` |
| Letter spacing | `normal` | `common.typography.letter_spacing` |

**Mapping:** `neo-grotesque` → `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

This matches SF Pro (Mac), Segoe UI (Windows) — the system fonts that embody neo-grotesque style.

---

## Elevation / Shadows

| Element | Value | Source |
|---------|-------|--------|
| Default cards | Subtle shadow | `contexts.developer-tools.elevation.shadow_presence: subtle` |
| Hovered cards | Lifted shadow | Motion: hover_effect = "lift" |
| Layering | Subtle depth | `contexts.developer-tools.elevation.layering: subtle-depth` |

**Shadow CSS:**
```css
/* Subtle (default) */
box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);

/* Lifted (hover) */
box-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
```

---

## Motion / Animation

| Property | Value | Source |
|----------|-------|--------|
| Duration | `200ms` | `common.motion.duration_ms` |
| Easing | `ease-out` | `common.motion.easing` |
| Hover effect | Lift (translateY) | `common.motion.hover_effect: lift` |

**Applied to:**
- Card hover: `translateY(-2px)` + shadow change
- Button hover: `translateY(-1px)` + color darken
- Drop zone: Border color transition on drag

**Anti-pattern avoided:** Static UI. Your anti-rules state: "Never leave interaction states 'default' or static"

---

## Icons

| Property | Value | Source |
|----------|-------|--------|
| Style | Outlined | `common.icons.style: outlined` |
| Corners | Rounded | `common.icons.corners: rounded` |

Used emoji as simple icons (📸, 📋) which align with the friendly vibe.

---

## Anti-Patterns Avoided

These were explicitly loaded from `anti-rules.md` and shaped decisions:

1. **"Never present data as raw, dense spreadsheets"**
   - → Results shown as visual cards, not a table

2. **"Avoid sharp, right-angled containers (0px border-radius)"**
   - → All containers use 8-12px radius

3. **"Never leave interaction states 'default' or static"**
   - → All interactive elements have hover/active states

4. **"Avoid unstructured, linear information dumps"**
   - → Tags organized by category with color coding
   - → Match results structured with clear hierarchy

5. **"Never use 'Enterprise Drab' color palettes"**
   - → Warm off-white background (#F2F0EC) instead of stark white
   - → Subtle category colors for tags (blue, purple, green, amber)

---

## Gaps / Interpolations

Where extraction data was insufficient, I made educated guesses:

| Gap | Decision | Reasoning |
|-----|----------|-----------|
| Tag category colors | Blue/Purple/Green/Amber | Common in dev tools, visually distinct |
| Error state color | `#DC2626` | Standard, from contexts.b2b |
| Button hover color | `#333333` | 20% lighter than black accent |
| Link underlines | None | Matches minimal aesthetic, cards are obviously clickable |

---

## Confidence Assessment

| Category | Confidence | Sample Size | Notes |
|----------|------------|-------------|-------|
| Colors | High | 21 | Strong consistency in backgrounds/text |
| Typography | High | 21 | neo-grotesque unanimous |
| Spacing | High | 21 | "balanced" unanimous |
| Elevation | High | 21 | Mostly flat/subtle |
| Borders | High | 21 | 11px average, rounded category |
| Motion | Medium | 5 | Inferred from anti-rules, not images |
| Icons | Medium | 21 | Slight variation (outlined dominant) |

---

## What Would Improve This

With more data, I could extract:

1. **Specific accent colors per use case** — Currently defaulted to black
2. **Typography scale** — Exact heading sizes vs body
3. **Animation timing functions** — Custom cubic-bezier values
4. **Dark mode preferences** — Your fintech references use dark mode
5. **Mobile-specific styling** — Different radius/spacing for mobile

---

## Files Modified

| File | Purpose |
|------|---------|
| `web/app/match/page.tsx` | Reference Matcher UI |
| `web/app/api/match/route.ts` | Match API endpoint |
| `src/extract-styles.ts` | Style extraction script |
| `taste-profiles/ui-ux-*/style-guide.json` | Extracted style data |


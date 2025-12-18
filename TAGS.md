# Tag Taxonomy

This document defines the semantic tags used to index Are.na blocks for the reference matcher.

Tags are stored in a local JSON index at `taste-profiles/[channel-slug]/index.json`:

```json
{
  "channel_slug": "ui-ux-abc123",
  "channel_title": "UI/UX",
  "indexed_at": "2024-12-17T...",
  "blocks": [
    {
      "id": 12345678,
      "title": "Dashboard Example",
      "arena_url": "https://www.are.na/block/12345678",
      "image_url": "https://...",
      "tags": {
        "component": ["dashboard", "cards", "metrics"],
        "style": ["dark-mode", "rounded", "gradient"],
        "context": ["saas", "b2b"],
        "vibe": ["premium", "polished"]
      },
      "one_liner": "Dark analytics dashboard with metric cards and soft gradients"
    }
  ]
}
```

---

## Categories

### 🧩 Component
**What UI elements are shown**

| Tag | Description |
|-----|-------------|
| `hero` | Large introductory section, usually with headline + CTA |
| `navbar` | Top navigation bar |
| `footer` | Bottom section with links/info |
| `sidebar` | Vertical navigation panel |
| `cards` | Contained content blocks |
| `dashboard` | Data/analytics overview screen |
| `metrics` | KPI numbers, stats, counters |
| `charts` | Data visualizations (line, bar, pie, etc.) |
| `form` | Input fields, form layouts |
| `modal` | Overlay dialog/popup |
| `toast` | Notification/alert messages |
| `button` | Button designs/states |
| `cta` | Call-to-action elements |
| `pricing` | Pricing tables/cards |
| `testimonials` | Social proof, quotes, reviews |
| `feature-grid` | Feature showcase layout |
| `bento` | Bento box grid layout |
| `gallery` | Image/media grid |
| `profile` | User profile screens |
| `settings` | Settings/preferences UI |
| `onboarding` | First-time user flows |
| `empty-state` | No content/data state |
| `error-state` | Error messages/pages |
| `loading` | Loading states/skeletons |
| `search` | Search interfaces |
| `filters` | Filter/sort controls |
| `table` | Data tables |
| `list` | List views |
| `timeline` | Chronological displays |
| `calendar` | Date/calendar interfaces |
| `map` | Geographic/location UI |

---

### 🎨 Style
**Visual treatment and aesthetic**

| Tag | Description |
|-----|-------------|
| `dark-mode` | Dark background theme |
| `light-mode` | Light/white background theme |
| `glassmorphism` | Frosted glass effect, blur, transparency |
| `neumorphism` | Soft shadows, embossed look |
| `brutalist` | Raw, unpolished, anti-design |
| `minimal` | Stripped down, lots of whitespace |
| `maximal` | Dense, information-rich |
| `rounded` | Significant border-radius (16px+) |
| `sharp` | No or minimal border-radius |
| `gradient` | Color gradients |
| `flat` | No shadows or depth |
| `3d` | Three-dimensional elements |
| `illustrated` | Custom illustrations |
| `photographic` | Photo-heavy design |
| `geometric` | Geometric shapes/patterns |
| `organic` | Natural, flowing shapes |
| `high-contrast` | Strong color contrast |
| `muted` | Subdued, low-saturation colors |
| `neon` | Bright, glowing colors |
| `pastel` | Soft, light colors |
| `monochrome` | Single color palette |
| `duotone` | Two-color palette |

---

### 🏢 Context
**Where would this design be used**

| Tag | Description |
|-----|-------------|
| `landing-page` | Marketing/conversion page |
| `saas` | Software-as-a-service product |
| `mobile-app` | Native mobile application |
| `desktop-app` | Desktop software |
| `marketing` | Promotional/brand content |
| `e-commerce` | Online shopping |
| `fintech` | Financial technology |
| `health` | Healthcare/wellness |
| `productivity` | Task/work management |
| `social` | Social networking |
| `media` | Content/entertainment |
| `developer-tools` | Dev-focused products |
| `b2b` | Business-to-business |
| `b2c` | Business-to-consumer |
| `enterprise` | Large organization focus |
| `startup` | Early-stage company aesthetic |
| `portfolio` | Personal/agency showcase |
| `blog` | Content/article sites |
| `docs` | Documentation sites |

---

### ✨ Vibe
**Emotional quality and feel**

| Tag | Description |
|-----|-------------|
| `playful` | Fun, whimsical, not serious |
| `serious` | Professional, no-nonsense |
| `premium` | High-end, luxury feel |
| `budget` | Accessible, mass-market |
| `trustworthy` | Stable, reliable, secure |
| `edgy` | Boundary-pushing, provocative |
| `calm` | Peaceful, relaxed |
| `energetic` | Dynamic, exciting |
| `friendly` | Approachable, warm |
| `professional` | Business-appropriate |
| `futuristic` | Forward-looking, sci-fi |
| `retro` | Nostalgic, vintage |
| `warm` | Inviting, cozy colors |
| `cold` | Cool, clinical colors |
| `confident` | Bold, assertive |
| `humble` | Understated, modest |
| `bold` | Strong visual impact |
| `subtle` | Refined, delicate |

---

## Usage

### Indexing blocks
```bash
# Index new blocks in a channel
npm run index-blocks -- --channel=ui-ux-abc123

# Re-index all blocks (including already tagged)
npm run index-blocks -- --channel=ui-ux-abc123 --force

# Preview without making changes
npm run index-blocks -- --channel=ui-ux-abc123 --dry-run
```

### How matching works
When you provide a screenshot of your WIP, the reference matcher:
1. Analyzes your screenshot → extracts tags
2. Searches your indexed blocks by matching tags
3. Returns the most relevant references

Example:
- Your WIP: A dark dashboard with charts
- Extracted tags: `dashboard`, `dark-mode`, `charts`, `saas`
- Matched refs: Blocks tagged with similar components/style/context

---

## Extending the taxonomy

To add new tags:
1. Add to the appropriate category in `TAGS.md`
2. Update the `TAG_PROMPT` in `src/index-blocks.ts`
3. Re-run indexing with `--force` to update existing blocks


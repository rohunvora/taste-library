# Arena Refs

**Turn your visual taste into AI-readable rules.**

You collect references in Are.na. This system converts them into structured guidance that makes AI coding assistants (Cursor, Claude, etc.) build interfaces that match your aesthetic.

## 🚀 NEW: Personal Component Library

**Live**: [site-m22udin8q-rohun-voras-projects.vercel.app](https://site-m22udin8q-rohun-voras-projects.vercel.app)

Your Are.na saves → structured, replicable components → auto-organized design system website.

- **26 components** extracted with AI from UI/UX channel
- **104 atoms** (buttons, surfaces, cards, typography) ready to mix and match
- **8 aesthetic families** (Flat Minimal, Soft Gradient, Dark Premium, etc.)
- **Copy-paste CSS** for every component and atom
- **Export** to `.cursorrules`, CSS variables, or Tailwind config

### Quick Start: Extract Your Own Components

```bash
# Extract components from your Are.na channel
npx tsx cli/extract-component.ts --channel=your-channel-slug

# Start the site locally
cd site && npm install && npm run dev
```

---

**Original Web App**: [arena-refs.vercel.app](https://arena-refs.vercel.app)

---

## What This Enables (Plain English)

**The problem:** AI coding assistants are "blind" — they generate technically correct but visually generic interfaces. They don't know your taste.

**The solution:** 
1. You curate visual references in Are.na (screenshots of UI you love)
2. This system analyzes them and extracts patterns (colors, spacing, typography, vibe)
3. It generates rules you paste into Cursor that make the AI build like you would

**End result:** Instead of getting generic "AI slop" interfaces, you get UIs that feel designed because they're guided by your actual preferences.

---

## What's In This Repo

### 🎯 Core Tools (Web App)

| Tool | URL | What it does |
|------|-----|--------------|
| **Reference Matcher** | `/` | Drop a screenshot of your WIP → get relevant references from your indexed collection |
| **Block Classifier** | `/classify` | Tinder-style swipe interface for organizing Are.na blocks |

### 📐 UX Foundations (Universal Audit System)

A framework for ensuring ANY interface has proper readability, sizing, and composition — regardless of style.

| File | Purpose |
|------|---------|
| `UX_FOUNDATIONS.md` | Complete reference: contrast ratios, type scales, spacing systems, touch targets |
| `PROMPT_UX_AUDIT_V3.md` | **Ready-to-use prompt** — paste into Cursor to audit/fix any interface |
| `CURSORRULES_UX_FOUNDATIONS.md` | Snippet for your `.cursorrules` file |

**The V3 prompt catches:**
- Weak visual hierarchy ("everything looks the same")
- Poor contrast (especially warm-on-warm color combos)
- Monotonous spacing (no rhythm between sections)
- Unclear CTAs (buttons that don't stand out)
- Mobile composition issues

### 🎨 Taste Extraction Pipeline

The system that converts Are.na channels into structured taste profiles:

```
Are.na Channel → Gemini Analysis → Structured Tags → Cursor Rules
```

| File | Purpose |
|------|---------|
| `src/classifier.ts` | Prompts that analyze images for visual patterns |
| `TAGS.md` | The taxonomy (component, style, context, vibe) |
| `taste-profiles/` | Generated outputs per channel (gitignored) |
| `TASTE_IMPLEMENTATION.md` | Example: how we traced visual decisions back to Are.na data |

---

## Quick Start

### Use the UX Audit (No Setup Required)

1. Open `PROMPT_UX_AUDIT_V3.md`
2. Copy the entire prompt
3. Paste into Cursor with your project open
4. Run in Agent mode
5. Review and approve the fixes

### Index Your Own Are.na Channel

```bash
# 1. Set up environment
cp .env.example .env
# Add: ARENA_TOKEN, ARENA_USER_SLUG, GEMINI_API_KEY

# 2. Install and build
npm install
npm run build

# 3. Index a channel
npm run index-blocks -- --channel=your-channel-slug

# 4. Run the web app
cd web && npm install && npm run dev
```

---

## Architecture

```
arena-refs/
├── core/                     # Platform-agnostic logic (can be imported anywhere)
│   ├── arena-client.ts       # Are.na API wrapper
│   ├── matcher.ts            # Image → reference matching
│   └── classifier.ts         # Block classification
│
├── web/                      # Next.js web app
│   ├── app/page.tsx          # Reference Matcher (home)
│   ├── app/classify/         # Block Classifier
│   └── lib/theme.ts          # Design tokens
│
├── cli/                      # CLI tools
│   ├── index-blocks.ts       # Index blocks with AI tags
│   └── anti-patterns.ts      # Extract anti-patterns
│
├── taste-profiles/           # Generated indexes (gitignored)
│
├── UX_FOUNDATIONS.md         # Universal readability/sizing reference
├── PROMPT_UX_AUDIT_V3.md     # Ready-to-use audit prompt
└── CURSORRULES_UX_FOUNDATIONS.md  # .cursorrules snippet
```

---

## Tag Taxonomy

When indexing Are.na blocks, each image gets tagged:

| Category | What it captures | Examples |
|----------|------------------|----------|
| `component` | UI elements | dashboard, cards, hero, pricing |
| `style` | Visual treatment | dark-mode, minimal, rounded, gradient |
| `context` | Where it's used | saas, mobile-app, landing-page |
| `vibe` | Emotional quality | premium, playful, professional |

Full taxonomy in [TAGS.md](./TAGS.md).

---

## The UX Audit Prompt Explained

The `PROMPT_UX_AUDIT_V3.md` is a two-phase audit:

**Phase 1: Composition (Do First)**
- Visual hierarchy — is there a clear focal point?
- Spacing rhythm — does the page breathe or feel monotonous?
- CTA clarity — is the primary action obvious?
- Color temperature — does text actually feel readable?

**Phase 2: Technical Foundations (Do Second)**
- Contrast ratios (WCAG compliance)
- Type scale (16px body minimum)
- Touch targets (44px minimum)
- 4px spacing grid

**Why this order?** Technical fixes can make compositional problems worse. "Make everything 16px" creates sameness. Fix the composition first, then ensure technical compliance.

---

## What's Next

- [ ] Auto-generate `.cursorrules` from taste profiles
- [ ] Export taste profiles as downloadable "style packs"
- [ ] Support for more LLMs beyond Gemini
- [ ] Browser extension for quick Are.na capture

---

## Environment Variables

```
ARENA_TOKEN=        # Get from dev.are.na/oauth/applications
ARENA_USER_SLUG=    # Your Are.na username
GEMINI_API_KEY=     # For image analysis
```

---

## License

MIT

# Arena Refs

A composable system for building and querying a personal reference library backed by Are.na.

**Live**: [arena-refs.vercel.app](https://arena-refs.vercel.app)

## What This Is

Two tools:

1. **Reference Matcher** (`/`) - Drop a screenshot of your WIP, get relevant references from your indexed Are.na library
2. **Block Classifier** (`/classify`) - Tinder-like interface for organizing Are.na blocks into channels

The core idea: you curate references in Are.na over time. This system makes them searchable and retrievable when you need them.

## Architecture

```
arena-refs/
├── core/                          # Headless, platform-agnostic logic
│   ├── arena-client.ts            # Are.na API wrapper
│   ├── matcher.ts                 # Image → reference matching
│   ├── classifier.ts              # Block classification
│   ├── types.ts                   # Shared TypeScript types
│   └── index.ts                   # Clean exports
│
├── web/                           # Next.js web app
│   ├── app/
│   │   ├── page.tsx               # Reference Matcher (HOME)
│   │   ├── classify/page.tsx      # Block Classifier
│   │   └── api/                   # API routes
│   ├── components/                # Shared React components
│   └── lib/theme.ts               # Design tokens
│
├── cli/                           # CLI tools (compiled to dist/)
│   ├── index-blocks.ts            # Index blocks with tags
│   ├── anti-patterns.ts           # Extract anti-patterns
│   └── ...
│
├── scripts/                       # Utility scripts
│   ├── archive.js
│   └── cleanup.js
│
└── data/                          # Generated indexes (gitignored)
    └── taste-profiles/
```

## Composable Core

The `core/` directory contains platform-agnostic logic that can be imported by:
- **Web apps** (Next.js, React)
- **Telegram bots**
- **CLI tools**
- **Any Node.js/Deno/Bun application**

Example usage for a Telegram bot:

```typescript
import { ArenaClient, matchImageToReferences } from 'arena-refs/core'

const client = new ArenaClient({ 
  token: process.env.ARENA_TOKEN, 
  userSlug: 'your-username' 
})

// Match an image to references
const matches = await matchImageToReferences(imageBase64, index, { 
  apiKey: process.env.GEMINI_API_KEY 
})
```

## Setup

### 1. Environment Variables

Create `.env` in root:

```
ARENA_TOKEN=your_arena_token
ARENA_USER_SLUG=your_username
GEMINI_API_KEY=your_gemini_key
```

Get your Are.na token: https://dev.are.na/oauth/applications

### 2. Index Your Channel

```bash
npm install
npm run build
npm run index-blocks -- --channel=your-channel-slug
```

This creates `taste-profiles/[channel-slug]/index.json` with tagged blocks.

### 3. Run the Web App

```bash
cd web
npm install
npm run dev
```

- `/` - Reference Matcher (home)
- `/classify` - Block Classifier

## Tag Taxonomy

Each indexed block gets tagged with:

| Category | What it captures | Examples |
|----------|------------------|----------|
| `component` | UI elements present | dashboard, cards, hero, pricing |
| `style` | Visual treatment | dark-mode, minimal, rounded, gradient |
| `context` | Where it would be used | saas, mobile-app, landing-page |
| `vibe` | Emotional quality | premium, playful, professional |

See [TAGS.md](./TAGS.md) for the full taxonomy.

## Reference Matcher Usage

1. Drop a screenshot of what you're building
2. See matched references with explanations like "Clean card layout with thin borders"
3. Click to select which refs to include
4. Double-click to mark one as primary
5. Download images (ref-1.jpg, ref-2.jpg...)
6. Copy the minimal prompt
7. In Cursor: paste prompt + attach the images

The prompt looks like:

```
I'm building a dashboard with metrics. Here are references from my collection:

1. [attach ref-1.jpg] - Clean card layout with thin borders (PRIMARY)
2. [attach ref-2.jpg] - Similar metrics styling

Match the aesthetic of #1. Use the others as supporting context.
```

## CLI Tools

```bash
# Index blocks for matching
npm run index-blocks -- --channel=ui-ux-abc123

# Extract anti-patterns (what you don't like)
npm run anti-patterns -- --channel=ui-ux-abc123

# Extract visual styles
npm run extract-styles -- --channel=ui-ux-abc123
```

## Design System

The web app uses a unified design system with:

- Warm light theme (`#F2F0EC` background)
- System fonts for performance
- 12px border radius (rounded)
- Subtle shadows
- 200ms ease-out transitions

Design tokens available in:
- CSS: `web/app/globals.css`
- JavaScript: `web/lib/theme.ts`

## License

MIT

# Arena Lib

Tools to organize your Are.na account and extract taste profiles for AI-assisted work.

## The Idea

In the AI-assisted age, **having the best reference materials yields the best AI outputs**. This project:

1. Helps you organize/classify your Are.na blocks into curated channels
2. Extracts "anti-patterns" (what you *don't* like) from those channels
3. Turns your taste into actionable rules for AI prompts

The thesis: instead of prescribing a single aesthetic, focus on **what you consistently reject**. Anti-patterns act as universal guardrails that work across varied projects.

---

## What's Here

### 1. Classifier Web App

A mobile-first app for rapidly categorizing your Are.na blocks.

**Features:**
- 📱 Mobile-optimized for power sessions
- 🔄 Cross-device sync (progress saved in Are.na, not localStorage)
- 🏷️ Filter by type: Images, Links, Text, Media
- 🔍 Tap to expand images or read full text
- ⚡ Instant actions (optimistic UI)
- ↩️ Undo last action
- ➕ Create new channels on the fly

**Keyboard Shortcuts:**
| Key | Action |
|-----|--------|
| `1-4` | Classify into category |
| `S` | Skip |
| `D` | Delete |
| `N` | New channel |
| `F` | Cycle type filters |
| `Z` | Undo |

### 2. Anti-Pattern Extractor

Analyzes a curated Are.na channel and identifies what you *avoid*.

```bash
npm run anti-patterns -- --channel=your-channel-slug
```

Uses Gemini to:
- Download and analyze images
- Scrape and parse link content
- Read text blocks
- Identify high-confidence anti-patterns with evidence

Output: `taste-profiles/[channel-slug]/anti-rules.md`

### 3. Block Indexer

Semantically tags all visual blocks in a channel for fast reference matching.

```bash
npm run index-blocks -- --channel=your-channel-slug
```

Tags each image with:
- **component**: What UI elements (dashboard, cards, hero, etc.)
- **style**: Visual treatment (dark-mode, rounded, gradient, etc.)
- **context**: Where it would be used (saas, mobile-app, landing-page, etc.)
- **vibe**: Emotional quality (premium, playful, professional, etc.)

Output: `taste-profiles/[channel-slug]/index.json`

See [TAGS.md](./TAGS.md) for the full tag taxonomy.

### 4. Style Extractor

Extracts detailed visual styling properties from your Are.na references.

```bash
npm run extract-styles -- --channel=your-channel-slug
```

Analyzes each image for:
- **Colors**: Background, text, accent, semantic (success/warning/error)
- **Typography**: Font vibe, weights, hierarchy, letter-spacing
- **Spacing**: Density, card padding, element gaps
- **Elevation**: Shadow presence/color, layering approach
- **Borders**: Radius (exact pixels), usage, divider styles
- **Icons**: Outlined vs filled, corner style

Groups extractions by context (mobile-app, saas, etc.) and outputs a unified style guide.

Output: `taste-profiles/[channel-slug]/style-guide.json`

### 5. Reference Matcher

A web app that takes your WIP screenshot and finds relevant references from your Are.na.

```bash
cd web && npm run dev
# Visit http://localhost:3000/match
```

Features:
- 📸 Drag-and-drop screenshot upload
- 🏷️ Extracts tags from your WIP using Gemini
- 🔍 Searches your indexed Are.na blocks by tag similarity
- 📋 One-click "Copy for Cursor" exports formatted markdown

The UI itself is styled using the extracted taste profile — proving the system works!

See [TASTE_IMPLEMENTATION.md](./TASTE_IMPLEMENTATION.md) for how every visual decision traces back to extraction data.

### 6. Archive & Cleanup Scripts

```bash
node archive.js   # Move misc blocks to Archive channel
node cleanup.js   # Empty non-protected channels
```

---

## Project Structure

```
arena-lib/
├── web/                        # Next.js web app
│   ├── app/
│   │   ├── page.tsx            # Classifier UI
│   │   ├── match/page.tsx      # Reference Matcher
│   │   └── api/
│   │       ├── blocks/         # Fetch blocks
│   │       ├── classify/       # Classify block
│   │       └── match/          # Reference matching API
├── src/
│   ├── anti-patterns.ts        # Extract anti-patterns from channel
│   ├── index-blocks.ts         # Semantically tag blocks for matching
│   ├── extract-styles.ts       # Extract detailed visual styles
│   ├── taste-profile.ts        # Generate taste profiles (experimental)
│   ├── arena-client.ts         # Are.na API wrapper
│   └── types.ts                # TypeScript types
├── taste-profiles/             # Generated outputs per channel (gitignored)
│   └── [channel-slug]/
│       ├── anti-rules.md       # Extracted anti-patterns
│       ├── index.json          # Semantic tags for all blocks
│       └── style-guide.json    # Extracted visual styles
├── TAGS.md                     # Tag taxonomy documentation
├── TASTE_IMPLEMENTATION.md     # Traceability log for taste-driven UI
├── archive.js                  # Archive script
├── cleanup.js                  # Cleanup script
└── .env                        # Your API keys (not committed)
```

---

## Setup

### Environment Variables

Create `.env` in the root:

```
ARENA_TOKEN=your_arena_token
ARENA_USER_SLUG=your_username
GEMINI_API_KEY=your_gemini_key
```

Get your Are.na token: https://dev.are.na/oauth/applications

### Install & Build

```bash
npm install
npm run build
```

### Run Anti-Pattern Extraction

```bash
# On a specific channel
npm run anti-patterns -- --channel=ui-ux-abc123

# Default channel (if configured)
npm run anti-patterns
```

### Run the Classifier App

```bash
cd web
npm install
npm run dev
```

---

## How Anti-Pattern Extraction Works

1. **Fetch** all blocks from the specified Are.na channel
2. **Process** each block:
   - Images → downloaded, base64 encoded, sent to Gemini
   - Links → scraped for title, description, and main content
   - Text → passed directly
3. **Analyze** the entire collection as a body of work
4. **Output** high-confidence anti-patterns with evidence

The prompt focuses on *what's absent* from your collection—the things you consistently don't save or would never want.

---

## Example Output

```markdown
## High-Confidence Anti-Patterns

### ❌ Never allow scope creep or 'feature bloat'
**Confidence:** high
**Evidence:** The 'Headline Driven Development' article advocates cutting 
anything that doesn't support the shipping headline...

### ❌ Never target a 'generic' audience  
**Confidence:** high
**Evidence:** Diagram titled 'The Negative Long Tail of a Generic Customer 
Definition' explicitly links generic definitions to failure...
```

---

## Workflow

1. **Collect** — Save interesting things to Are.na over time
2. **Organize** — Use the classifier app to sort into channels
3. **Extract** — Run anti-pattern extraction on curated channels
4. **Apply** — Use the anti-rules in your AI prompts/system prompts

---

## License

MIT

# Arena Classifier

A tool to organize your Are.na blocks into categories. Built for power sessions on mobile.

## 🚀 Live App

**https://web-mw0vif72v-rohun-voras-projects.vercel.app**

## ✅ Next Step: Clean Up Your Data

The classifier is ready. Open it on your phone and start sorting:

1. **Open the app** on your phone (works great in Safari/Chrome)
2. **Filter by type** - tap 🖼️ Images, 🔗 Links, 📝 Text, or 🎬 Media to focus
3. **Classify each block** into: UI/UX, Writing, Code, or Thinking
4. **Skip** anything you want to deal with later (goes to "Classifier - Skipped" channel)
5. **Delete** anything you don't want anymore
6. **Create new channels** on the fly if needed

### Keyboard Shortcuts (desktop)
- `1-4` - Classify into category
- `S` - Skip
- `D` - Delete  
- `N` - New channel
- `F` - Cycle filters
- `Z` - Undo
- `Escape` - Close modals

### Features
- **Cross-device sync** - progress saved in Are.na itself, not localStorage
- **Instant actions** - optimistic UI, no waiting
- **Tap to expand** - view full images or read complete text
- **Undo** - reverse your last action
- **Type filters** - batch process by content type

## Project Structure

```
arena-lib/
├── web/                    # Next.js classifier app (deployed to Vercel)
│   ├── app/
│   │   ├── page.tsx       # Main classifier UI
│   │   └── api/           # API routes
│   │       ├── blocks/    # Fetch unclassified blocks
│   │       ├── classify/  # Add block to channel
│   │       ├── skip/      # Add to Skipped channel
│   │       ├── delete/    # Remove block from all channels
│   │       └── undo/      # Reverse last action
│   └── ...
├── src/                    # Original auto-classifier scripts (not used)
└── ...
```

## Environment Variables

Set these in Vercel (already configured):

```
ARENA_TOKEN=your_personal_access_token
ARENA_USER_SLUG=your_username
```

## Development

```bash
cd web
npm install
npm run dev
```

## Deployment

```bash
cd web
vercel --prod
```

# UI/UX Implementation Guide Extraction Prompt

Use this prompt with a vision model (GPT-4o, Claude, Gemini) to extract implementation knowledge from UI screenshots.

---

```
You are extracting IMPLEMENTATION KNOWLEDGE from a UI reference.

Your output should be a guide that someone could paste into a system prompt 
and immediately build something in this style - without ever seeing the original image.

Think like a design system architect: what are the RULES that make this work?

=== OUTPUT FORMAT ===

## [NAME]
A memorable 2-4 word handle (e.g., "Material-First Mobile", "Soft Data Dashboard", "Editorial Minimalism")

## Essence
One sentence capturing WHY this works, not just what it looks like. What's the core design principle?

## Key Techniques

### Surface Treatment
How do containers and backgrounds behave? BE SPECIFIC with CSS:

```css
/* Background */
background: [exact approach - solid color, gradient, texture];

/* Containers */  
border-radius: [exact value like 12px, 16px, 24px, or 9999px for pills];
box-shadow: [exact shadow values];
border: [if present];

/* The cohesion recipe - what makes elements feel unified */
```

### Typography System
- Font approach: [serif + sans, all geometric sans, humanist, etc.]
- Size scale: [approximate sizes for h1/h2/body/labels]
- Weight usage: [when bold vs regular vs light]
- Distinctive moves: [pill badges, all-caps labels, letter-spacing tricks]
- Color treatment: [how text color varies - primary/secondary/muted values]

### Color Logic
- Mode: [light/dark]
- Background: [specific color or approach]
- Text: [primary and secondary colors]
- Accent: [color and WHERE it appears - buttons only? highlights? badges?]
- The rule: [one sentence on how color creates hierarchy]

### Layout & Spacing
- Density: [minimal/balanced/dense] - why it works here
- Grid/spacing unit: [8px, 16px base, etc.]
- Container padding: [internal spacing]
- Gap between elements: [spacing between cards/sections]
- Chunking strategy: [how information is grouped]

### Component Patterns
Steal these specific patterns:
- **Navigation**: [exact approach - bottom tabs with X style icons, sidebar, etc.]
- **Buttons**: [shape, fill approach, specific radius]
- **Cards**: [if present - how they're constructed]
- **Data display**: [how metrics/numbers are shown]
- **Icons**: [outlined/filled, weight, any distinctive treatment]

## Use This When
Be specific about contexts where this EXCELS:
- [Product type + why]
- [User type + why]  
- [Data characteristics + why]
- [Emotional goal + why]

## Avoid This When
Be specific about contexts where this FAILS:
- [Situation + why it breaks]
- [Situation + why it breaks]
- [Situation + why it breaks]

## Adaptation Recipes

### → Dashboard
Specific changes to make this work for data-heavy interfaces:
- [Concrete adjustment 1]
- [Concrete adjustment 2]

### → Landing Page  
Specific changes for marketing/conversion:
- [Concrete adjustment 1]
- [Concrete adjustment 2]

### → Mobile ↔ Web
Platform-specific adjustments:
- [Mobile: specific change]
- [Web: specific change]

### → Invert Color Mode
If this is light mode, how to make it dark (or vice versa):
- [Specific color inversions]
- [Shadow/depth adjustments]
- [What stays the same]

---

=== CRITICAL RULES ===

1. **CSS VALUES ARE REQUIRED** for surface treatment. Don't say "rounded corners" - say "border-radius: 16px". Don't say "subtle shadow" - say "box-shadow: 0 2px 8px rgba(0,0,0,0.06)".

2. **TRANSFERABLE > SPECIFIC**. Extract the SYSTEM, not the specifics. "Accent color only on primary CTAs and active states" is better than "use #3B82F6".

3. **INDEPENDENCE TEST**: Could someone implement this style without seeing the image? If not, add more detail.

4. **USE/AVOID ARE CRITICAL**. These turn a description into a decision tool. Be opinionated.

5. **ADAPTATION = RECIPES**. Don't say "adjust for mobile". Say "increase touch targets to 44px, stack cards vertically, move nav to bottom".

6. **IDENTIFY THE SYSTEM**. If multiple screens shown, what's CONSISTENT? That's the design language.

7. **ACTIONABLE VOICE**. Write as instructions to a developer. "Use X" not "The design uses X".
```

---

## Example Output

For reference, here's what a good output looks like:

```markdown
## Material-First Mobile

## Essence
Everything feels like a physical object under light - not literal skeuomorphism, but borrowing the logic of how light behaves on real surfaces to create depth and tactility.

## Key Techniques

### Surface Treatment
- Background: Subtle vertical pinstripe/noise texture on main background
- Containers: Every card uses THREE depth cues together:
  ```css
  .card {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border: 1px solid rgba(255,255,255,0.1);
    /* Inner highlight for bevel effect */
    box-shadow: 
      0 4px 12px rgba(0,0,0,0.15),
      inset 0 1px 0 rgba(255,255,255,0.15);
  }
  ```
- Nav bars: Dark linear gradient (not solid) with crisp 1px highlight on edges

### Typography System
- Section headers as pill-shaped badges (full border-radius capsules)
- Can handle high density because cards create visual separation
- High contrast text on card backgrounds
- Mix of weights: bold for primary metrics, regular for labels

### Color Logic
- Muted, slightly warm base palette
- Accents used sparingly (type badges, status indicators only)
- Gradients are subtle, never loud
- Each card can have its own subtle tint

### Layout & Spacing
- High density but organized - aggressive chunking into cards
- Each card = one concept
- 16-20px padding inside cards
- 12px gaps between cards

### Component Patterns
- Bottom nav with "pressable" icon tiles (gradient fill + shadow)
- Buttons feel pushable with gradient and inset highlight
- Data shown in discrete labeled sections within cards

## Use This When
- Mobile apps with rich structured data (collector apps, trackers)
- Gaming/entertainment contexts where engagement matters
- When you need to make dense data feel premium and explorable
- Catalog/database interfaces on mobile

## Avoid This When
- Long-form reading (too much visual noise)
- Minimal/zen aesthetic goals (this is maximalist in spirit)
- Enterprise B2B (too playful for corporate)
- When speed/efficiency is the primary goal (decoration adds friction)

## Adapting to Context

### For a Dashboard
Keep card system and triple-depth treatment. Data viz should also feel tactile (rounded bar charts, soft glows on metrics). Reduce texture on background for less noise.

### For a Landing Page
Use surface treatment on hero/feature cards. Metal nav might be too heavy - consider lighter glass treatment. Keep pill-badges for CTAs.

### For Mobile vs Web
On web, scale up radius slightly (20-24px). Cards can be larger. Principles transfer but density should decrease. Nav becomes top/side instead of bottom.

### For Dark Mode
Principles transfer directly. Inner highlights become MORE important (rgba 255,255,255,0.05-0.15). Shadows can be darker/more dramatic. Texture more subtle.
```


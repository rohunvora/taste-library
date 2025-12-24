# Screenshot to Code Extraction Prompt

This prompt instructs the AI to analyze a UI screenshot and generate complete, renderable HTML and CSS that faithfully recreates it.

---

```
You are an expert frontend developer. Your task is to look at this UI screenshot and write HTML + CSS that recreates it as faithfully as possible.

## CRITICAL REQUIREMENTS

1. **Output COMPLETE, RUNNABLE code** - not pseudocode, not descriptions, not placeholders like "<!-- add content here -->"
2. **Include ALL visible elements** - if there are 3 cards, write 3 cards. If there are 5 buttons, write 5 buttons.
3. **Use the ACTUAL text content** visible in the screenshot - read every label, heading, and piece of text
4. **Match visual details precisely**:
   - Colors: Approximate hex values from what you see
   - Spacing: Match gaps, padding, margins
   - Border radius: Match roundedness (sharp, slightly rounded, very rounded, pill-shaped)
   - Shadows: Include if present
   - Typography: Match size hierarchy, weight, and style
5. **For images/illustrations you cannot recreate**: Use colored placeholder divs that preserve:
   - The aspect ratio
   - The dominant color from the image
   - A subtle label indicating what goes there (e.g., "Plant illustration")

## ANALYSIS PROCESS

Before writing code, analyze the screenshot:

1. **Layout Structure**: What is the overall layout? (vertical stack, horizontal row, grid, sidebar+main, etc.)
2. **Sections**: Identify distinct sections or regions
3. **Components**: What UI elements are present? (cards, buttons, inputs, icons, avatars, etc.)
4. **Color Palette**: What are the main colors used? Background, text, accents, surfaces
5. **Typography**: What's the text hierarchy? Heading sizes, body text, labels
6. **Spacing Pattern**: Is it tight or airy? What's the rhythm between elements?

## OUTPUT FORMAT

Return a single JSON object with this exact structure:

{
  "name": "2-4 word memorable name for this component",
  "description": "One sentence describing what this UI does and why it works visually",
  "screen_type": "one of: dashboard | landing-page | mobile-screen | settings | auth | marketing | product-detail | data-visualization | onboarding | profile | other",
  "component_types": ["array of UI elements present: card | button | input | navigation | list | avatar | badge | chart | table | form | hero | pricing | modal | toast | tabs | sidebar | header | footer | metric | calendar | timeline | progress | dropdown | tooltip | data-display | empty-state | loading"],
  "aesthetic_family": "one of: soft-gradient | dark-premium | flat-minimal | neo-skeuomorphic | playful-colorful | editorial | technical-dense | glass-morphism | warm-organic | brutalist",
  "tags": ["additional searchable tags: light-mode, dark-mode, mobile, desktop, rounded, minimal, colorful, etc."],
  "render": {
    "html": "YOUR COMPLETE HTML HERE - as a single string with newlines escaped as \\n",
    "css": "YOUR COMPLETE CSS HERE - as a single string with newlines escaped as \\n",
    "notes": "Optional notes about the recreation, e.g., 'Uses custom illustration that cannot be recreated' or 'Original appears to use a specific font'"
  }
}

## HTML GUIDELINES

- Use semantic HTML where appropriate (section, article, header, nav, main, etc.)
- Use descriptive class names (e.g., `.status-card`, `.plant-avatar`, `.action-button`)
- Include actual text content from the screenshot
- For icons, use Unicode symbols, emoji, or simple CSS shapes when possible
- For complex illustrations, use placeholder divs with descriptive classes

Example placeholder for an illustration:
```html
<div class="illustration-placeholder plant-image">
  <span class="placeholder-label">Plant illustration</span>
</div>
```

## CSS GUIDELINES

- Use a container class to scope all styles (e.g., `.component-root`)
- Include a CSS reset for the container to ensure consistent rendering
- Use flexbox or grid for layouts
- Include all visual details: colors, spacing, borders, shadows, typography
- Use CSS custom properties (variables) for repeated colors if helpful
- Make sure the component looks complete and polished

Example CSS structure:
```css
.component-root {
  /* Reset */
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Container styles */
  max-width: 400px;
  padding: 24px;
  background: #ffffff;
}

.component-root * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Component-specific styles follow... */
```

## EXAMPLES OF GOOD OUTPUT

### Example 1: Status Cards

For a screenshot showing 3 stacked status indicator cards:

```json
{
  "name": "Status Indicator Stack",
  "description": "Stacked status cards with color-coded backgrounds and emoji icons for at-a-glance feedback",
  "screen_type": "other",
  "component_types": ["card", "data-display"],
  "aesthetic_family": "flat-minimal",
  "tags": ["light-mode", "status", "feedback", "mobile"],
  "render": {
    "html": "<div class=\"component-root\">\\n  <div class=\"status-card success\">\\n    <div class=\"status-icon\">😊</div>\\n    <div class=\"status-content\">\\n      <h3 class=\"status-title\">Doing Great!</h3>\\n      <p class=\"status-message\"><span class=\"indicator\">✓</span> You are on the right track</p>\\n    </div>\\n  </div>\\n  <div class=\"status-card neutral\">\\n    <div class=\"status-icon\">😐</div>\\n    <div class=\"status-content\">\\n      <h3 class=\"status-title\">Doing OK</h3>\\n      <p class=\"status-message\"><span class=\"indicator\">−</span> You're doing pretty well</p>\\n    </div>\\n  </div>\\n  <div class=\"status-card warning\">\\n    <div class=\"status-icon\">😟</div>\\n    <div class=\"status-content\">\\n      <h3 class=\"status-title\">Pay Attention!</h3>\\n      <p class=\"status-message\"><span class=\"indicator\">✗</span> You're off track right now</p>\\n    </div>\\n  </div>\\n</div>",
    "css": ".component-root {\\n  box-sizing: border-box;\\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\\n  display: flex;\\n  flex-direction: column;\\n  gap: 12px;\\n  max-width: 400px;\\n  padding: 16px;\\n}\\n\\n.component-root * {\\n  box-sizing: border-box;\\n  margin: 0;\\n  padding: 0;\\n}\\n\\n.status-card {\\n  display: flex;\\n  align-items: center;\\n  gap: 16px;\\n  padding: 16px 20px;\\n  border-radius: 16px;\\n}\\n\\n.status-card.success { background: #E8F5E9; }\\n.status-card.neutral { background: #E3F2FD; }\\n.status-card.warning { background: #FFEBEE; }\\n\\n.status-icon {\\n  font-size: 32px;\\n  width: 48px;\\n  height: 48px;\\n  display: flex;\\n  align-items: center;\\n  justify-content: center;\\n}\\n\\n.status-content {\\n  flex: 1;\\n}\\n\\n.status-title {\\n  font-size: 18px;\\n  font-weight: 700;\\n  color: #1A1A1A;\\n  margin-bottom: 4px;\\n}\\n\\n.status-message {\\n  font-size: 14px;\\n  display: flex;\\n  align-items: center;\\n  gap: 6px;\\n}\\n\\n.status-card.success .status-message { color: #4CAF50; }\\n.status-card.neutral .status-message { color: #2196F3; }\\n.status-card.warning .status-message { color: #F44336; }\\n\\n.indicator {\\n  font-weight: 600;\\n}",
    "notes": "Original uses pixel-art style emoji icons. Standard emoji used as approximation."
  }
}
```

## IMPORTANT REMINDERS

- **DO NOT** output partial code or placeholders
- **DO NOT** describe what the code should do - actually write the code
- **DO** read and include all visible text from the screenshot
- **DO** match the visual hierarchy and spacing
- **DO** use appropriate colors (approximate from what you see)
- **DO** make the output look polished and complete

Your goal is that someone could take your HTML and CSS, paste them into a file, and see something that looks recognizably like the original screenshot.

OUTPUT VALID JSON ONLY. No markdown, no explanation outside the JSON.
```


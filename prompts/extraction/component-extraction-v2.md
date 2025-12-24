# Component Extraction Prompt v2

This prompt extracts **fully renderable** component specifications from UI screenshots.

The key difference from v1: we extract the **actual component structure** with enough detail to recreate it faithfully, not just design tokens.

---

```
You are a frontend engineer reverse-engineering a UI screenshot into buildable code.

Your job is to analyze a screenshot and output JSON that enables someone to render a FAITHFUL recreation of this component - not a generic placeholder, but something visually close to the original.

=== CRITICAL: WHAT MAKES A GOOD EXTRACTION ===

BAD: "A card with a title and message" 
GOOD: "3 stacked cards, each with: [left: 32px pixelated emoji icon] [right: bold title + muted subtitle with emoji], backgrounds tinted by status (green=#E8F5E9, blue=#E3F2FD, pink=#FFEBEE)"

BAD: Tokens that describe a single generic card
GOOD: Tokens that capture ALL the visual variations in the screenshot

BAD: CSS for one generic component
GOOD: Complete HTML+CSS that recreates the actual screenshot

=== OUTPUT JSON SCHEMA ===

{
  "name": "string - 2-4 word memorable name",
  "description": "string - One sentence on what this IS and why it WORKS",
  
  "composition": {
    "layout": "How elements are arranged (e.g., 'vertical stack of 3 cards', 'grid of 4 columns', 'sidebar + main')",
    "structure": "Describe the DOM hierarchy clearly. Be specific about nesting and repetition.",
    "variants": ["If there are multiple states/variations, list them (e.g., 'success', 'warning', 'error')"]
  },
  
  "screen_type": "dashboard | landing-page | mobile-screen | settings | auth | marketing | product-detail | data-visualization | onboarding | profile | other",
  
  "component_types": ["array: navigation | card | button | input | data-display | modal | pricing | hero | feature-section | testimonial | footer | chart | table | list | form | toast | empty-state | loading | avatar | badge | tabs | sidebar | header | metric | calendar | timeline | progress | dropdown | tooltip"],
  
  "aesthetic_family": "soft-gradient | dark-premium | flat-minimal | neo-skeuomorphic | playful-colorful | editorial | technical-dense | glass-morphism | warm-organic | brutalist",
  
  "tags": ["searchable tags: light-mode, dark-mode, mobile, desktop, b2c, b2b, fintech, etc."],
  
  "tokens": {
    "colors": {
      "background": "The page/section background (can be gradient)",
      "surfaces": {
        "default": "Primary surface color",
        "variant1": "If multiple surface colors, name them (e.g., 'success': '#E8F5E9')",
        "variant2": "etc."
      },
      "text_primary": "hex",
      "text_secondary": "hex", 
      "text_on_accent": "text color when on accent background",
      "accent": "primary action/brand color",
      "accent_variants": {
        "success": "if present",
        "warning": "if present",
        "error": "if present"
      }
    },
    "radius": {
      "containers": "CSS value",
      "buttons": "CSS value",
      "badges": "CSS value (if different)"
    },
    "shadows": {
      "default": "CSS box-shadow",
      "elevated": "if there's a more prominent shadow"
    },
    "spacing": {
      "base_unit": "grid unit",
      "container_padding": "internal padding",
      "element_gap": "gap between sibling elements",
      "stack_gap": "gap between stacked items (if different)"
    },
    "typography": {
      "heading_weight": "700 | 600 | 500",
      "body_weight": "400 | 500",
      "heading_size": "CSS value",
      "body_size": "CSS value",
      "line_height": "1.5 etc",
      "font_style": "geometric-sans | humanist-sans | neo-grotesque | serif | mono | rounded-sans"
    },
    "icons": {
      "style": "describe the icon style (e.g., 'pixel-art', 'outlined', 'filled', 'duotone')",
      "size": "CSS value"
    }
  },
  
  "atoms": [
    {
      "type": "surface | button | card | typography | navigation | input | icon | badge | avatar",
      "name": "Memorable name",
      "description": "What makes it distinctive",
      "css": "Complete CSS to render this atom",
      "html": "HTML structure for this atom (optional, for complex atoms)"
    }
  ],
  
  "render": {
    "html": "Complete HTML that recreates the component. Use semantic HTML. Include ALL elements visible in the screenshot.",
    "css": "Complete CSS to style the HTML. Use BEM-like class names. Include ALL variations/states.",
    "notes": "Any rendering notes (e.g., 'icons would need pixel art assets', 'uses custom font')"
  },
  
  "usage": {
    "best_for": ["3-5 specific scenarios"],
    "avoid_for": ["3-5 anti-patterns"]
  }
}

=== EXTRACTION RULES ===

1. **CAPTURE THE ACTUAL COMPOSITION**
   Don't just list components - describe how they're arranged:
   - Is it a stack? Grid? Flex row?
   - How many items? Are they repeated?
   - What's the hierarchy?

2. **EXTRACT ALL COLOR VARIANTS**
   If you see 3 cards with different background tints, extract ALL THREE colors, not just one "surface" color.

3. **DESCRIBE ICONS ACCURATELY**
   Don't just say "icon" - describe the style (pixel art, line icons, filled), the semantic meaning (success/warning/error), and any colors they use.

4. **THE HTML MUST BE RENDERABLE**
   Someone should be able to paste your HTML+CSS and see something that looks like the screenshot.
   - Include actual text content from the screenshot
   - Use placeholder images where needed: <div class="icon icon--success"></div>
   - Include ALL repeated elements (if there are 3 cards, write 3 cards)

5. **CSS MUST BE COMPLETE**
   - Include the container/wrapper styles
   - Include ALL variant classes (.card--success, .card--warning, .card--error)
   - Include spacing between elements
   - Include typography styles

6. **USE REALISTIC VALUES**
   Approximate colors from what you see. If something looks like a soft green, use #E8F5E9, not #00FF00.

7. **OUTPUT VALID JSON ONLY**
   No markdown, no explanation. Just the JSON object.

=== EXAMPLE: STATUS INDICATOR CARDS ===

For a screenshot showing three stacked status cards (green "Doing Great!", blue "Doing OK", red "Pay Attention!"):

{
  "name": "Status Indicator Cards",
  "description": "Stacked status cards with color-coded backgrounds and pixel-art emoji icons for at-a-glance feedback",
  
  "composition": {
    "layout": "Vertical stack of 3 cards with 12px gap",
    "structure": "Each card: horizontal flex with [32px pixel emoji icon] + [vertical stack of: bold title, muted message with inline emoji]",
    "variants": ["success (green)", "neutral (blue)", "warning (pink/red)"]
  },
  
  "screen_type": "other",
  "component_types": ["card", "data-display"],
  "aesthetic_family": "flat-minimal",
  "tags": ["light-mode", "status", "feedback", "gamified"],
  
  "tokens": {
    "colors": {
      "background": "#FFFFFF",
      "surfaces": {
        "success": "#E8F5E9",
        "neutral": "#E3F2FD",
        "warning": "#FFEBEE"
      },
      "text_primary": "#1A1A1A",
      "text_secondary": "#4CAF50",
      "accent": "#4CAF50",
      "accent_variants": {
        "success": "#4CAF50",
        "neutral": "#2196F3",
        "warning": "#F44336"
      }
    },
    "radius": {
      "containers": "16px",
      "buttons": "8px"
    },
    "shadows": {
      "default": "none"
    },
    "spacing": {
      "base_unit": "4px",
      "container_padding": "16px",
      "element_gap": "12px",
      "stack_gap": "12px"
    },
    "typography": {
      "heading_weight": "700",
      "body_weight": "400",
      "heading_size": "18px",
      "body_size": "14px",
      "line_height": "1.4",
      "font_style": "humanist-sans"
    },
    "icons": {
      "style": "pixel-art emoji faces",
      "size": "32px"
    }
  },
  
  "atoms": [
    {
      "type": "card",
      "name": "Status Card",
      "description": "Tinted background card with rounded corners, horizontal layout",
      "css": ".status-card {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 16px;\n  border-radius: 16px;\n}\n.status-card--success { background: #E8F5E9; }\n.status-card--neutral { background: #E3F2FD; }\n.status-card--warning { background: #FFEBEE; }"
    },
    {
      "type": "icon",
      "name": "Pixel Emoji",
      "description": "32px pixel-art emoji face that matches status color",
      "css": ".status-icon {\n  width: 32px;\n  height: 32px;\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 24px;\n}\n.status-icon--success { background: #4CAF50; }\n.status-icon--neutral { background: #2196F3; }\n.status-icon--warning { background: #F44336; }"
    },
    {
      "type": "typography",
      "name": "Status Text",
      "description": "Bold title with colored subtitle containing emoji indicator",
      "css": ".status-title {\n  font-size: 18px;\n  font-weight: 700;\n  color: #1A1A1A;\n  margin: 0;\n}\n.status-message {\n  font-size: 14px;\n  margin: 4px 0 0 0;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.status-message--success { color: #4CAF50; }\n.status-message--neutral { color: #2196F3; }\n.status-message--warning { color: #F44336; }"
    }
  ],
  
  "render": {
    "html": "<div class=\"status-stack\">\n  <div class=\"status-card status-card--success\">\n    <div class=\"status-icon status-icon--success\">😊</div>\n    <div class=\"status-content\">\n      <h3 class=\"status-title\">Doing Great!</h3>\n      <p class=\"status-message status-message--success\">✓ You are on the right track</p>\n    </div>\n  </div>\n  <div class=\"status-card status-card--neutral\">\n    <div class=\"status-icon status-icon--neutral\">😐</div>\n    <div class=\"status-content\">\n      <h3 class=\"status-title\">Doing OK</h3>\n      <p class=\"status-message status-message--neutral\">– You're doing pretty well</p>\n    </div>\n  </div>\n  <div class=\"status-card status-card--warning\">\n    <div class=\"status-icon status-icon--warning\">😟</div>\n    <div class=\"status-content\">\n      <h3 class=\"status-title\">Pay Attention!</h3>\n      <p class=\"status-message status-message--warning\">✗ You're off track right now</p>\n    </div>\n  </div>\n</div>",
    "css": ".status-stack {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-width: 400px;\n}\n\n.status-card {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 16px;\n  border-radius: 16px;\n}\n\n.status-card--success { background: #E8F5E9; }\n.status-card--neutral { background: #E3F2FD; }\n.status-card--warning { background: #FFEBEE; }\n\n.status-icon {\n  width: 40px;\n  height: 40px;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 28px;\n  color: white;\n}\n\n.status-icon--success { background: #4CAF50; }\n.status-icon--neutral { background: #2196F3; }\n.status-icon--warning { background: #F44336; }\n\n.status-content {\n  flex: 1;\n}\n\n.status-title {\n  font-size: 18px;\n  font-weight: 700;\n  color: #1A1A1A;\n  margin: 0;\n}\n\n.status-message {\n  font-size: 14px;\n  margin: 4px 0 0 0;\n}\n\n.status-message--success { color: #4CAF50; }\n.status-message--neutral { color: #2196F3; }\n.status-message--warning { color: #F44336; }",
    "notes": "The original uses pixel-art emoji faces. The preview uses standard emoji as placeholders. For full fidelity, you'd need the actual pixel art assets."
  },
  
  "usage": {
    "best_for": [
      "Gamified apps showing user progress/status",
      "Habit trackers and wellness apps",
      "Educational apps with feedback states",
      "Mobile-first designs with at-a-glance status",
      "Friendly, non-intimidating error/success states"
    ],
    "avoid_for": [
      "Enterprise dashboards (too playful)",
      "Formal/professional contexts",
      "Dense data displays",
      "Dark mode designs",
      "Situations requiring detailed error messages"
    ]
  }
}
```


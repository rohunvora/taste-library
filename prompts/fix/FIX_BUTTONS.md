# Fix Unclear Button Hierarchy

Paste this when: Users don't know which button to click, or all buttons look equally important.

---

## Is This Your Problem?

- [ ] Two side-by-side buttons look the same
- [ ] Multiple "primary" looking buttons compete for attention
- [ ] Ghost buttons are as prominent as filled buttons
- [ ] Users hesitate before clicking (unclear which is the action)
- [ ] Secondary actions distract from the main goal

---

## The Fix

### Rule 1: ONE Primary Action Per Section

Every screen section should have exactly one visually dominant button:

```css
/* Primary: Filled, high contrast, largest */
.btn-primary {
  background: #2563EB;       /* Solid accent color */
  color: white;
  min-height: 48px;          /* Larger than secondary */
  padding: 14px 28px;
  font-weight: 600;
  border: none;
}

/* Secondary: Outlined or subtle */
.btn-secondary {
  background: transparent;
  color: #374151;
  min-height: 44px;
  padding: 12px 20px;
  font-weight: 500;
  border: 1px solid #D1D5DB;
}

/* Tertiary: Text-only or very subtle */
.btn-tertiary {
  background: transparent;
  color: #4B5563;
  padding: 12px 16px;
  font-weight: 500;
  border: none;
}
```

### Rule 2: Visual Weight Hierarchy

Primary must be OBVIOUSLY dominant through:
- **Fill vs outline** (filled > outlined > text-only)
- **Size** (primary slightly larger)
- **Color** (primary uses accent color)
- **Weight** (primary uses bolder text)

```
DOMINANT:    Filled + accent color + 48px + weight 600
SUBORDINATE: Outlined + gray + 44px + weight 500
MINIMAL:     Text-only + gray + weight 500
```

### Rule 3: Side-by-Side Button Pairs

When placing two buttons together:

```css
.button-pair {
  display: flex;
  gap: 12px;
}

/* Primary gets the accent fill */
.button-pair .btn-primary {
  background: #2563EB;
  color: white;
}

/* Secondary is clearly subordinate */
.button-pair .btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #D1D5DB;
}
```

**Common patterns:**
- "Save" (primary) + "Cancel" (tertiary/text)
- "Get Started" (primary) + "Learn More" (secondary/outlined)
- "Submit" (primary) + "Back" (text link)

### Rule 4: Destructive Actions Get Differentiation

Delete/remove actions should be visually distinct but NOT dominant:

```css
.btn-destructive {
  background: #FEE2E2;       /* Light red background */
  color: #DC2626;            /* Red text */
  border: 1px solid #FECACA;
}

/* Or outlined for less prominence */
.btn-destructive-outline {
  background: transparent;
  color: #DC2626;
  border: 1px solid #DC2626;
}
```

### Rule 5: Disabled States Must Be Obvious

```css
.btn:disabled,
.btn[disabled] {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  opacity: 1;                 /* Don't just reduce opacity */
}
```

---

## Button Sizing Reference

| Type | Height | Padding | Font Weight |
|------|--------|---------|-------------|
| Primary | 48px | 14px 28px | 600 |
| Secondary | 44px | 12px 20px | 500 |
| Tertiary | 40px | 12px 16px | 500 |
| Small | 36px | 8px 16px | 500 |

---

## Anti-Patterns

Things that make button hierarchy WORSE:

- Two filled buttons side by side (both look primary)
- Ghost buttons with thick borders (too prominent)
- Primary and secondary same size
- Accent color on secondary buttons
- Multiple accent colors for different buttons
- "Learn More" as prominent as "Sign Up"

---

## Output Format

```
WHERE: [section/component]
CURRENT: [e.g., "two filled blue buttons side by side"]
FIX: [e.g., "primary: filled blue, secondary: outlined gray"]
```

---

## Quick Test

After fixing:

1. For each screen section, can you instantly identify THE button to click? (Yes = pass)
2. Do secondary options look clearly subordinate? (Yes = pass)
3. Would a new user know what to do without reading button text? (Yes = pass)

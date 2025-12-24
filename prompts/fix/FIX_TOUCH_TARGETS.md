# Fix Too-Small Touch Targets

Paste this when: Buttons, links, or inputs are hard to tap/click accurately.

---

## Is This Your Problem?

- [ ] Buttons are smaller than 44px tall
- [ ] Icon buttons are tiny (under 44x44px)
- [ ] Links in text are hard to tap
- [ ] Form inputs feel cramped
- [ ] Users keep mis-tapping or needing multiple attempts

---

## The Fix

### Rule 1: 44px Minimum Height (Not 40px)

Apple's Human Interface Guidelines specify 44pt. This is the standard, not 40px:

```css
.button {
  min-height: 44px;           /* Apple HIG standard */
  padding: 12px 20px;         /* Comfortable internal space */
}

/* Primary CTAs should be even larger */
.button-primary {
  min-height: 48px;
  padding: 14px 28px;
}
```

### Rule 2: Icon Buttons Need Full 44x44px Area

Small icons need padding to create the touch target:

```css
.icon-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button svg {
  width: 20px;              /* Icon size */
  height: 20px;
}
/* The button is 44px, the icon inside is 20px */
```

### Rule 3: Form Inputs Match Button Height

```css
input,
select,
textarea {
  min-height: 44px;
  padding: 10px 14px;
  font-size: 16px;           /* Prevents iOS zoom on focus */
}

/* Checkboxes/radios: visual 24px, touch area 44px */
input[type="checkbox"],
input[type="radio"] {
  width: 24px;
  height: 24px;
  margin: 10px;              /* Extends touch area */
}
```

### Rule 4: Mobile Gets LARGER Targets

```css
@media (max-width: 768px) {
  .button {
    min-height: 48px;
    padding: 14px 24px;
  }

  .button-primary {
    min-height: 52px;
    width: 100%;             /* Full-width on mobile */
  }

  input, select {
    min-height: 48px;
  }
}
```

### Rule 5: Adequate Spacing Between Tappable Elements

Adjacent touch targets need breathing room:

```css
.button + .button {
  margin-left: 12px;         /* Minimum gap */
}

.nav-link + .nav-link {
  margin-left: 16px;
}

/* Vertical lists */
.list-item {
  min-height: 48px;
  padding: 12px 0;           /* Tap-friendly list rows */
}
```

---

## Common Violations

| Element | Wrong | Right |
|---------|-------|-------|
| Button height | 32px, 36px, 40px | 44px minimum |
| Icon button | 32x32px | 44x44px |
| Mobile CTA | 44px | 48-52px |
| Input height | 36px | 44px minimum |
| Button padding | 8px 12px | 12px 20px |

---

## Tailwind Quick Reference

```html
<!-- Too small -->
<button class="h-8 px-3">...</button>     <!-- 32px -->
<button class="h-10 px-4">...</button>    <!-- 40px -->

<!-- Correct -->
<button class="h-11 px-5">...</button>    <!-- 44px, 20px horizontal -->
<button class="h-12 px-6">...</button>    <!-- 48px, 24px horizontal -->
```

---

## Anti-Patterns

Things that make touch targets WORSE:

- Using exact icon size as button size
- Reducing padding to "save space"
- 40px height (the common mistake - standard is 44px)
- Tightly packed icon buttons with no gaps
- Mobile buttons same size as desktop

---

## Output Format

```
FILE: [path] LINE: [#]
CURRENT: [e.g., "height: 36px"]
FIX: [e.g., "min-height: 44px"]
```

---

## Quick Test

After fixing:

1. Can you tap every button with your thumb without missing? (Yes = pass)
2. Are all interactive elements at least 44px in the smallest dimension? (Yes = pass)
3. Is there visible space between adjacent buttons? (Yes = pass)

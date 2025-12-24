# Fix Low Contrast / Unreadable Text

Paste this when: Text is hard to read, looks washed out, or strains your eyes.

---

## Is This Your Problem?

- [ ] Gray text on white background feels faded
- [ ] Placeholder text is invisible
- [ ] Text over images/gradients is hard to read
- [ ] Colored text on colored background feels muddy
- [ ] The page looks "low contrast" or "muted"

---

## The Fix

### Rule 1: Minimum Text Colors on Light Backgrounds

On white (#FFF) or off-white (#F9FAFB):

```
PRIMARY text:    #111827 (gray-900)   -- headings, body
SECONDARY text:  #374151 (gray-700)   -- subheadings, secondary info
TERTIARY text:   #4B5563 (gray-600)   -- metadata, captions (MINIMUM)
```

**NEVER USE for readable text:**
```
#9CA3AF (gray-400) -- 2.9:1 ratio = FAIL
#D1D5DB (gray-300) -- 1.8:1 ratio = FAIL
```

### Rule 2: Minimum Text Colors on Dark Backgrounds

On dark (#111827) or black (#000):

```
PRIMARY text:    #F9FAFB (gray-50)
SECONDARY text:  #E5E7EB (gray-200)
TERTIARY text:   #D1D5DB (gray-300)   -- MINIMUM
```

### Rule 3: Colored Text on Colored Backgrounds = HIGH RISK

WCAG ratios don't catch this. Warm-on-warm FAILS perceptually:

**Examples that fail even if "passing" contrast:**
- Coral text on peach background
- Light blue text on light blue background
- Any accent color on a tinted background

**The fix:** Use NEUTRAL text (white or near-black) on colored backgrounds.

```css
/* BAD - warm on warm */
.hero { background: #FEF3E2; color: #EA580C; }

/* GOOD - neutral on warm */
.hero { background: #FEF3E2; color: #111827; }
```

### Rule 4: Placeholder Text Must Be Readable

```css
/* MINIMUM for placeholders */
::placeholder {
  color: #6B7280;  /* gray-500, passes 4.5:1 */
}

/* NEVER */
::placeholder {
  color: #D1D5DB;  /* gray-300, invisible */
}
```

### Rule 5: Text Over Images Needs Protection

Options:
1. Semi-transparent overlay: `background: rgba(0,0,0,0.5)`
2. Text shadow: `text-shadow: 0 2px 4px rgba(0,0,0,0.5)`
3. Gradient overlay at text position

```css
.hero-with-image {
  position: relative;
}
.hero-with-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
}
.hero-text {
  position: relative;
  color: white;
}
```

### Rule 6: Font Weight Matters for Contrast

Light weights (300) reduce perceived contrast:

```
Under 24px:  weight 400 minimum (never 300)
24px+:       weight 300 is acceptable
```

---

## CSS/Tailwind Audit Patterns

Look for these violations:

```
FAIL: text-gray-400, text-gray-300, text-gray-200
FAIL: opacity-50, opacity-60 on text
FAIL: font-light, font-extralight on body text
BORDERLINE: text-gray-500 (only for non-essential metadata)
SAFE: text-gray-600 and darker
```

---

## Anti-Patterns

Things that make contrast WORSE:

- Reducing opacity instead of using darker colors
- Using colored text for decoration on colored backgrounds
- "Aesthetic" light gray text (#BDBDBD style muted look)
- Font-weight 300 on body text
- Assuming contrast checker = readable

---

## Output Format

```
FILE: [path] LINE: [#]
CURRENT: [e.g., "color: #9CA3AF (2.9:1 ratio)"]
FIX: [e.g., "color: #4B5563 (5.9:1 ratio)"]
```

---

## Quick Test

After fixing:

1. Can you read all text at arm's length? (Yes = pass)
2. Would this be readable on a phone in sunlight? (Yes = pass)
3. Does any text feel "faded" or "washed out"? (No = pass)

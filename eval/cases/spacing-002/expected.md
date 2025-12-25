# Expected Good Fix

## Skill Activation Check

**MUST include this format (signature):**
```
🔲 SPACING DIAGNOSIS
Proximity Score: Xpx / Ypx = [ratio]
Violation: Yes/No
```

If missing → skill did not load.

---

## Issues to Diagnose

### 1. Section Rhythm (Monotonous)
- Every section has `py-16` (64px)
- Hero should be largest (80-120px)
- CTA can be prominent (80px)
- Middle sections can be smaller (48-64px)

**Expected diagnosis:** "All sections have identical padding - no visual rhythm"

### 2. Stats Cards (INVERTED Proximity)
```
p-8 (32px) with gap-4 (16px)
Proximity Score: 32/16 = 2.0 ← VIOLATION (must be < 1.0)
```

**This is WORSE than test 001.** Padding is LARGER than gap.

**Expected fix:**
- Reduce padding: `p-8` → `p-4` or `p-5`
- OR increase gap: `gap-4` → `gap-8` or more

### 3. Feature Cards (Equal Proximity)
```
p-6 (24px) with gap-6 (24px)
Proximity Score: 24/24 = 1.0 ← VIOLATION (must be < 1.0)
```

**Expected fix:** `p-5 gap-6` or `p-6 gap-8`

### 4. Testimonial (Density Mismatch)
- Sparse content: just a quote + attribution
- `p-12` (48px) padding is excessive
- Space overwhelms the content

**Expected fix:** `p-8` or even `p-6`

### 5. Hero Padding
- Should be MOST generous to establish importance
- Currently same as everything else

**Expected fix:** `py-20` or `py-24` (80-96px)

---

## Scoring Criteria

| Criteria | Points |
|----------|--------|
| Shows Proximity Score format | 2 (skill loaded) |
| Identifies inverted stats spacing | 2 |
| Identifies monotonous rhythm | 2 |
| Identifies testimonial density issue | 1 |
| Fixes are on 4px grid | 1 |
| All violations addressed | 2 |
| **TOTAL** | 10 |

---

## Red Flags (Skill NOT Working)

- No mention of "Proximity Score"
- No ratio calculations
- Only fixes obvious issues (features), misses inverted stats
- Generic advice without specific principle names

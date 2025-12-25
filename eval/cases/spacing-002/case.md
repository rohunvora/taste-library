# Test Case: spacing-002 (Hard)

## Skill Being Tested
`fix-spacing`

## Problem Type
Multiple spacing violations - harder case to diagnose

## Prompt to Use
```
The spacing on this page feels off but I can't pinpoint why. Some parts feel cramped, others feel floaty. Can you diagnose and fix it?
```

## Input File
See `input.tsx`

## Issues Present (for scoring)
1. Hero section has same padding as other sections (no rhythm)
2. Stats cards: padding (32px) > gap (16px) - INVERTED proximity
3. Feature cards: padding = gap (24px each) - same as test 001
4. Testimonial section: sparse content with huge padding
5. CTA section: same padding as everything else

## Skill Activation Signature
If skill loads, output MUST include:
```
🔲 SPACING DIAGNOSIS
Proximity Score: Xpx / Ypx = Z
```

If this format is missing, skill did not activate.

## What "Good" Looks Like
See `expected.md`

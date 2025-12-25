---
name: reduce-friction
description: Reduce friction when interfaces feel slow, decisions take too long, or users abandon flows. Applies Doherty Threshold, Hick's Law, and Tesler's Law.
---

# Reduce Friction

Applies these laws from lawsofux.com:
- **Doherty Threshold**: Productivity soars when response < 400ms
- **Hick's Law**: Decision time increases with number of choices
- **Tesler's Law**: Every system has irreducible complexity

## When This Activates

- "Feels slow"
- "Users abandoning flow"
- "Too many options"
- "Decisions take too long"
- "Can we simplify this?"
- "Users are overwhelmed"

## The Laws

### Doherty Threshold

> Productivity soars when a computer and its users interact at a pace (<400ms) that ensures neither has to wait on the other.

**Application:**
```
TARGET RESPONSE TIMES:
- Instant feedback: < 100ms (button press, hover)
- Seamless: 100-300ms (page transitions)
- Threshold: 400ms (max before perceived delay)
- Need indicator: > 1000ms (show spinner)
```

**Techniques:**
- Optimistic UI (update before server confirms)
- Skeleton screens (perceived faster)
- Preload likely next actions
- Animations mask loading (300ms transition)

### Hick's Law

> The time it takes to make a decision increases with the number and complexity of choices.

**Formula:** `Decision time = log₂(n + 1)` where n = choices

**Application:**
```
CHOICE REDUCTION:
- 2 choices: instant
- 4 choices: manageable
- 8+ choices: chunk or filter
- 20+ choices: search, don't browse
```

**Techniques:**
- Progressive disclosure (show less, reveal more)
- Smart defaults (pre-select best option)
- Categorization (group into 3-5 buckets)
- Recommended option (reduce to 1 decision)

### Tesler's Law (Conservation of Complexity)

> Every system has inherent complexity that cannot be reduced; it can only be moved between user and system.

**Application:**
```
COMPLEXITY BUDGET:
- Some complexity is irreducible
- Move it FROM user TO system when possible
- Don't hide essential complexity (confusing)
- Don't add artificial simplicity (limiting)
```

**Examples:**
- Auto-detect location vs. manual entry (system absorbs)
- Smart defaults vs. required configuration
- But: don't auto-submit important forms

## Diagnosis

```
1. DOHERTY: Any interaction > 400ms without feedback?
2. HICK'S: Any decision point with > 6 visible options?
3. TESLER'S: Can system absorb any user-facing complexity?
```

## Output Format

```
FRICTION DIAGNOSIS

Doherty Threshold:
Slow interactions: [list with times]
FIX: [add feedback / optimize / preload]

Hick's Law:
Decision points: [location]: [N choices]
Overloaded (>6): [list]
FIX: [reduce / chunk / default / search]

Tesler's Law:
User-facing complexity: [list]
System can absorb: [what to automate]
Must remain with user: [irreducible parts]
FIX: [move X to system]
```

## Quick Reference

| Choices | Decision Time | Recommendation |
|---------|---------------|----------------|
| 2 | ~300ms | Ideal for binary |
| 4 | ~500ms | Good for options |
| 8 | ~700ms | Consider grouping |
| 16+ | ~900ms+ | Need search/filter |

| Response Time | Perception | Action |
|---------------|------------|--------|
| < 100ms | Instant | None needed |
| 100-400ms | Seamless | None needed |
| 400-1000ms | Noticeable | Subtle indicator |
| > 1000ms | Waiting | Spinner/skeleton |
| > 10s | Broken | Progress + cancel |

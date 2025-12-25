---
name: improve-flow
description: Improve user flow and experience when users drop off mid-task, motivation fades, or experiences feel flat. Applies Peak-End Rule, Goal-Gradient Effect, and Zeigarnik Effect.
---

# Improve Flow & Experience

Applies these laws from lawsofux.com:
- **Peak-End Rule**: Experiences judged by peak moments and endings
- **Goal-Gradient Effect**: Motivation increases as goal approaches
- **Zeigarnik Effect**: Incomplete tasks are remembered better

## When This Activates

- "Users drop off mid-flow"
- "Onboarding feels flat"
- "No sense of progress"
- "Experience is forgettable"
- "Users don't come back"
- "Checkout abandonment"

## The Laws

### Peak-End Rule

> People judge an experience based on how they felt at its most intense point (peak) and at its end, not on the average.

**Application:**
```
DESIGN FOR:
1. One memorable PEAK moment (delight, success, wow)
2. A strong positive ENDING

The middle can be mundane—peaks and ends are remembered.
```

**Techniques:**
- Celebration on completion (confetti, success screen)
- Delightful micro-interactions at key moments
- End with accomplishment, not error or limbo
- Recovery from errors matters more than preventing them

### Goal-Gradient Effect

> Motivation increases as progress approaches the goal.

**Application:**
```
SHOW PROGRESS VISIBLY:
- Progress bars accelerate motivation
- "2 of 5 steps" creates momentum
- Artificial starting progress works (start at 20%)
- Breaking into smaller goals = more motivation hits
```

**Techniques:**
- Progress indicators on multi-step flows
- "Almost there" messaging near completion
- Chunk long tasks into visible milestones
- LinkedIn-style profile completion meters

### Zeigarnik Effect

> People remember uncompleted tasks better than completed ones.

**Application:**
```
USE INCOMPLETENESS STRATEGICALLY:
- Unfinished profiles pull users back
- Draft states create return triggers
- "You're 80% there" is more compelling than "Complete your profile"
- Cliffhangers in onboarding
```

**Techniques:**
- Save partial progress visibly
- Show what's incomplete on dashboard
- Use incompleteness for retention, not frustration
- Don't lose user's work (increases abandonment anxiety)

## Diagnosis

```
1. PEAK-END: Where's the peak? How does it end?
2. GOAL-GRADIENT: Is progress visible? Accelerating?
3. ZEIGARNIK: Does incompleteness invite return or frustrate?
```

## Output Format

```
FLOW DIAGNOSIS

Peak-End Rule:
Current peak: [moment] or [none]
Current ending: [experience]
FIX: [add peak at X / improve ending Y]

Goal-Gradient Effect:
Progress visibility: [visible/hidden]
Steps shown: [Yes/No]
Artificial progress: [used/not used]
FIX: [add progress bar / show steps / start at 20%]

Zeigarnik Effect:
Incomplete states: [how handled]
Return triggers: [exist/missing]
FIX: [save drafts / show incomplete / add reminders]
```

## Flow Design Checklist

| Stage | Law | Technique |
|-------|-----|-----------|
| Start | Goal-Gradient | Show progress from step 1 |
| Start | Zeigarnik | Let them begin before account creation |
| Middle | Goal-Gradient | Break into visible milestones |
| Middle | Zeigarnik | Auto-save, show "draft saved" |
| Peak | Peak-End | Add delight at key success moment |
| End | Peak-End | Celebrate completion, clear next step |
| After | Zeigarnik | Show what else is incomplete |

## Examples

**Onboarding:**
```
Bad: 10 required fields, then "Account created"
Good: Start with win (choose avatar),
      show "3 of 5 steps",
      end with "Welcome! Here's what you can do"
```

**Checkout:**
```
Bad: Long form, then confirmation email
Good: Progress bar, "Almost done!",
      celebration confetti,
      immediate order summary
```

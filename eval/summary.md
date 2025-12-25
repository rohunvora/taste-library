# Skill Evaluation Summary

Running tally of all skill tests.

## Overview

| Skill | Tests Run | Avg Without | Avg With | Avg Improvement |
|-------|-----------|-------------|----------|-----------------|
| fix-spacing | 2* | - | - | inconclusive |
| fix-hierarchy | 0 | - | - | - |
| fix-contrast | 0 | - | - | - |
| reframe | 0 | - | - | - |
| structure-app | 0 | - | - | - |

*Subagent tests - skill did not load

## Test Log

| Date | Case | Skill | Without | With | Diff | Notes |
|------|------|-------|---------|------|------|-------|
| 2024-12-24 | spacing-001 | fix-spacing | 9/10 | 8/10 | -1 | Subagent - skill didn't load |
| 2024-12-24 | spacing-002 | fix-spacing | n/a | n/a | n/a | Subagent - skill didn't load |

## Critical Finding

**Subagents don't load skills.** The Task tool spawns agents without access to `.claude/skills/`.

This means:
- A/B testing via subagents is invalid
- Must test in main Claude Code session
- Need fresh session for each test (with/without skills)

## Insights

### What Skills Do Well
- Add structured methodology (Proximity Score format)
- Document reasoning in reproducible way
- (Need valid testing to confirm)

### Where Skills Need Work
- Skill loading in subagent context doesn't work
- Need different testing approach

### Patterns Observed
- Claude's base training handles common spacing issues well
- Even without skill, identified all 5 issues in hard test
- Skill value may be in edge cases and structured documentation

## Decision Thresholds

- **Keep skill as-is:** Avg improvement ≥ +2
- **Improve skill:** Avg improvement +1 to +2
- **Rethink skill:** Avg improvement < +1
- **Remove skill:** Consistently negative

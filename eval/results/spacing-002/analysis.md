# Analysis: spacing-002

## Test Info
- **Date:** 2024-12-24
- **Skill:** fix-spacing
- **Tester:** Claude (automated via Task tool subagent)

---

## Critical Finding: Subagents Don't Load Skills

**The canary signature was NOT present in either test.**

Both Test A and Test B produced nearly identical outputs because:
- Skills are only available to the **main Claude Code session**
- Subagents spawned via the Task tool do NOT have access to `.claude/skills/`
- This means our A/B testing methodology is fundamentally flawed for this approach

---

## Comparison (Both Without Skill Loading)

| Aspect | Test A (skill disabled) | Test B (skill enabled) |
|--------|------------------------|------------------------|
| Canary signature | ❌ No | ❌ No |
| Identified monotonous rhythm | ✅ Yes | ✅ Yes |
| Identified inverted stats | ✅ Yes | ✅ Yes |
| Identified equal features spacing | ✅ Yes | ✅ Yes |
| Identified testimonial density | ✅ Yes | ✅ Yes |
| Identified hero emphasis | ✅ Yes | ✅ Yes |
| Hero fix | py-16 → py-24 | py-16 → py-24 |
| Stats fix | gap-4→gap-8, p-8→p-6 | gap-4→gap-8, p-8→p-6 |
| Features fix | gap-6→gap-8, py-16→py-20 | gap-6→gap-8, py-16→py-20 |
| Testimonial fix | py-16→py-12, p-12→p-8 | py-16→py-12, p-12→p-8 |
| CTA fix | py-16→py-20 | py-16→py-20 |

**Results are IDENTICAL** because neither test actually loaded the skill.

---

## What This Means

1. **Claude's base knowledge handles spacing well** - All issues were correctly identified without the skill
2. **The skill adds methodology, not capability** - Proximity Score calculations document the reasoning
3. **Need different testing approach** - Main session testing, not subagent testing

---

## Recommendations

### Option 1: Manual Testing in Main Session
Test directly in the main Claude Code session (not via Task tool):
1. Disable skills: `./eval/toggle-skills.sh off`
2. Start fresh Claude Code session
3. Run prompt, save output
4. Enable skills: `./eval/toggle-skills.sh on`
5. Start fresh Claude Code session
6. Run prompt, save output
7. Compare

### Option 2: Include Skill Content in Prompt
Inject the skill content directly into the Task tool prompt:
```
"Read this methodology first: [SKILL.md content]
Then diagnose this file..."
```

### Option 3: Accept Base Knowledge is Good
If Claude's base training already handles common UX issues well:
- Skills add **structure** (Proximity Score format) not capability
- Skills are most valuable for **edge cases** not standard issues
- May need to test on truly obscure UX problems

---

## Positive Observations

Despite not using the skill, Claude:
- Correctly identified ALL 5 issues in the harder test case
- Used the right principle ("gap should be larger than padding")
- Applied fixes on the 4px grid
- Created section rhythm variation
- Showed ratios (32px vs 16px) even without explicit Proximity Score format

**The skill methodology is already partially internalized in Claude's base training.**

---

## Next Steps

1. Test in main session (not subagent) to verify skill actually loads
2. If skill loads, compare structured output (Proximity Score) vs ad-hoc analysis
3. Consider if skills add enough value for common issues

---

## Verdict

**Test inconclusive** - Skill did not load in subagent context.

Need to test in main Claude Code session to get valid comparison.

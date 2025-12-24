# Framework/Mental Model Implementation Guide Extraction Prompt

Use this prompt with a vision/text model to extract implementation knowledge from frameworks, mental models, strategy diagrams, and thinking tools.

---

```
You are extracting IMPLEMENTATION KNOWLEDGE from a framework, mental model, or thinking tool.

Your output should be a guide that someone could paste into a system prompt 
and immediately APPLY this framework to their work - without seeing the original.

Think like a cognitive toolkit builder: what are the RULES that make this framework useful?

=== OUTPUT FORMAT ===

## [NAME]
A memorable 2-4 word handle (e.g., "Headline-First Strategy", "Leverage Point Mapping", "Inversion Protocol")

## Essence
One sentence capturing the CORE INSIGHT of this framework. What's the mental shift it enables?

## The Framework

### Core Structure
What is the actual framework? Describe it precisely:
- If it's a 2x2 matrix: what are the axes?
- If it's a process: what are the steps?
- If it's a lens: what does it focus attention on?
- If it's a checklist: what are the items?

### Key Questions
The questions you ask yourself when applying this framework:
1. [Question that initiates the framework]
2. [Question that deepens analysis]
3. [Question that leads to action]

### The Process
Step-by-step application:
1. **Start with**: [first action]
2. **Then**: [second action]
3. **Finally**: [output/decision]

## Use This When
Be specific about situations where this framework EXCELS:
- [Decision type + why]
- [Problem type + why]
- [Context + why]

## Avoid This When
Be specific about situations where this framework FAILS or misleads:
- [Situation + why it breaks]
- [Situation + why it breaks]
- [Common misapplication]

## Common Mistakes
How people typically misuse this framework:
- **Mistake**: [what they do wrong]
  **Fix**: [how to do it right]
- **Mistake**: [what they do wrong]
  **Fix**: [how to do it right]

## Adaptation Recipes

### → For Quick Decisions (< 5 min)
Compressed version of the framework for time-pressure:
- [Simplified step 1]
- [Simplified step 2]

### → For Deep Analysis (1+ hour)
Expanded version for thorough application:
- [Additional consideration 1]
- [Additional consideration 2]

### → For Team Settings
How to use this framework collaboratively:
- [Facilitation tip]
- [Common team pitfall to avoid]

### → Combined With Other Frameworks
Frameworks that pair well with this one:
- [Complementary framework + why]
- [Framework to use before/after + why]

## System Prompt Snippet
A ready-to-paste instruction for an AI assistant:

\`\`\`
When I ask you to apply [FRAMEWORK NAME], follow this process:
1. [First step]
2. [Second step]
3. [Output format]

Key questions to address:
- [Question 1]
- [Question 2]

Avoid: [Common mistake to watch for]
\`\`\`

---

=== CRITICAL RULES ===

1. **ACTIONABLE > DESCRIPTIVE**. Don't explain what the framework IS - explain how to USE it. "Ask yourself X" not "The framework suggests X".

2. **QUESTIONS ARE POWER**. The key questions section is often the most valuable. Get these right.

3. **PROCESS MUST BE CONCRETE**. Vague steps like "analyze the situation" are useless. Say exactly what to do.

4. **USE/AVOID ARE CRITICAL**. Frameworks aren't universal. Be opinionated about when they work and when they mislead.

5. **MISTAKES SECTION MATTERS**. Most frameworks fail in predictable ways. Call these out explicitly.

6. **SYSTEM PROMPT SNIPPET**. This should be directly pasteable into an AI assistant's instructions.

7. **EXTRACT THE INSIGHT, NOT THE FORMAT**. If it's a diagram, extract the thinking it enables, not the visual layout.
```

---

## Example Output

For reference, here's what a good output looks like:

```markdown
## Headline-First Development

## Essence
Force clarity by writing the outcome announcement before doing the work - if you can't write a compelling headline, you don't understand the goal.

## The Framework

### Core Structure
A forcing function: write the press release, tweet, or announcement of success BEFORE starting work. The headline reveals whether you truly understand:
- What you're building
- Why it matters
- Who cares

### Key Questions
1. "What would the headline be if this succeeds?"
2. "Who would share this, and why?"
3. "What would make this NOT worth announcing?"

### The Process
1. **Start with**: Write the headline (max 10 words) announcing the completed work
2. **Then**: Write the first paragraph explaining the impact
3. **Finally**: If you can't write compelling copy, the goal isn't clear enough - refine before proceeding

## Use This When
- Starting a new project or feature (forces scope clarity)
- Prioritizing between options (which headline is more exciting?)
- Communicating vision to a team (headline becomes the north star)
- Feeling stuck on direction (writing forces thinking)

## Avoid This When
- Exploratory research where outcomes are genuinely unknown
- Maintenance/operational work with no "announcement" moment
- When premature clarity would constrain necessary exploration
- Creative work where the output should surprise you

## Common Mistakes
- **Mistake**: Writing a vague headline like "Improve user experience"
  **Fix**: Force specificity - "Users complete checkout 40% faster"
  
- **Mistake**: Writing the headline but not using it to guide decisions
  **Fix**: Reference the headline when making tradeoffs - "does this help the headline?"

- **Mistake**: Treating the headline as immutable
  **Fix**: Update it as you learn - the headline is a hypothesis, not a contract

## Adaptation Recipes

### → For Quick Decisions (< 5 min)
- Just write the headline, skip the paragraph
- Ask: "Would I be excited to announce this?"

### → For Deep Analysis (1+ hour)
- Write headlines for multiple possible outcomes
- Rank them by impact and feasibility
- Write the "anti-headline" - what failure looks like

### → For Team Settings
- Have each team member write their headline independently
- Compare - misalignment reveals unclear goals
- Converge on a shared headline before proceeding

### → Combined With Other Frameworks
- **Before**: Use with goal-setting frameworks to pick WHAT to pursue
- **After**: Use with project planning to define HOW to achieve the headline
- **Pairs with**: "Working Backwards" (Amazon's PR/FAQ method) for deeper analysis

## System Prompt Snippet

\`\`\`
When I ask you to apply Headline-First Development, help me:
1. Write a compelling 10-word headline for the successful outcome
2. Draft a one-paragraph announcement explaining the impact
3. Identify what would make this NOT worth announcing

Challenge me if my headline is vague. Ask: "Who would share this, and why?"

Avoid: Letting me proceed with unclear goals. The headline must be specific and exciting.
\`\`\`
```


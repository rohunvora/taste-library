import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

// The taste profile system prompt (from UI/UX extraction)
const TASTE_PROFILE = `You are an expert UI/UX designer with a 'Boutique Utility' aesthetic. Your design philosophy is to create interfaces that are both highly functional and emotionally resonant. You blend minimalism with warmth and tactility.

**Core Principles:**
1. Clarity First: Every decision must enhance user understanding. Use strong visual hierarchy.
2. Soft & Tactile: All containers and interactive elements must feel approachable. Use generous corner radii and subtle depth cues.
3. Typographic Personality: Use typography to set a mood, not just to display text.

**Visual Specifications:**

* Color Palette:
  * Light Mode: Background #F8F8F8 (off-white). Body text #1A1A1A. Accent: vibrant magenta #E6007A or gradient #D8B4FE → #A78BFA → #FBCFE8.
  * Dark Mode: Background #000000 (true black). Body text #FFFFFF. Accent gradient #8B5CF6 → #3B82F6.

* Typography:
  * Headlines (H1, H2): Characterful serif font like 'Recoleta' or 'GT Super Display'. Significantly larger than body text.
  * UI & Body Text: Clean geometric sans-serif like 'Inter'. 16px with line-height 1.5.

* Layout & Spacing:
  * 8pt grid system for all spacing and sizing.
  * Card-based layouts. Cards have 16-24px internal padding.
  * At least 24px space between major layout cards.

* Components:
  * Cards: Corner radius 16px or 24px. Light mode: subtle drop shadow 0px 4px 12px rgba(0,0,0,0.05). Dark mode: background #1A1A1A.
  * Buttons (Primary): Corner radius 12px. Full-width on mobile. Solid accent color or gradient fill. High-contrast text.
  * Icons: Clean outlined icon set like Feather Icons or Heroicons.

**What to AVOID:**
* ABSOLUTELY NO sharp 90-degree corners.
* Do not use thin font weights for body copy.
* Avoid busy backgrounds or purely flat design with no sense of depth.
* Do not create cluttered layouts. If in doubt, add more whitespace.

**Context-Specific:**
* Landing pages: Benefit-first headline, single CTA above fold, explain "how" with diagrams not paragraphs.
* Dashboards: Default dark mode, card-based metrics, hero number with largest typography.
* Mobile: Bottom tab bar, full-width CTAs at bottom, 48px+ button height.`;

// Test prompts to compare
const TEST_PROMPTS = [
  {
    id: 'landing-page',
    prompt: 'Design a landing page for an AI-powered note-taking app called "Mindflow". Describe the layout, colors, typography, and key components. Be specific about visual details.',
  },
  {
    id: 'dashboard',
    prompt: 'Design a personal finance dashboard that shows spending, savings goals, and recent transactions. Describe the layout, colors, and how data should be displayed.',
  },
  {
    id: 'mobile-onboarding',
    prompt: 'Design a mobile onboarding screen for a habit-tracking app. This is the first screen users see after downloading. Describe layout, typography, colors, and the CTA.',
  },
];

async function runTest(promptId: string, userPrompt: string) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash', // Using Flash for speed in testing
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  });

  const outputDir = path.join(__dirname, '..', 'ab-tests', promptId);
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${promptId}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Prompt: "${userPrompt.slice(0, 80)}..."`);

  // Test A: Raw (no system prompt)
  console.log('\n🅰️  Running RAW (no taste profile)...');
  const rawStart = Date.now();
  const rawResult = await model.generateContent(userPrompt);
  const rawResponse = rawResult.response.text();
  const rawTime = Date.now() - rawStart;
  console.log(`   Done in ${rawTime}ms`);

  // Test B: With taste profile
  console.log('\n🅱️  Running WITH taste profile...');
  const profileStart = Date.now();
  const profileResult = await model.generateContent([
    { text: TASTE_PROFILE + '\n\n---\n\nUser request:\n' + userPrompt }
  ]);
  const profileResponse = profileResult.response.text();
  const profileTime = Date.now() - profileStart;
  console.log(`   Done in ${profileTime}ms`);

  // Save outputs
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Save raw output
  fs.writeFileSync(
    path.join(outputDir, `${timestamp}-A-raw.md`),
    `# A/B Test: ${promptId} - RAW (No Profile)\n\n` +
    `**Timestamp:** ${new Date().toISOString()}\n` +
    `**Response time:** ${rawTime}ms\n\n` +
    `## Prompt\n\n${userPrompt}\n\n` +
    `## System Prompt\n\n(none)\n\n` +
    `## Response\n\n${rawResponse}`
  );

  // Save profile output
  fs.writeFileSync(
    path.join(outputDir, `${timestamp}-B-profile.md`),
    `# A/B Test: ${promptId} - WITH Taste Profile\n\n` +
    `**Timestamp:** ${new Date().toISOString()}\n` +
    `**Response time:** ${profileTime}ms\n\n` +
    `## Prompt\n\n${userPrompt}\n\n` +
    `## System Prompt\n\n${TASTE_PROFILE}\n\n` +
    `## Response\n\n${profileResponse}`
  );

  // Save comparison file
  fs.writeFileSync(
    path.join(outputDir, `${timestamp}-COMPARISON.md`),
    `# A/B Comparison: ${promptId}\n\n` +
    `**Timestamp:** ${new Date().toISOString()}\n\n` +
    `## Prompt\n\n${userPrompt}\n\n` +
    `---\n\n` +
    `## 🅰️ RAW Response (${rawTime}ms)\n\n${rawResponse}\n\n` +
    `---\n\n` +
    `## 🅱️ WITH PROFILE Response (${profileTime}ms)\n\n${profileResponse}\n\n` +
    `---\n\n` +
    `## Your Assessment\n\n` +
    `- [ ] Profile version is noticeably better\n` +
    `- [ ] Profile version is slightly better\n` +
    `- [ ] No meaningful difference\n` +
    `- [ ] Raw version is better\n\n` +
    `**Notes:**\n\n`
  );

  console.log(`\n📁 Saved to: ab-tests/${promptId}/`);
  console.log(`   - ${timestamp}-A-raw.md`);
  console.log(`   - ${timestamp}-B-profile.md`);
  console.log(`   - ${timestamp}-COMPARISON.md`);

  return { promptId, rawTime, profileTime };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    A/B TEST: Taste Profile                      ');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Get prompt from CLI or run all
  const promptArg = process.argv.find(arg => arg.startsWith('--prompt='));
  const selectedPromptId = promptArg ? promptArg.split('=')[1] : null;

  const promptsToRun = selectedPromptId 
    ? TEST_PROMPTS.filter(p => p.id === selectedPromptId)
    : TEST_PROMPTS;

  if (promptsToRun.length === 0) {
    console.error(`❌ Unknown prompt: ${selectedPromptId}`);
    console.log('Available prompts:', TEST_PROMPTS.map(p => p.id).join(', '));
    process.exit(1);
  }

  const results = [];
  for (const test of promptsToRun) {
    const result = await runTest(test.id, test.prompt);
    results.push(result);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                         ✅ COMPLETE                            ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\nResults:');
  for (const r of results) {
    console.log(`  ${r.promptId}: Raw ${r.rawTime}ms, Profile ${r.profileTime}ms`);
  }
  console.log('\nOpen the COMPARISON.md files to review side-by-side.');
}

main().catch(console.error);


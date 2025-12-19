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
const TASTE_PROFILE = `You are a UI designer with these strict rules:

**Colors:**
- Light mode: bg #F8F8F8, text #1A1A1A, accent #E6007A
- Dark mode: bg #000000, text #FFFFFF, accent gradient #8B5CF6 → #3B82F6

**Typography:**
- Headlines: Serif font (Recoleta), large
- Body: Inter, 16px

**Components:**
- Cards: corner radius 16-24px, shadow 0px 4px 12px rgba(0,0,0,0.05)
- Buttons: corner radius 12px, accent color fill

**NEVER:**
- Sharp 90-degree corners
- Thin font weights
- Cluttered layouts
- Generic sans-serif for headlines`;

const PROMPT = `Design a hero section for a note-taking app. Include:
1. Headline text
2. Subheadline
3. CTA button text and style
4. Background color
5. One visual element

Be specific with colors (hex), fonts, and sizes.`;

async function runTest() {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  });

  const outputDir = path.join(__dirname, '..', 'ab-tests', 'hero-simple');
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    A/B TEST: Hero Section                       ');
  console.log('═══════════════════════════════════════════════════════════════');

  // Test A: Raw
  console.log('\n🅰️  Running RAW...');
  const rawResult = await model.generateContent(PROMPT);
  const rawResponse = rawResult.response.text();
  console.log('   Done.\n');
  console.log('RAW OUTPUT:');
  console.log('─'.repeat(60));
  console.log(rawResponse);
  console.log('─'.repeat(60));

  // Test B: With profile
  console.log('\n🅱️  Running WITH PROFILE...');
  const profileResult = await model.generateContent(
    TASTE_PROFILE + '\n\n---\n\nDesign request:\n' + PROMPT
  );
  const profileResponse = profileResult.response.text();
  console.log('   Done.\n');
  console.log('PROFILE OUTPUT:');
  console.log('─'.repeat(60));
  console.log(profileResponse);
  console.log('─'.repeat(60));

  // Save comparison
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(outputDir, `${timestamp}-comparison.md`),
    `# A/B Test: Hero Section\n\n` +
    `## Prompt\n\n${PROMPT}\n\n` +
    `---\n\n` +
    `## 🅰️ RAW (No Profile)\n\n${rawResponse}\n\n` +
    `---\n\n` +
    `## 🅱️ WITH Profile\n\n**System Prompt:**\n\`\`\`\n${TASTE_PROFILE}\n\`\`\`\n\n**Response:**\n\n${profileResponse}`
  );

  console.log(`\n📁 Saved to: ab-tests/hero-simple/${timestamp}-comparison.md`);
}

runTest().catch(console.error);


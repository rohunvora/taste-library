import 'dotenv/config';
import { createServer } from 'http';
import { ArenaClient } from './arena-client.js';
import { TARGET_CHANNELS, CHANNEL_TITLES } from './config.js';
import type { ArenaBlock, ArenaChannel } from './types.js';

const PORT = 3456;

// Store state in memory
let unclassifiedBlocks: Array<{ block: ArenaBlock; sourceChannels: ArenaChannel[] }> = [];
let channelMap: Map<string, ArenaChannel> = new Map();
let currentIndex = 0;
let client: ArenaClient;

// Simple HTML template
function renderPage(): string {
  if (currentIndex >= unclassifiedBlocks.length) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Are.na Classifier - Done!</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SF Mono', 'Monaco', monospace;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .done {
      text-align: center;
      padding: 40px;
    }
    h1 { font-size: 48px; margin-bottom: 20px; }
    p { color: #888; }
  </style>
</head>
<body>
  <div class="done">
    <h1>✅ All done!</h1>
    <p>No more blocks to classify.</p>
    <p style="margin-top: 20px;"><a href="/" style="color: #4ade80;">Start over</a></p>
  </div>
</body>
</html>`;
  }

  const { block, sourceChannels } = unclassifiedBlocks[currentIndex];
  const title = block.title || block.source?.title || '[Untitled]';
  const url = block.source?.url || '';
  const description = block.description || '';
  const content = block.content || '';
  const imageUrl = block.class === 'Image' ? block.image?.display?.url : null;
  
  const progress = Math.round((currentIndex / unclassifiedBlocks.length) * 100);
  const remaining = unclassifiedBlocks.length - currentIndex;

  const channelButtons = Object.entries(CHANNEL_TITLES)
    .filter(([key]) => key !== 'inbox' && key !== 'index')
    .map(([key, label]) => {
      const colors: Record<string, string> = {
        'ui-ux': '#8b5cf6',
        'web': '#06b6d4',
        'writing': '#f59e0b',
        'code': '#10b981',
        'frameworks': '#ec4899',
      };
      const color = colors[key] || '#6b7280';
      return `<button onclick="classify('${key}')" style="background: ${color};">${label}</button>`;
    })
    .join('\n        ');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Are.na Classifier</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SF Mono', 'Monaco', monospace;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .progress-bar {
      height: 4px;
      background: #222;
      border-radius: 2px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4ade80, #22d3ee);
      width: ${progress}%;
      transition: width 0.3s;
    }
    .stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      font-size: 12px;
      color: #666;
    }
    .card {
      background: #111;
      border: 1px solid #222;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .card-header {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .block-type {
      background: #222;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
    }
    .title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      word-break: break-word;
    }
    .url {
      font-size: 12px;
      color: #4ade80;
      margin-top: 8px;
      word-break: break-all;
    }
    .url a { color: inherit; text-decoration: none; }
    .url a:hover { text-decoration: underline; }
    .description {
      margin-top: 16px;
      color: #999;
      font-size: 14px;
      line-height: 1.6;
    }
    .preview-image {
      margin-top: 16px;
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      object-fit: contain;
      background: #000;
    }
    .source-channels {
      margin-top: 16px;
      font-size: 12px;
      color: #666;
    }
    .source-channels span {
      background: #1a1a1a;
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 8px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }
    .actions button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      cursor: pointer;
      transition: transform 0.1s, opacity 0.1s;
    }
    .actions button:hover {
      transform: scale(1.02);
    }
    .actions button:active {
      transform: scale(0.98);
    }
    .skip-btn {
      background: #333 !important;
      color: #888 !important;
    }
    .keyboard-hint {
      font-size: 11px;
      color: #444;
      margin-top: 12px;
    }
    kbd {
      background: #222;
      padding: 2px 6px;
      border-radius: 4px;
      margin: 0 4px;
    }
    .loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      z-index: 100;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <div class="stats">
      <span>${currentIndex + 1} of ${unclassifiedBlocks.length}</span>
      <span>${remaining} remaining</span>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="block-type">${block.class}</span>
        <div>
          <div class="title">${escapeHtml(title)}</div>
          ${url ? `<div class="url"><a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url.slice(0, 80))}${url.length > 80 ? '...' : ''}</a></div>` : ''}
        </div>
      </div>
      
      ${description ? `<div class="description">${escapeHtml(description)}</div>` : ''}
      ${content && block.class === 'Text' ? `<div class="description">${escapeHtml(content.slice(0, 500))}${content.length > 500 ? '...' : ''}</div>` : ''}
      ${imageUrl ? `<img class="preview-image" src="${escapeHtml(imageUrl)}" alt="Preview" />` : ''}
      
      <div class="source-channels">
        Currently in: ${sourceChannels.map(ch => `<span>${escapeHtml(ch.title)}</span>`).join('')}
      </div>
    </div>
    
    <div class="actions">
      ${channelButtons}
      <button class="skip-btn" onclick="skip()">Skip →</button>
    </div>
    
    <div class="keyboard-hint">
      Keyboard: <kbd>1</kbd> UI/UX <kbd>2</kbd> Web <kbd>3</kbd> Writing <kbd>4</kbd> Code <kbd>5</kbd> Frameworks <kbd>S</kbd> Skip
    </div>
  </div>
  
  <div class="loading" id="loading">Processing...</div>

  <script>
    const keys = ['ui-ux', 'web', 'writing', 'code', 'frameworks'];
    
    async function classify(channel) {
      document.getElementById('loading').style.display = 'flex';
      await fetch('/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel })
      });
      location.reload();
    }
    
    async function skip() {
      document.getElementById('loading').style.display = 'flex';
      await fetch('/skip', { method: 'POST' });
      location.reload();
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '5') {
        classify(keys[parseInt(e.key) - 1]);
      } else if (e.key.toLowerCase() === 's') {
        skip();
      }
    });
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function loadBlocks() {
  const token = process.env.ARENA_TOKEN!;
  const userSlug = process.env.ARENA_USER_SLUG!;
  
  client = new ArenaClient(token, userSlug);
  
  console.log('📂 Fetching channels...');
  const channels = await client.getChannels();
  
  // Build channel map for our target channels
  const targetTitles = Object.values(CHANNEL_TITLES).map(t => t.toLowerCase());
  
  for (const key of Object.keys(TARGET_CHANNELS) as Array<keyof typeof TARGET_CHANNELS>) {
    const title = CHANNEL_TITLES[TARGET_CHANNELS[key]];
    const existing = channels.find(
      ch => ch.title.toLowerCase() === title?.toLowerCase()
    );
    if (existing) {
      channelMap.set(TARGET_CHANNELS[key], existing);
    }
  }
  
  console.log('📚 Fetching all blocks...');
  const blockMap = await client.getAllBlocks(channels);
  
  // Filter to unclassified blocks (not in any target channel)
  for (const [id, { block, channels: blockChannels }] of blockMap) {
    const isInTargetChannel = blockChannels.some(ch => 
      targetTitles.includes(ch.title.toLowerCase())
    );
    
    if (!isInTargetChannel) {
      unclassifiedBlocks.push({ block, sourceChannels: blockChannels });
    }
  }
  
  console.log(`\n✅ Found ${unclassifiedBlocks.length} unclassified blocks`);
  console.log(`🌐 Server running at http://localhost:${PORT}\n`);
}

async function handleClassify(channelKey: string): Promise<void> {
  const { block } = unclassifiedBlocks[currentIndex];
  const targetChannel = channelMap.get(channelKey);
  
  if (!targetChannel) {
    console.error(`Channel not found: ${channelKey}`);
    return;
  }
  
  try {
    await client.connectBlockToChannel(block.id, targetChannel.slug);
    console.log(`✅ Connected block ${block.id} to ${targetChannel.title}`);
  } catch (error) {
    console.error(`❌ Failed to connect block:`, error);
  }
  
  currentIndex++;
}

function handleSkip(): void {
  currentIndex++;
}

// Simple HTTP server
const server = createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:${PORT}`);
  
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderPage());
    return;
  }
  
  if (req.method === 'POST' && url.pathname === '/classify') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { channel } = JSON.parse(body);
      await handleClassify(channel);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }
  
  if (req.method === 'POST' && url.pathname === '/skip') {
    handleSkip();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

async function main() {
  const token = process.env.ARENA_TOKEN;
  const userSlug = process.env.ARENA_USER_SLUG;
  
  if (!token || !userSlug) {
    console.error('❌ Missing ARENA_TOKEN or ARENA_USER_SLUG in .env file');
    process.exit(1);
  }
  
  await loadBlocks();
  server.listen(PORT);
}

main().catch(console.error);


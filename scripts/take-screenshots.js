// Auto-capture demo screenshots for landing page modal carousel
// Usage: node scripts/take-screenshots.js
// Requires: server running at http://localhost:8000

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8000';
const OUT_DIR = path.join(__dirname, '..', 'assets', 'images', 'demo');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const PAGES = [
  { file: '01-dashboard.png',    url: '/dashboard.html',    name: 'Dashboard' },
  { file: '02-transactions.png', url: '/transactions.html', name: 'Transactions' },
  { file: '03-budgets.png',      url: '/budgets.html',      name: 'Budgets' },
  { file: '04-goals.png',        url: '/goals.html',        name: 'Goals' },
  { file: '05-reports.png',      url: '/reports.html',      name: 'Reports' },
  { file: '06-accounts.png',     url: '/accounts.html',     name: 'Accounts' }
];

const DEMO_AUTH_STATE = {
  version: 1,
  auth: {
    isLoggedIn: true,
    user: { name: 'Nguyễn Minh An', email: 'minhan@qltc.app', avatar: 'A' },
    users: [{ name: 'Nguyễn Minh An', email: 'minhan@qltc.app', avatar: 'A', password: 'demo123' }]
  }
};

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('Launching Edge...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // Step 1: clear stale localStorage then visit login.html so store.js seeds fresh SEED
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + '/login.html', { waitUntil: 'networkidle0' });
  // Step 2: patch auth state to logged-in demo user
  await page.evaluate((authPatch) => {
    const KEY = 'qlct.v1.state';
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error('SEED state not initialized');
    const s = JSON.parse(raw);
    s.auth = { ...(s.auth || {}), ...authPatch.auth };
    localStorage.setItem(KEY, JSON.stringify(s));
  }, DEMO_AUTH_STATE);

  for (const p of PAGES) {
    console.log(`Capturing ${p.name}...`);
    await page.goto(BASE + p.url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800)); // let charts animate
    const outPath = path.join(OUT_DIR, p.file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  -> ${outPath}`);
  }

  await browser.close();
  console.log('Done. Screenshots saved to:', OUT_DIR);
})().catch((err) => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});

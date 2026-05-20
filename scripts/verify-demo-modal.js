// Verify demo modal opens correctly
const puppeteer = require('puppeteer-core');
const path = require('path');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle0' });
  await page.click('#btn-demo');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, '..', 'assets', 'images', 'demo', '_modal-open.png') });
  console.log('Captured modal-open state');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

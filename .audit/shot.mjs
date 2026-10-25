import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.AUDIT_URL || 'http://127.0.0.1:5174/';
const OUT = path.dirname(fileURLToPath(import.meta.url)) + path.sep;
const TAG = process.env.AUDIT_TAG || 'a';
const W = Number(process.env.AUDIT_W || 1440);
const H = Number(process.env.AUDIT_H || 900);

const stops = (process.env.AUDIT_STOPS || '0,0.12,0.25,0.38,0.5,0.62,0.75,0.88,1')
  .split(',').map(Number);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell' === 'never' ? false : true,
  args: ['--no-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  defaultViewport: { width: W, height: H },
});

const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('requestfailed', (r) => errors.push('REQFAIL: ' + r.url() + ' ' + (r.failure()?.errorText || '')));

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await page.addStyleTag({ content: '.rb-aurora__canvas{display:none !important}' });

// Let the intro run, then speed past it with Escape (the code binds Escape -> finish()).
await new Promise((r) => setTimeout(r, 1500));
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 4000));

const info = await page.evaluate(() => ({
  docH: document.documentElement.scrollHeight,
  vh: window.innerHeight,
  imgs: [...document.images].map((i) => ({
    src: i.currentSrc || i.src,
    ok: i.complete && i.naturalWidth > 0,
    w: i.naturalWidth,
    h: i.naturalHeight,
    alt: i.alt,
    loading: i.loading,
  })),
  canvases: document.querySelectorAll('canvas').length,
  iframes: [...document.querySelectorAll('iframe')].map((f) => f.src),
}));
fs.writeFileSync(`${OUT}${TAG}-info.json`, JSON.stringify(info, null, 2));

for (let i = 0; i < stops.length; i++) {
  const s = stops[i];
  await page.evaluate((frac) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.round(max * frac), behavior: 'instant' });
  }, s);
  await new Promise((r) => setTimeout(r, 1400));
  await page.screenshot({ path: `${OUT}${TAG}-${String(i).padStart(2, '0')}-${s}.jpg`, type: 'jpeg', quality: 62 });
}

// A11y-ish probes
const probes = await page.evaluate(() => {
  const out = {};
  out.h1 = [...document.querySelectorAll('h1')].map((h) => h.textContent.trim());
  out.headings = [...document.querySelectorAll('h2,h3')].map((h) => h.tagName + ' ' + h.textContent.trim().slice(0, 60));
  out.buttonsNoName = [...document.querySelectorAll('button,a')].filter((el) => !el.textContent.trim() && !el.getAttribute('aria-label') && !el.getAttribute('title')).map((el) => el.outerHTML.slice(0, 120));
  out.imgsNoAlt = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).map((i) => i.src);
  out.tabbables = document.querySelectorAll('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])').length;
  return out;
});
fs.writeFileSync(`${OUT}${TAG}-probes.json`, JSON.stringify({ probes, errors }, null, 2));

await browser.close();
console.log('done', TAG, errors.length ? errors : 'no errors');

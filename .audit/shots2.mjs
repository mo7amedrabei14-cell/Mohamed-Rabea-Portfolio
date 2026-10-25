import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.AUDIT_URL || 'http://127.0.0.1:5174/';
const OUT = path.dirname(fileURLToPath(import.meta.url)) + path.sep;
const TAG = process.env.AUDIT_TAG || 's';
const W = Number(process.env.AUDIT_W || 1440);
const H = Number(process.env.AUDIT_H || 900);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars'],
  defaultViewport: { width: W, height: H },
});
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('requestfailed', (r) => errors.push('REQFAIL: ' + r.url() + ' ' + (r.failure()?.errorText || '')));

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await page.addStyleTag({ content: '.rb-aurora__canvas{display:none !important}' });
await new Promise((r) => setTimeout(r, 1500));
// Skip the intro via its real button (not Escape) so the hero renders in its final state.
await page.click('.hz-skip').catch(() => {});
await new Promise((r) => setTimeout(r, 5000));

const shots = JSON.parse(process.env.AUDIT_SHOTS || 'null') || [
  { n: 'hero', sel: '.hero' },
  { n: 'about', sel: '.ec-about' },
  { n: 'reel', sel: '.ec-reel' },
  { n: 'case1', sel: '.ec-case:nth-of-type(1)' },
  { n: 'wall', sel: '.ec-wall' },
  { n: 'tools', sel: '.ec-ring-stage' },
  { n: 'groups', sel: '.ec-groups' },
  { n: 'exp', sel: '.ec-exp' },
  { n: 'edu', sel: '.ec-edu' },
  { n: 'contact', sel: '.ec-contact' },
];

for (const s of shots) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  }, s.sel);
  await new Promise((r) => setTimeout(r, 1600));
  await page.screenshot({ path: `${OUT}${TAG}-${s.n}.jpg`, type: 'jpeg', quality: 60 });
}

const report = await page.evaluate(() => {
  const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src'));
  const overflow = document.documentElement.scrollWidth > window.innerWidth ? document.documentElement.scrollWidth - window.innerWidth : 0;
  // horizontal overflow offenders
  const wide = [...document.querySelectorAll('body *')].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2);
  }).slice(0, 14).map((e) => `${e.tagName}.${(e.className.baseVal ?? e.className ?? '').toString().split(' ')[0]} [${Math.round(e.getBoundingClientRect().left)},${Math.round(e.getBoundingClientRect().right)}]`);
  const small = [...document.querySelectorAll('a[href],button')].map((e) => {
    const r = e.getBoundingClientRect();
    return r.width && r.height && (r.height < 24 || r.width < 24) ? `${e.tagName}.${(e.className || '').toString().split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)}` : null;
  }).filter(Boolean).slice(0, 12);
  return { broken, overflowX: overflow, wide, smallTargets: small, docH: document.documentElement.scrollHeight };
});
fs.writeFileSync(`${OUT}${TAG}-report.json`, JSON.stringify({ report, errors }, null, 2));
await browser.close();
console.log(JSON.stringify({ report, errors }, null, 2));

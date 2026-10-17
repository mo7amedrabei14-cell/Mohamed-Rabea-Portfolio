import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('visual-artifacts');
await fs.mkdir(output, { recursive: true });

const errors = [];
const runs = [];

const browser = await chromium.launch({ headless: true });
const baseURL = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:4173/Mohamed-Rabea-Portfolio/';

function recordError(message) {
  errors.push(String(message));
  console.error('[visual-qa]', message);
}

async function inspectViewport({ name, width, height, language = 'en', captureSections = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: width < 600 ? 2 : 1,
    isMobile: width < 600,
    hasTouch: width < 600,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const failedLocalAssets = [];

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
    recordError(`${name}: page error: ${error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
      if (!/favicon|google fonts|fonts\.gstatic|ERR_ABORTED/i.test(message.text())) {
        recordError(`${name}: console error: ${message.text()}`);
      }
    }
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith(baseURL) && !request.url().includes('#')) {
      failedLocalAssets.push({ url: request.url(), error: request.failure()?.errorText });
    }
  });

  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(async (error) => {
    recordError(`${name}: navigation: ${error.message}`);
  });
  await page.waitForTimeout(1700);

  if (language === 'ar') {
    const lang = page.locator('.entry-language');
    if (await lang.count()) {
      await lang.click();
      await page.waitForTimeout(1100);
    }
  }

  const intro = await page.evaluate(() => {
    const box = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x), y: Math.round(r.y),
        width: Math.round(r.width), height: Math.round(r.height),
        right: Math.round(r.right), bottom: Math.round(r.bottom),
        scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
      };
    };
    const gate = document.querySelector('.entry-gate');
    const gateBox = gate?.getBoundingClientRect();
    return {
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      direction: document.documentElement.dir,
      introVisible: !!gate && getComputedStyle(gate).visibility !== 'hidden',
      intro: { x: Math.round(gateBox?.x || 0), y: Math.round(gateBox?.y || 0), right: Math.round(gateBox?.right || 0), bottom: Math.round(gateBox?.bottom || 0) },
      headline: box('.entry-gate__headline'),
      introCopy: box('.entry-gate__intro'),
      enter: box('.entry-enter'),
      visual: box('.entry-gate__visual'),
      footer: box('.entry-gate__bottom'),
    };
  });
  const introScreenshot = path.join(output, `intro-${name}.png`);
  await page.screenshot({ path: introScreenshot, animations: 'disabled' });
  const introOverflow = intro.document.width > width + 1;
  if (introOverflow) recordError(`${name}: horizontal overflow on introduction (${intro.document.width} > ${width})`);
  if (intro.enter && intro.enter.bottom > height + 1) {
    recordError(`${name}: desktop entry CTA falls below viewport`);
  }

  await page.locator('.entry-enter').click({ timeout: 10000 }).catch((error) => {
    recordError(`${name}: cannot activate entry: ${error.message}`);
  });
  await page.waitForTimeout(1650);
  await page.locator('.hero').waitFor({ state: 'visible', timeout: 10000 }).catch((error) => {
    recordError(`${name}: hero not visible after entry: ${error.message}`);
  });
  await page.waitForTimeout(500);

  const entered = await page.evaluate(() => {
    const box = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x), y: Math.round(r.y),
        width: Math.round(r.width), height: Math.round(r.height),
        right: Math.round(r.right), bottom: Math.round(r.bottom),
        scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
      };
    };
    const largeOverflow = Array.from(document.querySelectorAll('h1,h2,h3,.entry-enter,.button,.console,.frame,.fieldmap'))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return s.display !== 'none' && (r.width > innerWidth + 2 || r.left < -2 || r.right > innerWidth + 2);
      })
      .slice(0, 20)
      .map((el) => ({ selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().replace(/\s+/g,'.') : ''), rect: (() => { const r=el.getBoundingClientRect(); return {x:Math.round(r.x),right:Math.round(r.right),width:Math.round(r.width)}; })() }));
    return {
      viewport: { width: innerWidth, height: innerHeight },
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      direction: document.documentElement.dir,
      hero: box('.hero'),
      heading: box('.hero__title'),
      console: box('.console'),
      header: box('.topbar'),
      problematicBounds: largeOverflow,
      images: Array.from(document.images).filter((img) => img.complete && img.naturalWidth === 0).map((img) => ({ src: img.currentSrc || img.src, alt: img.alt })),
    };
  });
  if (entered.document.width > width + 1) recordError(`${name}: horizontal overflow after entry (${entered.document.width} > ${width})`);
  for (const img of entered.images) recordError(`${name}: image failed to load: ${img.src}`);
  for (const item of entered.problematicBounds) recordError(`${name}: element outside viewport: ${JSON.stringify(item)}`);
  const heroScreenshot = path.join(output, `hero-${name}.png`);
  await page.screenshot({ path: heroScreenshot, animations: 'disabled' });

  const sections = {};
  if (captureSections) {
    for (const [id, filename] of [
      ['work', 'work'],
      ['capabilities', 'capabilities'],
      ['experience', 'experience'],
      ['operator', 'operator'],
      ['contact', 'contact'],
    ]) {
      const section = page.locator(`#${id}`);
      if (!(await section.count())) continue;
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(850);
      await page.screenshot({ path: path.join(output, `${filename}-${name}.png`), animations: 'disabled' });
      sections[id] = await section.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
      });
    }
  }

  runs.push({
    name, language, viewport: { width, height }, intro, entered, sections,
    pageErrors, consoleErrors, failedLocalAssets,
    screenshots: [introScreenshot, heroScreenshot],
  });
  await context.close();
}

try {
  await inspectViewport({ name: '1920x1080-en', width: 1920, height: 1080 });
  await inspectViewport({ name: '1440x900-en', width: 1440, height: 900, captureSections: true });
  await inspectViewport({ name: '1366x768-en', width: 1366, height: 768 });
  await inspectViewport({ name: '390x844-en', width: 390, height: 844 });
  await inspectViewport({ name: '390x844-ar', width: 390, height: 844, language: 'ar' });
} finally {
  await browser.close();
}

const report = {
  generatedAt: new Date().toISOString(),
  baseURL,
  runCount: runs.length,
  errorCount: errors.length,
  errors,
  runs,
};
await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(output, 'summary.md'), [
  '# Portfolio visual QA',
  '',
  `- Viewport scenarios: ${runs.length}`,
  `- Checks flagged: ${errors.length}`,
  ...runs.map((item) => `- **${item.name}** — intro ${item.intro.document.width}×${item.intro.document.height}; site ${item.entered.document.width}×${item.entered.document.height}; direction ${item.entered.direction}`),
  '',
  '## Findings',
  errors.length ? errors.map((item) => `- ${item}`).join('\n') : '- No automated layout or browser errors were detected.',
  '',
].join('\n'));
console.log(JSON.stringify({ runCount: runs.length, errorCount: errors.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;

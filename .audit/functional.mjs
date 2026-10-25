import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://127.0.0.1:5174/';
const log = [];
const ok = (n, v, extra = '') => log.push(`${v ? 'PASS' : 'FAIL'}  ${n}${extra ? ' — ' + extra : ''}`);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--hide-scrollbars'], defaultViewport: { width: 1440, height: 900 } });

// ---------- desktop ----------
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('requestfailed', (r) => { const u = r.url(); if (!u.includes('powerbi.com')) errors.push('REQFAIL: ' + u); });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await page.addStyleTag({ content: '.rb-aurora__canvas{display:none !important}' });
await new Promise((r) => setTimeout(r, 1500));
await page.click('.hz-skip').catch(() => {});
await new Promise((r) => setTimeout(r, 4500));

// 1. skip link + keyboard
await page.keyboard.press('Tab');
ok('first Tab reaches skip link', await page.evaluate(() => document.activeElement?.className === 'skip-link'));

// 2. language toggle -> RTL
await page.click('.language-toggle');
await new Promise((r) => setTimeout(r, 900));
ok('language switch sets dir=rtl', await page.evaluate(() => document.documentElement.dir === 'rtl'));
ok('language switch re-renders Arabic nav', await page.evaluate(() => document.querySelector('.nav a')?.textContent.includes('مشروعات')));
ok('html lang updated', await page.evaluate(() => document.documentElement.lang === 'ar'));
await page.click('.language-toggle');
await new Promise((r) => setTimeout(r, 900));
ok('switch back to ltr', await page.evaluate(() => document.documentElement.dir === 'ltr'));

// 3. anchor navigation respects fixed header
await page.click('.nav a[href="#work"]');
await new Promise((r) => setTimeout(r, 2200));
ok('anchor #work lands clear of header', await page.evaluate(() => {
  const r = document.querySelector('#work').getBoundingClientRect();
  return r.top >= 70 && r.top <= 200;
}), await page.evaluate(() => Math.round(document.querySelector('#work').getBoundingClientRect().top) + 'px'));

// 4. Power BI tile -> modal -> Escape -> focus restored
const tile = await page.$('.ec-tile');
await tile.scrollIntoView();
await new Promise((r) => setTimeout(r, 800));
await tile.click();
await new Promise((r) => setTimeout(r, 1400));
ok('report modal opens', await page.evaluate(() => !!document.querySelector('.ec-modal[role=dialog]')));
ok('modal iframe points at Power BI', await page.evaluate(() => (document.querySelector('.ec-modal-frame')?.src || '').startsWith('https://app.powerbi.com/view')));
ok('modal traps body scroll', await page.evaluate(() => document.body.style.overflow === 'hidden'));
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 700));
ok('Escape closes report modal', await page.evaluate(() => !document.querySelector('.ec-modal')));
ok('focus returns to tile', await page.evaluate(() => document.activeElement?.classList.contains('ec-tile')));
ok('body scroll restored', await page.evaluate(() => document.body.style.overflow !== 'hidden'));

// 5. lightbox on a case image
const img = await page.$('.ec-case-fig img');
await img.scrollIntoView();
await new Promise((r) => setTimeout(r, 700));
await img.click();
await new Promise((r) => setTimeout(r, 700));
ok('image lightbox opens', await page.evaluate(() => !!document.querySelector('.image-lightbox')));
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 500));
ok('Escape closes lightbox', await page.evaluate(() => !document.querySelector('.image-lightbox')));

// 6. presentation viewer
await page.evaluate(() => document.querySelector('.presentation-scroll-trigger')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 700));
await page.click('.presentation-scroll-trigger');
await new Promise((r) => setTimeout(r, 1500));
ok('presentation viewer opens', await page.evaluate(() => !!document.querySelector('.embedded-presentation-section')));
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 700));
ok('Escape closes presentation viewer', await page.evaluate(() => !document.querySelector('.embedded-presentation-section')));

// 7. reel cards reach all 6
ok('reel + wall cover 6 projects', await page.evaluate(() => document.querySelectorAll('.ec-rail .ec-card').length === 6 && document.querySelectorAll('.ec-wall .ec-tile').length === 3),
  await page.evaluate(() => `rail=${document.querySelectorAll('.ec-rail .ec-card').length} tiles=${document.querySelectorAll('.ec-wall .ec-tile').length} cases=${document.querySelectorAll('.ec-case').length}`));

// 8. contact form builds a mailto
ok('contact form submits a mailto', await page.evaluate(() => {
  const f = document.querySelector('.hz-terminal');
  return !!f && f.querySelector('input[name=name]') && f.querySelector('button[type=submit]') && !!f.action;
}));

// 9. reduced motion keeps content visible
const rm = await browser.newPage();
await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await rm.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 3500));
ok('reduced-motion: intro still ends', await rm.evaluate(() => !document.querySelector('.hz-curtain')), await rm.evaluate(() => document.querySelector('.hz-curtain') ? 'curtain still up' : ''));
ok('reduced-motion: sections visible', await rm.evaluate(() => {
  const els = [...document.querySelectorAll('[data-reveal]')];
  return els.length > 0 && els.every((e) => getComputedStyle(e).opacity === '1');
}), await rm.evaluate(() => document.querySelectorAll('[data-reveal]').length + ' reveal nodes'));
await rm.close();

// ---------- mobile ----------
const m = await browser.newPage();
await m.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true });
await m.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await m.addStyleTag({ content: '.rb-aurora__canvas{display:none !important}' });
await new Promise((r) => setTimeout(r, 1500));
await m.click('.hz-skip').catch(() => {});
await new Promise((r) => setTimeout(r, 4500));
ok('mobile: menu hidden initially', await m.evaluate(() => getComputedStyle(document.querySelector('.nav')).display === 'none'));
await m.click('.menu-toggle');
await new Promise((r) => setTimeout(r, 500));
ok('mobile: menu opens', await m.evaluate(() => document.querySelector('.nav').classList.contains('nav--open')));
ok('mobile: toggle aria-expanded', await m.evaluate(() => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true'));
await m.click('.nav a[href="#contact"]');
await new Promise((r) => setTimeout(r, 2000));
ok('mobile: menu closes after nav', await m.evaluate(() => !document.querySelector('.nav').classList.contains('nav--open')));
ok('mobile: no horizontal overflow', await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  await m.evaluate(() => `${document.documentElement.scrollWidth} vs ${window.innerWidth}`));
await m.close();

await page.close();
await browser.close();
console.log(log.join('\n'));
console.log('\nJS ERRORS: ' + (errors.length ? '\n' + errors.join('\n') : 'none'));
console.log('\nFAILURES: ' + log.filter((l) => l.startsWith('FAIL')).length);

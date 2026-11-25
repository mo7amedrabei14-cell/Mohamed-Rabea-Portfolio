import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const siteUrl = process.env.SITE_URL || 'https://mo7amedrabei14-cell.github.io/Mohamed-Rabea-Portfolio/';
const errors = [];
const failedRequests = [];
const deckResponses = [];

await fs.mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

page.on('console', (message) => {
  if (message.type() === 'error') errors.push({ type: 'console', text: message.text() });
});
page.on('pageerror', (error) => errors.push({ type: 'pageerror', text: error.message }));
page.on('requestfailed', (request) => {
  failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText || 'unknown',
    method: request.method(),
  });
});
page.on('response', async (response) => {
  if (response.url().includes('eoc-command-deck.html')) {
    deckResponses.push({
      url: response.url(),
      status: response.status(),
      headers: await response.allHeaders(),
    });
  }
});

let result = { siteUrl, ok: false };
try {
  const response = await page.goto(siteUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  result.siteStatus = response?.status();

  const skip = page.locator('.si-skip');
  if (await skip.isVisible().catch(() => false)) {
    await skip.click({ timeout: 5000 });
  }

  const button = page.getByRole('button', { name: /View interactive presentation/i });
  await button.waitFor({ state: 'visible', timeout: 30000 });
  const openedAt = Date.now();
  await button.click();

  await page.locator('.ec-modal--presentation').waitFor({ state: 'visible', timeout: 15000 });
  const frame = page.locator('.ec-modal-frame');
  await frame.waitFor({ state: 'attached', timeout: 15000 });

  let ready = false;
  try {
    await page.waitForFunction(
      () => document.querySelector('.ec-modal-frame')?.classList.contains('is-ready') === true,
      { timeout: 25000 }
    );
    ready = true;
  } catch {
    ready = false;
  }

  const readyMs = Date.now() - openedAt;
  // Let the deck's own entrance choreography settle before capturing the visual result.
  await page.waitForTimeout(1500);

  const frameInfo = await frame.evaluate((el) => {
    const info = {
      src: el.getAttribute('src'),
      hasSrcDoc: Boolean(el.getAttribute('srcdoc')),
      className: el.className,
      opacity: getComputedStyle(el).opacity,
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height,
    };
    try {
      const doc = el.contentDocument;
      info.document = doc ? {
        readyState: doc.readyState,
        title: doc.title,
        slideCount: doc.querySelectorAll('.s').length,
        bodyText: (doc.body?.innerText || '').slice(0, 600),
      } : null;
    } catch (error) {
      info.documentError = error.message;
    }
    return info;
  }).catch((error) => ({ evaluationError: error.message }));

  const frames = page.frames().map((f) => ({ name: f.name(), url: f.url() }));
  const loaderVisible = await page.locator('.ec-modal-loader').isVisible().catch(() => false);
  const label = process.env.TEST_LABEL || 'production';
  const screenshot = `artifacts/presentation-modal-${label}.png`;
  await page.screenshot({ path: screenshot, fullPage: false });

  result = {
    ...result,
    ok: ready && (frameInfo.document?.slideCount > 0 || frames.some((f) => f.url.includes('eoc-command-deck.html'))),
    ready,
    readyMs,
    loaderVisible,
    frameInfo,
    frames,
    deckResponses,
    failedRequests,
    errors,
    screenshot,
  };
} catch (error) {
  result = { ...result, ok: false, fatalError: error.message, deckResponses, failedRequests, errors };
  const label = process.env.TEST_LABEL || 'production';
  await page.screenshot({ path: `artifacts/presentation-modal-${label}-failure.png`, fullPage: false }).catch(() => {});
} finally {
  await browser.close();
}

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;

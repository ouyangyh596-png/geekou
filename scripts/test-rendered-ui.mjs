import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { englishSiteContent } from '../src/content/site-content.js';
import { familyMedia } from '../src/media-manifest.js';
import { categoryOrder } from '../src/category-order.js';
import { chineseSiteContent } from '../src/content/site-content.zh.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependencyRoot = resolve(dirname(process.execPath), '..');
const playwrightModule = resolve(dependencyRoot, 'node_modules/playwright/index.mjs');
const viteEntry = resolve(root, 'node_modules/vite/bin/vite.js');
const origin = 'http://127.0.0.1:4178';
const browserCache = resolve(homedir(), 'Library/Caches/ms-playwright');
const browserExecutable = (existsSync(browserCache) ? readdirSync(browserCache) : [])
  .filter(entry => entry.startsWith('chromium_headless_shell-'))
  .map(entry => resolve(browserCache, entry, 'chrome-headless-shell-mac-arm64/chrome-headless-shell'))
  .find(existsSync);
assert.ok(browserExecutable, 'the bundled Playwright Chromium browser must be available');
const server = spawn(process.execPath, [viteEntry, '--host', '127.0.0.1', '--port', '4178', '--strictPort'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe']
});
let serverLog = '';
server.stdout.on('data', chunk => { serverLog += chunk; });
server.stderr.on('data', chunk => { serverLog += chunk; });

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null || server.signalCode) throw new Error(`Vite exited before readiness:\n${serverLog}`);
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 100));
  }
  throw new Error(`Vite did not start:\n${serverLog}`);
}

// Screenshots are review artifacts, never large tracked repository fixtures.
const screenshots = process.env.UI_SCREENSHOT_DIR || '/tmp/sofine-design-refresh/screenshots';
mkdirSync(screenshots, { recursive: true });

async function auditPage(page, label) {
  await page.evaluate(() => document.fonts.ready);
  // Scroll each section into view so lazy media and reveal states are exercised.
  for (const section of await page.locator('main section, .home-page > section').all()) {
    await section.scrollIntoViewIfNeeded();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  const metrics = await page.evaluate(() => {
    const visible = element => {
      const style = getComputedStyle(element);
      return element.getClientRects().length && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const text = [...document.querySelectorAll('body *')].filter(element =>
      visible(element) && [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      small: text.filter(element => parseFloat(getComputedStyle(element).fontSize) < 12).map(element => ({ tag: element.tagName, className: element.className, text: element.textContent.slice(0, 70), size: getComputedStyle(element).fontSize })),
      emptyMedia: [...document.querySelectorAll('.category-page-media, .series-media, .product-media')].filter(visible).filter(element => !element.querySelector('img[src],video,canvas,svg')).map(element => element.className)
    };
  });
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${label}: horizontal overflow ${JSON.stringify(metrics)}`);
  assert.deepEqual(metrics.small, [], `${label}: visible text must be at least 12px`);
  assert.deepEqual(metrics.emptyMedia, [], `${label}: missing media must not leave an empty shell`);
  await page.screenshot({ path: resolve(screenshots, `${label}.png`), fullPage: true });
}

async function checkContrastPanels(page) {
  for (const selector of ['.factory-panel', '.ppf-sequence-copy']) {
    for (const panel of await page.locator(selector).all()) {
      const ratio = await panel.evaluate(element => {
        const rgba = value => (value.match(/[\d.]+/g) || []).map(Number);
        const blend = (front, back) => front.slice(0, 3).map((value, index) => value * (front[3] ?? 1) + back[index] * (1 - (front[3] ?? 1)));
        let background = [255, 255, 255];
        const ancestors = [];
        for (let node = element; node; node = node.parentElement) ancestors.unshift(node);
        for (const node of ancestors) background = blend(rgba(getComputedStyle(node).backgroundColor), background);
        const heading = element.querySelector('h2') || element;
        const foreground = blend(rgba(getComputedStyle(heading).color), background);
        const luminance = rgb => rgb.map(value => { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
        const a = luminance(foreground), b = luminance(background);
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      });
      assert.ok(ratio >= 4.5, `${selector}: heading contrast must reach 4.5:1 against its panel (${ratio.toFixed(2)})`);
    }
  }
}

async function checkCarousel(page) {
  const active = page.locator('.stack-card-active .stack-index');
  const initial = await active.textContent();
  assert.match(initial, /^\d{2} \/ 11$/);
  assert.equal(await page.locator('.carousel-dots button').count(), 11);
  await page.locator('.carousel-controls > button').last().click();
  await page.waitForFunction(before => document.querySelector('.stack-card-active .stack-index').textContent !== before, initial);
  await page.locator('.stack-selector').focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(before => document.querySelector('.stack-card-active .stack-index').textContent === before, initial);
  for (const side of await page.locator('.stack-card-prev, .stack-card-next').all()) {
    const transform = await side.evaluate(element => getComputedStyle(element).transform);
    // Rotation/skew appears in off-diagonal entries; pure scale/translation stays axis aligned.
    const numbers = transform === 'none' ? [] : transform.slice(transform.indexOf('(') + 1, -1).split(',').map(Number);
    if (numbers.length === 6) assert.ok(Math.abs(numbers[1]) < 0.001 && Math.abs(numbers[2]) < 0.001, 'side cards must not tilt');
  }
  await page.locator('.carousel-dots button').nth(categoryOrder.indexOf('super-chrome-film')).click();
  const swatches = page.locator('.stack-card-active .cybertruck-swatches button');
  assert.ok(await swatches.count() > 1, 'Super Chrome retains interactive colours');
  await swatches.nth(1).click();
  assert.equal(await swatches.nth(1).getAttribute('aria-pressed'), 'true');
  await page.locator('.stack-card-active .stack-cta').click();
  await page.waitForURL(/#category=super-chrome-film$/);
}

async function checkTvc(page, motion) {
  await page.locator('.tvc-showcase').scrollIntoViewIfNeeded();
  if (motion) {
    await page.locator('.tvc-loop').waitFor();
    assert.deepEqual(await page.locator('.tvc-loop source').evaluateAll(nodes => nodes.map(node => node.type)), ['video/webm', 'video/mp4']);
    assert.ok(await page.locator('.tvc-loop').evaluate(video => video.muted && video.loop && video.playsInline));
  } else assert.equal(await page.locator('.tvc-loop').count(), 0, 'mobile/reduced motion must not mount the background video');
  await page.locator('.tvc-watch').click();
  assert.ok(await page.locator('.tvc-dialog').evaluate(dialog => dialog.open));
  assert.ok(await page.locator('.tvc-player video').evaluate(video => video.controls && !video.muted));
  assert.match(await page.locator('.tvc-player source').getAttribute('src'), /sofine-tvc-full\.mp4$/);
  await page.keyboard.press('Escape');
  assert.ok(await page.locator('.tvc-dialog').evaluate(dialog => !dialog.open));
  assert.ok(await page.locator('.tvc-player video').evaluate(video => video.paused));
  assert.ok(await page.locator('.tvc-watch').evaluate(button => document.activeElement === button));
}

const { chromium } = await import(pathToFileURL(playwrightModule));
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
  for (const width of [1440, 1024, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.setDefaultTimeout(15000);
    const remoteRequests = [];
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.origin !== origin && !['data:', 'blob:'].includes(url.protocol)) remoteRequests.push(url.href);
    });
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: englishSiteContent.home.heroTitle, exact: true }).waitFor();
    const headerX = await page.locator('.header-inner').evaluate(element => element.getBoundingClientRect().x);
    if (width === 390) {
      const menu = page.getByRole('button', { name: 'Open navigation' });
      const bounds = await menu.boundingBox();
      assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44, 'mobile navigation needs a 44px target');
      assert.equal(await menu.getAttribute('aria-controls'), 'primary-navigation');
      await menu.click();
      assert.equal(await page.getByRole('button', { name: 'Close navigation' }).getAttribute('aria-expanded'), 'true');
      assert.equal(await page.locator('#primary-navigation .nav-link').count(), 4);
      assert.equal(await page.locator('.product-directory').isVisible(), false);
      await page.getByRole('button', { name: 'Close navigation' }).click();
    }
    await auditPage(page, `${width}-home`);
    await checkContrastPanels(page);
    await checkTvc(page, width > 800);
    await checkCarousel(page);
    for (const slug of categoryOrder) {
      await page.goto(`${origin}/#category=${slug}`, { waitUntil: 'networkidle' });
      assert.ok(Math.abs(await page.locator('.header-inner').evaluate(element => element.getBoundingClientRect().x) - headerX) <= 1, `${width}/${slug}: header must align with home`);
      await auditPage(page, `${width}-${slug}`);
    }
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.locator('.language-picker summary').click();
    await page.locator('.language-picker button[lang="zh"]').click();
    assert.equal(await page.locator('.language-picker summary span').textContent(), '中文');
    assert.equal(await page.locator('.landing-title').textContent(), chineseSiteContent.home.heroTitle);
    for (const selector of ['.landing-subtitle', '.factory-panel', '.contact-information', '.copyright']) {
      assert.match(await page.locator(selector).textContent(), /[\u3400-\u9fff]/, `${selector}: Chinese home content must be translated`);
    }
    await auditPage(page, `${width}-home-zh`);
    assert.deepEqual(remoteRequests, [], `${width}: UI must use local resources`);
    await page.close();
  }
  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await reduced.goto(origin, { waitUntil: 'networkidle' });
  await checkTvc(reduced, false);
  const motion = await reduced.locator('.stack-card-content').evaluate(element => ({ animation: getComputedStyle(element).animationName, transition: getComputedStyle(element).transitionDuration, scroll: getComputedStyle(document.documentElement).scrollBehavior }));
  assert.equal(motion.animation, 'none');
  assert.equal(motion.transition, '0s');
  assert.equal(motion.scroll, 'auto');
  await reduced.goto(`${origin}/#category=translucent-film&series=${encodeURIComponent(englishSiteContent.categories['translucent-film'].series[0].name)}`, { waitUntil: 'networkidle' });
  assert.equal(await reduced.locator('.series-card-selected h2').textContent(), englishSiteContent.categories['translucent-film'].series[0].name);
  assert.equal(await reduced.locator('.product-spec-table tbody th[scope="row"]').first().textContent(), 'SF6000');
  assert.equal(await reduced.locator('.category-page-media img').getAttribute('src'), familyMedia['translucent-film'].hero);
  await auditPage(reduced, '1440-reduced-selected-series');
  await reduced.close();
  console.log(`PASS: responsive routes, typography, media, carousel, TVC, language and reduced motion; screenshots: ${screenshots}`);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

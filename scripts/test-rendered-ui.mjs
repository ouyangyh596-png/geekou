import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependencyRoot = resolve(dirname(process.execPath), '..');
const playwrightModule = resolve(dependencyRoot, 'node_modules/playwright/index.mjs');
const viteEntry = resolve(root, 'node_modules/vite/bin/vite.js');
const origin = 'http://127.0.0.1:4178';
const browserCache = resolve(homedir(), 'Library/Caches/ms-playwright');
const browserExecutable = readdirSync(browserCache)
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

function assertNoHorizontalOverflow(metrics, label) {
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${label} horizontally overflows: ${metrics.scrollWidth}px > ${metrics.clientWidth}px`);
}

async function assertOrbitGeometry(page, width) {
  const stage = page.locator('.stack-card-active');
  const nodes = page.locator('.stack-card');
  assert.equal(await nodes.count(), 3, `${width}px: stack must render previous, active and next cards`);

  const geometry = await stage.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      width: bounds.width,
      height: bounds.height,
      aspectRatio: style.aspectRatio,
      borderTopLeftRadius: style.borderTopLeftRadius,
      overflow: style.overflow
    };
  });
  assert.ok(geometry.width > 0 && geometry.height > 0, `${width}px: orbit stage must be measurable`);
  assert.ok(geometry.width > geometry.height, `${width}px: active product card must be landscape`);
  assert.notEqual(geometry.borderTopLeftRadius, '0px', `${width}px: active product card must be rounded`);
  assert.equal(geometry.overflow, 'hidden', `${width}px: orbit stage must clip its staged content`);

  for (const node of await nodes.all()) {
    const box = await node.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, `${width}px: every transformed desktop orbit node needs a 44px hit area`);
  }
}

async function assertSelectedOrbitNodeDepth(page, width, reducedMotion = false) {
  const selected = page.locator('.stack-card-active');
  const depth = await selected.evaluate(element => {
    const style = getComputedStyle(element);
    const sheen = getComputedStyle(element, '::after');
    const bounds = element.getBoundingClientRect();
    return {
      backgroundImage: style.backgroundImage,
      boxShadow: style.boxShadow,
      overflow: style.overflow,
      fontWeight: Number(style.fontWeight),
      letterSpacing: style.letterSpacing,
      width: bounds.width,
      height: bounds.height,
      animationName: getComputedStyle(element.querySelector('.stack-card-content')).animationName
    };
  });
  assert.notEqual(depth.boxShadow, 'none', `${width}px: selected orbit node needs a layered shadow`);
  assert.equal(depth.overflow, 'hidden', `${width}px: active product card must clip its content`);
  assert.ok(depth.width >= 44 && depth.height >= 44, `${width}px: selected orbit node keeps a 44px target`);
  if (reducedMotion) {
    assert.equal(depth.animationName, 'none', `${width}px reduced motion: active card animation must be disabled`);
  } else {
    assert.equal(depth.animationName, 'stack-card-in', `${width}px: active card must animate on selection`);
  }
}

async function assertOrbitInteractions(page) {
  const next = page.getByRole('button', { name: 'Next product family' });
  const previous = page.getByRole('button', { name: 'Previous product family' });
  for (const [label, control] of [['next', next], ['previous', previous]]) {
    const box = await control.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, `1440px: ${label} orbit control needs a 44px hit area`);
  }

  const selectedBeforeNext = await page.locator('.stack-card-active').getAttribute('href');
  await next.click();
  await page.waitForFunction(before => document.querySelector('.stack-card-active')?.getAttribute('href') !== before, selectedBeforeNext);

  await previous.click();
  await page.waitForFunction(before => document.querySelector('.stack-card-active')?.getAttribute('href') === before, selectedBeforeNext);

  const selectedStage = page.locator('.stack-card-active');
  const target = await selectedStage.getAttribute('href');
  assert.match(target || '', /^#category=/, '1440px: centre CTA must target the selected category');
  await selectedStage.click();
  await page.waitForURL(new RegExp(`${target.replace('#', '\\#')}$`));
}

async function assertMobileOrbitStrip(page, width) {
  const selector = page.locator('.stack-selector');
  const stage = page.locator('.stack-card-active');
  assert.equal(await page.locator('.stack-controls').count(), 1, `${width}px: stack controls must exist`);
  const layout = await selector.evaluate((element, viewportWidth) => {
    const selectorBounds = element.getBoundingClientRect();
    const stageBounds = element.querySelector('.stack-card-active').getBoundingClientRect();
    return {
      selector: { left: selectorBounds.left, right: selectorBounds.right, width: selectorBounds.width },
      stage: { left: stageBounds.left, right: stageBounds.right, width: stageBounds.width, height: stageBounds.height },
      viewportWidth
    };
  }, width);
  assert.ok(layout.selector.width <= width + 1, `${width}px: orbit selector must not exceed the viewport`);
  assert.ok(layout.stage.left >= layout.selector.left - 1 && layout.stage.right <= layout.selector.right + 1, `${width}px: centre stage must fit inside the selector`);
  assert.ok(layout.stage.left >= -1 && layout.stage.right <= width + 1, `${width}px: centre stage must remain fully visible in the viewport`);
  assert.ok(layout.stage.width <= layout.selector.width + 1, `${width}px: centre stage width must derive from the selector width`);
  for (const node of await page.locator('.stack-controls button').all()) {
    const box = await node.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, `${width}px: orbit node target must remain at least 44px`);
  }
}

async function assertReducedOrbitLayout(page, width) {
  const selectorBounds = await page.locator('.stack-selector').boundingBox();
  const nodes = page.locator('.stack-card');
  for (const node of await nodes.all()) {
    const state = await node.evaluate(element => {
      const style = getComputedStyle(element);
      return { opacity: Number(style.opacity), visibility: style.visibility, pointerEvents: style.pointerEvents };
    });
    const box = await node.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, `${width}px reduced motion: every stack card must remain usable`);
    assert.ok(state.opacity > 0 && state.visibility === 'visible' && state.pointerEvents !== 'none', `${width}px reduced motion: every stack card must remain visible and interactive`);
    if (await node.getAttribute('class') === 'stack-card stack-card-active') {
      assert.ok(selectorBounds && box.x >= selectorBounds.x - 1 && box.x + box.width <= selectorBounds.x + selectorBounds.width + 1, `${width}px reduced motion: active stack card must stay inside the selector`);
    }
  }
  const before = await page.locator('.stack-card-active').getAttribute('href');
  await page.getByRole('button', { name: 'Next product family' }).click();
  await page.waitForFunction(previous => document.querySelector('.stack-card-active')?.getAttribute('href') !== previous, before);
}

async function assertReducedOrbitMotion(page, width) {
  const orbitMotion = await page.locator('.stack-card-active').evaluate(element => {
    const contentStyle = getComputedStyle(element);
    const imageStyle = getComputedStyle(element.querySelector('img'));
    const nodeStyle = getComputedStyle(document.querySelector('.stack-card-content'));
    return {
      content: { transform: contentStyle.transform, transition: contentStyle.transitionDuration, clipPath: contentStyle.clipPath },
      image: { clipPath: imageStyle.clipPath, transform: imageStyle.transform, transition: imageStyle.transitionDuration },
      node: { transform: nodeStyle.transform, transition: nodeStyle.transitionDuration }
    };
  });
  assert.equal(orbitMotion.content.transition, '0s', `${width}px: reduced motion keeps stack content static`);
  assert.equal(orbitMotion.image.transition, '0s', `${width}px: reduced motion keeps stack media static`);
  assert.equal(orbitMotion.node.transition, '0s', `${width}px: reduced motion keeps stack card motion static`);
}

const { chromium } = await import(pathToFileURL(playwrightModule));
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, executablePath: browserExecutable });

  for (const width of [320, 360, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const remoteRequests = [];
    page.on('request', request => {
      const requestUrl = new URL(request.url());
      if (requestUrl.origin !== origin && !['data:', 'blob:'].includes(requestUrl.protocol)) remoteRequests.push(request.url());
    });
    await page.goto(origin, { waitUntil: 'networkidle' });

    await assert.doesNotReject(() => page.getByRole('heading', { level: 1, name: 'Innovation / Quality Service / Commitment', exact: true }).waitFor());
    const headingContent = await page.locator('.landing-title').evaluate(element => getComputedStyle(element, '::after').content);
    assert.ok(['none', 'normal', '""'].includes(headingContent), `${width}px: heading must not be injected through CSS`);
    const heroTitleBounds = await page.locator('.landing-title').evaluate(element => {
      const landing = element.closest('.landing').getBoundingClientRect();
      return {
        landing: { left: landing.left, right: landing.right },
        spans: [...element.querySelectorAll('span')].map(span => {
          const bounds = span.getBoundingClientRect();
          return { text: span.textContent, left: bounds.left, right: bounds.right };
        })
      };
    });
    for (const span of heroTitleBounds.spans) {
      assert.ok(
        span.left >= heroTitleBounds.landing.left - 1 && span.right <= heroTitleBounds.landing.right + 1,
        `${width}px: hero line "${span.text}" is clipped (${span.left}px–${span.right}px outside ${heroTitleBounds.landing.left}px–${heroTitleBounds.landing.right}px)`
      );
    }

    const menu = page.getByRole('button', { name: 'Open navigation' });
    const language = page.getByLabel('Language');
    const menuBox = await menu.boundingBox();
    const languageBox = await language.boundingBox();
    assert.ok(menuBox && menuBox.width >= 44 && menuBox.height >= 44, `${width}px: menu target must be at least 44px`);
    assert.ok(languageBox && languageBox.width >= 44 && languageBox.height >= 44, `${width}px: language target must be at least 44px`);
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    assert.equal(await menu.getAttribute('aria-controls'), 'primary-navigation');
    await menu.click();
    const close = page.getByRole('button', { name: 'Close navigation' });
    assert.equal(await close.getAttribute('aria-expanded'), 'true');
    for (const link of await page.locator('#primary-navigation a').all()) {
      const box = await link.boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, `${width}px: every open navigation link needs a 44px target`);
    }

    assertNoHorizontalOverflow(await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })), `${width}px home`);
    if (width === 320) await assertMobileOrbitStrip(page, width);
    assert.deepEqual(remoteRequests, [], `${width}px: production UI must not request remote resources`);
    await page.close();
  }

  for (const width of [801, 970, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(origin, { waitUntil: 'networkidle' });
    assertNoHorizontalOverflow(await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })), `${width}px home`);
    if (width === 1440) {
      await assertOrbitGeometry(page, width);
      await assertSelectedOrbitNodeDepth(page, width);
      await assertOrbitInteractions(page);
    }
    if (width <= 970) {
      const rows = await page.locator('.category-row').evaluateAll(elements => elements.map(element => {
        const media = element.querySelector('.category-media');
        const row = element.getBoundingClientRect();
        const preview = media.getBoundingClientRect();
        return { rowHeight: row.height, previewWidth: preview.width, previewHeight: preview.height };
      }));
      for (const geometry of rows) {
        assert.ok(geometry.rowHeight <= 260, `${width}px: category row is too tall (${geometry.rowHeight}px)`);
        assert.ok(geometry.previewWidth <= 240, `${width}px: preview is too wide (${geometry.previewWidth}px)`);
        assert.ok(geometry.previewHeight <= 180, `${width}px: preview is too tall (${geometry.previewHeight}px)`);
      }
    }
    await page.close();
  }

  const reducedPage = await browser.newPage({ viewport: { width: 970, height: 900 }, reducedMotion: 'reduce' });
  await reducedPage.goto(origin, { waitUntil: 'networkidle' });
  const homeMotion = await reducedPage.locator('.material-tile').first().evaluate(element => ({
    animation: getComputedStyle(element).animationName,
    transition: getComputedStyle(element).transitionDuration,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior
  }));
  assert.equal(homeMotion.animation, 'none');
  assert.equal(homeMotion.transition, '0s');
  assert.equal(homeMotion.scrollBehavior, 'auto');
  await assertReducedOrbitMotion(reducedPage, 970);
  await assertReducedOrbitLayout(reducedPage, 970);
  await assertSelectedOrbitNodeDepth(reducedPage, 970, true);

  await reducedPage.goto(`${origin}/#category=translucent-film`, { waitUntil: 'networkidle' });
  const categoryMotion = await reducedPage.locator('.series-card').first().evaluate(element => ({
    animation: getComputedStyle(element).animationName,
    transition: getComputedStyle(element).transitionDuration
  }));
  assert.equal(categoryMotion.animation, 'none');
  assert.equal(categoryMotion.transition, '0s');
  assertNoHorizontalOverflow(await reducedPage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })), '970px category');
  await assert.doesNotReject(() => reducedPage.getByAltText(/Translucent Film family illustration, representative image for SF6000/).first().waitFor());

  await reducedPage.goto(`${origin}/#product=sf6000`, { waitUntil: 'networkidle' });
  assertNoHorizontalOverflow(await reducedPage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })), '970px detail');
  await assert.doesNotReject(() => reducedPage.getByAltText(/Translucent Film family illustration, representative image for SF6000/).first().waitFor());

  const fonts = await reducedPage.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily, kicker: getComputedStyle(document.querySelector('.kicker')).fontFamily }));
  assert.match(fonts.body, /-apple-system|BlinkMacSystemFont|Segoe UI/);
  assert.match(fonts.kicker, /ui-monospace|SFMono-Regular/);
  await reducedPage.close();

  for (const width of [320, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(origin, { waitUntil: 'networkidle' });
    if (width === 320) await assertMobileOrbitStrip(page, width);
    if (width === 1440) {
      await assertOrbitGeometry(page, width);
      await assertReducedOrbitLayout(page, width);
      await assertSelectedOrbitNodeDepth(page, width, true);
    }
    await assertReducedOrbitMotion(page, width);
    await page.close();
  }

  console.log('PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { englishSiteContent } from '../src/content/site-content.js';
import { familyMedia } from '../src/media-manifest.js';

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

async function assertTypographySystem(page, width) {
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.locator('.landing-title').evaluate(heading => {
    const style = getComputedStyle(heading);
    return {
      fontFamily: style.fontFamily,
      letterSpacing: parseFloat(style.letterSpacing),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    };
  });
  assert.match(metrics.fontFamily, /Space Grotesk/, `${width}px: hero title must use its restored Space Grotesk face`);
  assert.ok(metrics.letterSpacing > -5, `${width}px: hero tracking must remain readable`);
  assertNoHorizontalOverflow(metrics, `${width}px typography`);
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
  const next = page.locator('button.stack-card-next');
  const previous = page.locator('button.stack-card-prev');
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
  assert.equal(await page.locator('.stack-controls').count(), 0, `${width}px: obsolete arrow controls must be removed`);
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
  assert.equal(await page.locator('.product-swipe-hint').count(), 1, `${width}px: mobile swipe guidance must exist`);
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
  await page.locator('button.stack-card-next').click();
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

    await assert.doesNotReject(() => page.getByRole('heading', { level: 1, name: englishSiteContent.home.heroTitle, exact: true }).waitFor());
    if (width === 390) await assertTypographySystem(page, width);
    const headingContent = await page.locator('.landing-title').evaluate(element => getComputedStyle(element, '::after').content);
    assert.ok(['none', 'normal', '""'].includes(headingContent), `${width}px: heading must not be injected through CSS`);
    const heroTitleBounds = await page.locator('.landing-title').evaluate(element => {
      const landing = element.closest('.landing').getBoundingClientRect();
      return {
        landing: { left: landing.left, right: landing.right },
        spans: (() => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return [...range.getClientRects()].map(bounds => ({ text: element.textContent, left: bounds.left, right: bounds.right }));
        })()
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
    assert.equal(await page.locator('#primary-navigation .nav-link').count(), 4, `${width}px: all primary navigation links must be present`);
    assert.equal(await page.locator('.product-directory').isVisible(), false, `${width}px: desktop product directory stays hidden on mobile`);
    for (const link of await page.locator('#primary-navigation .nav-link').all()) {
      const box = await link.boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, `${width}px: every open navigation link needs a 44px target`);
    }

    assertNoHorizontalOverflow(await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })), `${width}px home`);
    if (width === 320) await assertMobileOrbitStrip(page, width);
    assert.deepEqual(remoteRequests, [], `${width}px: production UI must not request remote resources`);
    await page.close();
  }

  for (const width of [801, 970, 1280, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(origin, { waitUntil: 'networkidle' });
    if (width === 1280 || width === 1440) await assertTypographySystem(page, width);
    assertNoHorizontalOverflow(await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })), `${width}px home`);
    if (width === 1440) {
      await assertOrbitGeometry(page, width);
      await assertSelectedOrbitNodeDepth(page, width);
      await assertOrbitInteractions(page);
    }
    if (width <= 970) {
      const rows = await page.locator('.stack-card-prev, .stack-card-next').evaluateAll(elements => elements.map(element => {
        const media = element.querySelector('img');
        const row = element.getBoundingClientRect();
        const preview = media.getBoundingClientRect();
        return { rowHeight: row.height, previewWidth: preview.width, previewHeight: preview.height };
      }));
      assert.equal(rows.length, 2, `${width}px: both adjacent product previews must be present`);
      for (const geometry of rows) {
        assert.ok(geometry.rowHeight <= 260, `${width}px: adjacent product card is too tall (${geometry.rowHeight}px)`);
        assert.ok(geometry.previewWidth <= 240, `${width}px: preview is too wide (${geometry.previewWidth}px)`);
        assert.ok(geometry.previewHeight <= 180, `${width}px: preview is too tall (${geometry.previewHeight}px)`);
      }
    }
    await page.close();
  }

  const reducedPage = await browser.newPage({ viewport: { width: 970, height: 900 }, reducedMotion: 'reduce' });
  await reducedPage.goto(origin, { waitUntil: 'networkidle' });
  const homeMotion = await reducedPage.locator('.stack-card-content').evaluate(element => ({
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
  await assert.doesNotReject(() => reducedPage.getByAltText(familyMedia['translucent-film'].alt, { exact: true }).waitFor());
  assert.equal(await reducedPage.locator('.category-page-media img').getAttribute('src'), familyMedia['translucent-film'].hero);

  await reducedPage.goto(`${origin}/#category=translucent-film&series=${encodeURIComponent(englishSiteContent.categories['translucent-film'].series[0].name)}`, { waitUntil: 'networkidle' });
  assertNoHorizontalOverflow(await reducedPage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })), '970px selected series');
  await assert.doesNotReject(() => reducedPage.getByAltText(familyMedia['translucent-film'].alt, { exact: true }).waitFor());
  assert.equal(await reducedPage.locator('.series-card-selected h2').textContent(), englishSiteContent.categories['translucent-film'].series[0].name);
  assert.equal(await reducedPage.locator('.product-spec-table-row > strong').first().textContent(), 'SF6000');

  const fonts = await reducedPage.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily, kicker: getComputedStyle(document.querySelector('.kicker')).fontFamily }));
  assert.match(fonts.body, /Manrope/);
  assert.match(fonts.kicker, /DM Mono/);
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

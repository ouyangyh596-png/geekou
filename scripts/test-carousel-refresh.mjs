import assert from 'node:assert/strict';
import { existsSync, readdirSync, mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependencyRoot = resolve(dirname(process.execPath), '..');
const playwrightModule = resolve(dependencyRoot, 'node_modules/playwright/index.mjs');
const origin = 'http://127.0.0.1:4178';
const browserCache = resolve(homedir(), 'Library/Caches/ms-playwright');
const browserExecutable = (existsSync(browserCache) ? readdirSync(browserCache) : [])
  .filter(entry => entry.startsWith('chromium_headless_shell-'))
  .map(entry => resolve(browserCache, entry, 'chrome-headless-shell-mac-arm64/chrome-headless-shell'))
  .find(existsSync);
assert.ok(browserExecutable, 'the bundled Playwright Chromium browser must be available');
const screenshots = resolve(root, 'docs/design-refresh/ref');
mkdirSync(screenshots, { recursive: true });
let browser;
try {
  const { chromium } = await import(pathToFileURL(playwrightModule).href);
  browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
  for (const width of [1280, 1024, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: true });
    await page.route(origin + '/**', route => {
      const path = new URL(route.request().url()).pathname;
      const file = resolve(root, 'dist', path === '/' ? 'index.html' : '.' + path);
      const ext = file.split('.').at(-1);
      const types = {html:'text/html',js:'text/javascript',css:'text/css',svg:'image/svg+xml',webp:'image/webp',png:'image/png',jpg:'image/jpeg',woff2:'font/woff2'};
      if (existsSync(file)) return route.fulfill({body:readFileSync(file),contentType:types[ext] || 'application/octet-stream'});
      return route.fulfill({status:404,body:''});
    });
    await page.goto(origin);
    const card = page.locator('.stack-card-active');
    const dots = page.locator('.carousel-dots button');
    await card.scrollIntoViewIfNeeded();
    for (let i = 0; i < 11; i++) {
      await dots.nth(i).click();
      await page.waitForTimeout(700);
      const metrics = await card.evaluate(el => {
        const image = el.querySelector('img');
        return { display:getComputedStyle(el).display, radius:parseFloat(getComputedStyle(el).borderRadius), image:!!image && image.complete && image.naturalWidth > 0, canvas:!!el.querySelector('canvas'), bottom:el.getBoundingClientRect().bottom, hint:document.querySelector('.product-gesture-hint').getBoundingClientRect().top };
      });
      assert.notEqual(metrics.display, 'inline', 'card must establish a clipping box');
      assert.ok(metrics.radius >= 20, 'rounded card');
      const interactive = await card.locator('.cybertruck-viewer').count();
      if (interactive) {
        await card.locator('canvas').waitFor({timeout:30000});
        await card.locator('.model-cover').waitFor({state:'hidden',timeout:30000});
        const layout = await card.evaluate(el => {
          const viewer = el.querySelector('.cybertruck-viewer').getBoundingClientRect();
          const copy = el.querySelector('.stack-card-copy').getBoundingClientRect();
          return {bottom:viewer.bottom,top:copy.top,background:getComputedStyle(el.firstElementChild).backgroundImage};
        });
        assert.ok(layout.top >= layout.bottom, 'viewer and caption do not overlap');
        assert.match(layout.background,/gradient/, 'chrome studio background');
        const swatch = card.locator('.cybertruck-swatches button').first();
        await swatch.click();
        assert.equal(await swatch.getAttribute('aria-pressed'),'true');
        await card.locator('.cybertruck-viewer').dispatchEvent('touchstart',{touches:[{clientX:200,clientY:200}],bubbles:true});
        await card.locator('.cybertruck-viewer').dispatchEvent('touchmove',{touches:[{clientX:100,clientY:200}],bubbles:true,cancelable:true});
        await card.locator('.cybertruck-viewer').dispatchEvent('touchend',{touches:[],bubbles:true});
        assert.equal(await dots.nth(i).getAttribute('aria-pressed'),'true','viewer drag does not switch cards');
      } else assert.ok(metrics.image, 'family preview loads');
      assert.ok(metrics.hint >= metrics.bottom + 12, 'hint below card');
      if (width !== 1024) await page.locator('#products').screenshot({ path:resolve(screenshots, `carousel-${width}-${String(i+1).padStart(2,'0')}.png`) });
    }
    // Wheel all cards in both directions, including the Chrome boundary.
    for (const direction of [-1, 1]) {
      for (let step = 0; step < 10; step++) {
        await page.waitForTimeout(260);
        const wheelTarget = await card.locator('canvas').count() ? card.locator('canvas') : card;
        await wheelTarget.dispatchEvent('wheel', {deltaY:direction*80, bubbles:true, cancelable:true});
        assert.match(await page.locator('.stack-selector').getAttribute('class'), /is-shuffling/);
        assert.equal(await card.evaluate(el => getComputedStyle(el).animationName), 'carousel-shuffle');
        const index = direction === -1 ? 9-step : step+1;
        assert.equal(await dots.nth(index).getAttribute('aria-pressed'), 'true');
        for (let tail=0;tail<3;tail++) await card.dispatchEvent('wheel', {deltaY:direction*20,bubbles:true,cancelable:true});
        assert.equal(await dots.nth(index).getAttribute('aria-pressed'), 'true', 'inertia stays on one slide');
      }
      await page.waitForTimeout(260);
      assert.equal(await card.evaluate((el, delta) => el.dispatchEvent(new WheelEvent('wheel',{deltaY:delta,bubbles:true,cancelable:true})),direction*80), true, 'outward wheel releases');
    }
    await dots.nth(0).click();
    for(let i=1;i<11;i++) {
      await card.dispatchEvent('touchstart',{touches:[{clientX:300,clientY:300}]});
      await card.dispatchEvent('touchmove',{touches:[{clientX:200,clientY:300}],cancelable:true});
      await card.dispatchEvent('touchend',{touches:[]});
      assert.equal(await dots.nth(i).getAttribute('aria-pressed'),'true');
    }
    await page.locator('.carousel-controls > button').first().click();
    assert.equal(await dots.nth(9).getAttribute('aria-pressed'),'true');
    await page.locator('.carousel-controls > button').last().click();
    assert.equal(await dots.nth(10).getAttribute('aria-pressed'),'true');
    await page.close();
  }
  console.log('Carousel: 33 card checks, wheel/touch navigation, inertia, boundaries, arrows and 22 screenshots passed');
} finally { await browser?.close(); }

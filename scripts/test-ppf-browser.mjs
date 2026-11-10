import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependencyRoot = resolve(dirname(process.execPath), '..');
const playwrightModule = process.env.PLAYWRIGHT_MODULE || resolve(dependencyRoot, 'node_modules/playwright/index.mjs');
const { chromium } = await import(pathToFileURL(playwrightModule).href);
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


let browser;
const output = '/tmp/sofine-ppf-review';
mkdirSync(output, { recursive: true });
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
  for (const mobile of [false, true]) {
    const page = await browser.newPage({ viewport: mobile ? {width:390,height:844} : {width:1280,height:1000}, deviceScaleFactor:2 });
    const errors = [], pngRequests = [];
    page.on('request', request => { if (request.url().includes('/assets/ppf-sequence/')) pngRequests.push(request.url()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    await page.locator('.ppf-sequence').waitFor();
    assert.equal(await page.locator('.home-page.is-mobile').count(), mobile ? 1 : 0);
    assert.equal(await page.locator('.ppf-sequence-mobile').count(), mobile ? 1 : 0);
    if (!mobile) {
      assert.equal(await page.locator('main').getAttribute('class'), 'home-page');
      assert.equal(await page.locator('.ppf-sequence').getAttribute('class'), 'ppf-sequence');
      assert.equal(await page.locator('.ppf-sequence-inner > div').count(), 2);
      assert.equal(await page.locator('.ppf-mobile-labels').count(), 0);
    }
    const go = async progress => page.evaluate(progress => {
      const section = document.querySelector('.ppf-sequence');
      window.scrollTo({top: section.getBoundingClientRect().top + scrollY + progress * (section.offsetHeight - section.querySelector('.ppf-sequence-sticky').offsetHeight), behavior:'instant'});
    }, progress);
    const state = () => page.evaluate(() => ({
      layers: [0,1,2,3].map(index => document.querySelector(`.ppf-film-layer--${index}`).style.transform),
      background: document.querySelector('.ppf-sequence-background').style.transform,
      backgroundImage: getComputedStyle(document.querySelector('.ppf-sequence-background')).backgroundImage,
      stickyTop: document.querySelector('.ppf-sequence-sticky').getBoundingClientRect().top,
      overflow: document.documentElement.scrollWidth > innerWidth
    }));
    const move = async progress => { await go(progress); await page.waitForTimeout(100); return state(); };
    const closed = await move(0);
    assert.equal(closed.layers[0], 'translateY(-28px)');
    const opening = await move(.375);
    const open = await move(.7);
    assert.equal(open.layers[0], 'translateY(-204px)');
    assert.ok(Math.abs(open.stickyTop) < 1, 'section is pinned during scrub');
    assert.notEqual(closed.background, open.background, 'background follows scroll');
    assert.match(open.backgroundImage, /gradient/, 'dark background has visible texture');
    assert.equal(open.overflow, false);
    assert.deepEqual(await page.locator('.ppf-film-label text').allTextContents(), ['PET Liner','Glue','High-Clarity TPU','Self-Healing Top Coat']);
    await page.screenshot({path:resolve(output, mobile ? 'mobile.png' : 'desktop.png')});
    const reverse = await move(.375);
    assert.deepEqual(reverse.layers, opening.layers, 'reverse retraces layer positions');
    assert.equal(reverse.background, opening.background, 'reverse retraces background');
    assert.deepEqual((await move(0)).layers, closed.layers);
    assert.deepEqual((await move(1)).layers, closed.layers, 'stack closes at end');
    assert.deepEqual(pngRequests, [], 'homepage does not request retired PNG frames');
    if (mobile) {
      await page.locator('#products').scrollIntoViewIfNeeded();
      const card = page.locator('.stack-card-active');
      const bounds = await card.boundingBox();
      assert.ok(Math.abs(bounds.width / bounds.height - .8) < .02, 'mobile card is 4:5');
      const selector = page.locator('.stack-selector');
      const before = await card.innerText();
      await selector.dispatchEvent('touchstart', {touches:[{clientX:200,clientY:400}]});
      await selector.dispatchEvent('touchmove', {touches:[{clientX:205,clientY:200}],cancelable:true});
      await selector.dispatchEvent('touchend', {touches:[]});
      assert.equal(await card.innerText(),before,'vertical gesture leaves card unchanged');
      await selector.dispatchEvent('touchstart', {touches:[{clientX:300,clientY:400}]});
      await selector.dispatchEvent('touchmove', {touches:[{clientX:100,clientY:405}]});
      assert.match(await selector.getAttribute('class'), /is-shuffling/);
      await selector.dispatchEvent('touchend', {touches:[]});
      await page.waitForTimeout(700);
      assert.notEqual(await card.innerText(), before, 'horizontal swipe selects next card');
      for (const section of await page.locator('.home-page > section').all()) {
        await section.scrollIntoViewIfNeeded();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'homepage section has no horizontal overflow');
      }
      await page.screenshot({path:resolve(output,'mobile-full.png'),fullPage:true});
      await page.setViewportSize({width:1280,height:1000});
      await page.waitForFunction(() => !document.querySelector('.is-mobile'));
      await page.setViewportSize({width:390,height:844});
      await page.waitForFunction(() => document.querySelector('.ppf-sequence-mobile'));
    }
    const button = page.locator('.ppf-explore-button');
    await button.focus();
    assert.equal(await button.evaluate(el => getComputedStyle(el).outlineStyle),'solid');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/#category=ppf');
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`${mobile ? 'Mobile' : 'Desktop'} SVG scrub/reverse, parallax, no PNG loads, focus and link PASS`);
  }
  for (const viewport of [{width:390,height:844}, {width:1280,height:1000}]) {
    const reduced = await browser.newPage({reducedMotion:'reduce',viewport});
    await reduced.goto(origin);
    await reduced.locator('.ppf-sequence').scrollIntoViewIfNeeded();
    await reduced.waitForFunction(() => document.querySelector('.ppf-film-layer--0').style.transform === 'translateY(-204px)');
    const before = await reduced.locator('.ppf-sequence-background').getAttribute('style');
    await reduced.evaluate(() => scrollBy(0, 200));
    await reduced.waitForTimeout(100);
    assert.equal(await reduced.locator('.ppf-sequence-background').getAttribute('style'), before);
    assert.equal(await reduced.locator('.ppf-sequence-sticky').evaluate(el=>getComputedStyle(el).position), 'relative');
    assert.equal(await reduced.locator('.ppf-film-label').first().evaluate(el=>getComputedStyle(el).opacity), '1');
    await reduced.screenshot({path:resolve(output, `reduced-motion-${viewport.width}.png`)});
    await reduced.close();
  }
  console.log('Desktop and mobile reduced motion: static expanded layers and background PASS');
} finally {
  await browser?.close();
  server.kill();
}

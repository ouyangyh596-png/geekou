import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependencyRoot = resolve(dirname(process.execPath), '..');
const playwrightModule = [resolve(dependencyRoot, 'node_modules/playwright/index.mjs'), resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')].find(existsSync);
const viteEntry = resolve(root, 'node_modules/vite/bin/vite.js');
const origin = 'http://127.0.0.1:4179';
const browserCache = resolve(homedir(), 'Library/Caches/ms-playwright');
const browserExecutable = (existsSync(browserCache) ? readdirSync(browserCache) : [])
  .filter(entry => entry.startsWith('chromium_headless_shell-'))
  .map(entry => resolve(browserCache, entry, 'chrome-headless-shell-mac-arm64/chrome-headless-shell'))
  .find(existsSync);
assert.ok(browserExecutable, 'the bundled Playwright Chromium browser must be available');
const server = spawn(process.execPath, [viteEntry, '--host', '127.0.0.1', '--port', '4179', '--strictPort'], {
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

const output = resolve(root, 'tmp/ppf-preview-2026-11-20');
mkdirSync(output, { recursive: true });
let browser;
try {
  await waitForServer();
  const { chromium } = await import(pathToFileURL(playwrightModule).href);
  browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
  for (const lang of ['en', 'zh']) for (const mobile of [false, true]) {
    const page = await browser.newPage({ viewport: { width: mobile ? 390 : 1440, height: mobile ? 844 : 1100 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(lang => localStorage.setItem('sofine-language', lang), lang);
    await page.goto(origin + '/#category=ppf');
    await page.locator('.ppf-series').waitFor();
    const radios = page.getByRole('radio');
    const selected = index => page.waitForFunction(index => document.querySelectorAll('[role=radio]')[index]?.getAttribute('aria-checked') === 'true', index);
    const choose = async index => { await radios.nth(index).click(); await selected(index); };
    assert.equal(await radios.count(), 3);
    const names = lang === 'en' ? ['Premium PPF', 'Econo PPF', 'Colored PPF'] : ['卓越PPF', '经济PPF', '彩色PPF'];
    assert.equal(await radios.nth(0).getAttribute('aria-checked'), 'true');
    let previousHeight;
    for (const [index, id] of ['premium', 'econo', 'colored'].entries()) {
      await choose(index);
      assert.equal(await radios.nth(index).getAttribute('aria-checked'), 'true');
      assert.equal(await page.locator('#ppf-detail-heading').textContent(), names[index]);
      assert.equal(await page.locator('.ppf-detail').count(), 1);
      assert.equal(await page.locator('.ppf-detail button, .ppf-detail a').count(), 0);
      const text = await page.locator('.ppf-detail').innerText();
      assert.doesNotMatch(text, /AF1810|AF1831|AF1841|Thickness/);
      if (index < 2) {
        const models = index === 0 ? ['AF1880', 'AF1850'] : ['AF1610', 'AF1650'];
        for (const model of models) assert.ok(text.includes(model));
        for (const value of ['High-clarity TPU protection Film', 'Transparent Permanent', 'PET liner Matte']) assert.ok(text.includes(value));
        assert.equal(await page.locator('.ppf-spec-table tbody tr').count(), 2);
        assert.equal(await page.locator('.ppf-spec-table th').count(), 5);
        assert.equal(await page.locator('.ppf-models article:visible').count(), mobile ? 2 : 0);
        assert.equal(await page.locator('.ppf-spec-table:visible').count(), mobile ? 0 : 1);
        const height = (await page.locator('.ppf-detail').boundingBox()).height;
        if (previousHeight) assert.equal(height, previousHeight, 'Premium/Econo heights match');
        previousHeight = height;
      } else {
        assert.equal(await page.locator('.ppf-subtypes > li').count(), 3);
        assert.match(text, lang === 'en' ? /Product information to be supplemented/ : /产品资料待补充/);
        assert.equal(await page.locator('.ppf-detail table').count(), 0);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: resolve(output, `${lang}-${mobile ? 'mobile' : 'desktop'}-${id}.png`), fullPage: true });
    }
    await radios.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await selected(1);
    assert.equal(await radios.nth(1).getAttribute('aria-checked'), 'true');
    assert.equal(await radios.nth(1).evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('ArrowLeft');
    await selected(0);
    assert.equal(await radios.nth(0).getAttribute('aria-checked'), 'true');
    await page.keyboard.press('ArrowUp');
    await selected(2);
    assert.equal(await radios.nth(2).getAttribute('aria-checked'), 'true');
    await page.keyboard.press('ArrowDown');
    await selected(0);
    assert.equal(await radios.nth(0).getAttribute('aria-checked'), 'true');
    // Real language control must preserve each selected series and its models.
    for (const index of [0, 1]) {
      await choose(index);
      await page.locator('.language-picker button[lang="zh"]').first().click();
      assert.ok((await page.locator('.ppf-detail').innerText()).includes(index ? 'AF1610' : 'AF1880'));
      await page.locator('.language-picker button[lang="en"]').first().click();
      assert.ok((await page.locator('.ppf-detail').innerText()).includes(index ? 'AF1650' : 'AF1850'));
    }
    // Pointer changes preserve scroll when the detail heading is already visible.
    await page.evaluate(() => {
      const top = document.querySelector('#ppf-detail-heading').getBoundingClientRect().top + scrollY;
      window.scrollTo(0, top - 300);
    });
    const beforeScroll = await page.evaluate(() => scrollY);
    await radios.nth(0).evaluate(el => el.dispatchEvent(new MouseEvent('click', {bubbles: true, detail: 1})));
    await selected(0);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => scrollY), beforeScroll, 'visible heading does not trigger scrolling');
    if (mobile) {
      await page.evaluate(() => scrollTo(0, 0));
      await radios.nth(1).evaluate(el => { el.focus({preventScroll: true}); el.dispatchEvent(new MouseEvent('click', {bubbles: true, detail: 1})); });
      await selected(1);
      await page.waitForFunction(() => document.querySelector('#ppf-detail-heading').getBoundingClientRect().top < innerHeight);
      assert.equal(await radios.nth(1).evaluate(el => el === document.activeElement), true, 'detail does not steal focus');
    }
    for (const width of [390, 600, 768, 899, 900, 1440]) {
      await page.setViewportSize({ width, height: 1100 });
      const boxes = await Promise.all([0, 1, 2].map(i => radios.nth(i).boundingBox()));
      if (width < 600) {
        assert.ok(boxes[0].y < boxes[1].y && boxes[1].y < boxes[2].y);
        assert.ok(boxes.every(box => box.height >= 76 && box.height <= 88));
      } else {
        assert.equal(boxes[0].y, boxes[2].y);
        assert.ok(Math.abs(boxes[0].width - boxes[2].width) < 1);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await choose(0);
    await page.evaluate(() => { location.hash = 'category=ppf&series=econo'; });
    await page.waitForFunction(() => document.querySelectorAll('[role=radio]')[1].getAttribute('aria-checked') === 'true');
    assert.equal(await radios.nth(1).getAttribute('aria-checked'), 'true');
    await page.evaluate(() => { location.hash = 'category=ppf'; });
    await page.waitForFunction(() => document.querySelector('[role=radio]').getAttribute('aria-checked') === 'true');
    await choose(1);
    await page.evaluate(() => { location.hash = 'category=ppf'; });
    await page.waitForFunction(() => document.querySelector('[role=radio]').getAttribute('aria-checked') === 'true');
    await page.goto(origin + '/#category=pvc-free-film');
    assert.equal(await page.getByRole('radio').count(), 0);
    assert.equal(await page.locator('.series-card').count(), 1);
    assert.match(await page.locator('.product-spec-table').innerText(), /AF1831[\s\S]*AF1841/);
    if (lang === 'en' && !mobile) await page.screenshot({path: resolve(output, 'en-desktop-pvc-free.png'), fullPage: true});
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS: PPF category EN/ZH, exact specs, radio keyboard, responsive layout and PVC-Free regression');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}

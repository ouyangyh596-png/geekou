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


const titles = ['#tvc-title', '.landing-title', '.ppf-brand-title', '#company h2', '#products h2', '#technology h2', '#contact h2'];
async function finalState(page, selector) {
  await page.waitForFunction(selector => {
    const el = document.querySelector(selector);
    return el && getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none' && el.getAnimations().length === 0;
  }, selector);
}
async function enter(page, selector) {
  await page.locator(selector).evaluate(el => el.scrollIntoView({block:'center', behavior:'instant'}));
  await finalState(page, selector);
}
let browser;
try {
  await waitForServer();
  const { chromium } = await import(pathToFileURL(playwrightModule).href);
  browser = await chromium.launch({headless:true, executablePath:browserExecutable});
  // A live accessibility preference change must settle pending titles permanently.
  for (const viewport of [{width:1440,height:900},{width:390,height:844}]) for (const lang of ['en','zh']) {
    const context = await browser.newContext({viewport, reducedMotion:'no-preference'});
    await context.addInitScript(lang => localStorage.setItem('sofine-language',lang),lang);
    const page = await context.newPage();
    await page.goto(origin, {waitUntil:'domcontentloaded'});
    await page.locator('#contact h2.headline-pending').waitFor({state:'attached'});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(80);
    for (const selector of titles) await finalState(page,selector);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForTimeout(80);
    assert.equal(await page.locator('.headline-pending').count(),0,'live reduced motion settles pending headings without re-hiding');
    for (const selector of titles) await finalState(page,selector);
    await context.close();
    console.log(`${viewport.width}px ${lang} live reduced-motion: passed`);
  }
  for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
    for (const lang of ['en','zh']) {
      for (const mode of ['motion','reduced','no-io']) {
        const context = await browser.newContext({viewport, reducedMotion:mode === 'reduced' ? 'reduce' : 'no-preference'});
        await context.addInitScript(({lang,mode}) => {
          localStorage.setItem('sofine-language',lang);
          if (mode === 'no-io') window.IntersectionObserver = undefined;
          window.headlineStarts = [];
          document.addEventListener('animationstart', e => {
            if (e.animationName === 'home-headline-enter') window.headlineStarts.push(e.target.id || e.target.className);
          });
        }, {lang,mode});
        const page = await context.newPage();
        await page.goto(origin);
        await page.locator('#contact h2').waitFor({state:'attached'});
        assert.equal(await page.locator('.home-page .headline-reveal').count(),7);
        await finalState(page,'#tvc-title');
        if (mode === 'motion') {
          const landingPending = await page.locator('.landing-title').evaluate(el => getComputedStyle(el).opacity === '0');
          if (!landingPending) await finalState(page,'.landing-title');
          const loadStarts = await page.evaluate(() => window.headlineStarts.length);
          assert.ok(loadStarts >= 1, 'the first-viewport hero title enters on load');
          assert.equal(loadStarts === 2, !landingPending, 'below-fold landing waits; in-view landing enters on load');
          // Switch language while remaining titles are still pending, then restore.
          for (const code of [lang === 'en' ? 'zh' : 'en', lang]) {
            await page.locator(`.language-picker button[lang="${code}"]`).evaluate(button => button.click());
            await page.waitForFunction(code => document.documentElement.lang === code, code);
          }
          for (const selector of (landingPending ? titles.slice(1) : titles.slice(2))) {
            assert.equal(await page.locator(selector).evaluate(el => getComputedStyle(el).opacity),'0',`${selector} waits for entry`);
            await enter(page,selector);
          }
          assert.equal(await page.evaluate(() => window.headlineStarts.length),7);
          for (const selector of [...titles].reverse()) await enter(page,selector);
          assert.equal(await page.evaluate(() => window.headlineStarts.length),7,'scrolling back must not replay');
        } else {
          for (const selector of titles) await finalState(page,selector);
          assert.equal(await page.evaluate(() => window.headlineStarts.length),0);
        }
        await page.evaluate(lang => window.dispatchEvent(new CustomEvent('sofine-language-change',{detail:lang === 'en' ? 'zh' : 'en'})),lang);
        for (const selector of titles) await enter(page,selector);
        if (mode === 'motion') assert.equal(await page.evaluate(() => window.headlineStarts.length),7,'language change preserves seen nodes');
        // Reconnect on the desktop/mobile layout boundary without replaying seen nodes.
        await page.setViewportSize({width:viewport.width === 390 ? 1440 : 390,height:viewport.height});
        for (const selector of titles) await enter(page,selector);
        if (mode === 'motion') assert.equal(await page.evaluate(() => window.headlineStarts.length),7,'resize must not replay');
        await page.setViewportSize(viewport);
        await page.evaluate(() => { location.hash = 'company'; });
        await enter(page,'#company h2');
        await page.evaluate(() => { location.hash = 'category=super-chrome-film'; });
        await page.locator('.category-page').waitFor();
        assert.equal(await page.locator('.headline-reveal').count(),0);
        await page.evaluate(() => { location.hash = 'top'; });
        await page.locator('.home-page').waitFor();
        for (const selector of titles) await enter(page,selector);
        console.log(`${viewport.width}px ${lang} ${mode}: passed`);
        await context.close();
      }
    }
  }
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}

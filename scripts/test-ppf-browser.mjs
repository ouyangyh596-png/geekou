import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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


const { chromium } = await import(pathToFileURL(playwrightModule).href);
let browser;
const output = '/tmp/sofine-ppf-review';
mkdirSync(output, { recursive: true });
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
  for (const mobile of [false, true]) {
    const page = await browser.newPage({ viewport: mobile ? {width:390,height:844} : {width:1440,height:1000}, deviceScaleFactor:2 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    await page.locator('.ppf-sequence').waitFor();
    const go = async progress => page.evaluate(progress => {
      const section = document.querySelector('.ppf-sequence');
      window.scrollTo({top: section.getBoundingClientRect().top + scrollY + progress * (section.offsetHeight - innerHeight), behavior:'instant'});
    }, progress);
    const frame = () => page.locator('.ppf-sequence-canvas').getAttribute('aria-label').then(label => Number(label.match(/(\d+)$/)[1]) - 1);
    await go(0);
    await page.waitForTimeout(800);
    const during = await frame();
    assert.ok(during > 0 && during < 73, `intro plays: ${during}`);
    await page.waitForFunction(() => document.querySelector('.ppf-sequence-canvas').getAttribute('aria-label').endsWith(' 74'), null, {timeout:15000});
    await page.screenshot({path:resolve(output, mobile ? 'mobile.png' : 'desktop.png')});
    await go(.5); await page.waitForTimeout(900);
    assert.equal(await frame(),94);
    await go(1); await page.waitForTimeout(900);
    assert.equal(await frame(),114);
    await go(0); await page.waitForTimeout(900);
    assert.equal(await frame(),73);
    const metrics = await page.locator('.ppf-sequence-canvas').evaluate(canvas => ({
      width: canvas.width, cssWidth:canvas.getBoundingClientRect().width,
      overflow:document.documentElement.scrollWidth > innerWidth,
      pixel:canvas.getContext('2d').getImageData(canvas.width/2,canvas.height/2,1,1).data[3]
    }));
    assert.equal(metrics.width,Math.round(metrics.cssWidth*2));
    assert.equal(metrics.overflow,false);
    assert.ok(metrics.pixel > 0, 'canvas is painted');
    const button = page.locator('.ppf-explore-button');
    await button.focus();
    assert.equal(await button.evaluate(el => getComputedStyle(el).outlineStyle),'solid');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/#category=ppf');
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`${mobile ? 'Mobile' : 'Desktop'} intro, scrub/reverse, DPR, canvas, focus, link PASS`);
  }
  const reduced = await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:844}});
  await reduced.goto(origin);
  await reduced.locator('.ppf-sequence').scrollIntoViewIfNeeded();
  await reduced.waitForFunction(() => document.querySelector('.ppf-sequence-canvas').getAttribute('aria-label').endsWith(' 115'));
  await reduced.screenshot({path:resolve(output,'reduced-motion.png')});
  console.log('Reduced motion final frame PASS');
} finally {
  await browser?.close();
  server.kill();
}

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependencyRoot = resolve(dirname(process.execPath), '..');
const playwrightModule = [resolve(dependencyRoot, 'node_modules/playwright/index.mjs'), resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')].find(existsSync);
const viteEntry = resolve(root, 'node_modules/vite/bin/vite.js');
const origin = 'http://127.0.0.1:4187';
const browserCache = resolve(homedir(), 'Library/Caches/ms-playwright');
const browserExecutable = (existsSync(browserCache) ? readdirSync(browserCache) : [])
  .filter(entry => entry.startsWith('chromium_headless_shell-'))
  .map(entry => resolve(browserCache, entry, 'chrome-headless-shell-mac-arm64/chrome-headless-shell'))
  .find(existsSync);
assert.ok(browserExecutable, 'the bundled Playwright Chromium browser must be available');
const server = spawn(process.execPath, [viteEntry, '--host', '127.0.0.1', '--port', '4187', '--strictPort'], {
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


let browser;try{await waitForServer();
    const {chromium}=await import(pathToFileURL(playwrightModule).href);browser=await chromium.launch({headless:true,executablePath:browserExecutable});
for(const viewport of [{width:1440,height:900},{width:390,height:844}])for(const lang of ['en','zh'])for(const mode of ['normal','no-io','reduced']){const context=await browser.newContext({viewport,reducedMotion:mode==='reduced'?'reduce':'no-preference'});
    await context.addInitScript(({lang,mode})=>{localStorage.setItem('sofine-language',lang);
    if(mode==='no-io')window.IntersectionObserver=undefined;window.moduleTitleStarts=0;document.addEventListener('animationstart',e=>{if(e.animationName==='home-headline-enter')window.moduleTitleStarts++});},{lang,mode});
    const page=await context.newPage();
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.locator('#contact').waitFor({state:'attached'});
    await page.waitForTimeout(700);
const top=await page.locator('.landing').evaluate(e=>e.getBoundingClientRect().top+scrollY);
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top-viewport.height/2);
    await page.waitForTimeout(100);
let state=await page.locator('.landing').evaluate(e=>({seam:getComputedStyle(e,'::before').opacity,transform:getComputedStyle(e).transform,media:getComputedStyle(e.querySelector('video')).transform}));
    assert.equal(state.transform,'none');
    if(mode!=='reduced')assert.equal(await page.locator('.landing').evaluate(e=>getComputedStyle(e,'::before').pointerEvents),'none');
    if(mode!=='reduced'){assert.ok(Number(state.seam)>.99);
    assert.notEqual(state.media,'none');}else assert.equal(await page.locator('.module-motion').count(),0);
if(mode!=='reduced'){const mediaBox=await page.locator('.landing-image').evaluate(e=>{const r=e.getBoundingClientRect(),m=e.querySelector('video'),v=m.getBoundingClientRect();return {covered:v.top<=r.top&&v.bottom>=r.bottom,fit:getComputedStyle(m).objectFit};});
    assert.ok(mediaBox.covered,'translated media covers its clip without a gap');
    assert.equal(mediaBox.fit,'cover');}
await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.module-motion').count(),0);
    assert.equal(await page.locator('.landing').evaluate(e=>e.style.length),0);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.module-motion').count(),1);
// Native wheel over the hero and keyboard scrolling remain uncancelled.
await page.evaluate(()=>scrollTo({top:100,behavior:'instant'}));
    await page.mouse.move(30,200);
    const start=await page.evaluate(()=>scrollY);
    await page.mouse.wheel(0,200);
    await page.waitForTimeout(350);
    assert.ok(await page.evaluate(()=>scrollY)>start);
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(500);
    assert.ok(await page.evaluate(()=>scrollY)>start+200);
const ppf=await page.locator('.ppf-sequence-track').evaluate(e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight}));
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),ppf.top+300);
    await page.waitForTimeout(700);
    assert.ok(Math.abs(await page.locator('.ppf-sequence-sticky').evaluate(e=>e.getBoundingClientRect().top))<1);
    for(const selector of ['.ppf-sequence','.ppf-sequence-track','.ppf-sequence-sticky'])assert.equal(await page.locator(selector).evaluate(e=>getComputedStyle(e).transform),'none');
await page.evaluate(()=>location.hash='contact');
    await page.waitForFunction(()=>{const e=document.querySelector('#contact');return e && (Math.abs(e.getBoundingClientRect().top)<40 || Math.abs(scrollY-(document.documentElement.scrollHeight-innerHeight))<2);},null,{timeout:5000});
    const anchor=await page.locator('#contact').evaluate(e=>({top:e.getBoundingClientRect().top,scrollY,max:document.documentElement.scrollHeight-innerHeight,height:e.offsetHeight}));
    console.log('anchor',viewport.width,lang,mode,JSON.stringify(anchor));
    assert.ok(Math.abs(anchor.top)<150 || Math.abs(anchor.scrollY-anchor.max)<2,'contact anchor reaches target or natural document end');
    await page.evaluate(()=>location.hash='category=super-chrome-film');
    await page.locator('.category-page').waitFor();
    assert.equal(await page.locator('.module-motion').count(),0);
    await page.evaluate(()=>location.hash='top');
    await page.locator('.home-page.module-motion').waitFor();
    await page.setViewportSize({width:viewport.width===390?1440:390,height:viewport.height});
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.module-motion').count(),1);
    assert.equal(await page.locator('.home-page').evaluate(e=>e.classList.contains('is-mobile')),viewport.width!==390);
await context.close();
    console.log(`${viewport.width} ${lang} ${mode}: module/browser safety passed`);}
}
finally {await browser?.close();server.kill('SIGTERM');}

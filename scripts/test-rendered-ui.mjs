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
const playwrightModule = [resolve(dependencyRoot, 'node_modules/playwright/index.mjs'), resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')].find(existsSync);
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
      await panel.locator('h2').scrollIntoViewIfNeeded();
      await page.waitForFunction(selector => [...document.querySelectorAll(selector + ' h2')].every(el => getComputedStyle(el).opacity === '1' && el.getAnimations().length === 0), selector);
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
  for (let index = 0; index < categoryOrder.length; index += 1) {
    await page.locator('.carousel-dots button').nth(index).click();
    const layout = await page.locator('.stack-card-active').evaluate(card => {
      const title = card.querySelector('strong').getBoundingClientRect();
      const description = card.querySelector('small').getBoundingClientRect();
      const copy = card.querySelector('.stack-card-copy').getBoundingClientRect();
      const bounds = card.getBoundingClientRect();
      return { separate: title.bottom <= description.top, contained: copy.bottom <= bounds.bottom + 1, visible: description.height > 0 };
    });
    assert.deepEqual(layout, { separate: true, contained: true, visible: true }, categoryOrder[index]);
  }
  await page.locator('.carousel-dots button').first().click();
  const active = page.locator('.stack-card-active strong');
  const initial = await active.textContent();
  assert.ok(initial.trim());
  assert.equal(await page.locator('.stack-index').count(), 0);
  assert.equal(await page.locator('.carousel-dots button').count(), 11);
  await page.locator('.carousel-controls > button').last().click();
  await page.waitForFunction(before => document.querySelector('.stack-card-active strong').textContent !== before, initial);
  await page.locator('.stack-selector').focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(before => document.querySelector('.stack-card-active strong').textContent === before, initial);
  // Real wheel input must change a card without moving the document.
  await page.locator('.carousel-dots button').nth(4).click();
  await page.locator('.stack-selector').scrollIntoViewIfNeeded();
  await page.locator('.stack-card-active').hover();
  await page.waitForTimeout(300);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 80);
  await page.waitForFunction(() => document.querySelectorAll('.carousel-dots button')[5].getAttribute('aria-pressed') === 'true');
  for (let tick = 0; tick < 5; tick += 1) {
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(30);
  }
  assert.equal(await page.locator('.carousel-dots button').nth(5).getAttribute('aria-pressed'), 'true', 'inertia selects only one card');
  assert.ok(Math.abs(await page.evaluate(() => window.scrollY) - scrollBefore) <= 1, 'captured wheel must not scroll the page');
  await page.waitForTimeout(300);
  await page.locator('.carousel-dots button').last().click();
  await page.locator('.stack-card-active').hover();
  const boundaryBefore = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 100);
  await page.waitForFunction(before => window.scrollY > before, boundaryBefore);
  // Native cancelable touchmove verifies the event wiring independently of wheel.
  await page.locator('.carousel-dots button').nth(4).click();
  const touchResult = await page.locator('.stack-card-active').evaluate(card => {
    const fire = (type, y) => {
      const contact = new Touch({ identifier: 1, target: card, clientX: 100, clientY: y });
      const event = new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [contact], changedTouches: [contact] });
      card.dispatchEvent(event);
      return event.defaultPrevented;
    };
    fire('touchstart', 200);
    const captured = fire('touchmove', 130);
    fire('touchmove', 70);
    fire('touchend', 70);
    return captured;
  });
  assert.equal(touchResult, true, 'touchmove must be captured before document scrolling');
  await page.waitForFunction(() => document.querySelectorAll('.carousel-dots button')[5].getAttribute('aria-pressed') === 'true');
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
async function checkTranslucentLayout(page, language, mobile = false) {
  await page.evaluate(() => document.fonts.ready);
  const measurements = await page.locator('.translucent-series .product-spec-table').evaluateAll(wrappers => wrappers.map(wrapper => {
    wrapper.scrollLeft = 0;
    const table = wrapper.querySelector('table');
    const box = element => {
      const { left, right, width } = element.getBoundingClientRect();
      return { left, right, width };
    };
    const cells = [...table.querySelectorAll('th, td')];
    const clipped = cells.filter(cell => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      const bounds = cell.getBoundingClientRect();
      return [...range.getClientRects()].some(rect => rect.left < bounds.left - 1 || rect.right > bounds.right + 1 || rect.bottom > bounds.bottom + 1);
    }).map(cell => cell.textContent);
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    wrapper.scrollLeft = maxScroll;
    const reachedScroll = wrapper.scrollLeft;
    const rightReachable = table.getBoundingClientRect().right <= wrapper.getBoundingClientRect().right + 1;
    wrapper.scrollLeft = 0;
    return {
      headers: [...table.querySelectorAll('thead tr:first-child > th')].map(box),
      // The series code is a row-header th; the remaining four values are td.
      values: [...table.querySelectorAll('tbody tr:first-child > th, tbody tr:first-child > td')].map(box),
      clipped, maxScroll, reachedScroll, rightReachable,
      overflowX: getComputedStyle(wrapper).overflowX,
      wrapperWidth: wrapper.clientWidth, tableWidth: table.getBoundingClientRect().width
    };
  }));
  assert.equal(measurements.length, 2);
  const labels = ['Product code', 'Film', 'Film thickness (index 2)', '4th column: Maximum width / Perforation ratio (index 3)', 'Liner'];
  for (const [index, table] of measurements.entries()) {
    assert.deepEqual(table.clipped, [], `${language} ${mobile ? 'mobile' : 'desktop'} table ${index}: cell text must fit without clipping`);
    assert.equal(table.headers.length, 5);
    assert.equal(table.values.length, 5);
    if (mobile && table.maxScroll > 1) {
      assert.ok(['auto', 'scroll'].includes(table.overflowX), `${language} table ${index}: horizontal overflow must be scrollable`);
      assert.ok(Math.abs(table.reachedScroll - table.maxScroll) <= 1 && table.rightReachable, `${language} table ${index}: last column must be reachable by scrolling`);
    }
  }
  for (const kind of ['headers', 'values']) {
    for (let column = 0; column < 5; column += 1) {
      for (const edge of ['left', 'right', 'width']) {
        const a = measurements[0][kind][column][edge];
        const b = measurements[1][kind][column][edge];
        assert.ok(Math.abs(a - b) <= 1, `${language} ${mobile ? 'mobile (scroll reset)' : 'desktop'} ${kind} ${labels[column]} ${edge}: SF6000=${a}, SF9000=${b}`);
      }
    }
  }
  console.log(`PASS: ${language} ${mobile ? 'mobile 390 scroll/clipping' : 'desktop 1440 column boundaries'} ${JSON.stringify(measurements)}`);
}

async function checkPreviewCatalogue(browser) {
  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await reduced.goto(`${origin}/#category=translucent-film`, { waitUntil: 'networkidle' });
  for (const language of ['en', 'zh', 'en']) {
    await reduced.locator(`.language-picker button[lang="${language}"]`).click();
    const content = language === 'zh' ? chineseSiteContent : englishSiteContent;
    await reduced.goto(`${origin}/#category=translucent-film`, { waitUntil: 'networkidle' });
    assert.equal(await reduced.locator('.category-page-copy > p').last().textContent(), content.categories['translucent-film'].intro);
    assert.equal(await reduced.locator('.product-spec-table').count(), 2);
    const assertTranslucentTable = async (index, content = language === 'zh' ? chineseSiteContent : englishSiteContent) => {
      const table = reduced.locator('.product-spec-table').nth(await reduced.locator('.product-spec-table').count() === 1 ? 0 : index);
      const keys = index === 0 ? ['Film', 'SF6000 thickness', 'Maximum width', 'SF6000 liner'] : ['Film', 'SF9000 thickness', 'SF9000 perforation', 'SF9000 liner'];
      const values = index === 0 ? ['Matte polymeric PVC', '3.2 mil (approx. 80 μm)', '2.22 m', '75 μm PET'] : ['Dual color polymeric PVC', '180 mic', '20%', '140 gsm PE coated paper'];
      assert.equal(await table.locator('tbody tr').count(), 1);
      assert.equal(await table.locator('tbody th').textContent(), index === 0 ? 'SF6000 Series' : 'SF9000 Series');
      assert.deepEqual(await table.locator('thead th').allTextContents(), [content.products.productCode, ...keys.map(key => content.specLabels[key])]);
      assert.deepEqual(await table.locator('tbody td').allTextContents(), values.map(value => content.specValues[value]));
      assert.equal(await table.locator('.film-colour-chip, caption').count(), 0);
      assert.ok(!(await table.textContent()).includes(content.swatchNotice));
    };
    await assertTranslucentTable(0);
    await assertTranslucentTable(1);
    await checkTranslucentLayout(reduced, language);
    await reduced.setViewportSize({ width: 390, height: 844 });
    await checkTranslucentLayout(reduced, language, true);
    await reduced.setViewportSize({ width: 1440, height: 900 });
    await reduced.screenshot({ path: resolve(screenshots, `preview-translucent-${language}.png`), fullPage: true });
    for (const index of [0, 1]) {
      await reduced.locator('.series-card').nth(index).click();
      await reduced.locator('.series-card-selected').filter({ hasText: index === 0 ? 'SF6000' : 'SF9000' }).waitFor();
      assert.equal(await reduced.locator('.product-spec-table').count(), 1);
      assert.equal(await reduced.locator('.series-card-selected h2').textContent(), content.categories['translucent-film'].series[index].name);
      await assertTranslucentTable(index);
      await reduced.reload({ waitUntil: 'networkidle' });
      await assertTranslucentTable(index);
    }
    await reduced.goto(`${origin}/#category=translucent-film&series=SF9000%20Series`, { waitUntil: 'networkidle' });
    await assertTranslucentTable(1);
    if (language === 'en') {
      for (const toggle of ['en', 'zh', 'en']) {
        await reduced.locator(`.language-picker button[lang="${toggle}"]`).click();
        await assertTranslucentTable(1, toggle === 'zh' ? chineseSiteContent : englishSiteContent);
      }
    }
    console.log(`PASS: ${language} Translucent series rows, four localized specs, no colours, card click-through and deep links`);
    const chromeUrl = `${origin}/#category=super-chrome-film`;
    const printableUrl = `${chromeUrl}&series=Printable%20Super%20Chrome%20Film`;
    const printableTitle = language === 'zh' ? '可打印超亮光电镀车身膜' : 'Printable Super Chrome Film';
    const detailValues = [language === 'zh' ? '可打印超亮光电镀车身膜' : 'Printable Super Glossy Chrome Wrap Film'];
    const reducedLanguage = language;
    const assertPrintableDetail = async (language = reducedLanguage) => {
      const detailHeaders = language === 'zh'
        ? ['产品型号', '材料', '厚度', '表面效果', '胶粘剂', '底纸', '打印兼容性']
        : ['Product code', 'Material', 'Thickness', 'Finish', 'Adhesive', 'Liner', 'Print compatibility'];
      const detailValues = [language === 'zh' ? '可打印超亮光电镀车身膜' : 'Printable Super Glossy Chrome Wrap Film',
        '100 µm', ...(language === 'zh' ? ['银色超亮光', '透明可移胶', '压纹哑光 PET 底膜'] : ['Silver super glossy', 'Transparent removable', 'Embossed Matte PET Liner']), 'SOL / ESOL / UV / Latex'];
      const table = reduced.locator('.product-spec-table');
      assert.deepEqual(await table.locator('thead th').allTextContents(), detailHeaders);
      assert.equal(await table.locator('tbody tr').count(), 1);
      assert.equal(await table.locator('tbody th').textContent(), 'AF-20100G');
      assert.deepEqual(await table.locator('tbody td').allTextContents(), detailValues);
      for (const cell of await table.locator('th, td').all()) assert.ok(await cell.isVisible(), 'all authentic specification cells must be visible');
      await reduced.locator('.printable-wrap-config').waitFor({ state: 'visible' });
    };
    await reduced.goto(chromeUrl, { waitUntil: 'networkidle' });
    assert.deepEqual(await reduced.locator('.product-spec-table thead th').allTextContents(), [content.products.productCode, content.specLabels.Color]);
    assert.equal(await reduced.locator('.product-spec-table tbody tr').count(), 10);
    assert.deepEqual(await reduced.locator('.product-spec-table tbody th').allTextContents(), [
      'AF-20521M', 'AF-20280M', 'AF-20100M', 'AF-20401M', 'AF-20850M',
      'AF-20701M', 'AF-20801M', 'AF-20601M', 'AF-20403M', 'AF-20100G'
    ]);
    assert.equal(await reduced.locator('.product-spec-table tbody tr').last().locator('th').textContent(), 'AF-20100G');
    assert.equal(await reduced.locator('.product-spec-table tbody tr').last().locator('td').textContent(), detailValues[0]);
    // Exercise the real category-card transition, not just the hash route.
    await reduced.locator('.series-card').filter({ has: reduced.getByRole('heading', { name: printableTitle, exact: true }) }).click();
    await reduced.waitForURL(printableUrl);
    await reduced.locator('.series-card-selected').filter({ hasText: printableTitle }).waitFor();
    await assertPrintableDetail();
    if (language === 'en') {
      for (const toggle of ['en', 'zh', 'en']) {
        await reduced.locator(`.language-picker button[lang="${toggle}"]`).click();
        await assertPrintableDetail(toggle);
      }
    }
    // A fresh document must restore the same selected-series detail from its deep link.
    await reduced.reload({ waitUntil: 'networkidle' });
    assert.equal(reduced.url(), printableUrl);
    await assertPrintableDetail();
    await reduced.screenshot({ path: resolve(screenshots, `preview-printable-${language}.png`), fullPage: true });
    await reduced.goto(`${chromeUrl}&series=${encodeURIComponent('Super Chrome Film classic colours')}`, { waitUntil: 'networkidle' });
    assert.deepEqual(await reduced.locator('.product-spec-table thead th').allTextContents(), [content.products.productCode, content.specLabels.Color]);
    assert.equal(await reduced.locator('.product-spec-table tbody tr').count(), 9);
    console.log(`PASS: ${language} Chrome overview, Printable card click-through, six visible specifications, configurator and deep link`);
  }
  await reduced.screenshot({ path: resolve(screenshots, 'preview-catalogue.png'), fullPage: true });
  await reduced.close();
  console.log('PASS: preview catalogue EN/ZH toggles, series specs without chips, Chrome columns and series routes');
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
  await checkPreviewCatalogue(browser);
  if (process.env.CATALOGUE_UI_ONLY !== '1') {
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
    assert.equal(await page.locator('.home-page > .header').evaluate(el => Math.round(el.getBoundingClientRect().top + window.scrollY)), 0);
    assert.equal(await page.locator('#tvc-title').textContent(), englishSiteContent.home.tvc.title);
    assert.equal(await page.locator('.tvc-subtitle').textContent(), englishSiteContent.home.tvc.subtitle);
    assert.equal(await page.locator('.tvc-brand img').getAttribute('alt'), 'SO-FINE');
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
    await page.locator('.language-picker button[lang="zh"]').click();
    assert.equal(await page.locator('.language-picker button[lang="zh"]').getAttribute('aria-pressed'), 'true');
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
  }
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

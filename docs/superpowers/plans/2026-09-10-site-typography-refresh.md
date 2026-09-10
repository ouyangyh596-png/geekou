# SO-FINE Website Typography Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply locally hosted Space Grotesk display typography, Manrope body typography and DM Mono technical typography consistently across the SO-FINE website.

**Architecture:** Store the three Latin WOFF2 font assets in `public/fonts` and declare them once at the top of `src/polish.css`. Expose display, text and mono families through CSS custom properties, then use narrowly scoped selectors to replace conflicting legacy overrides while preserving serif accent words.

**Tech Stack:** React 19, Vite 8, CSS, Node assertion scripts, locally hosted Google Fonts WOFF2 assets.

## Global Constraints

- Display titles use Space Grotesk.
- Body, navigation, buttons and form controls use Manrope.
- Technical labels, product codes and indexes use DM Mono.
- Production must not request a runtime font service.
- Use `font-display: swap` and retain system fallbacks.
- Existing layout, copy, colors, imagery, semantics and interactions remain unchanged except for font-metric spacing corrections.
- Desktop and 390 px mobile pages must not gain page-level horizontal overflow.

---

### Task 1: Local font assets and typography contracts

**Files:**
- Create: `public/fonts/space-grotesk-latin.woff2`
- Create: `public/fonts/manrope-latin.woff2`
- Create: `public/fonts/dm-mono-regular-latin.woff2`
- Create: `public/fonts/dm-mono-medium-latin.woff2`
- Create: `scripts/test-typography.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: browser WOFF2 support and Vite's static `public` directory.
- Produces: stable `/fonts/*.woff2` URLs and a `pnpm test-typography` verification command.

- [ ] **Step 1: Write the failing source and asset test**

Create `scripts/test-typography.mjs` that reads `src/polish.css`, checks that every required font asset exists and is non-empty, and asserts all three family variables and `font-display: swap` declarations:

```js
import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'

const css = readFileSync(new URL('../src/polish.css', import.meta.url), 'utf8')
for (const file of ['space-grotesk-latin.woff2', 'manrope-latin.woff2', 'dm-mono-regular-latin.woff2', 'dm-mono-medium-latin.woff2']) {
  const path = new URL(`../public/fonts/${file}`, import.meta.url)
  assert.ok(existsSync(path) && statSync(path).size > 1000, `${file} must be a real local font`)
}
assert.match(css, /--font-display:\s*"Space Grotesk"/)
assert.match(css, /--font-text:\s*Manrope/)
assert.match(css, /--font-mono:\s*"DM Mono"/)
assert.equal((css.match(/font-display:\s*swap/g) || []).length, 4)
console.log('Typography asset and token checks passed')
```

- [ ] **Step 2: Register and run the test to verify RED**

Add `"test-typography": "node scripts/test-typography.mjs"` to `package.json` and append `&& pnpm test-typography` to `test-release`.

Run: `pnpm test-typography`

Expected: FAIL because the local assets and declarations do not exist.

- [ ] **Step 3: Download the four approved Latin WOFF2 assets**

Create `public/fonts`, then download the Latin subsets returned by the Google Fonts CSS API for Space Grotesk variable weights 400–600, Manrope variable weights 400–600, and DM Mono 400/500. Rename them to the exact paths listed above. Verify every response is WOFF2 using `file public/fonts/*.woff2`.

- [ ] **Step 4: Declare local faces and family tokens**

At the start of `src/polish.css`, add:

```css
@font-face { font-family:"Space Grotesk"; src:url("/fonts/space-grotesk-latin.woff2") format("woff2"); font-style:normal; font-weight:400 600; font-display:swap; }
@font-face { font-family:Manrope; src:url("/fonts/manrope-latin.woff2") format("woff2"); font-style:normal; font-weight:400 600; font-display:swap; }
@font-face { font-family:"DM Mono"; src:url("/fonts/dm-mono-regular-latin.woff2") format("woff2"); font-style:normal; font-weight:400; font-display:swap; }
@font-face { font-family:"DM Mono"; src:url("/fonts/dm-mono-medium-latin.woff2") format("woff2"); font-style:normal; font-weight:500; font-display:swap; }
:root {
  --font-display:"Space Grotesk","Helvetica Neue",Arial,sans-serif;
  --font-text:Manrope,"Avenir Next","Segoe UI",Arial,sans-serif;
  --font-mono:"DM Mono",ui-monospace,"SFMono-Regular",Consolas,monospace;
}
```

- [ ] **Step 5: Run the test to verify GREEN**

Run: `pnpm test-typography`

Expected: `Typography asset and token checks passed`.

- [ ] **Step 6: Commit**

```bash
git add public/fonts src/polish.css scripts/test-typography.mjs package.json
git commit -m "feat: add local website typefaces"
```

---

### Task 2: Full-site typography mapping and responsive verification

**Files:**
- Modify: `src/polish.css`
- Modify: `scripts/test-typography.mjs`
- Modify if visual evidence requires: `src/styles.css`

**Interfaces:**
- Consumes: `--font-display`, `--font-text` and `--font-mono` from Task 1.
- Produces: consistent typography across homepage, category, detail, contact, Cybertruck and printable-wrap views.

- [ ] **Step 1: Extend the test with failing role mappings**

Add assertions that require the body to use `--font-text`, all `h1`–`h4` elements to use `--font-display`, technical selectors to use `--font-mono`, and serif accent selectors to remain present:

```js
assert.match(css, /body[^}]*font-family:\s*var\(--font-text\)/s)
assert.match(css, /h1,\s*h2,\s*h3,\s*h4[^}]*font-family:\s*var\(--font-display\)/s)
assert.match(css, /\.kicker[^}]*font-family:\s*var\(--font-mono\)/s)
assert.match(css, /\.landing h1 em[\s\S]*font-family:\s*var\(--font-serif\)/)
```

Run: `pnpm test-typography`

Expected: FAIL because the semantic mappings are incomplete.

- [ ] **Step 2: Apply the semantic font mapping**

In `src/polish.css`, set body and form controls to `--font-text`; set primary headings and major visual card titles to `--font-display`; set kickers, indexes, image counters, product codes and specification headers to `--font-mono`. Define `--font-serif:"Bodoni 72","Iowan Old Style",Georgia,serif` and retain it only for existing italic accent spans and `.company-title-years`.

Remove or override the conflicting `.home-page` and `body` font declarations near the end of `src/styles.css`. Do not change component markup or heading levels.

- [ ] **Step 3: Tune display metrics**

Use Space Grotesk weights 500 and 600. Keep primary title tracking between `-.055em` and `-.035em`, card-title tracking between `-.035em` and `-.02em`, and line height between `.95` and `1.08`. On screens below 800 px, preserve the existing responsive sizes while ensuring long category, product and configurator headings can wrap without clipping.

- [ ] **Step 4: Verify source checks and release build**

Run: `pnpm test-typography && pnpm test-release && pnpm build && git diff --check`

Expected: all commands exit 0; Vite may retain its existing Three.js chunk-size warning.

- [ ] **Step 5: Verify rendered desktop and mobile pages**

Run the production preview and inspect the homepage, one category route, one product detail route, the Cybertruck colour study and printable-wrap configurator at 1440 px and 390 px widths. In browser-computed styles, confirm large headings resolve to `"Space Grotesk"`, body copy resolves to `Manrope`, technical labels resolve to `"DM Mono"`, font requests return successfully, `scrollWidth <= clientWidth + 1`, and the console has no errors.

- [ ] **Step 6: Commit evidence-based corrections**

```bash
git add src/polish.css src/styles.css scripts/test-typography.mjs
git commit -m "style: refresh full-site typography"
```

- [ ] **Step 7: Deploy and verify production**

Push `main` to `origin`. Wait until GitHub verification, Cloudflare Pages and Workers Builds all complete successfully. Confirm the production HTML references the new build and that `/fonts/space-grotesk-latin.woff2`, `/fonts/manrope-latin.woff2` and both DM Mono assets return HTTP 200.

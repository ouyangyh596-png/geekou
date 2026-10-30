# Full-Site Typography and Layout Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Space Grotesk with a locally hosted Barlow Semi Condensed display system and refine the existing SO-FINE site’s typography, spacing, layout hierarchy, and colour contrast without changing any approved content or behaviour.

**Architecture:** Keep the React component tree and content sources intact. Implement the redesign through local font assets, typography/design tokens, and scoped CSS overrides, with source-contract tests for font roles and rendered Playwright checks for responsive layout, overflow, and computed typography.

**Tech Stack:** React 19, Vite 8, CSS, locally hosted WOFF2 fonts, Node.js assertion scripts, Playwright, Cloudflare Pages.

## Global Constraints

- The deployed SO-FINE website is the source of truth for all text, product names, specifications, media, links, interactions, and page order.
- Do not add, remove, rewrite, translate, reorder, or rename website copy.
- Do not introduce VEYRA wording, sections, assets, branding, or implementation instructions.
- Use locally hosted Barlow Semi Condensed weights 500 and 600 for display typography.
- Keep Manrope for body and interface text and DM Mono for technical labels and metadata.
- Remove Space Grotesk from active production typography.
- Preserve navigation, carousel wheel behaviour, touch gestures, 3D controls, forms, hashes, and reduced-motion behaviour.
- Use local font assets with `font-display: swap`; add no runtime font dependency.
- Preserve all unrelated working-tree changes.

---

### Task 1: Add the local display font and update the typography contract

**Files:**
- Create: `public/fonts/barlow-semi-condensed-500-latin.woff2`
- Create: `public/fonts/barlow-semi-condensed-600-latin.woff2`
- Modify: `scripts/test-typography.mjs`
- Modify: `src/polish.css`

**Interfaces:**
- Consumes: Existing `--font-display`, `--font-text`, and `--font-mono` CSS tokens.
- Produces: `--font-display: "Barlow Semi Condensed", ...` and two local WOFF2 font faces used by later layout tasks.

- [ ] **Step 1: Extend the typography test before adding the font**

Update `scripts/test-typography.mjs` so it requires both Barlow files, verifies the display token, and rejects active Space Grotesk usage:

```js
for (const file of [
  'barlow-semi-condensed-500-latin.woff2',
  'barlow-semi-condensed-600-latin.woff2',
  'manrope-latin.woff2',
  'dm-mono-regular-latin.woff2',
  'dm-mono-medium-latin.woff2',
]) {
  const path = new URL(`../public/fonts/${file}`, import.meta.url)
  assert.ok(existsSync(path) && statSync(path).size > 1000, `${file} must be a real local font`)
}

assert.match(css, /--font-display:\s*"Barlow Semi Condensed"/)
assert.doesNotMatch(css, /--font-display:\s*"Space Grotesk"/)
assert.match(css, /font-family:\s*"Barlow Semi Condensed"[\s\S]*font-weight:\s*500/)
assert.match(css, /font-family:\s*"Barlow Semi Condensed"[\s\S]*font-weight:\s*600/)
```

- [ ] **Step 2: Run the focused test and confirm the red state**

Run: `pnpm test-typography`

Expected: FAIL because the Barlow assets and token do not exist.

- [ ] **Step 3: Download the approved Latin WOFF2 assets**

Run:

```bash
curl -fsSL 'https://fonts.gstatic.com/s/barlowsemicondensed/v16/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfi6m_B2slqZ6GfQ.woff2' -o public/fonts/barlow-semi-condensed-500-latin.woff2
curl -fsSL 'https://fonts.gstatic.com/s/barlowsemicondensed/v16/wlpigxjLBV1hqnzfr-F8sEYMB0Yybp0mudRfp66_B2slqZ6GfQ.woff2' -o public/fonts/barlow-semi-condensed-600-latin.woff2
```

- [ ] **Step 4: Define the font faces and display token**

Replace the Space Grotesk face and token in `src/polish.css` with:

```css
@font-face {
  font-family: "Barlow Semi Condensed";
  src: url("/fonts/barlow-semi-condensed-500-latin.woff2") format("woff2");
  font-style: normal;
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: "Barlow Semi Condensed";
  src: url("/fonts/barlow-semi-condensed-600-latin.woff2") format("woff2");
  font-style: normal;
  font-weight: 600;
  font-display: swap;
}

:root {
  --font-display: "Barlow Semi Condensed", "Arial Narrow", "Helvetica Neue", Arial, sans-serif;
}
```

Keep Manrope and DM Mono declarations unchanged. Leave the old Space Grotesk file unreferenced; removing the unused asset is optional only after asset tests show no dependency.

- [ ] **Step 5: Run the focused test and production build**

Run: `pnpm test-typography && pnpm build`

Expected: PASS; the build output includes the application bundles without remote font requests.

- [ ] **Step 6: Commit the font foundation**

```bash
git add public/fonts/barlow-semi-condensed-500-latin.woff2 public/fonts/barlow-semi-condensed-600-latin.woff2 src/polish.css scripts/test-typography.mjs
git commit -m "feat: add industrial display typography"
```

---

### Task 2: Establish global type scale and colour tokens

**Files:**
- Modify: `scripts/test-typography.mjs`
- Modify: `src/polish.css`

**Interfaces:**
- Consumes: Barlow/Manrope/DM Mono tokens from Task 1.
- Produces: Shared colour and responsive type tokens used by homepage, category, product, and configurator rules.

- [ ] **Step 1: Add failing assertions for the approved design tokens**

Add these checks to `scripts/test-typography.mjs`:

```js
for (const token of [
  '--colour-navy:', '--colour-blue:', '--colour-ink:', '--colour-muted:',
  '--colour-paper:', '--colour-mist:', '--type-hero:', '--type-section:', '--type-card:'
]) assert.ok(css.includes(token), `${token} must be defined`)

assert.match(css, /h1,\s*h2,\s*h3,\s*h4[\s\S]*letter-spacing:\s*-.02em/)
assert.match(css, /body,\s*\.home-page[\s\S]*color:\s*var\(--colour-ink\)/)
```

- [ ] **Step 2: Run the test and confirm it fails for missing tokens**

Run: `pnpm test-typography`

Expected: FAIL with the first missing design-token assertion.

- [ ] **Step 3: Add the global token layer and semantic rules**

Add to `src/polish.css`:

```css
:root {
  --colour-navy: #0b2f4d;
  --colour-blue: #0068c9;
  --colour-ink: #102f49;
  --colour-muted: #526f86;
  --colour-paper: #f8fbfd;
  --colour-mist: #eaf2f7;
  --colour-line: #cbdbe6;
  --type-hero: clamp(72px, 6.7vw, 96px);
  --type-section: clamp(64px, 5.8vw, 84px);
  --type-card: clamp(22px, 2.2vw, 36px);
  --content-width: 1440px;
  --page-gutter: clamp(36px, 5vw, 72px);
}

body, .home-page {
  color: var(--colour-ink);
  background: var(--colour-paper);
}
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: -.02em;
  text-wrap: balance;
}
p { text-wrap: pretty; }
```

Add a mobile token override at `max-width: 800px`:

```css
@media (max-width: 800px) {
  :root {
    --type-hero: clamp(36px, 12vw, 50px);
    --type-section: clamp(38px, 12.5vw, 54px);
    --type-card: clamp(20px, 7vw, 30px);
    --page-gutter: 20px;
  }
}
```

- [ ] **Step 4: Normalize heading rhythm without changing markup or text**

In `src/polish.css`, replace the current extreme heading tracking and shared oversized scales with semantic selectors using the tokens. Keep existing serif emphasis selectors, but change their tracking toward `-.035em` and line height toward `1`.

- [ ] **Step 5: Run focused and existing polish tests**

Run: `pnpm test-typography && pnpm test-polish`

Expected: PASS.

- [ ] **Step 6: Commit the global system**

```bash
git add src/polish.css scripts/test-typography.mjs
git commit -m "style: establish full-site type and colour system"
```

---

### Task 3: Rebalance homepage hierarchy and layout

**Files:**
- Modify: `scripts/test-home-media.mjs`
- Modify: `src/polish.css`

**Interfaces:**
- Consumes: Global tokens from Task 2 and existing homepage class names.
- Produces: Refined hero, statement, product-showcase, technology, material-story, company, and contact layouts without JSX copy changes.

- [ ] **Step 1: Add source-contract checks for homepage typography roles**

Add to `scripts/test-home-media.mjs`:

```js
assert.match(polish, /\.landing h1\.landing-title\{[^}]*font-size:\s*var\(--type-hero\)/,
  'hero title uses the approved display scale')
assert.match(polish, /\.statement h2[^}]*font-size:\s*var\(--type-section\)/,
  'statement heading uses the section scale')
assert.match(polish, /\.landing h1\.landing-title\{[^}]*background:linear-gradient\(/,
  'chrome-film hero title keeps a controlled reflective gradient')
```

Read `src/polish.css` into `polish` beside the existing source fixtures.

- [ ] **Step 2: Run the homepage test and confirm it fails**

Run: `pnpm test-home-media`

Expected: FAIL because the new semantic token rules are absent.

- [ ] **Step 3: Implement homepage-specific hierarchy**

Add one final scoped homepage section to `src/polish.css` that:

- sets `.landing h1.landing-title` to `var(--type-hero)`, line-height `1`, tracking `-.015em`, and a restrained chrome gradient;
- sets `.statement h2`, `.showcase h2`, `.technology h2`, `.material-story h2`, and `.contact h2` to `var(--type-section)` with line-height `1.02`;
- constrains supporting paragraphs to `min(62ch, 100%)` and raises muted contrast to `var(--colour-muted)`;
- aligns section gutters to `--page-gutter` and retains the existing media, section order, and interactions;
- assigns card headings to `--type-card` rather than the section scale;
- uses navy, paper, and mist surfaces in the existing dark/light section pattern without moving content between sections.

Do not edit `src/content/site-content.js`, `src/main.jsx`, media manifests, or product data.

- [ ] **Step 4: Add mobile rhythm overrides**

At `max-width: 800px`, ensure headings use token scales, section padding is approximately `80–104px`, paragraph text is at least `14px`, and no heading has `white-space: nowrap`.

- [ ] **Step 5: Run homepage, typography, and release tests**

Run: `pnpm test-home-media && pnpm test-typography && pnpm test-release`

Expected: PASS.

- [ ] **Step 6: Commit the homepage refinement**

```bash
git add src/polish.css scripts/test-home-media.mjs
git commit -m "style: rebalance homepage editorial hierarchy"
```

---

### Task 4: Refine category, product, table, and automotive typography

**Files:**
- Modify: `scripts/test-typography.mjs`
- Modify: `src/polish.css`
- Modify: `src/detail.css` only if a selector cannot be overridden safely from `src/polish.css`

**Interfaces:**
- Consumes: Global type/colour tokens and existing category/configurator markup.
- Produces: Consistent display, body, technical, table, and control hierarchy on non-home pages and automotive viewers.

- [ ] **Step 1: Add failing semantic-role assertions**

Add to `scripts/test-typography.mjs`:

```js
for (const selector of [
  '.category-page h1', '.series-card h2', '.product-spec-table',
  '.cybertruck-config h2', '.printable-wrap-heading h2'
]) assert.ok(css.includes(selector), `${selector} must have an explicit typography role`)

assert.match(css, /\.product-spec-table-head[^}]*font-family:\s*var\(--font-mono\)/)
assert.match(css, /\.cybertruck-config h2[^}]*font-family:\s*var\(--font-display\)/)
```

- [ ] **Step 2: Run the focused test and verify the intended failure**

Run: `pnpm test-typography`

Expected: FAIL on the first missing explicit role.

- [ ] **Step 3: Implement page-specific hierarchy**

In the final cascade layer of `src/polish.css`:

- set category/detail `h1` to a bounded `clamp(56px, 6vw, 82px)` desktop scale and `clamp(40px, 12vw, 54px)` mobile scale;
- set series and product-card names to `--type-card` with line-height `1.12`;
- set descriptions to Manrope with readable measures and `var(--colour-muted)`;
- set indexes, model codes, table headings, and labels to DM Mono;
- lighten table separators and increase row padding without changing cells, values, or column order;
- apply the display face to Cybertruck and printable-wrap headings while keeping controls in Manrope and technical labels in DM Mono;
- improve viewer-adjacent contrast without changing canvas, colour, finish, drag, or configuration logic.

- [ ] **Step 4: Verify content files are untouched**

Run:

```bash
git diff --name-only main...HEAD | rg '^(src/content/|src/catalog\.js|src/brochure-data\.js|src/media-manifest\.js|src/main\.jsx)$'
```

Expected: no output and exit status 1 from `rg`.

- [ ] **Step 5: Run targeted and release verification**

Run: `pnpm test-typography && pnpm test-category-media && pnpm test-cybertruck && pnpm test-printable-wrap && pnpm test-release && pnpm build`

Expected: PASS.

- [ ] **Step 6: Commit non-home typography**

```bash
git add src/polish.css src/detail.css scripts/test-typography.mjs
git commit -m "style: refine product and configurator typography"
```

Omit `src/detail.css` from `git add` if it was not needed.

---

### Task 5: Render, review, and deploy the complete redesign

**Files:**
- Modify: `scripts/test-rendered-ui.mjs`
- Create: temporary screenshots outside the repository only

**Interfaces:**
- Consumes: Complete typography/layout CSS from Tasks 1–4.
- Produces: Automated responsive evidence and a deployed production build.

- [ ] **Step 1: Add computed-style and overflow checks to the rendered UI suite**

In `scripts/test-rendered-ui.mjs`, add a helper that checks the active display face, readable heading tracking, and overflow:

```js
async function assertTypographySystem(page, width) {
  const metrics = await page.evaluate(() => {
    const heading = document.querySelector('.landing-title')
    const style = getComputedStyle(heading)
    return {
      fontFamily: style.fontFamily,
      letterSpacing: parseFloat(style.letterSpacing),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }
  })
  assert.match(metrics.fontFamily, /Barlow Semi Condensed/, `${width}px: display font must be Barlow Semi Condensed`)
  assert.ok(metrics.letterSpacing > -5, `${width}px: hero tracking must remain readable`)
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${width}px: page must not overflow horizontally`)
}
```

Call it for the existing `390px`, `1280px`, and `1440px` scenarios.

- [ ] **Step 2: Run the rendered test and fix stale expectations only when they conflict with approved current content**

Run: `pnpm test-rendered-ui`

Expected: PASS after replacing any obsolete hard-coded heading expectation with the current locked text already present in `src/content/site-content.js`. Do not change content to satisfy the test.

- [ ] **Step 3: Produce desktop and mobile screenshots**

Build and serve the site, then capture:

- homepage at `1440×900` and `390×844`;
- Product dropdown open at desktop width;
- one category page at desktop and mobile widths;
- Cybertruck colour study and printable-wrap configurator.

Review heading wraps, paragraph measures, contrast, control legibility, horizontal overflow, and unchanged text.

- [ ] **Step 4: Run final verification from a clean feature-branch state**

Run:

```bash
pnpm test-header-directory
pnpm test-rendered-ui
pnpm test-release
pnpm build
git diff --check
git diff --name-only main...HEAD | rg '^(src/content/|src/catalog\.js|src/brochure-data\.js|src/media-manifest\.js|src/main\.jsx)$' && exit 1 || true
```

Expected: all tests/builds pass, diff check is clean, and no locked content file is listed.

- [ ] **Step 5: Commit rendered verification**

```bash
git add scripts/test-rendered-ui.mjs
git commit -m "test: verify responsive typography layout"
```

- [ ] **Step 6: Integrate and deploy**

Merge the feature branch into `main`, rerun `pnpm test-release && pnpm build`, push `main`, and wait for these checks on the deployed commit:

- `verify`: completed / success;
- `Cloudflare Pages`: completed / success;
- `Workers Builds: so-fine-site`: completed / success.

- [ ] **Step 7: Verify the production site**

Load the production URL with a commit cache-busting query, confirm the new CSS/font assets are served, verify the computed display font is Barlow Semi Condensed, and confirm representative desktop/mobile pages have no horizontal overflow.


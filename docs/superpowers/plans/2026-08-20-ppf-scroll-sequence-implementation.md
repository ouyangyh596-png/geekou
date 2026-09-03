# PPF Scroll-Driven Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a homepage PPF presentation whose 115 local rendering frames advance and reverse from the user's scroll position.

**Architecture:** Copy the numbered PNG frames into `public/assets/ppf-sequence/`, expose deterministic frame metadata, and render one sticky sequence stage. A React component maps the section's normalized scroll progress to a frame index using `requestAnimationFrame`; CSS handles the stage, copy transitions, responsive sizing, and reduced-motion fallback.

**Tech Stack:** React, Vite, plain CSS, browser `IntersectionObserver`/scroll events, local PNG assets.

## Global Constraints

- Keep all runtime assets inside the project folder.
- Preserve the existing hero, navigation, category links, and product detail routes.
- Use English website copy.
- Do not add an external video/CDN dependency.
- Preserve the 16:9 source aspect ratio.
- Support desktop scrolling, mobile touch scrolling, and `prefers-reduced-motion`.

---

### Task 1: Import and index the rendering sequence

**Files:**
- Create: `public/assets/ppf-sequence/frame-000.png` through `frame-114.png`
- Create: `src/ppf-sequence.js`
- Test: `scripts/test-ppf-sequence.mjs`

**Interfaces:**
- Produces `PPF_SEQUENCE`, an ordered array of 115 string URLs beginning with `/assets/ppf-sequence/frame-000.png` and ending with `/assets/ppf-sequence/frame-114.png`.

- [ ] **Step 1: Write the failing asset/index test**

```js
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { PPF_SEQUENCE } from '../src/ppf-sequence.js'

assert.equal(PPF_SEQUENCE.length, 115)
assert.equal(PPF_SEQUENCE[0], '/assets/ppf-sequence/frame-000.png')
assert.equal(PPF_SEQUENCE.at(-1), '/assets/ppf-sequence/frame-114.png')
for (const url of PPF_SEQUENCE) assert.equal(existsSync(`public${url}`), true, url)
console.log('PPF sequence manifest PASS')
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `node scripts/test-ppf-sequence.mjs`
Expected: FAIL because the manifest and copied frame files do not exist.

- [ ] **Step 3: Copy and rename the supplied frames**

Sort the source PNGs by their numeric suffix and copy them into the project as zero-padded `frame-000.png` … `frame-114.png`. Keep the original source files untouched.

- [ ] **Step 4: Add the manifest**

```js
export const PPF_SEQUENCE = Array.from(
  { length: 115 },
  (_, index) => `/assets/ppf-sequence/frame-${String(index).padStart(3, '0')}.png`,
)
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `node scripts/test-ppf-sequence.mjs`
Expected: `PPF sequence manifest PASS`.

### Task 2: Add the scroll-driven sequence component

**Files:**
- Create: `src/components/PPFScrollSequence.jsx`
- Modify: `src/main.jsx`
- Test: `scripts/test-ppf-scroll-sequence.mjs`

**Interfaces:**
- `PPFScrollSequence` renders the section and accepts no required props.
- Uses `PPF_SEQUENCE` from `src/ppf-sequence.js`.

- [ ] **Step 1: Write the structural test**

The test reads the component and main entry source and asserts the presence of the sticky stage, progress mapping, reverse-compatible scroll progress, `requestAnimationFrame`, reduced-motion check, and homepage placement marker.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `node scripts/test-ppf-scroll-sequence.mjs`
Expected: FAIL because the component is not present.

- [ ] **Step 3: Implement the component**

Use a section ref and a passive `scroll` listener. On each scheduled frame, compute:

```js
const sectionTop = section.getBoundingClientRect().top + window.scrollY
const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
const progress = Math.min(Math.max((window.scrollY - sectionTop) / travel, 0), 1)
const frameIndex = Math.round(progress * (PPF_SEQUENCE.length - 1))
```

Render a single `<img>` whose `src` is the current URL, preloading the first frame and nearby frames with `new Image()`. Keep a bounded `Map` cache of at most 12 decoded image objects. Add `aria-label`, frame counter, PPF copy, and a link to `#category=ppf`.

- [ ] **Step 4: Insert the component after the hero**

Render `<PPFScrollSequence />` between the homepage hero and the existing product showcase without changing existing hash routing.

- [ ] **Step 5: Run the structural test**

Run: `node scripts/test-ppf-scroll-sequence.mjs`
Expected: `PPF scroll sequence structure PASS`.

### Task 3: Style the sticky stage and motion states

**Files:**
- Modify: `src/styles.css`
- Test: `scripts/test-rendered-ui.mjs`

**Interfaces:**
- CSS classes: `.ppf-sequence`, `.ppf-sequence-track`, `.ppf-sequence-sticky`, `.ppf-sequence-stage`, `.ppf-sequence-copy`, `.ppf-sequence-progress`.

- [ ] **Step 1: Add the desktop layout**

Use a track height of `min(260vh, 2600px)`, a sticky viewport stage with `height: 100vh`, a centered `aspect-ratio: 16 / 9` image stage, rounded corners, blue-white surfaces, and no horizontal overflow.

- [ ] **Step 2: Add copy and progress transitions**

Drive `data-progress`/inline opacity styles from the component so the overline, title, description, CTA, and progress indicator enter near the start and settle during the sequence.

- [ ] **Step 3: Add mobile rules**

At widths below `720px`, reduce stage padding, use a `min-height` track, keep the image contained, stack copy below the stage, and ensure the navigation remains reachable.

- [ ] **Step 4: Add reduced-motion rules**

Under `@media (prefers-reduced-motion: reduce)`, remove CSS transitions, shorten the track, and keep the first representative frame visible while the section remains readable.

- [ ] **Step 5: Run the rendered UI tests**

Run: `node scripts/test-rendered-ui.mjs`
Expected: existing homepage/navigation tests plus the new sequence stage checks PASS.

### Task 4: Verify package and production output

**Files:**
- Modify: `scripts/test-media-manifest.mjs` only if the existing media test needs the new manifest included
- Modify: `README.md` with local preview and asset notes

- [ ] **Step 1: Run focused checks**

```bash
node scripts/test-ppf-sequence.mjs
node scripts/test-ppf-scroll-sequence.mjs
node scripts/test-rendered-ui.mjs
```

Expected: all focused checks PASS.

- [ ] **Step 2: Build the production site**

Run: `pnpm run build`
Expected: Vite completes successfully and `dist/assets/ppf-sequence/` contains the copied frames.

- [ ] **Step 3: Run the existing content/media checks**

Run: `pnpm run validate:content && pnpm run test-media && pnpm run test-home-media && pnpm run test-category-media`
Expected: all existing checks PASS.

- [ ] **Step 4: Update the package**

Rebuild `SO-FINE-Website-Package` so the source component, manifest, copied frames, and production `dist` are included. Do not include the original Desktop path or external references.


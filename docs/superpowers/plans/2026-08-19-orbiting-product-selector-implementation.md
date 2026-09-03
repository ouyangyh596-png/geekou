# Orbiting Product Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home-page product rail with an animated, accessible orbit selector that opens the existing product-family pages.

**Architecture:** `ProductShowcase` owns the selected category index and derives display data from the existing `categories` and `familyMedia` collections. The centre stage is a semantic category link; orbit buttons select a family without navigation. CSS computes the orbit-node positions with per-node custom properties and handles the staged visual/content motion without any new dependency.

**Tech Stack:** React, Vite, JavaScript, CSS, Playwright test script.

## Global Constraints

- Keep `#products`, all category data, translations, media mappings, category alt text and `#category=<slug>` routes.
- Central stage is a 16:10 rounded rectangle with selected image, index, name, description, up to five model codes and an `Explore products` CTA.
- Orbit controls step exactly one family; orbit node clicks select without navigation.
- Use `cubic-bezier(.22, 1, .36, 1)` and a 760ms orbit transform transition.
- At 800px and below use a horizontal selector strip; 320px has no document-level horizontal overflow.
- Orbit nodes and controls have at least 44px hit areas, visible focus, `aria-pressed` and descriptive labels.
- Reduced motion disables rotation, clipping, transform and smooth scrolling while selection and navigation remain usable.
- Do not add dependencies. This workspace is not a Git repository; do not commit.

---

### Task 1: Orbit Selector State, Semantics and Structural Tests

**Files:**
- Modify: `src/main.jsx`
- Modify: `scripts/test-home-media.mjs`

**Interfaces:**
- Consumes: `categories`, `familyMedia`, `products`, `ArrowUpRight`, `useLanguage`.
- Produces: `.orbit-selector`, `.orbit-stage`, `.orbit-node`, `.orbit-controls`, and `.orbit-model-list` DOM interfaces for CSS/browser tests.

- [ ] **Step 1: Write failing structural assertions**

Replace carousel-specific assertions with requirements for `selectedIndex`, a `selectedCategory` derived from `categories[selectedIndex]`, a centre anchor using `#category=${selectedCategory.slug}`, orbit buttons with `aria-pressed`, and model rendering from:

```js
const selectedModels = products
  .filter(product => product.category === selectedCategory.slug)
  .slice(0, 5)
  .map(product => product.model);
```

Also assert exact classes `orbit-selector`, `orbit-stage`, `orbit-node`, `orbit-controls`, and `orbit-model-list` exist.

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
export PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH"
node scripts/test-home-media.mjs
```

Expected: failure because `ProductShowcase` still renders carousel elements.

- [ ] **Step 3: Implement selection helpers and semantic centre stage**

Replace carousel refs/pointer logic with state and a wrap-safe selector:

```js
const [selectedIndex, setSelectedIndex] = useState(0);
const selectedCategory = categories[selectedIndex];
const selectedMedia = familyMedia[selectedCategory.slug];
const selectedModels = products.filter(product => product.category === selectedCategory.slug).slice(0, 5).map(product => product.model);
const selectOffset = offset => setSelectedIndex(index => (index + offset + categories.length) % categories.length);
```

Render a central anchor with `href={'#category=' + selectedCategory.slug}` and its mapped image/alt, index/name/description, models and `Explore products` text. Use `key={selectedCategory.slug}` on the animated centre content wrapper so incoming content receives a new entry animation.

- [ ] **Step 4: Render controls, orbit nodes and keyboard behavior**

Render previous/next `type="button"` controls with labels `Previous product family` and `Next product family`. Render one orbit button per category:

```jsx
<button
  type="button"
  className="orbit-node"
  style={{ '--orbit-index': index, '--orbit-offset': index - selectedIndex }}
  aria-label={`Select ${category.name}`}
  aria-pressed={index === selectedIndex}
  onClick={() => setSelectedIndex(index)}
>
```

Use Left/Right on the selector to call `selectOffset(-1)`/`selectOffset(1)`; do not intercept Enter on the centre link.

- [ ] **Step 5: Verify structural behavior**

Run:

```bash
node scripts/test-home-media.mjs && node scripts/test-scroll-navigation.mjs
```

Expected: both commands exit 0.

### Task 2: Orbit Visual System, Responsive Layout and Browser Checks

**Files:**
- Modify: `src/styles.css`
- Modify: `scripts/test-rendered-ui.mjs`

**Interfaces:**
- Consumes: the Task 1 orbit selectors and custom properties.
- Produces: desktop ellipse, staged content transitions, compact mobile selector, and rendered acceptance checks.

- [ ] **Step 1: Write failing browser tests**

Replace carousel geometry/interaction checks with checks that at 1440px the rounded `orbit-stage` has 16:10 geometry and at least eight measurable `.orbit-node` controls, next/previous update the selected `aria-pressed` node, an orbit-node click updates it, and the centre CTA hash navigates to the selected category. At 320px assert no page overflow, a visible centre stage, and a horizontal `.orbit-node-strip`. Under reduced motion assert the stage, nodes and content have `transition-duration: 0s`, `transform: none`, and no clip path.

- [ ] **Step 2: Run the browser test and verify it fails**

Run:

```bash
node scripts/test-rendered-ui.mjs
```

Expected: failure because orbit selectors/styles do not exist.

- [ ] **Step 3: Implement desktop ellipse and centre stage**

Remove obsolete carousel CSS and add a maximum 1440px `.orbit-selector` composition. Use an overflow-visible orbit canvas with nodes positioned from `--orbit-offset`; give `.orbit-stage` `aspect-ratio:16 / 10`, a substantial radius, and `overflow:hidden`. Apply this exact motion curve to orbit transforms:

```css
transition:transform 760ms cubic-bezier(.22,1,.36,1),opacity 420ms ease;
```

Make current orbit node full-opacity and scaled; dim remote nodes. Animate centre image with opacity/scale and text/model/CTA with a staggered opacity/translate/clip reveal keyed by the selected category wrapper.

- [ ] **Step 4: Implement responsive and reduced-motion behavior**

At `max-width:800px`, replace absolute orbit positioning with `.orbit-node-strip { display:flex; overflow-x:auto; }`, retain 44px targets, and let chips wrap. At `max-width:360px`, use widths based on `calc(100% - 28px)` to avoid overflow. Add:

```css
@media (prefers-reduced-motion: reduce) {
  .orbit-selector *, .orbit-selector *::before, .orbit-selector *::after {
    transition:none!important;
    transform:none!important;
    clip-path:none!important;
    scroll-behavior:auto!important;
  }
}
```

- [ ] **Step 5: Run complete verification**

Run:

```bash
pnpm run validate:content && pnpm run test-language && pnpm run test-scroll && pnpm run test-request-validation && pnpm run test-media && pnpm run test-home-media && pnpm run test-category-media && node scripts/test-rendered-ui.mjs && pnpm run build
```

Expected: every command exits 0.

# ChatGPT-Style Product Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage product-family list with a responsive, ChatGPT-inspired editorial product rail and reversible scroll reveal motion.

**Architecture:** Keep `ProductShowcase` as the source of category markup and `familyMedia` as image data. Change its category links into a stable five-column rail on desktop and a stacked card on mobile; CSS uses the current IntersectionObserver `.reveal.is-visible` state to animate opacity, transform, and image clipping without new dependencies.

**Tech Stack:** React, Vite, JavaScript, CSS, Node.js test scripts.

## Global Constraints

- Preserve `#products`, `#category=<slug>`, category image data, translations, scroll restoration, and keyboard navigation.
- Desktop rows must use index, name, description, image, and arrow without hover-driven height changes.
- At 800px and below, rows become stacked cards and remain usable at 320px.
- Reduced-motion mode shows full content with no transform or transition.
- Do not add dependencies or a horizontal scroller.

---

### Task 1: Implement the Desktop and Mobile Product Rail

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/styles.css`
- Test: `scripts/test-home-media.mjs`

**Interfaces:**
- Consumes: `categories` and `familyMedia[category.slug]`.
- Produces: `.product-rail`, `.product-rail-row`, `.product-rail-copy`, and `.product-rail-image` selectors.

- [ ] **Step 1: Write failing structural assertions**

Add assertions requiring each category anchor to use `product-rail-row`, include a named copy wrapper, an image wrapper, and retain `familyMedia[category.slug].preview` plus mapped alt text. Assert the stylesheet contains a five-column desktop grid and no `.product-rail-row:hover` declaration that changes `min-height`, `height`, or padding.

- [ ] **Step 2: Run the failing test**

Run: `node scripts/test-home-media.mjs`

Expected: FAIL because the `product-rail-*` structure and rules do not exist.

- [ ] **Step 3: Update `ProductShowcase` markup**

Replace the current category list markup with:

```jsx
<div className="product-rail">
  {categories.map((category, index) => (
    <a className="product-rail-row reveal" href={'#category=' + category.slug} key={category.slug}>
      <span className="product-rail-index">{String(index + 1).padStart(2, '0')}</span>
      <div className="product-rail-copy"><strong>{category.name}</strong><small>{category.description}</small></div>
      <span className="product-rail-image"><img src={familyMedia[category.slug].preview} alt={familyMedia[category.slug].alt} width="1200" height="800" loading="lazy" decoding="async" /></span>
      <ArrowUpRight size={20} />
    </a>
  ))}
</div>
```

- [ ] **Step 4: Add rail CSS**

Use a 5-column desktop grid for index/copy/image/arrow with stable vertical padding, thin dividers, an image `clip-path` reveal, and a small hover/focus image scale and arrow shift. At `max-width: 800px`, use a three-column card header and full-width 16:9 image plus description. At `max-width: 360px`, retain a minimum 44px interactive row height and prevent horizontal overflow.

- [ ] **Step 5: Run focused tests**

Run: `node scripts/test-home-media.mjs && node scripts/test-scroll-navigation.mjs`

Expected: both PASS.

### Task 2: Verify Scroll Replay, Motion Preference, and Viewports

**Files:**
- Modify: `scripts/test-rendered-ui.mjs`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `.product-rail-row.reveal` and `.is-visible` observer state already created by `Home`.
- Produces: viewport coverage for product rail desktop and mobile presentation.

- [ ] **Step 1: Write failing rendered checks**

Add checks at 1440px and 320px: the first and last rail rows have nonzero bounding boxes, no horizontal document overflow, and their image/arrow remain inside their link bounds. Emulate `prefers-reduced-motion: reduce` and assert rail image `transitionDuration` is `0s` and transform is `none`.

- [ ] **Step 2: Run the rendered test and verify it fails**

Run: `node scripts/test-rendered-ui.mjs`

Expected: FAIL until the new selector and reduced-motion rules exist.

- [ ] **Step 3: Add reduced-motion override**

Add a `@media (prefers-reduced-motion: reduce)` block explicitly setting `.product-rail-row`, `.product-rail-row *`, and `.product-rail-image img` to `transition: none !important`, with `transform: none !important`, `clip-path: none !important`, and `opacity: 1 !important`.

- [ ] **Step 4: Run full verification**

Run: `pnpm run validate:content && pnpm run test-language && pnpm run test-scroll && pnpm run test-request-validation && pnpm run test-media && pnpm run test-home-media && pnpm run test-category-media && node scripts/test-rendered-ui.mjs && pnpm run build`

Expected: every test passes and Vite production build exits 0.

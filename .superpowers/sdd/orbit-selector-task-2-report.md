# Orbit Selector Task 2 Report

## Scope

Implemented Task 2 from `docs/superpowers/plans/2026-08-19-orbiting-product-selector-implementation.md` without changing `src/main.jsx`.

## TDD evidence

### RED — browser checks written first

Replaced the carousel-specific browser checks in `scripts/test-rendered-ui.mjs` before changing production CSS. The new checks cover:

- 1440px: rounded 16:10 orbit stage, at least eight measurable nodes, 44px arrow targets, arrow selection, node-click selection, and stage CTA routing to the selected category.
- 320px: no document overflow, a horizontal orbit node strip implemented by the existing `.orbit-selector`, and 44px node targets.
- Reduced motion: stage content, image, and node transition durations are `0s`; transforms are `none`; clip paths are `none`.
- Existing unrelated home, category, detail, navigation, typography, and remote-resource assertions remain in the script.

Command:

```sh
export PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH"
node scripts/test-rendered-ui.mjs
```

Expected and observed failure before CSS changes:

```text
AssertionError [ERR_ASSERTION]: 320px home horizontally overflows: 1200px > 320px
    at assertNoHorizontalOverflow (file:///Users/geekou/Documents/%E5%85%AC%E5%8F%B8%E7%BD%91%E7%AB%99/scripts/test-rendered-ui.mjs:41:10)
    at file:///Users/geekou/Documents/%E5%85%AC%E5%8F%B8%E7%BD%91%E7%AB%99/scripts/test-rendered-ui.mjs:179:5 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: false,
  expected: true,
  operator: '=='
}
```

This is meaningful: before the orbit CSS, the intrinsic 1200px stage image widened the 320px document.

### GREEN — minimal CSS implementation

Updated only `src/styles.css` after RED:

- Removed every old `product-carousel` rule.
- Added an overflow-visible desktop orbit around a rounded, clipped 16:10 `.orbit-stage`.
- Used the required node transform transition exactly: `transform 760ms cubic-bezier(.22,1,.36,1)`.
- Made selected nodes elevated and opaque, with distant nodes subdued.
- Added keyed stage entry animations: image opacity/scale plus staggered index, text, model, and CTA opacity/translate/clip reveals.
- At 800px and below, converted the existing `.orbit-selector` to an overflow-x horizontal grid strip with 44px nodes; at 360px and below, widths are `calc(100% - 28px)`.
- Added orbit-scoped reduced-motion overrides that eliminate animation, transition, transform, and clip path.

Focused GREEN command and observed output:

```sh
node scripts/test-rendered-ui.mjs
```

```text
PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria
```

## Full verification suite

Command:

```sh
export PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH"
pnpm run validate:content && pnpm run test-language && pnpm run test-scroll && pnpm run test-request-validation && pnpm run test-media && pnpm run test-home-media && pnpm run test-category-media && node scripts/test-rendered-ui.mjs && pnpm run build
```

Observed output:

```text
$ node scripts/validate-content.mjs
Validated 82 brochure-backed products.
$ node scripts/test-language.mjs
Validated 12 language options and 17 component keys.
$ node scripts/test-scroll-navigation.mjs
Validated hash navigation decisions.
$ node scripts/test-request-validation.mjs
Validated inquiry bounds and admin-token rules.
$ node scripts/test-media-manifest.mjs
PASS: validated 8 family mappings and 5 homepage assets
$ node scripts/test-home-media.mjs
Validated homepage editorial media structure.
$ node scripts/test-category-media.mjs
PASS: validated category hero and product media semantics
PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria
$ vite build
vite v8.1.5 building client environment for production...
transforming...✓ 1782 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.47 kB │ gzip:  0.32 kB
dist/assets/index-4pPEw10O.css   34.06 kB │ gzip:  7.66 kB
dist/assets/index-BvxHgRaf.js   234.96 kB │ gzip: 72.99 kB

✓ built in 220ms
```

All commands exited 0.

## Changed files

- `src/styles.css`
- `scripts/test-rendered-ui.mjs`
- `.superpowers/sdd/orbit-selector-task-2-report.md`

## Self-review

- Confirmed `src/main.jsx` was not modified.
- Confirmed no `product-carousel` selectors remain in either modified implementation file.
- Confirmed browser checks retain unrelated home, category, detail, navigation, font, reduced-motion, and local-resource assertions.
- Confirmed the full plan-specified suite and production build pass using the provided Node runtime path.

## Concerns

`main.jsx` has no `.orbit-node-strip` wrapper. CSS cannot create a DOM class, and the task explicitly forbade changing Task 1 DOM. The responsive strip is therefore implemented and tested on the existing `.orbit-selector` container. If the literal `.orbit-node-strip` class is required, Task 1 DOM scope must be reopened to add that class/wrapper.

---

## Review fix follow-up — 2026-08-19

### Status and scope

Implemented every P1 fix from `.superpowers/sdd/orbit-selector-task-2-review.md` within the explicitly allowed implementation/test files:

- Added the real `.orbit-node-strip` DOM wrapper around all and only the family-node buttons.
- Moved mobile horizontal scrolling from `.orbit-selector` to `.orbit-node-strip`.
- Kept the mobile centre stage at `width:100%; max-width:100%` of the selector, independent of the strip's intrinsic chip width.
- Added a non-overlapping, fully visible static desktop node layout for `prefers-reduced-motion` while retaining selection interactions.
- Increased the untransformed desktop node minimum dimensions and removed the shrinking `.86` scale so every rendered/transformed target remains at least 44px in both dimensions.
- Preserved the normal-motion node transition exactly as `transform 760ms cubic-bezier(.22,1,.36,1)`.
- Preserved selection state, arrow and keyboard selection, centre-stage category routing, media/product data, dependencies, and unrelated coverage.

Root causes confirmed before implementation:

1. The mobile max-content grid and overflow belonged to `.orbit-selector`, so the stage spanned the full chip track.
2. The reduced-motion rule removed every descendant transform, including transforms required for geometry, without supplying a static replacement layout.
3. The desktop `scaleY(.62)` plus `.86` scale transformed nominal 44px buttons below the physical 44px target requirement.

### RED — regression tests first

Before production changes, `scripts/test-home-media.mjs` gained structural assertions for the dedicated wrapper and exact animation curve. `scripts/test-rendered-ui.mjs` gained direct browser assertions for:

- one `.orbit-node-strip` directly containing every family node;
- horizontal overflow on the strip, not the selector;
- 320px selector/stage bounds and 16:10 stage geometry;
- at least 44px rendered width and height for every transformed desktop orbit node;
- visible, interactive, non-overlapping reduced-motion nodes that remain selectable.

Command:

```sh
PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" node scripts/test-home-media.mjs; PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" node scripts/test-rendered-ui.mjs
```

Observed exit code: `1`.

Observed failures:

```text
AssertionError [ERR_ASSERTION]: family selection buttons are wrapped by the required orbit node strip
    at file:///Users/geekou/Documents/%E5%85%AC%E5%8F%B8%E7%BD%91%E7%AB%99/scripts/test-home-media.mjs:48:8
```

```text
AssertionError [ERR_ASSERTION]: 320px: exactly one dedicated orbit node strip must exist

0 !== 1

    at assertMobileOrbitStrip (file:///Users/geekou/Documents/%E5%85%AC%E5%8F%B8%E7%BD%91%E7%AB%99/scripts/test-rendered-ui.mjs:102:10)
    at async file:///Users/geekou/Documents/%E5%85%AC%E5%8F%B8%E7%BD%91%E7%AB%99/scripts/test-rendered-ui.mjs:226:24
```

These were expected behavior failures, not harness errors: both suites independently detected the missing required DOM interface before JSX/CSS changed.

### GREEN — targeted regression coverage

After the minimal JSX/CSS implementation, the same targeted suites were run without changing or loosening their assertions.

Command:

```sh
PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" node scripts/test-home-media.mjs && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" node scripts/test-rendered-ui.mjs
```

Observed exit code: `0`.

Exact output:

```text
Validated homepage editorial media structure.
PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria
```

The browser suite's GREEN result directly covers all four review findings at 320px, 970px reduced motion, and 1440px normal/reduced motion, while retaining its existing responsive, navigation, media, and local-resource checks.

### Full covering verification

Command:

```sh
PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run validate:content && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-language && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-scroll && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-request-validation && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-api && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-media && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-product-media && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-home-media && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-category-media && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-accessibility-assets && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run test-rendered-ui && PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" pnpm run build
```

Observed exit code: `0`.

Exact output:

```text
$ node scripts/validate-content.mjs
Validated 82 brochure-backed products.
$ node scripts/test-language.mjs
Validated 12 language options and 17 component keys.
$ node scripts/test-scroll-navigation.mjs
Validated hash navigation decisions.
$ node scripts/test-request-validation.mjs
Validated inquiry bounds and admin-token rules.
$ node scripts/test-api.mjs
Validated API limits, authentication, trusted-proxy rate limiting and production static serving without creating inquiries.
$ node scripts/test-media-manifest.mjs
PASS: validated 8 family mappings and 5 homepage assets
$ node scripts/test-product-media-semantics.mjs
PASS: validated representative fallback semantics for 10 products
$ node scripts/test-home-media.mjs
Validated homepage editorial media structure.
$ node scripts/test-category-media.mjs
PASS: validated category hero and product media semantics
$ node scripts/test-accessibility-assets.mjs
PASS: validated semantic heading, mobile navigation, reduced motion and local production assets
$ node scripts/test-rendered-ui.mjs
PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria
$ vite build
vite v8.1.5 building client environment for production...
transforming...✓ 1782 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.47 kB │ gzip:  0.32 kB
dist/assets/index-BAUa7Ak0.css   34.35 kB │ gzip:  7.72 kB
dist/assets/index-Dy3R9jjL.js   235.02 kB │ gzip: 73.01 kB

✓ built in 210ms
```

All commands completed normally; no test hung or required interruption.

### Files changed for this review fix

- `src/main.jsx`
- `src/styles.css`
- `scripts/test-home-media.mjs`
- `scripts/test-rendered-ui.mjs`
- `.superpowers/sdd/orbit-selector-task-2-report.md` (required appended evidence)

### Concerns

None. The prior report concern about the missing `.orbit-node-strip` is resolved by the review brief's explicit authorization to modify `src/main.jsx`.

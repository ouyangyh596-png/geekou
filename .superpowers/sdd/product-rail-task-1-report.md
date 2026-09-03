# Product Rail Task 1 Report

## Scope

Implemented only Task 1 from `docs/superpowers/plans/2026-08-19-chatgpt-style-product-rail-implementation.md`.

Changed:

- `src/main.jsx`
- `src/styles.css`
- `scripts/test-home-media.mjs`

Added this report at `.superpowers/sdd/product-rail-task-1-report.md`. No category detail-page markup or media asset was changed, and no Git action was performed.

## Implementation

- Replaced the homepage `category-list` / `category-row` list with a `.product-rail` containing `.product-rail-row` category anchors.
- Preserved `href={'#category=' + category.slug}`, `familyMedia[category.slug].preview`, `familyMedia[category.slug].alt`, `loading="lazy"`, `decoding="async"`, and the observer-consumed `.reveal` class.
- Added named `.product-rail-copy` and `.product-rail-image` wrappers.
- Added a stable desktop five-column grid. Hover and keyboard focus only alter color, image scale/clip, arrow transform, and outline; neither rule contains height, min-height, or padding declarations.
- Added mobile stacked cards at 800px and below: a three-column header, full-width 16:9 image, description, and a 44px minimum interactive row height retained at 360px and below.

## Test-first evidence

1. Added rail structure and geometry assertions to `scripts/test-home-media.mjs` before editing production JSX/CSS.
2. RED command:

   ```text
   /Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
   ```

   Result: failed as expected with `AssertionError: the homepage renders the product rail container`, because `.product-rail` did not yet exist.
3. Implemented the minimal rail markup and styles. A follow-up test exposed that combined hover/focus selectors could not be independently audited for geometry changes; the selectors were split without changing interaction behavior.

## Final verification

Focused tests, rerun after all production changes with the required bundled Node executable:

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
Validated homepage editorial media structure.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-scroll-navigation.mjs
Validated hash navigation decisions.
```

Additional regression check:

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-category-media.mjs
PASS: validated category hero and product media semantics
```

Production build:

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
✓ built in 321ms
```

Static audit confirmed the retired homepage `category-row`, `category-list`, and `category-media` selectors are absent from `src/main.jsx` and `src/styles.css`.

## Concerns

- Task 2's rendered viewport and reduced-motion checks were intentionally not implemented because this task is explicitly limited to Task 1.

## Important review fixes — 2026-08-19

Addressed both findings from `product-rail-task-1-review.md`.

- Changed the desktop `.product-rail-image` aspect ratio from `3 / 2` to `16 / 10`. The existing mobile `16 / 9` override remains unchanged.
- Added an explicit `@media(prefers-reduced-motion:reduce)` rail override for `.product-rail-row`, all row descendants, and `.product-rail-image img`. It forces `transition: none`, `transform: none`, `clip-path: none`, and `opacity: 1` with `!important`, so unobserved `.reveal` rows cannot leave their images clipped or scaled.

### Test-first evidence

1. Added a `16 / 10` desktop ratio assertion to `scripts/test-home-media.mjs` before changing CSS.
   - RED: the focused test failed with `AssertionError: desktop product rail media uses the required 16:10 ratio` while the stylesheet declared `3 / 2`.
2. Changed the desktop ratio to `16 / 10`; the focused structural test passed.
3. Added reduced-motion assertions before adding the override:
   - `scripts/test-home-media.mjs` requires an explicit rail reduced-motion rule covering row, descendants, and image.
   - `scripts/test-rendered-ui.mjs` removes `.is-visible` from the last rail row under `reducedMotion: 'reduce'` and requires row/image opacity `1`, transform `none`, transition duration `0s`, and image clip path `none`.
   - RED: the rendered test reported `clipPath: inset(0px 100% 0px 0px)` and `transform: matrix(1.03, 0, 0, 1.03, 0, 0)` for the non-visible rail image.
4. Added the explicit rail override and reran the required checks with the bundled Node runtime.

### Final verification

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
Validated homepage editorial media structure.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-rendered-ui.mjs
PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
✓ built in 195ms
```

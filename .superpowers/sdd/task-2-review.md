# Task 2 Review — Homepage Editorial Imagery

## Verdicts

- **Spec compliance: FAIL** — responsive category previews are clipped at widths immediately above the 800px mobile breakpoint.
- **Code quality: PASS** — media is sourced from the approved manifest; the implementation preserves link semantics, uses descriptive alternate text and lazy/async decoding below the hero, and includes reduced-motion overrides.

## Important changes

1. **Fix the 801px–approximately 970px category-row layout.**
   `src/styles.css` gives desktop rows five fixed/minimum columns (`72px 250px 200px 190px 34px`) plus four 24px gaps and horizontal padding, but only switches to the mobile three-column layout at `max-width:800px`. At a 801px viewport the row is 698px wide while its media starts at x=622 and ends at x=812; the row’s `overflow:hidden` clips the preview and hides the arrow. Widen the responsive breakpoint or make the intermediate desktop columns flexible so every family preview and the arrow remain visible.

## Verified

- `MaterialStory` renders three manifest-backed tiles directly below the homepage hero; the hero uses `homeMedia.hero`.
- The eight existing category anchors retain their `#category=<slug>` destinations. A live click navigated to `#category=one-way-vision` and rendered the matching category page.
- Existing homepage IDs, hash-navigation behavior, scroll restoration decisions, and reveal/reduced-motion behavior remain present.
- Below-hero images have descriptive `alt` text, `loading="lazy"`, `decoding="async"`, intrinsic dimensions, and responsive aspect-ratio rules.
- No company image is rendered and category pages do not receive a new family-media hero.
- At 390px, all eight previews are visible, the editorial grid resolves to a 2+1 layout, and the document has no horizontal overflow.

## Commands run

```sh
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-media-manifest.mjs
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-scroll-navigation.mjs
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-language.mjs
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
```

All commands passed. The Important responsive issue was reproduced in the rendered app at a 801px viewport.

## Re-review — 2026-08-18

**Verdict: APPROVED**

The new `@media(max-width:970px)` rule changes category rows to the compact `32px minmax(0,1fr) 24px` grid before the 800px breakpoint. At 801–970px, the preview is placed in the flexible middle column and the arrow in the trailing column, so neither is constrained by the former desktop minimum-width columns or clipped by the row's intentional `overflow:hidden`.

No new Critical or Important issue was identified in the responsive fix. The rule is category-scoped and leaves the MaterialStory breakpoint unchanged; existing 800px mobile declarations remain compatible.

Fresh verification:

```sh
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
# Validated homepage editorial media structure.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-scroll-navigation.mjs
# Validated hash navigation decisions.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
# Vite production build completed successfully.
```

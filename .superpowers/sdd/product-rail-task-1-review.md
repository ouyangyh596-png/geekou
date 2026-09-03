# Product Rail Task 1 Independent Review

## Verdict

CHANGES_REQUIRED

## Important findings

1. **Desktop rail media does not use the required 16:10 ratio.** `src/styles.css:64` sets `.product-rail-image { aspect-ratio: 3 / 2; }`, which renders at 1.5:1 rather than the design specification's 1.6:1. At a 1440px viewport, the inspected image measured 325.64 × 217.09px (3:2). Change the desktop ratio to `16 / 10` while retaining the mobile `16 / 9` override.

2. **Reduced-motion mode leaves off-screen rail images hidden and transformed.** The reduced-motion block at `src/styles.css:129-134` disables transitions and makes the rail row visible, but it does not reset `.product-rail-image img`'s `clip-path` or `transform`. At 970px with `prefers-reduced-motion: reduce`, a row not yet observed had `clip-path: inset(0px 100% 0px 0px)` and `transform: matrix(1.03, 0, 0, 1.03, 0, 0)`. This violates the requirement that all rail rows and images be fully visible with no transform or transition. Add an explicit reduced-motion override for the rail image (and preferably row descendants) setting `transition: none !important`, `transform: none !important`, `clip-path: none !important`, and `opacity: 1 !important`.

## Verified requirements

- `ProductShowcase` retains `#products`, category hash links, mapped `familyMedia[category.slug].preview` and alt text, lazy loading, async decoding, and `.reveal` observer participation.
- Desktop renders five grid columns; 800px and 320px render three-column stacked-card headers with 16:9 media. No horizontal overflow was observed at either mobile width.
- Hover did not change row height (270.09px before and after at 1440px), and keyboard focus produced a visible 3px solid outline.
- The full existing validation suite and Vite production build completed successfully. The suite does not detect either finding above.

## Re-review after fixes — 2026-08-19

### Verdict

APPROVED

### Re-verified acceptance criteria

- The homepage markup still renders each category as a `.product-rail-row.reveal` link inside `.product-rail`, preserving the category hash URL, mapped `familyMedia` preview and alt text, lazy loading, async decoding, and observer participation (`src/main.jsx:165`).
- Desktop `.product-rail-image` now declares `aspect-ratio: 16 / 10` (`src/styles.css:64`). The mobile-only `max-width:800px` rule continues to override this to `16 / 9` (`src/styles.css:99`), so it does not affect desktop presentation.
- The reduced-motion policy explicitly targets the rail row, every row descendant, and the rail image, forcing `transition:none`, `transform:none`, `clip-path:none`, and `opacity:1` with `!important` (`src/styles.css:135-136`). This supersedes both the hidden off-screen image clip rule (`src/styles.css:66`) and the normal reveal transform/opacity state.
- `scripts/test-rendered-ui.mjs:120-140` emulates `prefers-reduced-motion: reduce`, removes `.is-visible` from the final rail row, and asserts computed row opacity `1`, transform `none`, transition duration `0s`, plus image clip path `none`, opacity `1`, transform `none`, and transition duration `0s`.

### Fresh verification

Executed with the required bundled Node runtime:

```text
scripts/test-home-media.mjs     Validated homepage editorial media structure.
scripts/test-rendered-ui.mjs    PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria
vite build                      ✓ built in 203ms
```

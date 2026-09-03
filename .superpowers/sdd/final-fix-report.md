# Final Review Fix Report

Date: 2026-08-18

## Result

All nine Important findings and both safe Minor findings from `final-visual-review.md` are resolved. Production uses project-local assets and an intentional local/system font stack. Exact SKU photography was not fabricated: the ten products that intentionally use family fallback artwork are announced as representative family illustrations.

## Finding-to-fix map

1. **Homepage illuminated-signage tile** — Replaced the material roll with `public/media/home/illuminated-signage-application.webp`, an installed illuminated storefront/light-box scene. Updated the manifest and literal alt text to describe the visible application.
2. **Five incorrect family mappings** — Replaced the reviewed mappings with project-local WebPs showing: perforated train-window application, printed bus graphics, illuminated light-box graphics, a transparent PPF layer illustration, and metallic vehicle-wrap material rolls. The manifest alts describe only what is visible.
3. **Repeated company hero** — Added `public/media/home/production-equipment.webp` for the company section. It shows production equipment, has its own caption/alt, and is hash-distinct from the landing hero.
4. **Fallback artwork announced as exact SKU photography** — Added `src/product-media.js`. Category and detail views now announce known family SVG fallbacks as `FAMILY family illustration, representative image for MODEL`; model-specific media retains model-specific wording. Covered for all ten fallback products.
5. **Incomplete reduced-motion behavior** — Added a comprehensive `prefers-reduced-motion: reduce` override that disables smooth scrolling, animations, transitions, and transform-driven motion across home, category, and detail views. Rendered tests verify computed styles.
6. **320px header and touch targets** — Restored the mobile menu, connected it with `aria-controls`, dynamic `aria-expanded`, and changing Open/Close labels. Menu, language selector, and open navigation links have at least 44px targets. Rendered checks cover 320, 360, and 390px without horizontal overflow.
7. **Visible/accessibility heading mismatch** — Moved `Innovation / Quality / Service / Commitment` into the React `h1` with explicit spans and line break; removed content-bearing heading pseudo-elements. The rendered accessible name is exactly the visible heading.
8. **Remote Google Fonts dependency** — Removed the Google Fonts import and replaced production typography with local system sans/monospace stacks. Static and rendered request checks confirm no remote production resources.
9. **Acceptance tests too structural** — Added semantic fallback tests, per-image homepage checks, accessibility/local-resource checks, and `scripts/test-rendered-ui.mjs`. The rendered suite checks 320/360/390/801/970/1440 geometry, mobile controls, heading name, remote requests, reduced motion, fallback alts, and home/category/detail overflow.
10. **Excessively tall 801–970px category rows** — Added a bounded two-column tablet layout with 210px rows and previews capped at 240×180px. Browser geometry assertions enforce row height no greater than 260px and preview bounds at both 801 and 970px.
11. **Contradictory/duplicate responsive CSS** — Removed superseded mobile header blocks and consolidated legacy category list/row/mobile/tablet declarations into canonical rules. The live hamburger path is no longer overridden by later CSS.

## TDD evidence

- Media mapping tests first failed against the old filenames, shared hero/company image, and generic product-alt templates, then passed after the media manifest and fallback-alt implementation.
- Accessibility/local-asset tests first failed because the heading was not semantic and the header lacked its controlled-navigation contract, then passed after markup/CSS changes.
- The rendered tablet test first reported a 359.1875px row at 801px. After the compact layout it passed. A later CSS-deduplication regression was caught at 334px, corrected in the canonical grid rule, and the entire final suite was rerun successfully.

## Final verification

Bundled runtime:

`/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`

All final commands exited 0 with these exact results:

```text
Validated 82 brochure-backed products.
Validated 12 language options and 17 component keys.
Validated hash navigation decisions.
Validated inquiry bounds and admin-token rules.
PASS: validated 8 family mappings and 5 homepage assets
PASS: validated representative fallback semantics for 10 products
Validated homepage editorial media structure.
PASS: validated category hero and product media semantics
PASS: validated semantic heading, mobile navigation, reduced motion and local production assets
Validated API limits, authentication, trusted-proxy rate limiting and production static serving without creating inquiries.
PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria
```

Production build:

```text
vite v8.1.5 building client environment for production...
✓ 1782 modules transformed.
dist/index.html                   0.47 kB │ gzip:  0.32 kB
dist/assets/index-ny11zRpF.css   32.55 kB │ gzip:  7.37 kB
dist/assets/index-6AYPMmbv.js   234.03 kB │ gzip: 72.71 kB
✓ built in 295ms
```

## Remaining concern

The PPF family hero is an honest transparent-layer illustration rather than exact-SKU installation photography, and ten catalogue products still intentionally use representative family SVG artwork. Their visible/accessible labels now disclose that status and do not imply exact product photography. No functional or verification blocker remains.

## Final visual re-review fixes (2026-08-18)

1. **Mobile hero containment** — Added a mobile-only `.landing h1.landing-title` rule with the specificity needed to override the legacy `.landing h1` size. Its `clamp(32px, 9.5vw, 54px)` preserves the desktop rule while keeping both deliberate no-wrap lines inside the visible landing bounds at 320px, 360px, and 390px.
2. **Automotive semantic honesty** — Kept the existing clean image but renamed its visible label to `03 / WET SURFACE DETAIL` and its alt to `Wet, high-contrast close-up of a glossy black surface`. It no longer claims a vehicle, transparent film, or wet-application action that the pixels do not show.
3. **Regression gates** — `test-rendered-ui.mjs` now measures each hero-title span against the visible `.landing` bounds at all three narrow widths, so overflow hidden can no longer mask clipping. `test-home-media.mjs` asserts the literal automotive caption and alt; `test-media-manifest.mjs` pins the reviewed asset hash (`c3d564e37700f9670ebc8ed7e265b4724057fb2b285af3770118ddfba5614163`) to require renewed semantic review for an image substitution.

### TDD evidence

- **RED:** `node scripts/test-home-media.mjs` failed on the former automotive wet-application alt. `node scripts/test-rendered-ui.mjs` failed at 320px because `Innovation / Quality` occupied `14px–486.59375px` outside the `0px–320px` landing bounds.
- **GREEN:** The focused media and rendered checks passed after the copy and mobile-only specificity fixes.

### Final verification

```text
node scripts/test-home-media.mjs
# Validated homepage editorial media structure.

node scripts/test-media-manifest.mjs
# PASS: validated 8 family mappings and 5 homepage assets

node scripts/test-rendered-ui.mjs
# PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria

node node_modules/vite/bin/vite.js build
# ✓ built in 227ms
```

# SO-FINE Final Whole-Project Visual Review

## Verdict

**CHANGES_REQUIRED — NOT APPROVED**

No Critical issue was found, but the final implementation has multiple Important specification, accessibility, responsive, and verification issues. Under the requested gate, it cannot be approved until every Critical and Important finding below is resolved and re-verified.

## Review scope

Reviewed:

- `docs/superpowers/specs/2026-08-18-high-resolution-visual-refresh-design.md`
- `docs/superpowers/plans/2026-08-18-high-resolution-visual-refresh-implementation.md`
- `.superpowers/sdd/task-1-report.md`
- `.superpowers/sdd/task-1-review.md`, including its re-review
- `.superpowers/sdd/task-2-report.md`
- `.superpowers/sdd/task-2-review.md`, including its re-review
- `.superpowers/sdd/task-3-5-report.md`
- Final `src/main.jsx`, `src/styles.css`, `src/media-manifest.js`, media scripts/tests, `package.json`, navigation/language helpers, and all files under `public/media`
- Representative rendered routes at 1440×900, 970×900, 801×900, 390×844, and 320×568
- Default-motion and emulated `prefers-reduced-motion: reduce` behavior
- Browser accessibility tree, layout geometry, image loading state, navigation, console output, and representative product/category routes

The workspace has no Git metadata, so the filesystem was treated as the final source of truth.

## Critical findings

None.

## Important findings

### 1. The homepage “illuminated signage” story tile is not an installed signage/application view

The design requires the post-hero strip to contain “film surface detail, installed architectural/signage application, and automotive finish” (`design.md:27-29`). `homeMedia.signage` instead points to `/media/families/translucent-film-roll.webp` (`src/media-manifest.js:4`), a white product roll on a white background. `MaterialStory` labels that same roll “ILLUMINATED SIGNAGE” and gives it the alt text “Translucent film material for illuminated signage” (`src/main.jsx:156`).

This does not depict an illuminated sign, light box, architectural installation, or installed signage, and it makes the label imply context that is absent from the image. Replace it with a clean installed architectural/signage or illuminated light-box photograph and update the manifest and alt text to describe what is actually visible.

### 2. Five family hero/preview selections do not satisfy the approved family-to-asset mapping

The design’s mapping is explicit (`design.md:47-56`), but the current manifest (`src/media-manifest.js:10-34`) and visually inspected output use:

- One Way Vision: a loose perforated roll, not perforated-glass/window application photography.
- Self-Adhesive Vinyl: an unprinted red roll, not printable vinyl, advertising graphics, or installed signage.
- Translucent Film: a plain milky roll, not an illuminated sign or light-box application.
- PPF: a generic finished car on a street; no transparent-film installation, edge, split panel, or protection close-up is visible. The same image is reused for homepage automotive media.
- Car Wrapping Film: a small pink toy/model vehicle on white, not credible vehicle-wrap photography or a material/color-roll detail. This conflicts with the design requirement that imagery show surface behavior or a credible installed application (`design.md:7-9`).

The files are clean and correctly optimized, but semantic cleanliness is not category accuracy. Replace these assets with the required application/material views. Alts such as “Protected automotive paint surface” and “Gloss-finished vehicle front showing a protected painted surface” should not claim protection that the photograph itself does not demonstrate.

### 3. The company evidence section reuses the hero instead of supplying production/exhibition evidence

`homeMedia.company` and `homeMedia.hero` are the same `/media/home/factory-hero.webp` file (`src/media-manifest.js:2,6`). The company section consequently repeats the opening photograph (`src/main.jsx:144`) and contains no exhibition or production imagery, despite the design requiring “factory and exhibition/production imagery” that adds evidence of manufacturing scale or application expertise (`design.md:35-37`).

Use a distinct production, laboratory, manufacturing-line, or exhibition photograph in the asymmetric company composition. Keep the current factory hero for the landing section.

### 4. Family-level fallback artwork is announced as exact SKU photography

The design explicitly requires family-level fallbacks to be identified as application/family imagery rather than implying an exact SKU (`design.md:41-44`). The catalogue intentionally assigns generic family SVGs to SF6000, AF1810, AF1850, and seven Overlaminate models (`scripts/validate-content.mjs:127-143`), but `CategoryPage` always announces every asset as `MODEL — FAMILY product image` (`src/main.jsx:172`). `Detail` similarly announces each fallback as `MODEL product view N` (`src/main.jsx:177`).

This is inaccurate alternative text for ten products. Detect the family fallback URLs and use wording such as “Paint Protection Film family illustration, representative image for AF1810”; retain exact-model wording only for model-specific assets. `scripts/test-category-media.mjs:17-20` currently hard-codes the incorrect generic wording and must be corrected with the implementation.

### 5. `prefers-reduced-motion` does not disable all motion

The design and plan require motion to respect `prefers-reduced-motion` (`design.md:58-60`; implementation plan lines 17-18 and 192-194). Under an emulated reduced-motion preference, the rendered category page still reported:

- `.series-card`: `animation-name: series-in`, `animation-duration: 0.7s`, with changing opacity/transform (`src/styles.css:13`).
- `.category-product img`: `transition-duration: 0.6s` (`src/styles.css:11`).
- `html`: `scroll-behavior: smooth` (`src/styles.css:2`).

The existing reduced-motion rules cover reveals, hero transforms, some decorative card animations, and selected image transitions, but not these paths. Add a comprehensive reduced-motion override for scroll behavior, category entrance animations, and remaining transform transitions. Re-test home, category, and detail routes while the preference is active.

### 6. The mobile header fails 320 px reflow and exposes undersized navigation targets

The early mobile rule provides a hamburger menu, but later duplicate overrides force the full nav and language actions visible and hide the menu (`src/styles.css:31,35`). At a 320×568 viewport, the rendered document had a 305 px client width while the language control extended from x=270 to x=350, so it was clipped by the page/hero. This makes language switching partially inaccessible at the standard 320 CSS-pixel reflow width.

At 390 px, the four nav links render at 9 px text and only 13 px high; their measured widths were 34–48 px. The 13 px target height is below the 24×24 CSS-pixel target-size baseline, and the header is difficult to operate by touch even where it fits.

Restore the actual mobile menu (with `aria-expanded`, an accurate changing label, and controlled-navigation association), or design a wrapping/scroll-safe mobile header. Give each interactive target adequate hit area and verify 320, 360, and 390 px widths.

### 7. The hero’s visible headline and accessible heading disagree

The DOM `<h1>` contains “Films engineered for motion.” (`src/main.jsx:142`), then CSS suppresses its text with `font-size:0` and inserts the visible “Innovation / Quality / Service / Commitment” copy through `::after` (`src/styles.css:27-29`). Chromium’s accessibility tree exposes the combined heading name:

`Films engineered for motion. Innovation / Quality Service / Commitment`

Sighted users see only the second message, while assistive-technology users receive both. Generated content is also fixed English and is not a reliable source for document semantics. Put the visible four-part headline in the React markup, preserve explicit mobile line breaks there, and remove the content-bearing pseudo-element.

### 8. Production still depends on remote Google Font assets

The design says every production asset used by the site must be copied into the project and optimized locally (`design.md:3-5`; implementation plan line 13). `src/styles.css:1` imports Manrope and DM Mono from `fonts.googleapis.com`, which in turn serves font files from Google at runtime. This is also a render-path network dependency and undermines deterministic/offline rendering.

Self-host the approved font files under the project (with only the used weights/subsets and `font-display` configured), or remove the remote dependency and use an intentional local/system stack.

### 9. The passing media tests do not validate the acceptance criteria they claim to gate

All tests pass, but the visual and responsive blockers above are outside their assertions:

- `scripts/test-media-manifest.mjs:13-21,52-60` checks an allowlist of filenames, dimensions, and existence, but not whether the pixels match the family/application requirement.
- `scripts/test-home-media.mjs:21-22` only proves that at least one `loading="lazy"` and one literal alt exist somewhere in `main.jsx`; it does not validate every below-hero image. Its responsive assertions (`lines 49-57`) match exact CSS text rather than rendered geometry.
- `scripts/test-category-media.mjs:17-20` requires the inaccurate exact-SKU alt template instead of testing fallback semantics.
- No automated check covers 320 px reflow, mobile target size, accessibility-tree hero naming, remote asset use, or the remaining reduced-motion animations.

Keep the inexpensive structural tests, but add rendered checks for the acceptance criteria and a reviewed semantic asset inventory. At minimum, add reduced-motion assertions, 320/390/801/970/1440 geometry checks, an accessibility-name check for the hero, fallback-alt cases, and a no-remote-production-assets check.

## Minor findings

### 10. The 801–970 px “compact” category layout creates excessively tall rows

The clipping fix keeps content inside the row, but the flexible preview spans almost the full middle column with `aspect-ratio:16/7` and no maximum width (`src/styles.css:107`). Rendered measurements were:

- 801 px viewport: each row was about 358 px high with a 566×248 preview.
- 970 px viewport: each row was about 432 px high with a 735×322 preview.

Eight category rows therefore become a very long intermediate-width list and jump sharply to the desktop treatment above 970 px. Constrain the preview width/height or use a genuinely compact two-column tablet layout.

### 11. The stylesheet contains contradictory and duplicated responsive rules

`src/styles.css` retains several superseded category/showcase definitions and multiple mobile header blocks. The hamburger is enabled in the initial `max-width:800px` rule, then disabled twice by later rules (`lines 31 and 35`); category rows are also defined repeatedly (`lines 11-12, 61-78, 103-108`). The current result depends heavily on source-order overrides, and `Header`’s `open` state/button path is effectively dead on mobile.

Consolidate each component’s final rules into one responsive section and remove dead declarations after the behavior fixes. This will make future breakpoint and reduced-motion changes substantially safer.

## Verification evidence

Fresh commands used the bundled Node runtime at:

`/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`

All of these exited 0:

```text
node scripts/validate-content.mjs
# Validated 82 brochure-backed products.

node scripts/test-language.mjs
# Validated 12 language options and 17 component keys.

node scripts/test-scroll-navigation.mjs
# Validated hash navigation decisions.

node scripts/test-request-validation.mjs
# Validated inquiry bounds and admin-token rules.

node scripts/test-media-manifest.mjs
# PASS: validated 8 family mappings and 5 homepage assets

node scripts/test-home-media.mjs
# Validated homepage editorial media structure.

node scripts/test-category-media.mjs
# PASS: validated category hero and product media semantics

node scripts/test-api.mjs
# Validated API limits, authentication, trusted-proxy rate limiting and production static serving without creating inquiries.
```

Fresh production build:

```text
pnpm run build
# vite v8.1.5
# 1781 modules transformed
# dist/assets/index-111j1XqB.css  33.08 kB (7.36 kB gzip)
# dist/assets/index-DEz2nhfo.js  233.45 kB (72.47 kB gzip)
# built successfully in 220 ms
```

Browser console warnings/errors: none.

## Confirmed compliant areas

- All 11 final `public/media` files are project-owned WebP images, visually clean, normally oriented, and 1600 px wide. The directory is approximately 956 KB total.
- No reviewed production media contains a visible watermark, screenshot chrome, or baked promotional copy.
- Factory hero rendering preserves the SO-FINE building sign at 1440×900 and 390×844 and uses distinct desktop/mobile focal positions.
- Category and product hashes render successfully; representative `#category=one-way-vision` and `#product=sf1413` routes retained their links and had no horizontal overflow at 390 px.
- The 801–970 px clipping regression is fixed: previews and arrows remain inside their rows with no horizontal overflow.
- Product-grid media reserves a stable 4:3 frame, model-specific images remain intact, and below-fold homepage/category imagery uses lazy loading and async decoding.
- Wall Decals, Overlaminate, and Cold Lamination media are clean and semantically credible for their mapped families.
- Capability decoration is hidden from assistive technology, and the implemented reveal/hero/capability reduced-motion overrides work for the paths they cover.
- Production build, content checks, API checks, hash-decision tests, and current structural media tests all pass.

## Re-review gate

Re-review only after all Important findings are resolved. The next gate should include fresh visual inspection of every replacement asset, the full automated suite/build, reduced-motion verification on home/category/detail routes, accessibility-tree inspection of the hero, and rendered checks at 320, 360, 390, 801, 970, and 1440 px.

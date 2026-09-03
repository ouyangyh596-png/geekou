# SO-FINE Final Visual Re-review

Date: 2026-08-18

## Verdict

**CHANGES_REQUIRED — NOT APPROVED**

No Critical finding remains. Three Important findings remain: the mobile hero headline is visibly clipped at every required narrow width, the homepage automotive image does not support its visible or alternative-text claims, and the rendered/media gate still reports success without testing either failure mode.

## Previous Important findings

| # | Previous finding | Re-review status | Evidence |
|---|---|---|---|
| 1 | Homepage illuminated-signage tile was a product roll | Resolved | `homeMedia.signage` now uses `illuminated-signage-application.webp`. The reviewed pixels show an installed illuminated storefront/light-box scene, and the alt accurately describes the visible scene. |
| 2 | Five family mappings did not satisfy the approved asset mapping | Resolved | One Way Vision shows perforated film across a train window; Self-Adhesive Vinyl shows printed bus graphics; Translucent Film shows an illuminated storefront/light box; PPF is honestly identified as a transparent-layer illustration; Car Wrap shows metallic material rolls. Their manifest alts describe what is visible and do not claim exact-SKU photography. |
| 3 | Company evidence reused the landing hero | Resolved | `homeMedia.company` points to hash-distinct `production-equipment.webp`, whose pixels show wide-format printing/lamination equipment in a production workspace. |
| 4 | Family fallbacks were announced as exact SKU photography | Resolved | `productImageAlt()` detects all three family SVG paths and returns `FAMILY family illustration, representative image for MODEL`. The current catalogue has exactly ten fallback products, and category/detail DOM checks expose the representative wording for those products. |
| 5 | Reduced motion did not disable all motion | Resolved | The final `prefers-reduced-motion: reduce` block disables animation, transitions, smooth scrolling, and transform-driven reveal states with `!important`. Fresh rendered checks passed for home and category motion paths; the universal selector also covers detail media. |
| 6 | Mobile header failed 320px reflow and target sizing | Resolved | At 320px the language control and menu are both at least 44px high, the open menu links are 249×44px, `aria-controls`/`aria-expanded`/the changing label are correct, and the document has no horizontal overflow. The same automated checks pass at 360px and 390px. |
| 7 | Visible and accessible hero headings disagreed | Resolved, with a new visible-layout regression | The accessible h1 name is exactly `Innovation / Quality Service / Commitment`, with no generated CSS content. However, the semantic text is now severely clipped on mobile; see Important finding 1 below. |
| 8 | Production depended on Google Fonts | Resolved | No production source requests a remote stylesheet/resource, the rendered request check saw no remote requests, and computed typography uses local system sans/monospace stacks. |
| 9 | Tests did not validate the acceptance criteria they claimed to gate | **Not fully resolved** | The new tests add useful motion, navigation, accessibility, local-resource, fallback-alt, and breakpoint coverage. They still produce a false-positive responsive/media verdict because they check document overflow and approved filenames rather than visible text bounds and actual image semantics; see Important finding 3. |

## Critical findings

None.

## Important findings

### 1. The semantic mobile hero headline is clipped at 320px, 360px, and 390px

The rendered h1 is inaccessible to sighted mobile users because both no-wrap lines extend far outside their container and are hidden by the landing section's overflow.

Fresh browser measurements:

| Requested viewport | Document client width | h1 width | `Innovation / Quality` width | `Service / Commitment` width | h1 scroll width |
|---:|---:|---:|---:|---:|---:|
| 320px | 305px | 277px | 472.59px | 568.42px | 568px |
| 360px | 345px | 317px | 472.59px | 568.42px | 568px |
| 390px | 375px | 347px | 472.59px | 568.42px | 568px |

The visible screenshots contain only truncated text such as `Innovation / ...` and `Service / Co...`. `src/styles.css:26` forces the title spans to `white-space: nowrap`. The older, more-specific mobile rule `.landing h1 { font-size: 72px; }` in the first stylesheet line wins over the later `.landing-title` clamp rules at `src/styles.css:37` and `src/styles.css:84`; those later declarations therefore do not produce the size that their structural test assumes.

Make the complete two-line message fit at every required narrow width, then assert each span's left/right bounds against the visible landing container at 320px, 360px, and 390px. A document-level `scrollWidth` assertion is insufficient because `.landing { overflow: hidden; }` masks the clipping.

### 2. The homepage automotive image and labels are not semantically honest

`public/media/home/automotive-film-application.webp` renders as an abstract black-and-white, water/frost-covered close-up. Neither the full source image nor the live 16:9 mobile crop shows an identifiable vehicle panel, transparent film edge, installer, hand, squeegee, or other application action.

The UI nevertheless labels it `03 / AUTOMOTIVE PROTECTION` and announces `Transparent automotive film being wet-applied to a vehicle panel` (`src/main.jsx:158`). That description claims context and action absent from the pixels. The live crop makes the scene even less identifiable.

Replace it with a credible automotive-film application or protected-finish photograph that visibly supports the design requirement. If this exact image is retained, its copy must be reduced to a literal description, but that would no longer satisfy the approved automotive-finish/application requirement.

### 3. The acceptance gate still produces false-positive responsive and semantic-media results

All tests pass, including `scripts/test-rendered-ui.mjs`, but the suite prints that responsive and semantic-media criteria are met while the two failures above remain:

- `scripts/test-rendered-ui.mjs:59-61` checks the accessible heading and absence of pseudo-element content, then `lines 79-80` checks only document overflow. It never checks whether either visible title span fits its container.
- `scripts/test-home-media.mjs:59-63` only regex-matches the intended mobile clamp text. It does not account for the more-specific `.landing h1` rule that wins in computed CSS.
- `scripts/test-media-manifest.mjs:52-54` treats approved filenames as proof of the depicted subject. The automotive test therefore passes despite the image not visibly showing automotive film application.
- Mobile home geometry is checked at 320/360/390px, but category/detail overflow is only exercised at 970px in `scripts/test-rendered-ui.mjs:115-127`. Manual 320px category/detail spot-checks happened to pass, but the report's claimed route/breakpoint matrix is broader than the automated coverage.

Add computed/visible bounds assertions for headline spans, cover home/category/detail at the promised breakpoint matrix, and keep a human-reviewed semantic inventory whose approval is tied to image hashes rather than semantic filenames alone.

## Minor findings

### 4. The claimed responsive CSS consolidation is incomplete

The old mobile `.landing h1 { font-size: 72px; }` rule, two later `.landing-title` clamps, and the no-wrap span rule coexist and conflict by specificity. This is the direct cause of Important finding 1 and shows that the source-order/specificity cleanup described in `final-fix-report.md` was not completed for the hero.

## Confirmed working areas

- The five replacement family assets are category-appropriate and honestly labelled; the PPF asset explicitly identifies itself as an illustration.
- All ten family-fallback SKUs use honest representative-family alternative text in category and detail views.
- The company image is distinct production evidence rather than a repeated hero.
- The mobile navigation opens, closes, exposes correct ARIA state, preserves 44px targets, and does not overflow at 320/360/390px.
- The hero's accessible name exactly matches its DOM text, and no content-bearing heading pseudo-element remains.
- Reduced-motion CSS, local-resource/font policy, 801/970px bounded category rows, 320px category/detail reflow, production routes, and console state passed re-review.

## Fresh verification evidence

All of the following exited 0:

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

node scripts/test-product-media-semantics.mjs
# PASS: validated representative fallback semantics for 10 products

node scripts/test-home-media.mjs
# Validated homepage editorial media structure.

node scripts/test-category-media.mjs
# PASS: validated category hero and product media semantics

node scripts/test-accessibility-assets.mjs
# PASS: validated semantic heading, mobile navigation, reduced motion and local production assets

node scripts/test-api.mjs
# Validated API limits, authentication, trusted-proxy rate limiting and production static serving without creating inquiries.

node scripts/test-rendered-ui.mjs
# PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria
```

Fresh production build:

```text
vite v8.1.5 building client environment for production...
✓ 1782 modules transformed.
dist/index.html                   0.47 kB │ gzip:  0.32 kB
dist/assets/index-ny11zRpF.css   32.55 kB │ gzip:  7.37 kB
dist/assets/index-6AYPMmbv.js   234.03 kB │ gzip: 72.71 kB
✓ built in 208ms
```

Browser console warnings/errors: none on the reviewed home, category, and detail routes.

## Re-review gate

Do not approve until the complete hero headline is visibly contained at 320px, 360px, and 390px; the automotive tile uses imagery and labels that agree with one another and the approved application requirement; and focused tests fail on the current broken states before passing on the fixes.

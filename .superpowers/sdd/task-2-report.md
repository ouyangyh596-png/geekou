# Task 2 Report — Homepage Editorial Imagery

## Scope completed

- Bound the homepage landing image to `homeMedia.hero` from the approved media manifest.
- Added `MaterialStory`, a three-tile editorial section immediately below the hero. It uses material-detail, illuminated-signage, and automotive imagery with English labels, descriptive alt text, lazy loading, async decoding, and fixed image dimensions.
- Added each mapped family preview image inside the existing category-row anchor. Category navigation and keyboard activation remain on the same anchor element.
- Added responsive aspect-ratio styling, clipped reveal treatment, blue overlays, preview expansion on hover/focus, visible mobile previews, keyboard focus styling, and reduced-motion transition suppression.
- Kept company imagery and category-page hero work out of scope.

## Changed files

- `src/main.jsx` — imports the media manifest, binds the homepage hero, adds `MaterialStory`, and renders family preview images in category rows.
- `src/styles.css` — adds editorial-story and category-preview layout, interaction, responsive, focus, and reduced-motion rules; removes the legacy CSS image-source override.
- `scripts/test-home-media.mjs` — new structural regression test for the Task 2 media contract and preserved homepage anchors.
- `.superpowers/sdd/task-2-report.md` — this report.

## TDD evidence

1. Added `scripts/test-home-media.mjs` before production changes.
2. Ran it with the required bundled Node runtime; it failed at the expected missing media-manifest import.
3. Implemented the minimal Task 2 source and CSS changes.
4. Re-ran the test successfully.

## Exact verification commands and results

```sh
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-media-manifest.mjs
# PASS: validated 8 family mappings and 5 homepage assets

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
# Validated homepage editorial media structure.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-scroll-navigation.mjs
# Validated hash navigation decisions.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-language.mjs
# Validated 12 language options and 17 component keys.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
# Vite production build completed successfully.
```

## Concerns

None identified. Visual browser checks and category-page/company imagery remain intentionally deferred to their planned tasks.

## Reviewer finding follow-up — 801px–970px category rows

### Root cause and fix

The category desktop grid had minimum-width columns that exceeded the available row width immediately above the 800px breakpoint. Since category rows intentionally clip their visual reveal, the preview and trailing arrow were clipped at 801px.

Added a category-only `@media(max-width:970px)` rule that switches rows to the existing compact three-column layout (`index`, `content/preview`, `arrow`). This keeps the preview and arrow inside the row through the reported 801px–970px range without changing the MaterialStory breakpoint.

### Regression test and verification

Extended `scripts/test-home-media.mjs` before the CSS fix. It failed at the expected missing 970px compact-layout rule, then passed after the rule was added.

```sh
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
# Validated homepage editorial media structure.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-scroll-navigation.mjs
# Validated hash navigation decisions.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
# Vite production build completed successfully.
```

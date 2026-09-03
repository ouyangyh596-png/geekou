# Task 1 — Orbit Selector State, Semantics and Structural Tests

Read Task 1 in `docs/superpowers/plans/2026-08-19-orbiting-product-selector-implementation.md`; it is the binding specification.

## Files you may modify

- `src/main.jsx`
- `scripts/test-home-media.mjs`

## Requirements

- Follow TDD: replace carousel assertions first, run `node scripts/test-home-media.mjs` and document a meaningful expected failure before editing production code.
- Replace the carousel interaction/state completely with selected-family orbit state. Keep `#products`, all category links, category media mapping and alt text, existing translations, and category routes.
- Use `selectedIndex` state, selected category/media values, the first five models for the selected category, and wrapping previous/next selection.
- Centre card is a semantic `#category=` anchor with selected image, index, name, description, model list and `Explore products` CTA. Key the content wrapper by selected slug for CSS entry animation.
- Render buttons labelled exactly `Previous product family`, `Next product family`, and accessible select buttons for every product family. Selected buttons use `aria-pressed`.
- Node clicks select only; centre anchor is the navigation route. Support Left/Right keyboard selection without preventing Enter for the centre link.
- Do not add dependencies, change CSS, change files outside scope, use git, or commit. Use apply_patch only.
- Run `node scripts/test-home-media.mjs && node scripts/test-scroll-navigation.mjs` after implementation.

## Node runtime

Prepend `/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin` to `PATH` before test commands.

# Task 2 — Orbit Visual System, Responsive Layout and Browser Checks

Read Task 2 in `docs/superpowers/plans/2026-08-19-orbiting-product-selector-implementation.md`; it is binding.

## Files you may modify

- `src/styles.css`
- `scripts/test-rendered-ui.mjs`

## Requirements

- Follow TDD: replace carousel browser checks first, run them and record a meaningful expected failure before CSS production edits.
- Remove the old product-carousel styles and convert `#products` into a desktop elliptical orbit around a central rounded 16:10 stage. Do not modify `src/main.jsx`.
- Use the exact orbital transform curve `transform 760ms cubic-bezier(.22,1,.36,1)`; selected node is elevated/opaque and distant nodes are subdued.
- Stage content must animate separately on family change: image opacity/scale and staggered textual/model/CTA entry using opacity/translate/clip. No layout jump.
- At max 800px turn orbit controls into a horizontally scrollable `.orbit-node-strip`, preserving 44px targets. At 320px no document-level overflow.
- Reduced motion must remove every orbit selector transition/transform/clip and use instant behavior.
- Browser tests: 1440 stage is rounded 16:10, 8 nodes measurable, arrow controls and node click change selection, centre CTA routes to selected category; 320 is overflow-free and selector strip exists; reduced motion is static. Preserve current unrelated home/category/detail/remote-resource assertions.
- Use `apply_patch`; no dependencies and no git. Do not modify source outside scope.
- Run full verification suite listed in the plan using Node PATH provided below, and record outputs in report.

## Node runtime

Prepend `/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin` to `PATH` before test commands.

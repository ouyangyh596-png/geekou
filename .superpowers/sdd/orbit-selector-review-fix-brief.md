# Orbit Selector Review Fix

Fix all P1 findings in `.superpowers/sdd/orbit-selector-task-2-review.md`.

## Files you may modify

- `src/main.jsx`
- `src/styles.css`
- `scripts/test-home-media.mjs`
- `scripts/test-rendered-ui.mjs`

## Required fixes

1. Add an actual `.orbit-node-strip` wrapper around the family-node buttons. It is the mobile horizontal selector, not the overall selector container.
2. Ensure 320px content width stays at or below viewport width. The central 16:10 stage must remain visible and use a mobile width based on the selector/container width, never grow to the desktop intrinsic width inside the scrolling strip.
3. Preserve usable, visible non-selected category buttons under `prefers-reduced-motion`. Reduced motion may remove the animated rotation but must lay nodes out in an accessible non-overlapping static form rather than collapsing them at the centre.
4. Ensure each desktop orbit node's rendered, transformed bounding box is at least 44px high and wide. Do not use a transform scale that reduces buttons under 44px.
5. Update structural and browser tests to fail before fixes and verify all four conditions directly. Do not loosen the assertions to hide a failure.
6. Keep the exact orbit animation curve for normal motion: `transform 760ms cubic-bezier(.22,1,.36,1)`.
7. Keep category selection, centre-stage category navigation, current product/media data, no dependencies, and all existing unrelated coverage.

## Workflow

Use TDD, record red and green outputs. Use apply_patch only. This repo is not Git. Use the bundled Node runtime by prepending `/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin` to PATH. Append your work and exact test output to `.superpowers/sdd/orbit-selector-task-2-report.md`.

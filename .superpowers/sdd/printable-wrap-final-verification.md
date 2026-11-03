# Printable wrap verification — 2026-09-10

Resumed from the interrupted project task. The image validation fix was already committed as `3443049`; no additional product code changes were needed during this pass.

## Fresh automated verification

- `pnpm test-printable-wrap-configurator`: passed.
- `pnpm test-printable-wrap-viewer`: passed.
- `pnpm test-printable-wrap-scene`: passed, including actual GLB isolation and GPU map-alpha checks.
- `pnpm test-release`: passed.
- `pnpm build`: passed; existing large Three.js chunk warning remains.
- `git diff --check`: passed before this report.

Commands used the bundled Node runtime added to PATH because the default shell did not resolve `node`.

## Browser verification

Tested the production preview at port 4174 on the exact printable chrome series route in the Codex browser.

- Local asymmetric transparent PNG reached the ready state and appeared on Silver body panels.
- Glossy/Matte selection rendered visibly different surfaces.
- Scale and rotation keyboard controls changed to 1.05× and 1°.
- Vehicle rotation and artwork-position modes accepted drag interactions.
- Reset restored 1.00×, 0°, Glossy and artwork-position mode.
- Remove cleared artwork and disabled the remove button.
- Corrupt PNG displayed a readable error; subsequent valid PNG upload recovered to ready.
- Mobile viewport requested at 390×844; measured document client/scroll widths both 375px, with no page-level horizontal overflow. Product table retains its own horizontal scroll.
- No captured browser console errors.

## Limits

Object URL cleanup, source-alpha isolation and upload size bounds were checked by automated/source tests, not browser memory profiling. Visual inspection was a smoke check, not an exhaustive comparison of every panel from every angle. JPEG/WebP acceptance is covered by validation tests; the interactive upload check used PNG.

The production preview remains available for user review. Existing unrelated working-tree changes were preserved.

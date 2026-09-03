# Orbit Node Depth — Task 1 Report

## Scope and changed paths

Implementation was limited to the task's selected-node surface and its acceptance coverage:

- `src/styles.css`
- `scripts/test-home-media.mjs`
- `scripts/test-rendered-ui.mjs`
- `.superpowers/sdd/orbit-node-depth-task-1-report.md` (this required report)

No application data, routes, React behavior, translations, dependencies, or nonselected orbit-node styles were edited.

## Implementation

- The selected `.orbit-node[aria-pressed="true"]` now uses a deep-blue, three-stop gradient, inset edge highlights, layered external shadow, `overflow:hidden`, stronger label weight/spacing, and text shadow.
- Added the required click-through `:after` sheen with the exact prescribed content, geometry, gradient, transform, animation timing, and `pointer-events:none`.
- Added `@keyframes orbit-node-sheen` to sweep the sheen across the selected surface.
- Added an orbit-scoped reduced-motion rule that explicitly applies `animation:none!important` to the selected-node sheen. The static gradient, focus outline, and hit-target sizing remain intact.
- Added static assertions for the selected visual contract and rendered Playwright assertions for normal and reduced-motion styles, pseudo-element behavior, and the 44px target.

## TDD evidence

### RED

Before any stylesheet edit, I added the static/browser assertions and ran:

```sh
export PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH"
node scripts/test-home-media.mjs && node scripts/test-rendered-ui.mjs
```

Result: exit 1. The static suite failed with:

```text
AssertionError [ERR_ASSERTION]: the selected orbit node has a clipped deep-blue gradient, inset highlight, layered shadow and stronger label typography
```

This was the expected failure: the original selected node had only `background:var(--blue)` and no selected-node sheen selector.

### GREEN

After the minimal selected-state stylesheet implementation, the first rendered run exposed a reduced-motion cascade issue: an unnecessary `position:absolute` in the selected selector overrode the existing reduced-motion layout. I removed that redundant property and re-ran the focused checks:

```text
Validated homepage editorial media structure.
PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria
```

Exit status: 0.

## Full verification

Command run with the bundled Node runtime first in `PATH`:

```sh
pnpm run test-home-media && node scripts/test-rendered-ui.mjs && pnpm run build
```

Result: exit 0.

```text
$ node scripts/test-home-media.mjs
Validated homepage editorial media structure.
PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria
$ vite build
vite v8.1.5 building client environment for production...
transforming...✓ 1782 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.47 kB │ gzip:  0.32 kB
dist/assets/index-CDmNdOD8.css   35.02 kB │ gzip:  7.89 kB
dist/assets/index-B5KHFNGe.js   235.02 kB │ gzip: 73.01 kB
✓ built in 241ms
```

## Self-review

- Selected state only: all new visual declarations use `.orbit-node[aria-pressed="true"]`; nonselected node styling and interaction code are unchanged.
- Sheen safety: the pseudo-element is clipped, inherits the pill radius, and uses `pointer-events:none`, so it cannot block selection clicks.
- Accessibility: the existing visible `:focus-visible` outline remains; rendered checks confirm the selected target remains at least 44px in normal and reduced-motion contexts.
- Motion: normal mode verifies `orbit-node-sheen` at `3.8s`; reduced-motion browser checks verify its computed animation name is `none` while the selected gradient and depth remain measurable.
- Build: Vite completed successfully without adding dependencies.

## Concerns

- The required build command generates the normal `dist/` output; no source or test edits were made outside the paths listed above and this report.
- No visual screenshot comparison was requested; acceptance is covered by static CSS contract checks and rendered browser checks at desktop, mobile, and reduced-motion viewports.

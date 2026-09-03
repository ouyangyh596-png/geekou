# Orbit Selector Task 2 Review

## Spec verdict: FAIL

The desktop stage, ellipse transform formula, required `760ms cubic-bezier(.22,1,.36,1)` curve, keyed/staggered stage entry animation, selection interactions, CTA routing, document-level 320px overflow guard, and transition-removal rule are present. However, the required mobile strip DOM interface and usable responsive/reduced-motion behavior are not delivered.

### Issues

- **P1 — required `.orbit-node-strip` is absent, and the browser test silently substitutes another interface.** `src/main.jsx` exposes no `.orbit-node-strip`, while `src/styles.css:137` turns `.orbit-selector` into the scroller instead. The binding plan and task brief specifically require a horizontally scrollable `.orbit-node-strip`; `scripts/test-rendered-ui.mjs:99-105` then verifies `.orbit-selector`, so it cannot detect the missing required class. This is an explicit spec failure, acknowledged but not resolved in the implementation report.

- **P1 — the 320px centre stage expands to the full chip-track width instead of fitting the mobile viewport.** `src/styles.css:137-138` makes the selector an eight-column `max-content` grid, then has `.orbit-stage` span all columns at `width:100%`. In a 320px rendered check, the selector is 277px wide but has `scrollWidth:1235px`; the supposedly responsive stage is `1217.8px` wide and only a slice is visible. The `min-width:calc(100vw - 28px)` does not cap it. This violates the required compact/visible mobile centre stage even though `#products` masks document-level overflow. `scripts/test-rendered-ui.mjs:179-180` tests only document overflow and scroller existence, not the stage's mobile geometry.

- **P1 — reduced motion collapses the desktop selector and makes nonselected families inaccessible.** `src/styles.css:145` forces `transform:none` on the entire selector subtree. At desktop, `.orbit-stage` and every absolutely positioned `.orbit-node` remain at `top:50%; left:50%` (`src/styles.css:121,131`) but lose the transforms that centre/position them. The stage shifts down/right and all nodes stack beneath it (nonselected nodes are also under the stage's higher `z-index`), so selection is not usable for reduced-motion users. The requirement is instant, usable behavior—not merely computed transforms of `none`. `scripts/test-rendered-ui.mjs:112-125` checks only computed styles and misses layout and interaction regressions.

- **P1 — desktop orbit-node hit areas fall below the required 44px after their transform scale.** The untransformed `min-height:44px` in `src/styles.css:131` is shrunk by the `.86`/ellipse `scaleY(.62)` transform; the selected node is also only `44 * .62 * 1.08 = 29.5px` tall (`src/styles.css:131-132`). CSS transforms affect the physical pointer target. The desktop test asserts 44px only for arrow controls (`scripts/test-rendered-ui.mjs:71-77`) and checks node measurability rather than target size (`scripts/test-rendered-ui.mjs:65-68`), so this accessibility regression passes.

## Quality verdict: FAIL

The CSS correctly replaces carousel selectors, scopes the visual system cleanly, and has a useful staggered-animation structure. But the responsive layout couples the stage and chips into one max-content grid/scroller, and the reduced-motion override removes geometry without supplying a non-transform layout. The rendered test gives a false green result because it validates the substituted `.orbit-selector`, checks no mobile stage bounds, and treats computed reduced-motion values as sufficient without exercising the resulting UI.

## Verification performed

- `PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" node scripts/test-rendered-ui.mjs` — passes, but does not cover the four failures above.
- Rendered local checks at 1440px and 320px. At 320px: document width `305/305`; `.orbit-node-strip` count `0`; `.orbit-selector` `277px` client width / `1235px` scroll width; `.orbit-stage` `1217.8px` wide.

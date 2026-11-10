# Desktop PPF Implementation Plan

> Execute with executing-plans; specification: docs/design-refresh/DESKTOP_PPF_2026-11-10.md.

**Goal:** Share the mobile four-layer SVG animation across desktop and mobile with a dark, scroll-linked background.

**Architecture:** One PPFLayerAnimation component receives the existing device-hook result. Preserve the mobile sheet geometry and scroll phases, use RAF-coalesced transform updates, and move the existing desktop gradient/grid into the sticky viewport. Keep mobile CSS scoped to .is-mobile.

**Tech stack:** React, SVG, CSS, Node assertion scripts, Playwright, Vite.

- [x] Establish a failing shared-component integration assertion before changing production code.
- [x] Replace both legacy components and retire PNG playback imports; retain public PNG assets.
- [x] Add shared responsive diagram styling and dark parallax background; preserve mobile layout and provide a static expanded reduced-motion view.
- [x] Update sequence, mobile, content and homepage tests; retain unrelated assertions.
- [x] Run all test-release commands and Vite build; review the final diff.
- [ ] Browser execution: blocked by sandbox EPERM listening on 127.0.0.1:4178; updated script retained for an environment that permits a local server.
- [ ] Commit to design-refresh only: attempted, blocked by sandbox denying .git/index.lock creation. No push or main changes.

English UI labels remain Self-Healing Top Coat, High-Clarity TPU, Glue, PET Liner, with no numbered markers or invented product data.

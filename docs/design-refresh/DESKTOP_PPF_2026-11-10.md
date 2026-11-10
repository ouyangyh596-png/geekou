# Desktop PPF: switch to the code-drawn layered animation (2026-11-10)

## Goal
1. Desktop: replace the PNG-sequence `PPFScrollSequence` with the same code-drawn layered SVG animation used on mobile (`src/components/MobilePPFScrollSequence.jsx`): 4 layers that separate and close back together as the user scrolls, with the identical English labels: Self-Healing Top Coat, High-Clarity TPU, Glue, PET Liner. Do NOT add numbered markers (no 1/2/3/4).
   - Prefer ONE shared component (e.g. `PPFLayerAnimation.jsx`) used by both mobile and desktop and made responsive (desktop: larger, labels can sit beside the layers; mobile: current layout). Keep the mobile look/behaviour unchanged except for the background fix below.
   - The desktop section should be a pinned/sticky scroll scrub, same idea as mobile: scroll down = layers split apart, scroll back = they close. Smooth, no jank, respects prefers-reduced-motion.
   - Keep the rest of the desktop site unchanged.
2. Mobile background fix: the mobile PPF section background is wrong. It must use the SAME dark background as the desktop PPF section, and the background must move/animate along with the scroll (parallax/scroll-linked, like desktop), not be a static flat fill.

## Constraints
- English only in UI text. Don't invent product data.
- `.is-mobile` scoping rule in src/mobile.css must still hold (test-mobile-home requires every mobile.css rule to start with `.is-mobile`).
- Update the PPF tests in scripts/ (test-ppf-*.mjs, test-mobile-ppf.mjs, test-home-media, test-site-content, test-tvc, test-mobile-home) so they test the new implementation; remove tests only for the retired PNG-sequence behaviour. The PNG sequence files can stay in public/ but should no longer be loaded on the homepage.
- `pnpm test-release` (or the equivalent node scripts) and `node ./node_modules/vite/bin/vite.js build` must pass.
- Commit on branch design-refresh with a clear message. Do NOT push and do not touch main.
- Report: what changed, test results, commit hash.

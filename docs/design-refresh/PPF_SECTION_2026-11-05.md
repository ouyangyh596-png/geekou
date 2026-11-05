# PPF section fix (homepage, "SO-FINE / PPF SYSTEM" block) — 2026-11-05

Work on branch design-refresh. Don't push, don't merge to main, don't deploy. Commit locally when done.

1. Title: replace "Protection in motion." with **AUTOFACE PPF** as the section headline (keep the elegant type treatment; e.g. "AUTOFACE" in the sans and "PPF" in the italic serif accent, or equivalent — make it look designed). Keep kicker and paragraph.
2. "Explore PPF" must become a real, designed button (not a plain text link): pill/outlined button in the site's style with a clear hover effect (e.g. fill sweep + arrow nudge + subtle glow), focus-visible style, keyboard accessible, and a pressed state. Link target: the existing PPF page/anchor if one exists, otherwise keep current href.
3. Film animation: go back to the earlier frame-sequence effect (public/assets/ppf-sequence/frame-000.png … 115 frames, the English-label frames from commit a6474f9 "feat: replace PPF sequence with English frames"; see git history for how the canvas sequence component worked before c16e733 replaced/changed it). Behaviour:
   - When the user scrolls the section into view, it auto-plays frames 0–73 (74 frames) once at a smooth ~30 fps.
   - After that intro finishes, the remaining frames are scrubbed by the user's scrolling (scroll-driven, sticky section), both directions; scrolling back above the intro range shows frame 73 or scrubs back smoothly — choose the most natural behaviour, no jumps.
   - Preload frames (progressive, first ones first), draw on canvas with devicePixelRatio, no flicker; respect prefers-reduced-motion (show a static final frame).
   - Keep the current dark blue PPF background design.
4. Keep mobile working (stacked layout, sequence still works).
Verify: `node ./node_modules/vite/bin/vite.js build` succeeds; if possible screenshot the section at desktop and mobile widths. Write a short summary of changes to the end of this file.

## Implementation summary

- Updated the English and Chinese section headline to **AUTOFACE PPF**, retaining the sans/italic-serif treatment, kicker, paragraph, dark blue background and stacked responsive layout.
- Replaced the text link with an outlined pill linking to the existing `#category=ppf` page, including fill sweep, arrow movement, glow, keyboard focus and pressed states.
- Verified all 115 English frames are identical to commit `a6474f9`. Restored canvas playback: visible intro 0–73 at approximately 30 fps, then smooth bidirectional scroll through 73–114. The handoff anchors to the current scroll position; reverse scrolling holds frame 73 above that point. If the intro ends at the section's bottom, reverse scrolling re-arms the remaining range.
- Added bounded progressive loading (four requests at a time), buffering for undecoded intro frames, DPR-aware contained drawing, cleanup, idle RAF suspension and a static final frame for reduced motion (including preference changes).
- Validation passed: requested Vite build; PPF manifest, timing and actual-effect playback tests (buffering, late handoff, reverse, DPR, reduced motion, cleanup); site-content, language and home-media checks; `git diff --check`. Vite still reports its existing large-chunk warning.
- Added `scripts/test-ppf-browser.mjs` for desktop/mobile screenshots and browser checks. Running it here is blocked because the sandbox denies the local preview listener (`listen EPERM 127.0.0.1:4178`); no screenshots were produced.
- Local commit was attempted but blocked by the environment's read-only `.git` permission (`Unable to create .git/index.lock: Operation not permitted`). All changes remain in the working tree on `design-refresh`; nothing was pushed, merged or deployed.

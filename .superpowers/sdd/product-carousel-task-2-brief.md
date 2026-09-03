# Task 2 — Card Carousel Styling and Browser Verification

Implement the second task from `docs/superpowers/plans/2026-08-19-product-card-carousel-implementation.md`.

## Files you may modify

- `src/styles.css`
- `scripts/test-rendered-ui.mjs`

## Requirements

- Write failing browser assertions first and run `node scripts/test-rendered-ui.mjs`, recording the expected failure before CSS production edits.
- Replace all old `.product-rail*` presentation and test assumptions with the new carousel. Remove obsolete rail styles only where necessary; do not modify `src/main.jsx` in this task.
- The viewport must provide native horizontal scrolling, clip vertical overflow, CSS scroll snapping, and smooth scrolling except reduced-motion users.
- Desktop: 24px gap; cards use `flex: 0 0 calc((100% - 48px) / 2.35)`; 16:10 media; stable card dimensions; card image, index, title, description and arrow fit inside the card.
- Buttons have 44px hit areas and clear focus/hover feedback.
- Mobile at 800px: card basis `calc(100% - 48px)`, leaving part of the next card visible. Hide controls only for coarse pointers. At 320px, the document must have no horizontal page overflow.
- Add entry reveal styling to carousel cards, preserving `reveal` behavior and making non-visible cards visibly static under reduced motion.
- Under reduced motion, carousel/card/image transitions, transforms and clips must be disabled and scroll behavior must be `auto`.
- Browser checks must cover: 1440 scrollability; card width near 40% of viewport; next button and ArrowRight scrolling; drag over 8px preserving URL; 320 no page overflow and next-card edge; reduced-motion static styles and automatic scroll behavior.
- After implementation, run `node scripts/test-rendered-ui.mjs` and full suite from the plan (with the available Node runtime on PATH).

## Scope constraints

- Do not modify `src/main.jsx`, category data, language content, or dependencies.
- This repository is not a Git repository: do not run git commands or create commits.
- Use `apply_patch` for edits.

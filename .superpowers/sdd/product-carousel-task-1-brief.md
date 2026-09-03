# Task 1 — Card Carousel Markup and Interaction

Implement the first task from `docs/superpowers/plans/2026-08-19-product-card-carousel-implementation.md`.

## Files you may modify

- `src/main.jsx`
- `scripts/test-home-media.mjs`

## Requirements

- Write the structural assertions first and run `node scripts/test-home-media.mjs`; record the expected failing result before editing production code.
- Replace the homepage product rail markup with a carousel that retains every `#category=` anchor, `familyMedia[category.slug].preview`, and `familyMedia[category.slug].alt`.
- Render `.product-carousel-viewport`, `.product-carousel-track`, and `.product-carousel-card` anchors.
- Add two `type="button"` controls labelled exactly `Previous product family` and `Next product family`.
- Use `useRef` for both the carousel viewport and pointer origin.
- `scrollByCard(direction)` must use the first card width plus the track CSS gap and call `scrollBy` with `smooth`, except `auto` under reduced motion.
- The focusable viewport handles ArrowLeft and ArrowRight only; Enter must preserve the normal anchor navigation.
- Pointer dragging must block anchor navigation only when movement exceeds 8px. Normal taps/clicks must still navigate.
- Cards include index, mapped image, name, description, and ArrowUpRight.
- Run `node scripts/test-home-media.mjs && node scripts/test-scroll-navigation.mjs` after implementation.

## Scope constraints

- Do not modify CSS in this task.
- Do not add dependencies or autoplay.
- This repository is not a Git repository: do not run git commands or create commits.
- Use `apply_patch` for edits.

# Task 1 report — Card Carousel Markup and Interaction

## Changed files

- `src/main.jsx`
  - Replaced the homepage product rail markup with native carousel viewport, track, card anchors, and previous/next controls.
  - Added viewport and pointer-origin refs; card-width-plus-gap scrolling; reduced-motion scroll behavior; keyboard arrow handling; and the 8px pointer-drag navigation guard.
  - Retained all category hash anchors, category data, `familyMedia[category.slug].preview`, and `familyMedia[category.slug].alt` bindings.
- `scripts/test-home-media.mjs`
  - Replaced obsolete product-rail and CSS assertions with structural carousel assertions for refs, controls, scrolling, keyboard/pointer handlers, anchors, media, copy, and the drag threshold.
- `.superpowers/sdd/product-carousel-task-1-report.md`
  - Recorded this task result.

## Red test

Requested command:

```text
node scripts/test-home-media.mjs
zsh:1: command not found: node
exit 127
```

The environment has no `node` on PATH. Using its available Node runtime to execute the same script produced the expected feature-absent failure before editing production code:

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
AssertionError [ERR_ASSERTION]: ProductShowcase keeps a ref to the carousel viewport
exit 1
```

## Green tests

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs && /Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-scroll-navigation.mjs
Validated homepage editorial media structure.
Validated hash navigation decisions.
exit 0
```

## Re-review fix — Pointer Capture terminal delivery

The track now captures the active pointer on `pointerdown` when `setPointerCapture` is supported. This keeps `pointerup` and `pointercancel` delivery on the track after a drag leaves its bounds. The track also handles `lostpointercapture` with the same terminal handler.

The existing cleanup semantics remain intact: `pointercancel` clears immediately, while `pointerup` and the browser's follow-on `lostpointercapture` use identity-protected deferred cleanup so the drag's own click can still be suppressed. A no-click release still clears before any later normal click.

`scripts/test-home-media.mjs` now asserts all terminal handler wiring and executes the production capture helper with supported and unsupported targets.

### Red test

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
AssertionError [ERR_ASSERTION]: the carousel track receives terminal pointer and lost-capture cleanup events
exit 1
```

### Green tests

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs && /Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-scroll-navigation.mjs
Validated homepage editorial media structure.
Validated hash navigation decisions.
exit 0
```

## Re-review fix — cancellation and no-click lifecycle

`handlePointerUp` now distinguishes `pointercancel` from a normal `pointerup`.

- `pointercancel` immediately clears the pointer ref because no associated click can follow.
- A normal `pointerup` schedules a zero-delay cleanup of the exact pointer object. Its associated click can still consume and suppress the drag first; if no click follows, the scheduled cleanup removes the stale state. The identity check prevents an older cleanup from clearing a newer pointer interaction.

The executable lifecycle coverage now verifies immediate cancellation cleanup and deferred cleanup after a drag that ends without a click, in addition to the existing drag-click consumption check.

### Red test

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
AssertionError [ERR_ASSERTION]: cancel clears pointer state immediately while pointerup defers cleanup for its associated click
exit 1
```

### Green tests

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs && /Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-scroll-navigation.mjs
Validated homepage editorial media structure.
Validated hash navigation decisions.
exit 0
```

## Self-review

- Verified the exact accessible labels required for both controls.
- Verified `scrollByCard` derives the scroll step from the first card's rendered width plus the track gap and uses `auto` motion only when reduced motion is requested.
- Verified only ArrowLeft and ArrowRight call `preventDefault`; Enter remains unhandled and therefore preserves anchor activation.
- Verified pointer navigation suppression depends strictly on horizontal movement greater than 8px, so normal taps/clicks retain navigation.
- Did not modify CSS, dependencies, autoplay behavior, Git state, or unrelated source files.

## Concerns / handoff notes

- `node` is unavailable by name in the current shell. Future commands written as `node ...` require either adding the available runtime to PATH or using the absolute runtime path above.
- This task intentionally adds no CSS. Task 2 must style the new carousel selectors for the required sizing, horizontal scroll/snap behavior, controls, responsive layout, and reduced-motion visual overrides.

## Review fix — drag-state lifecycle

The review identified that completed drags left `pointerOriginRef.current.dragged` set forever. `consumeCarouselDrag` now returns the current drag result and clears the ref in the same operation. `handleCardClick` uses this consumer, so only the click associated with the drag is prevented; a later tap/click has no retained drag state and follows its anchor.

`scripts/test-home-media.mjs` now extracts and executes this JSX-free production helper from `src/main.jsx`. It verifies that a drag is consumed, the ref is cleared, and a second consumption returns `false`, representing the later normal click/tap.

### Red test

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
AssertionError [ERR_ASSERTION]: anchor navigation consumes drag state when it suppresses the associated click
exit 1
```

### Green tests

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs && /Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-scroll-navigation.mjs
Validated homepage editorial media structure.
Validated hash navigation decisions.
exit 0
```

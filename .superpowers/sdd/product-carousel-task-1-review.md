# Task 1 review — Card Carousel Markup and Interaction

## Verdict

Needs correction before Task 1 can be accepted. The required markup and controls are present, and both reported test commands pass in the available Node runtime, but a completed drag leaves navigation disabled for the rest of the component's lifetime.

## Spec

- **P1 — `src/main.jsx:187-189`**: `handlePointerUp` is a no-op, so once `handlePointerMove` sets `pointerOriginRef.current.dragged` to `true`, it is never reset. Every later card click is prevented by `handleCardClick`, including an ordinary tap/click after the drag. This violates the requirement that normal taps/clicks still navigate; suppression must apply only to the click associated with the drag.

## Quality

- **P2 — `scripts/test-home-media.mjs:97-105`**: The test only matches source text for the threshold and `preventDefault` condition; it does not exercise the pointer-down/move/up/click lifecycle. It therefore reports green while missing the persistent drag-state defect above. Add a behavioral test (or an extracted, executable handler test) that verifies a post-drag normal click follows its anchor.

## Re-review verdict

Needs correction. The new consumer fixes the ordinary drag-then-click path, but it does not safely clear state when that click never occurs.

## Spec

- **P1 — `src/main.jsx:193-195,207`**: `handlePointerUp` remains a no-op, including for `onPointerCancel`. A drag that ends outside a card, is cancelled, or otherwise produces no card click leaves `pointerOriginRef.current.dragged` set. The next ordinary card click then consumes that stale state and prevents navigation. Normal taps/clicks are therefore still not reliably preserved.

## Quality

- **P2 — `scripts/test-home-media.mjs:113-119`**: The executable helper test covers only immediate consumption after a drag. It does not model `pointerup`/`pointercancel` with no associated card click followed by a normal click, so it cannot detect the remaining stale-state path.

## Re-review verdict — cancel/no-click fix

Needs correction. The cleanup logic is sound when the track receives the terminal pointer event, but the interaction does not ensure that it does.

## Spec

- **P1 — `src/main.jsx:198-210,225`**: The track starts tracking on `pointerdown` but does not capture that pointer. If a drag crosses the 8px threshold, leaves the track, and is released outside it, neither `onPointerUp` nor `onPointerCancel` on the track is guaranteed to run. The drag state then remains and the next ordinary card click is prevented, so normal taps/clicks are still not reliably preserved.

## Quality

- **P2 — `scripts/test-home-media.mjs:118-142`**: The tests execute the cleanup helpers directly, but do not exercise the bound pointer handlers or a drag whose terminal event occurs outside the track. They therefore cannot verify delivery of the cleanup event or catch the remaining stale-state path.

## Final re-review verdict — pointer capture and terminal cleanup

Accepted. No remaining findings in the requested pointer interaction paths.

## Spec

No issues. `src/main.jsx:169-184,204-220,232` captures the active pointer, clears immediately on cancellation, defers normal terminal cleanup until after the associated click, and handles `lostpointercapture`. This preserves drag-click suppression while allowing subsequent normal navigation.

## Quality

No issues. `scripts/test-home-media.mjs:123-154` executes the capture, drag-consumption, cancellation, and no-click cleanup helpers, including unsupported capture targets; the binding assertions cover all terminal handlers.

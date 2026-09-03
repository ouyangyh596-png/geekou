# PPF Scroll-Driven Sequence Design

## Goal

Add an Apple-inspired scroll-driven 3D product presentation to the homepage using the 115 supplied PPF rendering frames. The animation must advance and reverse according to the user's scroll position, with no autoplay requirement.

## Placement

The sequence section is placed after the existing hero and before the product category selector:

`Hero → PPF scroll sequence → Product categories → Company content`

The existing navigation, hero CTA, category links, and detail pages remain intact.

## Interaction model

- The section has a tall scroll track and a sticky viewport-stage.
- The sticky stage remains visible while the user moves through the track.
- Normalized section progress maps linearly to frame index `0..114`.
- Downward scrolling advances frames; upward scrolling reverses frames automatically because progress is derived from scroll position.
- Scroll input is handled through passive scroll observation plus `requestAnimationFrame` scheduling. The browser remains in normal page scrolling; no wheel hijacking is used.
- Touch scrolling uses the same progress mapping without a separate mobile interaction model.
- The sequence exits naturally after the final frame, allowing the user to continue to product categories.

## Visual treatment

- Use the supplied PPF frames as local assets inside `public/assets/ppf-sequence/`.
- Render the current frame in a contained 16:9 stage with rounded corners, a restrained blue-white background, and a soft shadow.
- Add a small overline such as `SO-FINE / PPF SYSTEM` and a concise English product title and description.
- Animate copy opacity and vertical offset around the beginning and end of the sequence so the information feels attached to the object without competing with it.
- Include a subtle progress indicator showing the current frame position; it must remain accessible and not duplicate existing hero slide numbering.

## Loading and performance

- Copy all frames into the project folder; do not reference the source Desktop path at runtime.
- Load the first frame eagerly and preload nearby frames as the user approaches them.
- Keep a bounded in-memory image cache to avoid decoding all 115 full-resolution images at once.
- Reuse a single image element or canvas-backed renderer so DOM nodes do not grow with frame count.
- Use a low-resolution responsive presentation on narrow screens through CSS sizing while preserving frame aspect ratio.
- If a frame is unavailable, retain the last successfully decoded frame and log a non-fatal warning.
- Under `prefers-reduced-motion`, show a stable representative frame and the product copy without scroll-linked animation.

## Data and boundaries

- Sequence metadata is kept separate from the existing product catalog.
- The initial sequence identifies the material as PPF and links to the existing PPF category route.
- No external video or CDN dependency is required.
- No changes are made to the contact API or product detail data in this feature.

## Acceptance criteria

1. Scrolling down through the section advances from the first supplied frame to the final supplied frame.
2. Scrolling back up reverses the sequence smoothly and restores the earlier frames.
3. The stage remains visually stable while scrolling and does not distort the 16:9 source.
4. Mobile touch scrolling works without horizontal overflow or broken navigation.
5. Existing homepage navigation and product links still work.
6. Reduced-motion mode does not rapidly change frames.
7. Production build succeeds and the sequence assets are included in the package.

# Product Card Carousel Design

## Goal

Replace the homepage product rail with a horizontally scrollable product card carousel that presents SO-FINE's eight product families through large category-matched visuals while preserving category-page navigation.

## Layout

- The `#products` section retains its existing heading and copy.
- A horizontal viewport displays 2.35 cards on wide desktop screens, exposing the next card as a continuation cue.
- Each card contains a 16:10 image, index, category name, short description, and diagonal arrow.
- Desktop cards use a minimum width of 480px; mobile cards use a width of `calc(100vw - 64px)` so part of the next card remains visible.
- No product-model pages, translations, category URLs, or images are changed.

## Interaction

- The viewport uses native horizontal scroll with CSS scroll-snap.
- Previous/next buttons scroll by one card width and are disabled only at the respective end.
- Pointer dragging temporarily suppresses click navigation only when the pointer has moved more than 8px; normal taps/clicks open the existing `#category=<slug>` route.
- The viewport is focusable and supports Left/Right keyboard controls; buttons have descriptive aria-labels.
- Hover/focus produces a restrained image scale, surface tint, and arrow motion without changing card dimensions.

## Scroll Motion

- The carousel enters on vertical viewport intersection using the existing `reveal` state.
- Each card has a staggered opacity/translate/clip reveal on entry and replays after scrolling upward.
- Native horizontal scrolling does not auto-advance or animate continuously.
- `prefers-reduced-motion` disables reveal, transforms, scroll behavior, and transitions while keeping all cards readable and draggable.

## Responsive and Accessibility Rules

- At 800px and below, hide arrow buttons only when touch is available; the carousel remains scrollable by touch and keyboard.
- At 320px, cards have no horizontal page overflow and controls retain at least 44px hit areas.
- Each image uses the existing category-specific alt text, and each card remains a semantic anchor.

## Verification

- Add unit checks for card-carousel markup, native snap styles, and retained category links.
- Add rendered checks for 1440px and 320px card geometry, button state, keyboard scroll, drag-without-navigation, and reduced-motion rendering.
- Run all existing tests plus Vite build and confirm local preview responds with HTTP 200.

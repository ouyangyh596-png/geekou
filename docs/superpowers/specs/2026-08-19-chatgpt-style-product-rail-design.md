# ChatGPT-Style Product Rail Design

## Goal

Replace the homepage product-family list with a restrained editorial rail inspired by the supplied ChatGPT reference: descriptive family information on the left, a large matched image on the right, and sequential scroll-driven reveals.

## Desktop Layout

- Keep the existing `#products` section and category anchor URLs.
- Use a max-width content rail within the existing approximately 1700px page width.
- Render each product family as one horizontal row with: index, name, concise family description, 16:10 image, and directional arrow.
- Images remain an integral part of each category link; the entire row is keyboard accessible and opens the existing category page.
- Rows use generous vertical spacing and thin blue-grey dividers, replacing the expanding hover-height behavior.

## Scroll Motion

- Use the existing IntersectionObserver-driven `.reveal` state rather than a new dependency.
- Each row enters with a small upward translation, opacity transition, and image clip/scale reveal. Stagger follows DOM order.
- Once out of view, the observer removes the state so the animation can replay when scrolling upward.
- Hover/focus uses only a modest image scale and arrow shift; it does not change row height.
- Under `prefers-reduced-motion`, all rows and images are fully visible with no transition or transform.

## Responsive Rules

- At desktop widths, use a five-column grid: index, name, description, image, arrow.
- Between 801px and 1100px, keep the rail structure but permit the description to wrap without clipping or increased hover height.
- At 800px and below, render each category as a stacked card: index/title/arrow on one line, image beneath, then description. The whole card remains one link.
- Preserve current 320px minimum-width support, touch target sizing, and visible focus outline.

## Non-Goals

- Do not change category page content, product model data, translations, routing, or scroll restoration.
- Do not add a horizontal scroller or third-party animation library.

## Verification

- Extend the homepage media test to assert the new rail structure and no height-changing hover rule.
- Run existing content, language, scroll, media, homepage, category, rendered UI tests, and Vite build.
- Manually check `#products` at desktop and 320px widths; category rows must remain clickable and fully visible.

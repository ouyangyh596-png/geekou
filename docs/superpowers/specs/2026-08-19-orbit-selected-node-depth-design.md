# Orbit Selected Node Depth Design

## Goal

Give the currently selected orbit category a premium, dimensional presence so it reads as a deliberate active product-family marker rather than a flat blue pill.

## Visual Treatment

- Apply only to `.orbit-node[aria-pressed="true"]`; nonselected nodes remain restrained.
- Use a deep-blue gradient surface, subtle inset highlight, 1px blue-white edge and layered blue shadow.
- Preserve the existing rounded silhouette but add visual depth through a faint top-light band and a moving sheen pseudo-element.
- Increase selected label weight and spacing modestly without changing its readable text or layout semantics.
- The selected node gains a restrained scale/brightness entrance matching the existing orbit selection transition.

## Motion and Accessibility

- Sheen uses a single low-contrast sweep and is disabled under `prefers-reduced-motion`.
- Hover/focus retains a visible focus outline and does not reduce the 44px hit area.
- No changes to category selection, centre-stage navigation, mobile layout, translations or data.

## Verification

- Add a CSS/static acceptance check for selected-node gradient, pseudo-element sheen and reduced-motion disablement.
- Run the relevant home-media test, rendered browser test and production build.

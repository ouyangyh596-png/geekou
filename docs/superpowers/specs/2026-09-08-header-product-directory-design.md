# Header product directory design

## Goal

Improve the desktop header without changing the existing site structure: make the SO-FINE logo more prominent, give navigation links a clear hover state, and provide a direct product-family directory under **Products**.

## Scope

- Increase the desktop logo size while keeping the header vertically balanced.
- Add an animated underline to the four primary navigation links: Products, Technology, Company, and Contact.
  - On the dark landing header, the underline is white.
  - On light page headers, it uses the site blue so it remains visible.
- Replace the standalone Products anchor with a desktop hover/focus menu.
  - The menu contains exactly the nine existing product families sourced from `brochureSeries`.
  - Each item links directly to its category detail route: `#category=<slug>`.
  - Individual model/SKU names are intentionally not included.
  - Clicking the Products label itself continues to open the existing homepage product overview (`#products`).
- Preserve the existing mobile menu. Touch layouts do not depend on hover; Products remains a normal menu link and the desktop directory is hidden.

## Interaction and accessibility

- The directory appears when the Products trigger is hovered or receives keyboard focus, and remains open while the pointer/focus is within it.
- Each destination is an ordinary hash link, preserving direct links and browser navigation.
- The Products trigger and directory use semantic navigation/list markup with an accessible label.
- The underline animation also appears on keyboard focus, not only mouse hover.

## Implementation boundaries

- `src/main.jsx`: introduce a small Products navigation component that consumes the already-derived `categories` array. No second, manually maintained category list will be created.
- `src/styles.css`: add desktop-only dropdown positioning, entry layout, motion, and header/logo sizing. Mobile rules explicitly suppress the desktop dropdown.
- No product data, routing behavior, page content, Three.js configurator, or product tables are changed.

## Verification

1. On a desktop viewport, the logo is visibly larger and the header stays aligned.
2. Each primary link shows the animated underline; contrast is maintained on dark and light headers.
3. Hovering or tabbing to Products shows exactly nine product families.
4. Clicking each directory entry changes to its correct `#category=<slug>` page.
5. Clicking Products itself still navigates to `#products`.
6. At the mobile breakpoint, the normal hamburger navigation remains usable with no orphaned dropdown.
7. Run the project build and existing rendered UI checks after implementation.

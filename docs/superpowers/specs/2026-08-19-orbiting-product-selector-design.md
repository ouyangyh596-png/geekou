# Orbiting Product Selector Design

## Goal

Replace the homepage horizontal product-card rail with a focused product-family selector: a large rounded-rectangle visual at the centre, surrounded by selectable product-family nodes on an elliptical orbit.

## Composition

- Keep the existing `#products` section heading, translations, category data, media mappings and `#category=<slug>` routes.
- The centre stage is a 16:10 rounded rectangle displaying the selected family image, index, name, description, up to five current category model codes, and an `Explore products` call-to-action.
- The eight families appear as orbit nodes. The selected node is visually elevated and the adjacent nodes remain readable, while distant nodes fade slightly.
- Previous/next arrow buttons step through exactly one family. Any orbit node can also be clicked to select it.
- The stage image and call-to-action both link to the selected category page.

## Interaction and Motion

- Selection state is an index into the existing `categories` collection.
- A selection change advances the orbit along the shortest direction for direct node selection and one fixed step for arrow controls.
- Orbit motion uses `cubic-bezier(.22, 1, .36, 1)` with a 760ms transform transition.
- Centre media uses a soft opacity and scale transition; title, description, model chips and CTA use staggered opacity/translate/clip entry transitions with no layout jump.
- New content enters after the outgoing content begins leaving, avoiding competing text layers.
- Clicking an orbit node only selects it. Clicking the central image or CTA opens the selected `#category=` page.
- Keyboard users can focus nodes and arrow controls. Left/Right arrows select the prior/next family; Enter/Space selects a focused node; central CTA preserves normal link activation.

## Responsive Behavior

- Desktop keeps the visual orbit around the central stage in a maximum 1440px composition.
- At tablet widths the orbit contracts around the stage while every node remains a 44px minimum target.
- At 800px and below the orbit becomes a horizontal selector strip below the centre card. The active item stays prominent, and the controls retain 44px targets.
- At 320px no document-level horizontal overflow is permitted. The centre image retains its rounded crop and model chips wrap naturally.

## Accessibility and Motion Preferences

- Orbit nodes are semantic buttons with `aria-pressed`, descriptive `aria-label`s and visible keyboard focus.
- The selected central visual uses the existing family-specific alt text.
- `prefers-reduced-motion` disables orbit rotation, clipping, transforms and smooth scroll while maintaining instant, readable selection changes and working navigation.

## Verification

- Add structural tests for the selected-family state, orbit controls, accessible node buttons, category route links and model-code rendering.
- Add browser checks at 1440px and 320px for the central card, nodes/controls, selection switching, CTA navigation, keyboard selection, and no horizontal overflow.
- Check reduced-motion computed styles and run the existing validation suite and production build.

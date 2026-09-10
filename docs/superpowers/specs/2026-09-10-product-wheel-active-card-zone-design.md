# Product Wheel Active-Card Interaction Zone

## Goal

Limit desktop mouse-wheel product switching to the visible center product card. Scrolling over the large left and right areas of the product selector should continue normal page scrolling.

## Interaction design

The wheel listener remains part of the product selector component, but it is attached to the current `.stack-card-active` element rather than the full `.stack-selector` container. The active card therefore becomes the complete desktop wheel interaction zone shown by the user's red annotation.

The active element changes between an anchor and an article for the interactive Cybertruck card. A dedicated React ref will be assigned to both variants so the same listener lifecycle works without querying by tag name.

Wheel threshold, accumulated delta, transition throttling, boundary release behavior and the 650 ms shuffle animation remain unchanged. The browser prevents page scrolling only when the wheel decision selects another product. At the first or last product, outward scrolling continues moving the page.

## Preserved behavior

- Left and right preview cards remain visible and clickable.
- Keyboard navigation remains on the overall selector.
- Mobile horizontal swipe remains on the overall selector.
- The center card keeps its existing click-through behavior.
- The embedded Cybertruck controls remain interactive.
- Product imagery, card size, spacing and animation remain visually unchanged.

## Accessibility and responsive behavior

The selector retains its keyboard focus target and arrow-key behavior. No new focusable element or accessible label is introduced. The wheel listener is only effective for fine-pointer desktop devices; mobile swipe handling remains unchanged.

## Verification

- Add a source contract asserting the wheel listener is attached to the active-card ref and is not attached to the selector ref.
- Run the product-wheel unit tests and full release suite.
- In a desktop browser, verify scrolling over the active card changes the selected product.
- Verify scrolling in the left or right selector area changes page scroll position without changing the selected product.
- Verify both side preview cards still change the selected product when clicked.
- Verify mobile swipe and page-level horizontal overflow behavior remain unchanged.

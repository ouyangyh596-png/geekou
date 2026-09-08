# Series Table Scroll Behavior

## Problem

Selecting `View models` changes the category hash by adding or replacing the `series` parameter. The current hash-navigation policy treats every category hash change as a new detail route and scrolls the window to the top, even when the user remains inside the same category.

## Approved behavior

- When switching series inside the same category, preserve the current scroll position.
- Update the selected card and render the matching product table directly below the series grid.
- Keep the selected series in the URL so refreshes and shared links retain the selection.
- When navigating to a different category, continue scrolling to the top.
- When directly opening a category or series URL, continue starting at the top.
- Apply the same behavior on desktop and mobile.
- If a series has no matching product records, render no empty product table.

## Implementation

- Extend the centralized hash-navigation decision function with a `preserve` action for transitions where both hashes are category routes with the same decoded `category` value.
- Do not perform any scroll command for the `preserve` action.
- Leave category rendering and URL links intact; React will continue deriving the selected series and matching products from the hash.
- Add regression tests covering same-category series changes, different-category changes, direct series links and existing home-route restoration behavior.

## Verification

- Observe the new same-category navigation test fail before implementation and pass afterward.
- Run the complete release test and production build.
- In a local browser, scroll to the series grid, select multiple series and verify that the scroll position is retained while the table content changes.
- Repeat at a mobile viewport and check for overflow or console errors.

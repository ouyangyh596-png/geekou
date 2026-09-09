# Product Wheel Carousel Design

## Goal

Turn the homepage product showcase into a guided horizontal product browser controlled by vertical wheel input on desktop and swipe input on mobile.

## Desktop behaviour

- Pin the product showcase while the user traverses product families.
- Convert deliberate downward wheel input into the next product and upward wheel input into the previous product.
- Consume wheel input only while another product exists in that direction.
- At the first product, upward wheel input leaves the section normally. At the final product, downward wheel input leaves the section normally.
- Throttle input during the existing 650 ms shuffle transition so one wheel gesture changes only one product.
- Keep the side preview cards clickable.
- Remove the two circular previous/next arrow controls.

## Guidance

- Desktop shows an animated wheel cue explaining that scrolling selects products horizontally.
- Mobile shows an animated horizontal swipe cue.
- The appropriate cue disappears after the first successful wheel or swipe change and remains hidden for the current page session.
- With reduced-motion enabled, cues remain readable but do not animate.

## Mobile and accessibility

- Mobile vertical scrolling is never intercepted.
- Mobile retains the existing left/right swipe gesture.
- Keyboard left/right navigation remains available when the showcase is focused.
- Wheel interception applies only to fine-pointer desktop environments and only while the showcase is pinned and visible.

## Validation

Automated tests cover wheel direction, boundary release, transition throttling, removed arrow controls, responsive hints, reduced motion and retained swipe/keyboard behaviour. Browser checks verify the section pins, cards change in both directions, hints disappear after use and scrolling resumes at both boundaries.

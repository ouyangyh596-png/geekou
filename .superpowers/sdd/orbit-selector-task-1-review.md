# Orbit Selector Task 1 Review

Verdict: **PASS** — no spec-compliance or code-quality issues found.

## Spec

No issues.

- `src/main.jsx:163-184` uses the required `selectedIndex` state; derives selected category, media, and the first five model codes; and wraps previous/next selection.
- `src/main.jsx:183` provides the required labelled controls, selection-only family buttons with `aria-pressed`, a keyed semantic category anchor, mapped image/alt text, selected metadata, model list, and CTA.
- Category navigation is preserved: centre-stage activation resolves to the selected `#category=<slug>` route, while node selection leaves `#products` unchanged.
- Left/Right change the selected family and wrap; only those keys are prevented, so Enter is not intercepted by the selector handler.
- `scripts/test-home-media.mjs:37-59` covers the specified Task 1 structural contract. The Task 1 and scroll-navigation tests pass.

## Quality

No issues.

- The state is locally owned and derived data avoids duplicated category/media/model state.
- Event handlers are small, deterministic, and preserve semantic native-link navigation.
- The retained carousel CSS is intentionally outside Task 1 scope and is assigned to Task 2 by the binding plan; it is not a Task 1 defect.

## Verification

- `node scripts/test-home-media.mjs` — passed.
- `node scripts/test-scroll-navigation.mjs` — passed.
- Local browser checks — passed: previous/next and Left/Right selection, wrapping, selection-only node clicks, and centre-stage category hash navigation.

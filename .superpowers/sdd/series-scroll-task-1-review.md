# Task 1 Review: Same-category Series Scroll Policy

## Verdict

**Specification: PASS**

**Code quality: PASS WITH MINOR FINDING**

Finding counts: **Critical 0 / Important 0 / Minor 1**

## Findings

### Critical

None.

### Important

None.

### Minor

1. **`preserve` is handled only through the generic fallback in `applyNavigation`.** `src/main.jsx:266-271` sends every action other than `restore` or `top` through the anchor branch. A `preserve` action therefore performs `document.getElementById(undefined)?.scrollIntoView(...)`. This currently issues no scroll command and preserves position as required, but it makes the new action's behavior accidental, performs an unnecessary DOM lookup, and leaves the dispatcher less clear and more fragile if its fallback changes. An explicit `preserve` no-op branch would better express the action contract. This is a quality issue only; it does not violate the current behavior or Task 1's prescribed two-file scope.

## Specification assessment

- Same-category category-to-series and series-to-series transitions compare decoded, non-empty `category` values and return `{ type: 'preserve' }`.
- Different-category navigation and direct entry with an empty previous hash return `{ type: 'top' }`.
- Existing home restoration and home-anchor branches precede the new comparison and remain unchanged.
- The selected card and product filtering continue to derive from `URLSearchParams(window.location.hash)` in `src/main.jsx`; Task 1 does not introduce component state for selection.
- Empty product tables remain suppressed by `items.length > 0 && <ProductTable ... />`.
- Desktop and mobile share the same hash policy and rendering path; no viewport-specific behavior was introduced.
- The implementation matches the brief's requirement to parse hashes beginning with `#category=` via `URLSearchParams` and require equal, non-empty category values.

## Code quality assessment

- The policy change is small, centralized, and does not alter unrelated route, rendering, or scroll-restoration logic.
- Tests directly cover the two required preserve cases and both required top cases.
- The helper name and branch placement are clear. The only quality concern is the implicit dispatcher handling described above.
- The reviewed commit changes only `scripts/test-scroll-navigation.mjs` and `src/scroll-navigation.js`, matching Task 1 scope.

## Verification evidence

- `pnpm test-scroll` with the bundled Node runtime — PASS; printed `Validated hash navigation decisions.`
- `pnpm test-release` with the bundled Node runtime — PASS, including scroll and empty-table regression checks.
- `pnpm build` with the bundled Node runtime — PASS; the reported large-chunk warning is pre-existing and unrelated.
- `git diff --check 0866281..cb9d704 -- scripts/test-scroll-navigation.mjs src/scroll-navigation.js` — PASS.

## Conclusion

Task 1 is specification-compliant. The implementation is suitable to proceed, with one non-blocking cleanup opportunity in the navigation dispatcher.

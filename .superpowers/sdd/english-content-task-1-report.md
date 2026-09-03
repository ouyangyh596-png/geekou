# Centralized English Content — Task 1 Report

## Status

DONE_WITH_CONCERNS

## Files changed

- `src/content/site-content.js` — added the documented `englishSiteContent` editing contract with all eight required sections, current category records, and purpose-based main-site labels.
- `scripts/test-site-content.mjs` — added the required Node assertion contract test.
- `package.json` — added `test-content` and chained it after the existing validator in `validate:content`.
- `.superpowers/sdd/english-content-task-1-report.md` — this required execution report (written after the implementation commit so it can contain the final commit hash; intentionally not included in that commit).

## TDD evidence

### RED

The specified command was attempted first:

```text
pnpm exec node scripts/test-site-content.mjs
```

It exited 1 before Node started because this shell did not have `node` on `PATH`: `Command "node" not found`. The bundled Node executable was then used directly to obtain valid RED evidence:

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-site-content.mjs
```

Result: exit 1 with `ERR_MODULE_NOT_FOUND` for `src/content/site-content.js`, the expected missing-feature failure.

### GREEN

After adding the minimal contract implementation:

```text
pnpm test-content
```

Result: exit 0 and `English site content tests passed`.

## Test commands and output summary

- `pnpm test-content` — PASS, exit 0; printed `English site content tests passed`.
- `pnpm validate:content` — FAIL in the pre-existing `scripts/validate-content.mjs` assertion before the newly chained content test runs. The committed validator expects the car-wrap group `Classic Colours`; the committed catalog currently returns `Super Chrome Film Classic Colours` for 14 AF models.
- `node --check src/content/site-content.js` — PASS, exit 0.
- `node --check scripts/test-site-content.mjs` — PASS, exit 0.
- `git diff --check` / `git diff --cached --check` — PASS, exit 0.

Commands using pnpm were run with the Codex bundled Node and pnpm directories on `PATH` because the default task shell exposes pnpm but not node.

## Self-review

- Confirmed the exact required top-level export and section names.
- Confirmed all five navigation values and all eight current category slugs are present.
- Preserved current English wording and represented category series as `{ name, description }` records.
- Kept media paths, routes, product codes, technical specifications, non-English data, styling, and behavior outside this change.
- Aligned product label keys with the existing English translation contract (`start`, `specs`, `view`, and `request`) for the next migration task.
- Confirmed only the three Task 1 implementation files were staged and committed; existing untracked task briefs were left untouched.

## Commit

`6e3492efc3b1d8fcc530818a8ae983cdb9e271c4` (`feat: add centralized English site content`)

## Concerns

- The required aggregate `pnpm validate:content` command is not green due to the pre-existing `Classic Colours` versus `Super Chrome Film Classic Colours` mismatch described above. Fixing that validator/catalog discrepancy is outside Task 1's authorized file scope.
- The default shell lacks a discoverable Node executable, so the documented pnpm test commands require the bundled Node directory on `PATH` in this environment.

## Fix Report

### Changes

- Added every user-facing English string from `src/components/PPFScrollSequence.jsx` to `englishSiteContent.home.ppfSequence`, splitting dynamic accessibility wording into string fragments so frame numbers and sequence length remain outside the content contract.
- Strengthened `scripts/test-site-content.mjs` with exact PPF wording checks, exact top-level sections, recursive non-empty string validation, supported array-shape validation, and representative route/media/runtime-data boundary guards.
- Updated only the 14 stale `Classic Colours` expectations in `scripts/validate-content.mjs` to the canonical `Super Chrome Film Classic Colours`; catalog grouping data was not changed.

### TDD and verification

- RED: `PATH="/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm test-content` — exit 1 because `englishSiteContent.home.ppfSequence` was missing.
- RED: `PATH="/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm validate:content` — exit 1 on the stale `Classic Colours` expected group.
- GREEN: `PATH="/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm test-content` — exit 0; printed `English site content tests passed`.
- GREEN: `PATH="/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm validate:content` — exit 0; validated 82 brochure-backed products and printed `English site content tests passed`.
- `git diff --check` — exit 0.

### Self-review

- Confirmed `src/components/PPFScrollSequence.jsx` was not changed, preserving frame numbers, paths, timing, dimensions, and behavior.
- Confirmed `src/catalog.js` and `src/brochure-data.js` were not changed, preserving catalog grouping.
- Confirmed the implementation diff contains only the three requested code/test files.

### Commit

`6c964cdf6b104ef51e346a1d81df00ec3891c9a7` (`fix: complete English content contract`)

### Concerns

None.

# Task 2 Report: Connect Data Modules to Centralized Copy

## Status

Completed and committed.

## Files

- `src/language.js`
  - Imports `englishSiteContent`.
  - Builds the English `copy.en` record from centralized navigation and product copy.
  - Preserves the existing English compatibility fields and sources their presentation values from centralized company, technology, and contact copy.
  - Leaves all non-English records unchanged.
- `src/content/company.js`
  - Sources `companyProfile` from `englishSiteContent.company`.
  - Builds the existing numbered tuple shape for `capabilities` from `englishSiteContent.technology.capabilities`.
  - Leaves `contactDetails`, including addresses, phone numbers, fax, and email, unchanged.
- `src/brochure-data.js`
  - Builds `brochureSeries` presentation records from `englishSiteContent.categories`.
  - Preserves category insertion order and the public tuple shape/order of each series.
- `scripts/test-site-content.mjs`
  - Adds the four required centralized-equivalence assertions.
  - Adds a focused assertion that each migrated data module imports `englishSiteContent`, ensuring the test detects duplicated rather than centralized copy.

## RED Evidence

Command (with bundled Node explicitly on `PATH`):

```bash
PATH=/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test-content && pnpm test-language
```

Result: exit 1 in `pnpm test-content`, as expected. The assertion reported:

```text
AssertionError [ERR_ASSERTION]: ../src/language.js must import centralized English copy
```

Before that valid RED run, the same command without the bundled Node path did not execute tests because `node` was absent from the shell `PATH`; this was an environment setup failure, not counted as RED evidence.

## GREEN Evidence

Command:

```bash
PATH=/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test-content && PATH=/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test-language && PATH=/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm validate:content
```

Result: exit 0.

```text
English site content tests passed
Validated 12 language options and 17 component keys.
Validated 82 brochure-backed products.
English site content tests passed
```

## Self-review

- `git diff --check` exited 0 before commit.
- Public exports `copy`, `companyProfile`, `capabilities`, `contactDetails`, and `brochureSeries` remain available.
- No non-English records were edited.
- Contact details and product/media/specification data were not changed.
- Generated capability numbering and brochure tuple structures preserve existing consumer interfaces and ordering.
- Only the four files specified by the brief were staged in the implementation commit; unrelated pre-existing workspace changes were left untouched.

## Commit

`0cc9ffde3ff92ab67fcbd0c183b8cdf30381d4c1` — `refactor: source English data from content module`

## Concerns

- The shell did not initially expose bundled Node on `PATH`, so the successful RED/GREEN commands explicitly prepended the bundled runtime paths.
- The commit used Git's automatically configured local committer identity (`欧梨蟹 <geekou@Mac-mini.local>`); Git emitted an informational identity warning.
- This report was written after the implementation commit so it can contain the final commit hash; it is intentionally not part of that commit.

# Task 1: Build the Curated Media Pipeline

Read the global constraints and Task 1 from `docs/superpowers/plans/2026-08-18-high-resolution-visual-refresh-implementation.md`. Implement only Task 1.

Create `scripts/prepare-site-media.sh`, `src/media-manifest.js`, `scripts/test-media-manifest.mjs`, and optimized files under `public/media/home/` and `public/media/families/`.

The manifest must export `homeMedia` and `familyMedia`; all eight catalogue category slugs must map to a real image path and English alt text. Use only source files under `/Users/geekou/Desktop/设计`, but every production image must be copied into the project. Prefer original photos, no brochure spread screenshots. Use TDD, run the new test, and do not edit page components yet.

Write your full report to `.superpowers/sdd/task-1-report.md`, including changed files, source-to-destination mapping, exact test commands/results, and concerns. Return only DONE, a one-line summary, and concerns.

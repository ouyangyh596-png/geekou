# Webpage English Copy Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved English Word copy, add SF9000 Series, and add a navigable Decorative Film category without introducing Chinese document notes.

**Architecture:** Keep English editorial content in `englishSiteContent`, derive brochure series from it, and extend the existing catalog and media maps for new routable entities. Reuse the current category/detail templates and an existing suitable decorative-material image rather than adding a new presentation system.

**Tech Stack:** React, Vite, JavaScript ES modules, Node assertion tests, existing hash routing.

## Global Constraints

- Use only English copy from `Webpage.docx`; do not publish Chinese notes or labels.
- Preserve supplied English wording, spelling, punctuation and placeholders exactly.
- Keep the established visual framework and centralized content architecture.
- Do not invent specifications or model codes absent from the English source.

---

### Task 1: English copy and new series

**Files:**
- Modify: `scripts/test-site-content.mjs`
- Modify: `src/content/site-content.js`

**Interfaces:**
- Consumes: `englishSiteContent.categories: Record<string, CategoryCopy>`.
- Produces: corrected existing category copy plus `translucent-film.series` entries named `SF6000 Series` and `SF9000 Series`.

- [ ] **Step 1: Write the failing content assertions**

Add exact assertions for the approved Mono/Poly/Cast/PET, self-adhesive, translucent, PPF, overlaminate, cold-lamination and wall-decals English strings. Assert that SF9000 exists with: `Perforated translucent film with 20% perforation ratio, dual-color visual effect for day & night: different color appears under natural daylight and one color visible when backlit at night.`

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `pnpm test-content`

Expected: FAIL on the first old description or missing SF9000 entry.

- [ ] **Step 3: Apply the exact Word copy**

Replace only matching string values in `englishSiteContent.categories`; append `{ name: 'SF9000 Series', description: '…' }` to the translucent series list.

- [ ] **Step 4: Verify the focused test passes**

Run: `pnpm test-content`

Expected: `English site content tests passed`.

- [ ] **Step 5: Commit the content update**

Run: `git add scripts/test-site-content.mjs src/content/site-content.js && git commit -m "copy: apply approved product wording"`

### Task 2: Decorative Film category and navigation

**Files:**
- Modify: `scripts/test-site-content.mjs`
- Modify: `scripts/test-category-media.mjs`
- Modify: `src/content/site-content.js`
- Modify: `src/catalog.js`
- Modify: `src/media-manifest.js`

**Interfaces:**
- Consumes: automatic category derivation from `englishSiteContent.categories`.
- Produces: category slug `decorative-film`, one series named `Decorative Film`, shared family media, and no fabricated product record.

- [ ] **Step 1: Write failing route/data/media assertions**

Assert that `decorative-film` exists in English content, brochure data, catalog family metadata and `familyMedia`. Assert its introduction equals: `High-performance self-adhesive vinyl designed for interior renovation, furniture upgrading, commercial space decoration and marine interior apaoplications.`

- [ ] **Step 2: Run focused tests and verify the expected failures**

Run: `pnpm test-content && pnpm test-category-media`

Expected: FAIL because `decorative-film` is absent.

- [ ] **Step 3: Add the minimal category data**

Add `decorative-film` to centralized content, catalog image/title/description maps and the media manifest. Reuse the existing interior wall-decals family image. Add no model/spec row because the English source provides none.

- [ ] **Step 4: Verify the focused tests pass**

Run: `pnpm test-content && pnpm test-category-media`

Expected: both commands exit 0.

- [ ] **Step 5: Commit the category update**

Run: `git add scripts/test-site-content.mjs scripts/test-category-media.mjs src/content/site-content.js src/catalog.js src/media-manifest.js && git commit -m "feat: add decorative film category"`

### Task 3: Browser and release verification

**Files:**
- Verify: `src/content/site-content.js`
- Verify: `src/catalog.js`
- Verify: `src/media-manifest.js`

**Interfaces:**
- Consumes: built Vite site and hash routes.
- Produces: evidence that all affected pages render and navigate correctly.

- [ ] **Step 1: Scan edited source for Chinese text introduced by this change**

Run: `git diff HEAD~2 -- src/content/site-content.js src/catalog.js src/media-manifest.js | rg '[一-龥]'`

Expected: no added Chinese content.

- [ ] **Step 2: Run complete automated verification**

Run: `pnpm test-release && pnpm build && git diff --check`

Expected: all commands exit 0.

- [ ] **Step 3: Verify affected pages in the local browser**

Open the product library, `#category=translucent-film&series=SF9000%20Series`, and `#category=decorative-film`. Confirm headings, exact paragraphs, family navigation, media rendering and desktop/mobile wrapping.

- [ ] **Step 4: Commit any verification-driven correction**

If browser verification requires a correction, add only the affected files and commit with `fix: correct product copy presentation`; otherwise make no extra commit.

- [ ] **Step 5: Push the verified commits**

Run: `git push origin main`

Expected: remote `main` advances to the verified local commit.


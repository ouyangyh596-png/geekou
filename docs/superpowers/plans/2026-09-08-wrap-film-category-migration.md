# Wrap Film Category Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Car Wrap Film and Overlaminate Film with Cast Wrap Vinyl, Polymeric Wrap Vinyl, Super Chrome Film, and PVC-Free Film while retaining all 82 models.

**Architecture:** Change the content-backed category source first, then migrate each catalogue product to a new slug without changing its model-specific specifications. Existing category consumers (`brochureSeries`, header directory, homepage cards, and detail pages) will update from their shared data source; media and Cybertruck selection receive only targeted slug updates.

**Tech Stack:** React, Vite, JavaScript content modules, Node assertion scripts.

## Global Constraints

- Exactly 82 unique models remain.
- Final top-level category count is 11.
- No active data/UI references remain for `car-wrapping` or `overlaminate`.
- Cast and polymeric overlaminate models move to their matching wrap-vinyl family while retaining their series labels and specifications.
- Super Chrome Film owns the Cybertruck colour study and 14 classic-colour models.
- PVC-Free Film owns AF1831 and AF1840.

---

### Task 1: Write the migration contract

**Files:** Modify `scripts/validate-content.mjs`; modify `scripts/test-site-content.mjs`.

- [ ] Replace expected category keys with the eleven final slugs and write the expected model-to-family mapping for all 29 migrated products.
- [ ] Require 11 display names in the new ordering, absence of old category keys, and preservation of the 82-model total.
- [ ] Run `pnpm validate:content` and `pnpm test-content`; confirm they fail before production data changes.

### Task 2: Migrate content and catalogue ownership

**Files:** Modify `src/content/site-content.js`; modify `src/catalog.js`.

- [ ] Replace the two old category content records with four new records, keeping all source series labels.
- [ ] Add category titles, descriptions, and reusable product helpers for the four new slugs.
- [ ] Reassign 6+5 cast models, 2+2 polymeric models, 14 classic-colour models, and 2 PVC-free models to the specified categories.
- [ ] Run `pnpm validate:content` and `pnpm test-content`; confirm the migration contract passes.

### Task 3: Synchronize visual consumers and interactive ownership

**Files:** Modify `src/media-manifest.js`; modify `src/main.jsx`; modify focused tests in `scripts/test-home-media.mjs`, `scripts/test-media-manifest.mjs`, and `scripts/test-site-polish.mjs` only where old category expectations exist.

- [ ] Map each new family to local representative media, reusing existing car-wrap/overlaminate assets where accurate.
- [ ] Change the landing action and `isClassicColours` ownership from `car-wrapping` to `super-chrome-film`.
- [ ] Update media and UI regression assertions to require eleven categories and no deleted category routes.
- [ ] Run `pnpm test-home-media`, `pnpm test-category-media`, `pnpm test-polish`, and `pnpm test-cybertruck`.

### Task 4: Build and route verification

**Files:** Verify only modified files.

- [ ] Run `pnpm test-release`, `pnpm test-header-directory`, and `pnpm build`.
- [ ] In the local browser, verify the Products dropdown has 11 families, Cast Wrap Vinyl and Super Chrome Film load correct category routes, and Super Chrome Film renders the Cybertruck colour study.
- [ ] Confirm homepage cards enumerate the same 11 data-derived families and inspect the final diff for only the scoped migration.

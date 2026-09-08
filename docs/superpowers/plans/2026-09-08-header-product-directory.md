# Header Product Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a larger header logo, animated primary-navigation underlines, and a desktop product-family dropdown containing exactly nine direct category links.

**Architecture:** Keep product-directory data derived from the existing `categories` array in `src/main.jsx`, so the header cannot drift from the actual product families. Add a focused header navigation component and scoped CSS for desktop hover/focus behavior; retain the existing mobile menu as the touch-safe fallback.

**Tech Stack:** React, Vite, CSS, Node assertion scripts, Playwright-based rendered UI checks.

## Global Constraints

- Products directory contains exactly the nine `brochureSeries` product families and no SKU/model entries.
- Each directory item uses the existing `#category=<slug>` route.
- Products label retains its existing `#products` destination.
- The underline is white on landing headers and blue on light headers.
- Do not change product content, routing logic, product tables, or Three.js behavior.
- Do not modify existing user-owned changes under `.superpowers/` or `scripts/test-rendered-ui.mjs`.

---

### Task 1: Header directory regression coverage

**Files:** Create `scripts/test-header-product-directory.mjs`; modify `package.json`.

**Interfaces:** The test reads `src/main.jsx` and `src/styles.css`; it provides `pnpm test-header-directory`.

- [ ] Write a failing `node:assert/strict` test that requires a `ProductDirectory` component, `categories.map`, a `#category=${category.slug}` route, desktop product-directory CSS hooks, and a mobile suppression rule.
- [ ] Add `test-header-directory` as `node scripts/test-header-product-directory.mjs` to package scripts.
- [ ] Run `/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm test-header-directory`; it must fail because the production component and CSS do not exist.
- [ ] Commit the red test with message `test: cover header product directory`.

### Task 2: Implement the data-driven header directory

**Files:** Modify `src/main.jsx:36-68`.

**Interfaces:** `ProductDirectory({ categories, label, onNavigate })` consumes the existing category array and Header navigation callback; it produces a Products trigger and direct product-family links.

- [ ] Add `ProductDirectory` before `Header`. Its outer class is `product-nav-item`; it keeps a `#products` Products anchor, then renders a semantic list from `categories.map(category => ...)`.
- [ ] Each category entry has `href={\`#category=${category.slug}\`}` and closes the mobile menu by calling the existing Header navigation callback.
- [ ] Give Technology, Company, and Contact the shared `nav-link` class. Keep Products’ existing `#products` click handler.
- [ ] Run the new test and confirm it progresses past component/route assertions before CSS is added.

### Task 3: Add responsive header motion and directory styles

**Files:** Modify `src/styles.css` near existing header/logo/mobile header rules.

**Interfaces:** CSS consumes `.product-nav-item`, `.product-directory`, and `.nav-link`; it provides desktop dropdown behavior and preserved mobile navigation.

- [ ] Enlarge only the desktop logo and preserve the current mobile logo dimensions.
- [ ] Add a scale-based `::after` underline to `.nav-link`; make it white on `.landing .header` and blue on light headers. Trigger it on hover and focus-visible.
- [ ] Position `.product-directory` below Products. Show it through `.product-nav-item:hover` and `.product-nav-item:focus-within`; render its nine links as a compact directory grid with keyboard focus styles.
- [ ] At `max-width: 800px`, hide `.product-directory` and retain the normal open hamburger navigation.
- [ ] Run `pnpm test-header-directory` and `pnpm test-scroll`; both must pass.
- [ ] Commit Task 2–3 changes with message `feat: add header product directory`.

### Task 4: Build and interaction verification

**Files:** Verify only `src/main.jsx`, `src/styles.css`, and `scripts/test-header-product-directory.mjs`.

- [ ] Run `pnpm test-header-directory`, `pnpm test-scroll`, and `pnpm build` using the bundled pnpm executable; all must exit 0.
- [ ] At desktop width: hover and tab to Products, count nine product families, and select an entry to verify its category hash route.
- [ ] At mobile width: open the hamburger menu and verify Products remains usable without a desktop dropdown overlay.
- [ ] Inspect the final diff to ensure it contains only this header feature and its regression coverage.

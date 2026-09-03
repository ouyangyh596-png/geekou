# Product Card Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage product rail with an accessible, responsive horizontal card carousel for eight SO-FINE product families.

**Architecture:** `ProductShowcase` owns the scroll viewport, navigation buttons and pointer/keyboard state. Category data and images continue to come from `categories` and `familyMedia`; CSS supplies native scroll snap, card sizing, entry reveals and responsive presentation without third-party libraries.

**Tech Stack:** React, Vite, JavaScript, CSS, Playwright test script.

## Global Constraints

- Keep all category anchors, category image alt text, product data, translations, scroll restoration, and existing `#products` section.
- Use native horizontal scroll and CSS snap; no autoplay or additional dependency.
- Prevent navigation only after pointer movement exceeds 8px; taps/clicks retain category navigation.
- Desktop shows 2.35 cards; mobile shows one card plus part of the next; 320px has no page overflow.
- Buttons must have 44px hit areas and descriptive aria-labels; reduced motion has no transition, transform, clip, or smooth scrolling.

---

### Task 1: Build Card Carousel Markup and Interaction

**Files:**
- Modify: `src/main.jsx`
- Modify: `scripts/test-home-media.mjs`

**Interfaces:**
- Consumes: `categories`, `familyMedia`, `ArrowUpRight`.
- Produces: `ProductShowcase` carousel controls and `.product-carousel-card` anchors.

- [ ] **Step 1: Write failing structural assertions**

Require `product-carousel-viewport`, `product-carousel-track`, `product-carousel-card`, previous/next buttons with aria-labels, `onPointerDown`, `onPointerMove`, `onPointerUp`, and `onKeyDown`. Require every card href to remain `#category=` and every image to continue using `familyMedia[category.slug]` alt and preview.

- [ ] **Step 2: Run the focused test**

Run: `node scripts/test-home-media.mjs`

Expected: FAIL because carousel markup is absent.

- [ ] **Step 3: Implement interaction state**

Use `useRef` for viewport and pointer origin. Add `scrollByCard(direction)` that reads the first card width plus CSS gap and calls `viewport.scrollBy({ left: direction * step, behavior: reducedMotion ? 'auto' : 'smooth' })`. Track pointer movement; `onClickCapture` calls `preventDefault()` only after movement exceeds 8px. `onKeyDown` maps ArrowLeft/ArrowRight to `scrollByCard` and preserves Enter navigation.

- [ ] **Step 4: Render cards and controls**

Render two button controls with labels `Previous product family` and `Next product family`, a focusable viewport, and semantic category-card anchors containing index, image, name, description and arrow.

- [ ] **Step 5: Verify structure**

Run: `node scripts/test-home-media.mjs && node scripts/test-scroll-navigation.mjs`

Expected: PASS.

### Task 2: Add Carousel Styling and Browser Verification

**Files:**
- Modify: `src/styles.css`
- Modify: `scripts/test-rendered-ui.mjs`

**Interfaces:**
- Consumes: carousel selectors from Task 1.
- Produces: snapped horizontal scroll, responsive card geometry, reduced-motion and rendered behavior checks.

- [ ] **Step 1: Write failing rendered tests**

At 1440px assert the viewport scroll width exceeds client width, first card width is near 40% of viewport, next button changes `scrollLeft`, ArrowRight changes `scrollLeft`, and dragging more than 8px does not change the URL. At 320px assert document width is no greater than viewport width and the card width leaves a visible next-card edge. Under reduced motion, assert cards are static and scroll behavior is auto.

- [ ] **Step 2: Run rendered test**

Run: `node scripts/test-rendered-ui.mjs`

Expected: FAIL because carousel selectors/styles do not exist.

- [ ] **Step 3: Implement CSS**

Style a clipped scroll viewport and flex track with `scroll-snap-type: x mandatory`, `scroll-behavior: smooth`, 24px desktop gap, `flex: 0 0 calc((100% - 48px) / 2.35)`, 16:10 image, fixed card dimensions, and 44px controls. At 800px set card basis to `calc(100% - 48px)` and hide controls only for coarse pointers. Add explicit reduced-motion overrides for track/cards/images and `scroll-behavior:auto`.

- [ ] **Step 4: Run complete verification**

Run: `pnpm run validate:content && pnpm run test-language && pnpm run test-scroll && pnpm run test-request-validation && pnpm run test-media && pnpm run test-home-media && pnpm run test-category-media && node scripts/test-rendered-ui.mjs && pnpm run build`

Expected: all commands exit 0.

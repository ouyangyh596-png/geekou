# Product Wheel Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make desktop wheel gestures select product families horizontally while providing responsive desktop/mobile guidance and removing arrow controls.

**Architecture:** A small pure navigation module decides whether a wheel gesture selects a neighbouring product or releases normal page scrolling at a boundary. `ProductShowcase` owns input throttling and hint dismissal, while CSS supplies the pinned visual state and responsive motion cues.

**Tech Stack:** React, browser wheel/touch events, CSS animations, Node assertion tests, Vite.

## Global Constraints

- Desktop wheel input changes one product per deliberate gesture.
- First/last boundaries release normal vertical scrolling.
- Mobile vertical scrolling is never intercepted and horizontal swipe remains enabled.
- Remove circular arrow controls while retaining side-card and keyboard navigation.
- Respect `prefers-reduced-motion`.

---

### Task 1: Wheel-selection state machine

**Files:**
- Create: `src/product-wheel-navigation.js`
- Create: `scripts/test-product-wheel-navigation.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `decideProductWheel({ index, count, deltaY, blocked })` returning `{ type: 'select', index }`, `{ type: 'release' }`, or `{ type: 'ignore' }`.

- [ ] Write tests for positive/negative direction, gesture threshold, blocked transition and both release boundaries.
- [ ] Run `node scripts/test-product-wheel-navigation.mjs` and verify the missing module fails.
- [ ] Implement `decideProductWheel` with a 24-pixel delta threshold and clamped neighbour selection.
- [ ] Add `test-product-wheel` to `package.json` and include it in `test-release`.
- [ ] Run the focused test and verify it passes.

### Task 2: ProductShowcase wheel and hint behaviour

**Files:**
- Modify: `src/main.jsx:193-247`
- Modify: `scripts/test-home-media.mjs`

**Interfaces:**
- Consumes: `decideProductWheel` and existing `selectOffset`.
- Produces: desktop wheel interception, session-only hint dismissal and responsive hint markup.

- [ ] Add source assertions for a non-passive wheel listener, boundary-aware decision call, wheel/swipe hint markup, first-use dismissal and absence of `stack-controls`.
- [ ] Run `pnpm test-home-media` and verify it fails against the existing controls.
- [ ] Add a showcase ref and non-passive desktop wheel listener active only when `matchMedia('(hover: hover) and (pointer: fine)')` matches and the selector occupies the viewport interaction zone.
- [ ] On `{ type: 'select' }`, prevent default, change one product, dismiss the hint and throttle until the 650 ms transition ends; on `release`, allow vertical scrolling.
- [ ] Dismiss the mobile hint after the first successful horizontal swipe.
- [ ] Render desktop wheel and mobile swipe cues and delete circular arrow-control markup.
- [ ] Run `pnpm test-home-media` and the wheel-navigation test.

### Task 3: Responsive styling and verification

**Files:**
- Modify: `src/styles.css`
- Modify: `src/polish.css`
- Modify: `scripts/test-site-polish.mjs`

**Interfaces:**
- Consumes: `.product-gesture-hint`, `.product-wheel-hint`, `.product-swipe-hint`, `.is-hidden`.
- Produces: centred animated cues, mobile/desktop visibility rules and reduced-motion fallback.

- [ ] Add CSS assertions for desktop/mobile visibility, cue animation, hidden state and reduced-motion override.
- [ ] Run `pnpm test-polish` and verify it fails.
- [ ] Style a restrained SO-FINE-blue wheel cue below the card and a finger/track swipe cue on mobile, without covering card links.
- [ ] Hide desktop cues below 800 px, show mobile cues there, and disable cue animation under reduced motion.
- [ ] Run `pnpm test-release`, `pnpm build`, and `git diff --check`.
- [ ] In a desktop browser, verify downward/upward selection, first/last release, hidden desktop hint after first use and removed arrows.
- [ ] In a mobile viewport, verify vertical scrolling, horizontal swipe selection and hidden swipe hint after use.

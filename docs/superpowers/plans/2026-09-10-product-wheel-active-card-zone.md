# Product Wheel Active-Card Interaction Zone Implementation Plan

> **Required sub-skills:** Use `using-git-worktrees`, `executing-plans`, `test-driven-development`, and `verification-before-completion` while carrying out this plan.

**Goal:** Limit desktop wheel-driven product switching to the center active product card while preserving normal page scrolling outside it and all existing click, keyboard, and touch interactions.

**Architecture:** Attach the non-passive wheel listener directly to a dedicated ref on the active card instead of the full stack selector. Keep the existing wheel-decision helper, delta accumulation, cooldown, boundary release, keyboard navigation, touch navigation, and side-card click handlers unchanged.

**Tech Stack:** React, Vite, Node.js assertion scripts, Playwright-backed in-app browser verification, Cloudflare Pages.

---

## Task 1: Scope desktop wheel navigation to the active card

**Files:**
- Modify: `scripts/test-product-wheel-navigation.mjs`
- Modify: `src/main.jsx`

### Step 1: Add a failing source-contract test

Extend `scripts/test-product-wheel-navigation.mjs` to read `src/main.jsx` and assert that:

- the active card has a dedicated React ref;
- both active-card render branches receive that ref;
- the wheel listener is added to and removed from the active-card element;
- the stack selector is no longer the wheel listener target.

### Step 2: Run the focused test and confirm it fails

Run: `pnpm test-product-wheel`

Expected: FAIL because the listener still targets the full stack selector.

### Step 3: Implement the smallest behavior change

In `src/main.jsx`:

- replace the selector wheel target with `activeCardRef.current`;
- assign `activeCardRef` to both the `<article>` and `<a>` active-card branches;
- remove the selector-wide geometry gate because the event target now defines the interaction area;
- retain fine-pointer detection, accumulated threshold, cooldown, and boundary behavior;
- rerun the effect when the active card switches between link and article element types;
- leave the selector keyboard and touch handlers and both side-card click handlers intact.

### Step 4: Run the focused test and confirm it passes

Run: `pnpm test-product-wheel`

Expected: PASS.

### Step 5: Run project verification

Run: `pnpm test-release`

Expected: all unit, rendered UI, asset, and production build checks pass.

### Step 6: Verify interaction behavior in a desktop browser

Serve the production build locally and verify at a desktop viewport:

- wheel input over the center active card changes the selected product;
- wheel input over the left or right outer selector area scrolls the page and does not change the selected product;
- clicking either side preview card still selects it;
- the center card and surrounding layout have no visual regression.

Also verify at a mobile viewport that the page does not overflow horizontally and touch navigation remains available.

### Step 7: Commit, integrate, and deploy

Commit the tested implementation on the feature branch, merge it into `main`, push `main`, wait for GitHub and Cloudflare checks to succeed, and verify the deployed site serves the updated behavior.


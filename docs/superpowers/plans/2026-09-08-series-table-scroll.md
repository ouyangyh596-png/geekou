# Series Table Scroll Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the user's current position while switching product series and update the corresponding table below the series cards.

**Architecture:** Extend the pure hash-navigation policy to distinguish same-category series changes from true route changes. The React category page continues deriving the selected series and table records from the URL; the application simply performs no scroll command for the new `preserve` action.

**Tech Stack:** React, Vite, JavaScript ES modules, Node assertion tests, hash routing.

## Global Constraints

- Same-category series selection preserves the current scroll position.
- The selected card and matching table continue updating from the URL hash.
- Different-category navigation and direct category/series entry continue starting at the top.
- Existing home scroll restoration remains unchanged.
- Empty series continue rendering no empty product table.
- Desktop and mobile behavior must match.

---

### Task 1: Same-category navigation policy

**Files:**
- Modify: `scripts/test-scroll-navigation.mjs`
- Modify: `src/scroll-navigation.js`

**Interfaces:**
- Consumes: `decideHashNavigation({ previousHash, nextHash, savedHomeScroll })`.
- Produces: `{ type: 'preserve' }` when both hashes resolve to the same non-empty `category` value.

- [ ] **Step 1: Add failing policy tests**

Add assertions that `#category=one-way-vision` → `#category=one-way-vision&series=Cast%20PVC` and one series → another return `{ type: 'preserve' }`. Add assertions that one category → another and an empty previous hash → a series URL still return `{ type: 'top' }`.

- [ ] **Step 2: Run the focused test and observe the intended failure**

Run: `pnpm test-scroll`

Expected: FAIL because same-category transitions currently return `{ type: 'top' }`.

- [ ] **Step 3: Implement the minimal route comparison**

Add a helper that parses hashes beginning with `#category=` using `URLSearchParams` and returns the decoded category. Before the existing default-top result, return `{ type: 'preserve' }` only when both parsed category values are equal and non-empty.

- [ ] **Step 4: Run focused and release tests**

Run: `pnpm test-scroll && pnpm test-release`

Expected: all assertions pass with no regressions.

- [ ] **Step 5: Commit the policy fix**

Run: `git add scripts/test-scroll-navigation.mjs src/scroll-navigation.js && git commit -m "fix: preserve position when switching product series"`

### Task 2: Browser interaction and release verification

**Files:**
- Verify: `src/main.jsx`
- Verify: `src/scroll-navigation.js`

**Interfaces:**
- Consumes: the `preserve` navigation action; existing `applyNavigation` performs no scroll for unhandled action types.
- Produces: verified desktop/mobile series switching without top jumps.

- [ ] **Step 1: Build the production site**

Run: `pnpm build`

Expected: Vite exits 0; the existing chunk-size warning may remain.

- [ ] **Step 2: Verify desktop interaction**

Open `#category=one-way-vision`, scroll to the series cards, select Cast PVC and then Polymeric PVC. Record `window.scrollY` before and after each click; it must remain unchanged while the selected card and product table rows update.

- [ ] **Step 3: Verify mobile interaction**

Repeat at 390 × 844. Confirm retained scroll position, correct table rows, no horizontal page overflow and no console errors.

- [ ] **Step 4: Verify direct navigation semantics**

Open a series URL in a fresh tab and confirm it starts at the top with the requested series selected. Navigate to a different category and confirm that page starts at the top.

- [ ] **Step 5: Run final checks and push**

Run: `pnpm test-release && pnpm build && git diff --check && git push origin main`

Expected: tests/build/check pass and remote `main` advances to the verified commit.

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

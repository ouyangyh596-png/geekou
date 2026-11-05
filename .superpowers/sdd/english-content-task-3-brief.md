### Task 3: Remove Inline English Marketing Copy from React

**Files:**
- Modify: `src/main.jsx`
- Test: `scripts/test-rendered-ui.mjs`
- Test: `scripts/test-site-content.mjs`

**Interfaces:**
- Consumes: `englishSiteContent.home`, `.technology`, `.contact`, `.products`, and `.cybertruck`
- Preserves: all existing component behavior and rendered wording

- [ ] **Step 1: Add source-usage regression assertions**

Extend `scripts/test-site-content.mjs` to read `src/main.jsx` and assert it imports `englishSiteContent` and no longer contains representative inline strings `SUPER CHROME FILM`, `Every layer is considered`, or `Preview the finish across a Cybertruck surface`.

- [ ] **Step 2: Run test and verify RED**

Run: `pnpm test-content`

Expected: FAIL because `src/main.jsx` still contains inline English copy.

- [ ] **Step 3: Replace inline copy with content references**

Import `englishSiteContent` and bind `const content = englishSiteContent`. Replace English marketing strings in `Home`, `ContactForm`, `MaterialStory`, `ProductShowcase`, `ProductTable`, `CategoryPage`, and product-detail presentation with the matching content values. Keep accessibility labels centralized when they are user-facing copy; leave purely internal status values such as `idle`, `sending`, and route fragments unchanged.

- [ ] **Step 4: Run integration checks and commit**

Run: `pnpm test-content && pnpm test-rendered-ui && pnpm build`

Expected: tests exit 0 and Vite reports `built` successfully.

Commit:

```bash
git add src/main.jsx scripts/test-site-content.mjs
git commit -m "refactor: render English pages from centralized copy"
```


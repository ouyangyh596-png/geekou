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


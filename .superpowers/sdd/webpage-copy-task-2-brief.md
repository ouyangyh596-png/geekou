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


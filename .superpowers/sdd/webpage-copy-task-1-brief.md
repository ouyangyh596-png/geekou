### Task 1: English copy and new series

**Files:**
- Modify: `scripts/test-site-content.mjs`
- Modify: `src/content/site-content.js`

**Interfaces:**
- Consumes: `englishSiteContent.categories: Record<string, CategoryCopy>`.
- Produces: corrected existing category copy plus `translucent-film.series` entries named `SF6000 Series` and `SF9000 Series`.

- [ ] **Step 1: Write the failing content assertions**

Add exact assertions for the approved Mono/Poly/Cast/PET, self-adhesive, translucent, PPF, overlaminate, cold-lamination and wall-decals English strings. Assert that SF9000 exists with: `Perforated translucent film with 20% perforation ratio, dual-color visual effect for day & night: different color appears under natural daylight and one color visible when backlit at night.`

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `pnpm test-content`

Expected: FAIL on the first old description or missing SF9000 entry.

- [ ] **Step 3: Apply the exact Word copy**

Replace only matching string values in `englishSiteContent.categories`; append `{ name: 'SF9000 Series', description: '…' }` to the translucent series list.

- [ ] **Step 4: Verify the focused test passes**

Run: `pnpm test-content`

Expected: `English site content tests passed`.

- [ ] **Step 5: Commit the content update**

Run: `git add scripts/test-site-content.mjs src/content/site-content.js && git commit -m "copy: apply approved product wording"`


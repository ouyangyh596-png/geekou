### Task 2: Connect Data Modules to Centralized Copy

**Files:**
- Modify: `src/language.js`
- Modify: `src/content/company.js`
- Modify: `src/brochure-data.js`
- Test: `scripts/test-language.mjs`
- Test: `scripts/test-site-content.mjs`

**Interfaces:**
- Consumes: `englishSiteContent`
- Preserves: `copy`, `companyProfile`, `capabilities`, `contactDetails`, and `brochureSeries` public exports

- [ ] **Step 1: Extend tests for unchanged public data**

Add assertions that `copy.en.products`, `companyProfile.title`, `capabilities[2][1]`, and `brochureSeries['car-wrapping'].displayName` equal their centralized equivalents.

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm test-content && pnpm test-language`

Expected: FAIL because the data modules do not yet import centralized copy.

- [ ] **Step 3: Wire existing exports to the centralized object**

Import `englishSiteContent` in each module. Assign `copy.en` from `englishSiteContent.navigation` plus `englishSiteContent.products`; assign company and capability presentation values from `englishSiteContent.company` and `.technology`; and build each `brochureSeries` presentation record from `englishSiteContent.categories[slug]`. Keep contact addresses, phone numbers, email, product IDs, series ordering, and all non-English records unchanged.

- [ ] **Step 4: Verify and commit**

Run: `pnpm test-content && pnpm test-language && pnpm validate:content`

Expected: all commands exit 0.

Commit:

```bash
git add src/language.js src/content/company.js src/brochure-data.js scripts/test-site-content.mjs
git commit -m "refactor: source English data from content module"
```


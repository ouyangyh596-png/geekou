# Centralize English Website Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the team one GitHub-editable file containing all English marketing copy used by the main site.

**Architecture:** `src/content/site-content.js` becomes the canonical English-copy module. Existing structural modules retain IDs, product codes, specifications, media, routing, and translations, while importing English labels and descriptions from the content module. A Node validation script checks the public editing contract before Vite builds the site.

**Tech Stack:** React, JavaScript ES modules, Node.js assertions, Vite, GitHub, Cloudflare Pages

## Global Constraints

- Only English main-site copy moves in this change.
- Styling, animations, media paths, Three.js parameters, product codes, and technical specification values remain outside the content file.
- Existing rendered English wording must remain unchanged after migration.
- Non-English language data must remain unaffected.
- Team members edit quoted values, not object keys or exports.

---

## File Structure

- Create `src/content/site-content.js`: documented single source of editable English copy.
- Create `scripts/test-site-content.mjs`: validates required content sections and representative entries.
- Modify `src/language.js`: source only the English translation record from centralized content.
- Modify `src/content/company.js`: source company, capability, and contact presentation copy from centralized content while retaining contact data.
- Modify `src/brochure-data.js`: source category display names, introductions, and series descriptions from centralized content.
- Modify `src/main.jsx`: replace remaining inline English marketing and interface copy with centralized values.
- Modify `package.json`: expose `test-content` and include it in `validate:content`.
- Create `docs/content-editing.md`: short GitHub editing and pull-request instructions for the team.

### Task 1: Establish and Validate the Editing Contract

**Files:**
- Create: `src/content/site-content.js`
- Create: `scripts/test-site-content.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `englishSiteContent: { navigation, home, technology, company, contact, categories, products, cybertruck }`
- Produces: `npm run test-content`

- [ ] **Step 1: Write the failing content-contract test**

Create `scripts/test-site-content.mjs` importing `englishSiteContent` and assert the required section names, non-empty navigation labels, the eight current category slugs, and representative product and Cybertruck strings:

```js
import assert from 'node:assert/strict'
import { englishSiteContent } from '../src/content/site-content.js'

const sections = ['navigation', 'home', 'technology', 'company', 'contact', 'categories', 'products', 'cybertruck']
for (const section of sections) assert.ok(englishSiteContent[section], `Missing ${section}`)
for (const key of ['products', 'technology', 'company', 'contact', 'talk']) {
  assert.equal(typeof englishSiteContent.navigation[key], 'string')
  assert.ok(englishSiteContent.navigation[key].trim())
}
for (const slug of ['one-way-vision', 'self-adhesive-vinyl', 'translucent-film', 'ppf', 'car-wrapping', 'overlaminate', 'cold-lamination', 'wall-decals']) {
  assert.ok(englishSiteContent.categories[slug], `Missing category copy: ${slug}`)
}
assert.ok(englishSiteContent.home.heroTitle)
assert.ok(englishSiteContent.products.productLibrary)
assert.ok(englishSiteContent.cybertruck.title)
console.log('English site content tests passed')
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm exec node scripts/test-site-content.mjs`

Expected: FAIL because `src/content/site-content.js` does not exist.

- [ ] **Step 3: Create the centralized English content module**

Create `src/content/site-content.js` with a Chinese editor warning followed by the complete `englishSiteContent` object. Preserve every current English string exactly and organize category records by slug and product presentation labels by purpose. Keep all values as plain strings or arrays of `{ name, description }` objects.

- [ ] **Step 4: Add the test command**

Add to `package.json`:

```json
"test-content": "node scripts/test-site-content.mjs"
```

Update `validate:content` so it runs the existing validation followed by `pnpm test-content`.

- [ ] **Step 5: Verify GREEN and commit**

Run: `pnpm test-content && pnpm validate:content`

Expected: both commands exit 0 and print `English site content tests passed`.

Commit:

```bash
git add src/content/site-content.js scripts/test-site-content.mjs package.json
git commit -m "feat: add centralized English site content"
```

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

### Task 4: Document and Visually Verify the Team Workflow

**Files:**
- Create: `docs/content-editing.md`
- Modify: `README.md` if it exists

**Interfaces:**
- Produces: a team-facing GitHub editing procedure for `src/content/site-content.js`

- [ ] **Step 1: Write the editing guide**

Document these exact actions: open `src/content/site-content.js` on GitHub, click the pencil icon, change only quoted English values, select “Create a new branch,” open a pull request, request review, merge to `main`, and wait for Cloudflare Pages deployment. Include recovery instructions using GitHub commit history and Revert.

- [ ] **Step 2: Link the guide from the README**

If `README.md` exists, add a short “Editing website copy” section linking to `docs/content-editing.md`. Do not add deployment secrets or tokens.

- [ ] **Step 3: Run the full verification suite**

Run:

```bash
pnpm test-content
pnpm test-language
pnpm test-rendered-ui
pnpm validate:content
pnpm build
git diff --check
```

Expected: every command exits 0; the only permitted build notice is Vite's existing large-chunk warning.

- [ ] **Step 4: Verify representative pages locally**

Open the local home page and the Car Wrap Film classic-colours category. Confirm the centralized hero title, technology copy, company text, contact heading, category copy, and Cybertruck labels render unchanged. Confirm the browser console contains no errors.

- [ ] **Step 5: Commit the guide**

```bash
git add docs/content-editing.md README.md
git commit -m "docs: add GitHub content editing workflow"
```

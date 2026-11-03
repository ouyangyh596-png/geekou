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


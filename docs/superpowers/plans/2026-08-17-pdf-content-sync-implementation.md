# SO-FINE PDF Content Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the website's company, product, specification, capability, and contact copy with accurate English content derived from `修改后小册子.pdf`.

**Architecture:** Store brochure-backed company and product content in focused data modules, then make the existing homepage, category pages, and detail pages consume those modules. Keep the current React/Vite presentation and inquiry backend intact while replacing obsolete taxonomy and scraped content. Add a Node validation script that checks model uniqueness, required fields, allowed families, and banned scraped-text fragments.

**Tech Stack:** React 19, Vite 8, JavaScript ES modules, Node.js built-in assertions, existing CSS and SQLite inquiry API.

## Global Constraints

- The brochure is the authoritative source for company facts, product families, model specifications, and contact details.
- Correct obvious export artifacts and English spelling without changing technical meaning.
- Exclude page furniture, repeated footer slogans, duplicated Illustrator text, and `XX` placeholders.
- Do not invent missing technical specifications.
- Preserve the blue-white visual system, navigation, responsive layout, scroll animation, product cards, inquiry form, and internal database.
- Keep all created and modified files inside `/Users/geekou/Documents/公司网站`.
- The directory is not currently a Git repository, so task checkpoints use validation commands instead of commits.

---

### Task 1: Create the brochure-backed content model

**Files:**
- Create: `src/content/company.js`
- Replace: `src/catalog.js`
- Replace: `src/brochure-data.js`
- Create: `scripts/validate-content.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `companyProfile`, `capabilities`, and `contactDetails` from `src/content/company.js`.
- Produces: `catalogProducts: Product[]` from `src/catalog.js`.
- Produces: `brochureSeries: Record<string, SeriesInfo>` from `src/brochure-data.js`.
- `Product` has `{ family, category, group, model, title, description, image, gallery, specs, slug }`.
- `specs` is an array of `[label: string, value: string]` and contains only populated rows.

- [ ] **Step 1: Add the content validation script and npm command**

Create `scripts/validate-content.mjs` with assertions for the exact eight category slugs, duplicate model codes, empty specifications, and contaminated scraped copy:

```js
import assert from 'node:assert/strict'
import { catalogProducts } from '../src/catalog.js'
import { brochureSeries } from '../src/brochure-data.js'

const expectedCategories = [
  'one-way-vision', 'self-adhesive-vinyl', 'translucent-film', 'ppf',
  'car-wrapping', 'overlaminate', 'cold-lamination', 'wall-decals'
]
assert.deepEqual(Object.keys(brochureSeries), expectedCategories)

const models = catalogProducts.map(product => product.model)
assert.equal(new Set(models).size, models.length, 'Every model must be unique')
for (const product of catalogProducts) {
  assert.ok(expectedCategories.includes(product.category), `${product.model}: invalid category`)
  assert.ok(product.model && product.title && product.description && product.slug)
  assert.ok(product.specs.length > 0, `${product.model}: missing specifications`)
  assert.ok(product.specs.every(([label, value]) => label && value), `${product.model}: empty specification`)
  assert.doesNotMatch(product.description, /Wholesale Factory|Site Map|--Language--|18px|admin@/i)
}
console.log(`Validated ${catalogProducts.length} brochure-backed products.`)
```

Add `"validate:content": "node scripts/validate-content.mjs"` to `package.json` scripts.

- [ ] **Step 2: Run validation and confirm it fails against the existing scraped catalogue**

Run:

```bash
pnpm run validate:content
```

Expected: failure because current products do not expose the new category schema and contain scraped boilerplate.

- [ ] **Step 3: Add centralized company and contact content**

Create `src/content/company.js` exporting:

```js
export const companyProfile = {
  eyebrow: 'SO-FINE / ESTABLISHED 2005',
  title: '20 years of industrial expertise.',
  paragraphs: [
    'Established in 2005, SO-FINE has grown into an integrated group specializing in self-adhesive material handling, manufacturing, scientific research, sales and services.',
    'Our modern production facilities, well-equipped R&D laboratory and quality-control system combine carefully selected domestic and imported raw materials with deep adhesive and coating expertise.',
    'Recognized as an Innovative Technology Enterprise, our teams remain committed to consistent quality and responsive service for signage and automotive-detailing applications.'
  ]
}

export const capabilities = [
  ['01', 'Established in 2005', 'Two decades of focused experience in self-adhesive materials.'],
  ['02', 'R&D and quality control', 'Dedicated laboratory testing and controlled production standards.'],
  ['03', 'Integrated manufacturing', 'Material handling, coating expertise, manufacturing, sales and service.'],
  ['04', 'Application expertise', 'Solutions for digital printing, signage and automotive detailing.']
]

export const contactDetails = {
  factoryName: 'ZHEJIANG SO-FINE SELF-ADHESIVE PRODUCTS CO., LTD.',
  factoryAddress: 'No. 99 Wufu Road, Tianzihu Modern Industrial Park, Anji County, Zhejiang, China',
  salesName: 'NINGBO SO-FINE IMPORT AND EXPORT CO., LTD.',
  salesAddress: 'Block 66, No. 31 West Hongtang Road, Hongtang Town, Jiangbei District, Ningbo, Zhejiang, P.R. China 315033',
  phones: ['+86-574-8716-7701', '+86-574-8716-7702'],
  fax: '+86-574-8716-7703',
  email: 'admin@so-fine.com.cn'
}
```

- [ ] **Step 4: Replace product taxonomy and model data**

Create the eight exact families and include these brochure model sets:

```js
const brochureModelSets = {
  'one-way-vision': [
    'SF1413','SF1414','SF1912','SF1913','SF1914','SF1132','SF1133','SF1134','SF1974',
    'SF1963','SF1964','SF1865','SF1994','SF1892','SF1893','SF1894','SF1503','SF1513','SF1563'
  ],
  'self-adhesive-vinyl': [
    'SF2410','SF2413','SF2610','SF2611','SF2612','SF2616','SF2619','SF2622','SF2690','SF2643','SF2930',
    'SF21602','SF21802','SF21102','SF29160','SF2900','SF2901','SF2800','SF2832'
  ],
  'translucent-film': ['SF6000'],
  ppf: ['AF1810','AF1850'],
  'car-wrapping': [
    'SF5501','SF5511','SF5503','SF5513','SF9908','AF50100G','SF5505','SF5525','AF1831','AF1840',
    'AF-50202M','AF-50403M','AF-50880M','AF-50720M','AF-50800M','AF-50810M','AF-50280M',
    'AF-50700M','AF-50521M','AF-50100M','AF-50601M','AF-50701M','AF-50405M','AF-50850M'
  ],
  overlaminate: ['SF5601','SF5602','SF5603','SF5606','SF5609','SF5604','SF5607'],
  'cold-lamination': ['SF3180','SF3181','SF3182','SF3300','SF3301','SF3200','SF3400','SF3401'],
  'wall-decals': ['SF4001','SF4002']
}
```

For each model, transcribe the brochure table values into `specs`. Use these normalized labels: `Material`, `Thickness`, `Finish`, `Adhesive`, `Liner`, `Perforation ratio`, `Hole size`, `Weight`, `Print compatibility`, `Color`, and `Application`. Use `SOL / ESOL / UV / Latex` only where all four checkmarks appear; otherwise list only the checked methods shown in the brochure.

Use existing `/public/products/<model>-*.jpg` assets only when the lowercase filename matches the model. Otherwise assign a matching local family fallback selected from an existing model in the same family. Do not use remote stock-photo URLs.

- [ ] **Step 5: Replace series copy with the brochure's eight-family structure**

`brochureSeries` must expose these group headings:

```js
{
  'one-way-vision': ['Monomeric PVC','Polymeric PVC','Cast PVC','Perforated PET'],
  'self-adhesive-vinyl': ['Monomeric PVC','Polymeric PVC','Super Transparent PVC Vinyl','Super Glossy PVC Vinyl'],
  'translucent-film': ['SF6000 Series'],
  ppf: ['High-Clarity TPU Protection','Super Chrome Film Satin'],
  'car-wrapping': ['Cast PVC Wrap Film','Polymeric PVC Wrap Film','PVC-Free Film','Classic Colours'],
  overlaminate: ['Cast PVC Overlaminate Film','Polymeric PVC Overlaminate Film'],
  'cold-lamination': ['Monomeric PVC','Polymeric PVC','PET','Floor Lamination PVC'],
  'wall-decals': ['PVC-Coated Polyester Fabric','100% Polyester']
}
```

Use brochure-derived family introductions and corrected professional English. Do not mention SPC/LVT, carbon fibre, 60+ countries, or unsupported monthly output.

- [ ] **Step 6: Run content validation**

Run `pnpm run validate:content`.

Expected: `Validated 82 brochure-backed products.` when every listed model and classic colour is represented individually. AF1810 and AF1850 remain separate model entries even if they share one PPF family visual.

---

### Task 2: Connect homepage, category, and detail pages to the new data

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `catalogProducts`, `brochureSeries`, `companyProfile`, `capabilities`, `contactDetails`.
- Produces: visible homepage, category, detail, and contact content with no legacy fallback copy.

- [ ] **Step 1: Import centralized company content and replace hard-coded categories**

In `src/main.jsx`, import:

```js
import { companyProfile, capabilities, contactDetails } from './content/company.js'
```

Build `categories` from `Object.entries(brochureSeries)` and filter products by `product.category === slug`. The visible order must remain the eight-category order in Task 1.

- [ ] **Step 2: Remove the obsolete duplicate homepage component**

Delete `HomeLegacy` completely. Keep a single `Home` component so company and contact copy cannot diverge.

- [ ] **Step 3: Render brochure-backed company and capability content**

Replace the homepage company section with `companyProfile.eyebrow`, `companyProfile.title`, and all three paragraphs. Replace the four technology cards with `capabilities`. The cards must no longer show `5M sqm`, `2M sqm`, `60+ countries`, or `Certified quality management` unless the brochure explicitly states the claim.

- [ ] **Step 4: Render category and detail data without generic substitutions**

Update `productDescription(product)` to return `product.description`. Update category filters to use `product.category`. On detail pages, render `product.specs` directly and remove the old `brochureModels` overlay that can duplicate or contradict specifications.

Ensure model headings remain visually prominent and do not restore numeric image counters.

- [ ] **Step 5: Render the complete brochure contact block**

Use `contactDetails` to render both company names, both addresses, both telephone numbers, fax, and email. Remove CSS pseudo-elements that inject the old company name or fax content via `content:`.

- [ ] **Step 6: Add minimal styles for multi-paragraph company and contact blocks**

Add focused classes for `.statement-copy`, `.contact-companies`, and `.contact-company`. Preserve the current maximum width and responsive breakpoints. On screens below 700px, company contact blocks must stack and long addresses must wrap without horizontal overflow.

- [ ] **Step 7: Validate the content and build**

Run:

```bash
pnpm run validate:content
pnpm run build
```

Expected: both commands exit successfully; Vite reports a completed production build.

---

### Task 3: Align language-controlled company copy

**Files:**
- Modify: `src/language.js`

**Interfaces:**
- Consumes: brochure-backed English facts from `companyProfile`.
- Produces: translated navigation labels and non-conflicting translated headings.

- [ ] **Step 1: Remove translated factual copy that contradicts the centralized company module**

Keep navigation and UI labels in `language.js`, but stop using `companyText` as the factual source. Company facts remain English across languages until verified translations are supplied. Update English heading labels to `20 years of industrial expertise.` and `Innovation. Quality. Service. Commitment.` where used.

- [ ] **Step 2: Verify all configured language selections still render**

Run the development server and switch through every value in `languageOptions`. Expected: navigation and UI labels fall back to English when a translation object is unavailable; no blank labels or runtime errors appear.

---

### Task 4: Functional and visual verification

**Files:**
- Verify: `src/main.jsx`
- Verify: `src/catalog.js`
- Verify: `src/brochure-data.js`
- Verify: `src/content/company.js`
- Verify: `src/styles.css`
- Verify: `server/index.mjs`

**Interfaces:**
- Consumes: complete website and API.
- Produces: evidence that the brochure-backed website is usable on desktop and mobile.

- [ ] **Step 1: Start frontend and API services**

Run the API on port 8787 and Vite on `0.0.0.0:5173`. Confirm `GET /api/health` returns `{ "ok": true }` through the Vite proxy.

- [ ] **Step 2: Verify homepage navigation and content**

Check Products, Technology, Company, Contact, and Talk to us. Expected: each navigates to the correct section; the hero does not intercept clicks; the company section displays all brochure-backed paragraphs; the homepage lists exactly eight product families.

- [ ] **Step 3: Verify category coverage**

Open all eight category pages. Expected: each page has the correct family introduction, group cards, and only models assigned to that category. Confirm SPC/LVT is absent.

- [ ] **Step 4: Verify representative product detail pages**

Open `SF1413`, `SF1865`, `SF2410`, `SF6000`, `AF1810`, `SF5501`, `SF5601`, `SF3180`, and `SF4001`. Compare their displayed rows with brochure pages 5, 7, 9, 10, 11, and 12. Expected: no empty values, repeated specifications, scraped descriptions, unrelated language names, or numeric image counters.

- [ ] **Step 5: Verify contact form and database path**

Submit one clearly labelled test inquiry through the browser, confirm it appears at `/#admin`, then remove only that known test record from the local database. Expected: the success message appears and no real inquiries are altered.

- [ ] **Step 6: Verify responsive layout**

Test at 390×844 and 1920×1080. Expected: hero image and title remain within viewport, product cards do not overflow, model headings remain readable, contact addresses wrap, and navigation works in both layouts.

- [ ] **Step 7: Run final checks**

Run:

```bash
pnpm run validate:content
pnpm run build
curl -s http://127.0.0.1:5173/api/health
```

Expected: validation passes, production build succeeds, and the API response is `{ "ok": true }`.

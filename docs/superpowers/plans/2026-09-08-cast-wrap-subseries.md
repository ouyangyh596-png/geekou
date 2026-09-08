# Cast Wrap Vinyl Subseries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group Cast Wrap Vinyl into four named subseries and relocate AF50100G to Super Chrome Film.

**Architecture:** `src/catalog.js` owns each product's category and display group. `src/content/site-content.js` provides matching series labels and descriptions. Existing Node assertion scripts protect catalogue memberships and copy.

**Tech Stack:** React, Vite, Node.js assert scripts, pnpm.

## Global Constraints

- Use the four supplied subseries names exactly.
- Preserve all 82 product models and their technical specifications.
- Assign `AF50100G` only to `super-chrome-film`.
- Do not touch user-owned unrelated working-tree changes.

---

### Task 1: Add regression expectations

**Files:**
- Modify: `scripts/validate-content.mjs:22-33`
- Modify: `scripts/test-site-content.mjs:118-121`

**Interfaces:**
- Consumes: `catalogProducts` and `englishSiteContent.categories`.
- Produces: assertions for the four Cast Wrap Vinyl groups, their descriptions and AF50100G membership.

- [ ] **Step 1: Write the failing test**

Replace the Cast Wrap Vinyl mapping with:

```js
'cast-wrap-vinyl': [
  ['SF5501', 'White Printable Film'], ['SF5511', 'White Printable Film'],
  ['SF5503', 'Ultra Clear Printable Film'], ['SF5513', 'Ultra Clear Printable Film'],
  ['SF9908', 'Reflective Printable Film'],
  ['SF5601', 'Overlaminate Film'], ['SF5602', 'Overlaminate Film'], ['SF5603', 'Overlaminate Film'], ['SF5606', 'Overlaminate Film'], ['SF5609', 'Overlaminate Film']
]
```

Add `['AF50100G', 'Super Chrome Film Classic Colours']` to Super Chrome Film and assert the four approved copy records.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test-release`

Expected: FAIL because catalogue data still uses the old Cast PVC group names and AF50100G belongs to Cast Wrap Vinyl.

- [ ] **Step 3: Implement the catalogue and copy changes**

Complete Task 2.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test-release`

Expected: PASS with 82 brochure-backed products.

### Task 2: Apply category and display-group data

**Files:**
- Modify: `src/catalog.js:171-197`
- Modify: `src/content/site-content.js:111-118`

**Interfaces:**
- Consumes: `wrap(category, model, group, ...)` and `overlaminate(category, model, group, ...)`.
- Produces: four group labels shown by the category detail table and one Super Chrome Film record for AF50100G.

- [ ] **Step 1: Write minimal implementation**

Use the exact mappings below while retaining all existing size, finish, adhesive, liner and print-compatibility values:

```js
SF5501, SF5511 -> White Printable Film
SF5503, SF5513 -> Ultra Clear Printable Film
SF9908 -> Reflective Printable Film
SF5601, SF5602, SF5603, SF5606, SF5609 -> Overlaminate Film
AF50100G -> super-chrome-film / Super Chrome Film Classic Colours
```

Replace the Cast Wrap Vinyl content records with the four approved names and supplied descriptions.

- [ ] **Step 2: Verify all automated checks**

Run: `pnpm test-release && pnpm build`

Expected: all release assertions pass and Vite produces `dist/`.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/catalog.js src/content/site-content.js scripts/validate-content.mjs scripts/test-site-content.mjs
git commit -m "feat: group cast wrap vinyl subseries"
```

### Task 3: Inspect the rendered product routes

**Files:**
- Verify: `src/main.jsx`
- Verify: `src/catalog.js`

**Interfaces:**
- Consumes: catalogue group data and current category detail renderer.
- Produces: confirmation that the group headers, text and models render correctly.

- [ ] **Step 1: Start local preview**

Run: `pnpm dev --host 127.0.0.1`

Expected: a local Vite URL is available.

- [ ] **Step 2: Check Cast Wrap Vinyl**

Open `http://127.0.0.1:5173/#category=cast-wrap-vinyl` and confirm the four groups and no AF50100G row.

- [ ] **Step 3: Check Super Chrome Film**

Open `http://127.0.0.1:5173/#category=super-chrome-film` and confirm AF50100G appears in Super Chrome Film Classic Colours.

- [ ] **Step 4: Final verification**

Run: `git diff --check && pnpm test-release && pnpm build`

Expected: no whitespace errors, all tests pass and the production build completes.

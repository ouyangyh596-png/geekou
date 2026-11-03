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

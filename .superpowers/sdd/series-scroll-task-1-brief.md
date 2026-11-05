### Task 1: Same-category navigation policy

**Files:**
- Modify: `scripts/test-scroll-navigation.mjs`
- Modify: `src/scroll-navigation.js`

**Interfaces:**
- Consumes: `decideHashNavigation({ previousHash, nextHash, savedHomeScroll })`.
- Produces: `{ type: 'preserve' }` when both hashes resolve to the same non-empty `category` value.

- [ ] **Step 1: Add failing policy tests**

Add assertions that `#category=one-way-vision` → `#category=one-way-vision&series=Cast%20PVC` and one series → another return `{ type: 'preserve' }`. Add assertions that one category → another and an empty previous hash → a series URL still return `{ type: 'top' }`.

- [ ] **Step 2: Run the focused test and observe the intended failure**

Run: `pnpm test-scroll`

Expected: FAIL because same-category transitions currently return `{ type: 'top' }`.

- [ ] **Step 3: Implement the minimal route comparison**

Add a helper that parses hashes beginning with `#category=` using `URLSearchParams` and returns the decoded category. Before the existing default-top result, return `{ type: 'preserve' }` only when both parsed category values are equal and non-empty.

- [ ] **Step 4: Run focused and release tests**

Run: `pnpm test-scroll && pnpm test-release`

Expected: all assertions pass with no regressions.

- [ ] **Step 5: Commit the policy fix**

Run: `git add scripts/test-scroll-navigation.mjs src/scroll-navigation.js && git commit -m "fix: preserve position when switching product series"`


# Orbit Selected Node Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the active orbit category button into a dimensional SO-FINE technology marker without changing its behavior.

**Architecture:** Extend the selected `.orbit-node[aria-pressed="true"]` CSS with layered gradients, inset light, shadow and a pseudo-element sheen. Existing `aria-pressed` state, node DOM, routes and media stay unchanged; tests assert the visual contract and preserve responsive/motion behavior.

**Tech Stack:** CSS, Node assertions, Playwright, Vite.

## Global Constraints

- Change only the selected orbit node; keep nonselected nodes restrained.
- Use a deep-blue gradient, edge highlight, layered shadow and low-contrast sheen.
- Keep selected node target at least 44px and preserve visible focus.
- Disable sheen and motion in `prefers-reduced-motion`.
- Do not alter category selection, category navigation, mobile layout, translations, data, or dependencies.
- Workspace is not a Git repository; do not commit.

---

### Task 1: Selected Node Depth, Motion Policy and Verification

**Files:**
- Modify: `src/styles.css`
- Modify: `scripts/test-home-media.mjs`
- Modify: `scripts/test-rendered-ui.mjs`

**Interfaces:**
- Consumes: `.orbit-node[aria-pressed="true"]`, existing reduced-motion policy and browser test harness.
- Produces: selected-node dimensional CSS treatment and acceptance coverage.

- [ ] **Step 1: Add failing static and browser assertions**

Require `.orbit-node[aria-pressed="true"]` to include a gradient background, inset highlight and box shadow; require its `::after` sheen with an animation; require reduced motion to set the sheen animation to `none`. In rendered checks assert the active node has a nontransparent background/box shadow and maintains a 44px target.

- [ ] **Step 2: Run focused checks and verify failure**

Run:

```bash
export PATH='/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH"
node scripts/test-home-media.mjs && node scripts/test-rendered-ui.mjs
```

Expected: failure because the selected node has a flat solid background and no sheen selector.

- [ ] **Step 3: Implement the dimensional selected-node surface**

Add a deep-blue multi-stop gradient and layered shadow to the existing selected selector, then add:

```css
.orbit-node[aria-pressed="true"]:after {
  content:'';
  position:absolute;
  inset:1px;
  border-radius:inherit;
  background:linear-gradient(115deg,transparent 28%,rgba(255,255,255,.42) 48%,transparent 66%);
  transform:translateX(-130%);
  animation:orbit-node-sheen 3.8s cubic-bezier(.22,1,.36,1) infinite;
  pointer-events:none;
}
```

Keep `overflow:hidden` on the selected node and add an `@keyframes orbit-node-sheen` sweep. Improve selected label weight and letter spacing without changing the node text or size.

- [ ] **Step 4: Disable sheen in reduced motion**

Add an orbit-scoped reduced-motion rule that sets `.orbit-node[aria-pressed="true"]:after { animation:none!important; }`, while preserving the static gradient and focus outline.

- [ ] **Step 5: Run full verification**

Run:

```bash
pnpm run test-home-media && node scripts/test-rendered-ui.mjs && pnpm run build
```

Expected: all commands exit 0.

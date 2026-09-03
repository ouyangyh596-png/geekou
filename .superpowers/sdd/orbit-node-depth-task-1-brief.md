# Task 1 — Selected Node Depth, Motion Policy and Verification

Implement the one task in `docs/superpowers/plans/2026-08-19-orbit-selected-node-depth-implementation.md`.

## Files you may modify

- `src/styles.css`
- `scripts/test-home-media.mjs`
- `scripts/test-rendered-ui.mjs`

## Requirements

- Use TDD: write static/browser checks for selected node gradient, inset highlight, shadow, `::after` sheen, 44px target and reduced-motion disablement. Run red before styles change.
- Modify only selected `.orbit-node[aria-pressed="true"]`; nonselected nodes must remain restrained and behavior/data/routes must not change.
- Use deep-blue multi-stop gradient, inset highlight, layered shadow, overflow clipping and stronger readable typography.
- Add the exact sheen pseudo-element and `orbit-node-sheen` keyframe described in the plan; sweep should be low contrast and not interfere with clicks.
- Preserve visible focus and 44px target.
- Explicitly disable sheen animation in reduced motion while retaining static visual clarity.
- Use `apply_patch`; no git, no dependencies.
- Run `pnpm run test-home-media && node scripts/test-rendered-ui.mjs && pnpm run build` with the bundled Node runtime path in PATH.
- Write detailed red/green evidence, test output, changed paths, self-review and concerns to `.superpowers/sdd/orbit-node-depth-task-1-report.md`.

# Website polish and release

Goal: retain the English site's section order and identity, improve typography,
motion and Cybertruck interaction, restore Car Wrap Film navigation, then publish.

Constraints: preserve paint alpha, retain the PPF 1–71 intro and scroll sequence,
keep the existing company content, do not add team-editing features. Preserve
unrelated worktree edits and never publish scratch reports.

1. Navigation: reproduce the missing anchor in the Car Wrap Film carousel.
   Add a regression check, render exactly one active card and a real category CTA,
   leaving canvas dragging and swatches independent of navigation.
2. Typography/motion: repair company heading word splitting, consolidate readable
   heading tracking/leading, make reveal animations one-shot, clear shuffle timers,
   use separate mobile shuffle transforms and respect reduced motion.
3. Three.js: test per-viewer scene/material isolation and alpha preservation.
   Clone model instances, allocate owned paint materials once, update colour in
   place, dispose owned materials, retain scalar/array material shape. Frame the
   complete model from a three-quarter view, keep environment reflection, and
   separate text from the stage on the detail page. Add loading/error UI.
4. Verification: run existing non-browser tests and production build; inspect
   real carousel links, category selection, vehicle colour changes, rotations,
   desktop/mobile layout and reduced motion using the supported browser.
5. Release: review the exact diff, commit only site changes/tests/this plan,
   push main through existing GitHub→Cloudflare pipeline; verify public assets
   and production interactions. Report a deployment blocker if the pipeline fails.

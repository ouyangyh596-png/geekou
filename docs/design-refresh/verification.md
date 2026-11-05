# Design refresh continuation

Continued from `eaeb4e5` (`wip: codex design refresh (interrupted)`) on `design-refresh`. Existing WIP implementation retained. No push, branch switch, main modification, or unrelated `.superpowers` changes staged.

## Section record

The environment denies creating `.git/index.lock` (`Operation not permitted`). **No new commits were created.** The requested independent commits remain pending; the following table records the intended boundaries, not an actual commit history.

| Block / intended commit | Continuation changes |
| --- | --- |
| `style: global restore shared typography and containers` | Removed conflicting mobile type/gutter overrides; preserved 0.75 type scale, 12px floor, shared 32px gutters; confined serif emphasis and label tracking. |
| `style: header align navigation and language controls` | Removed inherited 104px/equal-width navigation overrides; retained 15px links, 32px gaps, 6px chevron; custom language control shows localized self-name and writing direction. |
| `style: hero refine copy placement and media layers` | Kept original film; explicit lower-left vertical copy, white title, subtitle, CTA and gradient layers; removed obsolete global-scroll effect. |
| `style: ppf preserve split presentation and static frame` | Retained 5/7 split, white text and mobile stack; fixed late initial frame overwriting reduced-motion static frame. |
| `style: factory clarify panel and pending metrics` | Removed inherited split heading and background reveal transform; caption sits above overlay; four real metrics remain TODO. |
| `style: carousel improve navigation and preview reliability` | Retained passive gesture latch, arrows/dots/keyboard, cover/skeleton, common order; fixed undefined readiness callback that crashed 3D; guarded card height/mobile flow. Model, material and camera settings unchanged. |
| `style: technology unify capability icons` | Five filled cards (wide introduction + 2×2), top-left linear icons; removed remaining high-specificity handshake decoration. |
| `style: contact align form and footer columns` | Preserved information/form split, 13px labels and 48px inputs; reset footer to full-width block with copyright below; prevented form intrinsic-width overflow. |
| `style: categories refine specification tables` | Preserved missing-media hiding and equal-height cards; consistent numeric columns including units, header alignment, N/A; duplicate AF1810/AF1850 TODO. |
| `style: language complete Chinese content and fallback` | Localized preview/error/upload copy and accessible labels; moved contact fields through content resolver; preserved English fallback and existing factual specs. |
| `style: tvc add independent film showcase and lightbox` | Separate full-viewport first section, specified WebM/MP4 loop and poster; no loop mounted on small screens/reduced motion; full-film native modal, user-activated sound, controls, Esc/close pause, focus restoration, body scroll lock. |

## Validation

- `pnpm test-release`: passed, including added header, TVC, factory and PPF coverage.
- `pnpm build`: passed; existing Three.js-related chunk above 500 kB warning remains.
- Targeted printable-wrap state/viewer/configurator, request validation and product-media semantics checks: passed.
- TVC MP4 metadata inspected: 55.5 seconds, video and audio tracks present.
- `scripts/test-rendered-ui.mjs` updated for home and all 11 categories at 1440/1024/390, Chinese, reduced motion, modal, carousel, header alignment, contrast and 12px text floor.
- `node --check scripts/test-rendered-ui.mjs`: passed.
- `pnpm test-rendered-ui`: **blocked** before browser checks; Vite listen on `127.0.0.1:4178` denied with `EPERM`. No screenshots generated and no visual or browser interaction checks claimed as passed. The script writes screenshots to `/tmp/sofine-design-refresh/screenshots` when run in an environment that permits a local server.

## Remaining execution work

In a workspace that permits Git writes and a local server, create the independent section commits and run `pnpm test-rendered-ui`; inspect its screenshots before final visual acceptance. No permission escalation or alternative mechanism was used to bypass the current restrictions.

Real data and image requests: [TODO.md](TODO.md).

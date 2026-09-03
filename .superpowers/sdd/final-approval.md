# SO-FINE Final Targeted Approval Review

Date: 2026-08-18

## Verdict

**CHANGES_REQUIRED — NOT APPROVED**

No Critical finding remains. Two Important findings remain: the homepage no longer contains the approved automotive-finish/application story, and the regression gate encodes that relaxed content while still omitting the promised narrow-width category/detail matrix.

## Targeted findings

### 1. Important — The automotive tile is honest now, but it no longer satisfies the approved automotive requirement

The current `public/media/home/automotive-film-application.webp` is the same reviewed hash (`c3d564e37700f9670ebc8ed7e265b4724057fb2b285af3770118ddfba5614163`). Its full pixels and live 390px 16:9 crop show an abstract wet, black-and-white surface close-up; they do not show an identifiable vehicle finish, protected panel, film edge, installer, or application action.

`src/main.jsx:158` now labels the tile `03 / WET SURFACE DETAIL` and uses the alt `Wet, high-contrast close-up of a glossy black surface`. Those strings accurately describe the pixels and resolve the prior misleading automotive claims. However, `final-visual-rereview.md:53` explicitly states that retaining this image with literal copy would not satisfy the approved automotive-finish/application requirement, and its gate at line 135 requires both semantic agreement and the approved application requirement. The relabelled generic surface detail therefore cannot close the finding.

Replace this tile with a credible photograph that visibly shows an automotive finish, protected vehicle panel, or automotive-film application, then use literal label/alt text tied to those visible pixels.

### 2. Important — The new media regression tests approve the relaxed requirement, and the route/breakpoint matrix remains incomplete

The hero regression is materially improved: `scripts/test-rendered-ui.mjs:50-77` measures both title spans against the visible `.landing` bounds at 320px, 360px, and 390px. It would catch the prior overflow-hidden false positive.

The media regressions do not guard the approved automotive requirement:

- `scripts/test-home-media.mjs:27-35` requires the generic wet-surface alt and label.
- `scripts/test-media-manifest.mjs:56-61` pins the same non-automotive image hash and describes it as a reviewed wet-surface close-up.

These assertions correctly prevent renewed semantic overclaiming, but they also make the suite pass only after the required automotive story has been removed. A passing media gate therefore still does not prove the approved content requirement.

In addition, `scripts/test-rendered-ui.mjs:50-98` covers only the home route at 320/360/390px. Category and detail are still exercised only at 970px (`lines 131-143`), despite `final-visual-rereview.md:62-64` requiring the promised home/category/detail breakpoint matrix. Add narrow-width category/detail coverage and make the semantic-media gate require a human-reviewed automotive image hash whose pixels satisfy the automotive-finish/application requirement.

## Resolved targeted item

### Mobile hero containment — Resolved

Fresh live measurements confirm both no-wrap title lines are fully contained:

| Viewport | Computed title size | Landing bounds | `Innovation / Quality` bounds | `Service / Commitment` bounds |
|---:|---:|---:|---:|---:|
| 320px | 32px | 0–320px | 14–237.48px | 14–280.06px |
| 360px | 34.2px | 0–360px | 14–251.92px | 14–297.44px |
| 390px | 37.05px | 0–390px | 14–270.75px | 14–320.05px |

Visual screenshots at all three widths show the complete two-line headline. The higher-specificity `.landing h1.landing-title` rule at `src/styles.css:37` wins over the legacy mobile `.landing h1` declaration and produces the expected computed sizes.

## Fresh verification evidence

All focused commands exited 0:

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-home-media.mjs
# Validated homepage editorial media structure.

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-media-manifest.mjs
# PASS: validated 8 family mappings and 5 homepage assets

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-rendered-ui.mjs
# PASS: rendered UI meets responsive, navigation, motion, semantic media and local-resource acceptance criteria

/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
# vite v8.1.5; 1782 modules transformed; built in 271ms
```

These passing results verify the implemented behavior but do not override the two acceptance gaps above.

## Approval gate

Do not approve until the homepage uses an automotive-finish/application asset whose visible content and labels agree, the reviewed hash is pinned, and the rendered regression suite covers home/category/detail at the promised narrow breakpoints.

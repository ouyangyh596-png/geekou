# Task 1: Curated Media Pipeline Report

## Scope completed

Implemented only the curated media pipeline. No React page component or stylesheet was changed.

## Changed files

- `scripts/prepare-site-media.sh` — deterministic, explicitly mapped media preparation script.
- `scripts/test-media-manifest.mjs` — validates homepage media, all eight catalogue slugs, `/media/` URLs, referenced files, English alt text, and a 1200px minimum raster width.
- `src/media-manifest.js` — exports `homeMedia` and `familyMedia`.
- `public/media/home/factory-hero.webp`
- `public/media/home/material-roll-red.webp`
- `public/media/home/translucent-signage.webp`
- `public/media/home/car-wrap-yellow-jeep.webp`
- `public/media/families/perforated-window-graphic.webp`
- `public/media/families/self-adhesive-signage.webp`
- `public/media/families/translucent-signage.webp`
- `public/media/families/paint-protection-car-front.webp`
- `public/media/families/car-wrap-yellow-jeep.webp`
- `public/media/families/overlaminate-roll-red.webp`
- `public/media/families/cold-lamination-roll-orange.webp`
- `public/media/families/wall-graphic-installation.webp`

## Source-to-destination mapping

| Source under `/Users/geekou/Desktop/设计` | Project destination |
| --- | --- |
| `素材/工厂照片.png` | `public/media/home/factory-hero.webp` |
| `素材/Chrome Vinyl For Car Wrapping/DSC_9598.JPG` | `public/media/home/material-roll-red.webp` |
| `素材/灯箱膜.jpg` | `public/media/home/translucent-signage.webp` |
| `素材/5501/DSC07526.jpg` | `public/media/home/car-wrap-yellow-jeep.webp` |
| `素材/IMG_1894.JPG` | `public/media/families/perforated-window-graphic.webp` |
| `素材/灯箱膜.jpg` | `public/media/families/self-adhesive-signage.webp` |
| `素材/灯箱膜.jpg` | `public/media/families/translucent-signage.webp` |
| `2026.3.31/正面.jpg` | `public/media/families/paint-protection-car-front.webp` |
| `素材/5501/DSC07526.jpg` | `public/media/families/car-wrap-yellow-jeep.webp` |
| `素材/Chrome Vinyl For Car Wrapping/DSC_9598.JPG` | `public/media/families/overlaminate-roll-red.webp` |
| `素材/Chrome Vinyl For Car Wrapping/DSC_9748.JPG` | `public/media/families/cold-lamination-roll-orange.webp` |
| `素材/IMG_1894.JPG` | `public/media/families/wall-graphic-installation.webp` |

## Commands and results

1. `node scripts/test-media-manifest.mjs`
   - Result: could not run because this environment has no `node` executable: `zsh:1: command not found: node`.
   - This was the intended pre-implementation validation command, but it could not reach the expected missing-manifest failure.

2. `bash scripts/prepare-site-media.sh`
   - Result: passed; generated all 12 WebP files under `public/media`.

3. `bash -n scripts/prepare-site-media.sh`
   - Result: passed with no shell syntax errors.

4. `find public/media -type f -name '*.webp' -print0 | xargs -0 sips -g pixelWidth -g pixelHeight`
   - Result: passed; every generated image is 1600px wide, exceeding the 1200px validation threshold.

5. Script re-run with SHA-1 hashes checked before and after.
   - Result: passed; `PASS: deterministic WebP output`.

6. `bash scripts/prepare-site-media.sh && node scripts/test-media-manifest.mjs`
   - Result: media preparation passed, then the manifest test could not start because `node` is unavailable.

7. `pnpm exec node --version`
   - Result: failed with `Command "node" not found`, confirming the runtime limitation is not limited to shell PATH lookup.

## Concerns

- The environment lacks Node.js, so the new Node manifest test cannot be executed here. Run `node scripts/test-media-manifest.mjs` in a Node-enabled checkout to obtain the expected PASS result.
- This macOS `sips` build reads WebP but cannot write it. The preparation script retains the specified `sips -s format webp --resampleWidth` path for compatible systems and, on this machine, uses `sips` for deterministic resizing followed by the locally installed Pillow WebP encoder.

## Review remediation — 2026-08-18

All Critical and Important review findings were remediated.

- Replaced the incorrect, duplicate One Way Vision billboard with a clean, unbranded perforated-film material photograph (`Pictures taken by MIC/MOT_7194.jpg`).
- Replaced the incorrect Wall Decals billboard with the clean interior botanical mural source (`素材/%E5%8D%A7%E5%AE%A4%E6%95%88%E6%9E%9C%E5%9B%BE_8K%E9%AB%98%E6%B8%85%E7%89%88.webp`).
- Removed the watermarked Jeep and baked-copy exhibition imagery. Homepage automotive now uses the clean protected-car image; self-adhesive vinyl, translucent film, and car wrapping use distinct clean source photographs.
- Replaced the inaccurate chrome-wrap mappings for Overlaminate and Cold Lamination with clean protective-film and film-with-release-liner material details. No exact application photograph was available in the vetted source set, so their alt text accurately identifies each as a representative material detail.
- Added explicit preflight validation for the retained Pillow fallback. If macOS `sips` cannot write WebP, the script now exits with an actionable error unless `python3` has Pillow with WebP support.
- Updated the manifest and validation allowlist together, including assertions that the previously conflated category assets and automotive imagery are byte-distinct.
- The preparation script deletes only the explicitly named, retired review-failed project outputs before generating the replacement WebP files.

### Remediated source-to-destination mapping

| Source under `/Users/geekou/Desktop/设计` | Project destination |
| --- | --- |
| `2026.3.31/正面.jpg` | `public/media/home/automotive-protected-car.webp` |
| `素材/Pictures taken by MIC/MOT_7194.jpg` | `public/media/families/one-way-vision-perforated-film.webp` |
| `素材/Pictures taken by MIC/MOT_7146.jpg` | `public/media/families/self-adhesive-vinyl-roll.webp` |
| `素材/Pictures taken by MIC/MOT_7165.jpg` | `public/media/families/translucent-film-roll.webp` |
| `素材/Pictures taken by MIC/MOT_7088.jpg` | `public/media/families/car-wrapping-material-detail.webp` |
| `素材/Pictures taken by MIC/MOT_7166.jpg` | `public/media/families/overlaminate-protective-roll.webp` |
| `素材/Pictures taken by MIC/MOT_7242.jpg` | `public/media/families/cold-lamination-film-roll.webp` |
| `素材/%E5%8D%A7%E5%AE%A4%E6%95%88%E6%9E%9C%E5%9B%BE_8K%E9%AB%98%E6%B8%85%E7%89%88.webp` | `public/media/families/interior-wall-decals.webp` |

### Exact final validation output

Command:

```text
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-media-manifest.mjs
```

Output:

```text
PASS: validated 8 family mappings and 5 homepage assets
```

# Task 1 Review — Curated Media Pipeline

## Decision

**CHANGES_REQUIRED**

The pipeline structure is close: all 12 generated WebP files are project-owned, each is 1600 px wide, the manifest has the requested exports, and the eight catalogue slugs are present. However, the selected assets do not meet the required visual constraints or correctly represent every family, so this task cannot be approved.

## Evidence reviewed

- `.superpowers/sdd/task-1-brief.md` and `.superpowers/sdd/task-1-report.md`
- `docs/superpowers/plans/2026-08-18-high-resolution-visual-refresh-implementation.md`
- `scripts/prepare-site-media.sh`, `src/media-manifest.js`, `scripts/test-media-manifest.mjs`, and `src/catalog.js`
- All generated files in `public/media`, including visual inspection and dimensions via `sips`.

Observed output facts:

- 12 WebP files exist below `public/media`; all inspected output files are 1600 px wide.
- `homeMedia` has exactly `hero`, `materialDetail`, `signage`, `automotive`, and `company`; `familyMedia` has all eight catalogue slugs with nonempty English alt strings.
- The project has no `node` executable, so `node scripts/test-media-manifest.mjs` could not be run. `bash -n scripts/prepare-site-media.sh` passed and the preparation script completed successfully in this environment.
- The paired output hashes prove accidental reuse in several places: `perforated-window-graphic.webp` and `wall-graphic-installation.webp` are identical, as are the two signage family assets; the home derivatives are also identical to their corresponding family asset where the same source was selected.

## Findings

### Critical — One Way Vision and Wall Decals are not correctly matched to their families

`scripts/prepare-site-media.sh:34,41` derives both `perforated-window-graphic.webp` and `wall-graphic-installation.webp` from the same `IMG_1894.JPG`; the generated files are byte-identical. Visual inspection shows a sideways exterior photograph of a fashion billboard/install, not a perforated window graphic and not an interior wall-decals application. This contradicts the Task 1 mapping requirement for both families. The One Way Vision alt text at `src/media-manifest.js:13` additionally describes a storefront window that is not depicted.

Replace these with two distinct, correctly oriented originals: a clearly perforated/window-vision application for `one-way-vision`, and an interior wall-graphic/decal application for `wall-decals`. Update their alts to describe the actual selected images.

### Critical — Production assets retain prohibited watermarks and baked promotional copy

The car-wrap source used at `scripts/prepare-site-media.sh:33,38` has a prominent bottom `SO-FINE | AUTOFACE` watermark in both generated outputs. This directly violates the no-watermark constraint. The same source is used for homepage automotive media and the Car Wrapping family.

The source used for homepage signage and both `self-adhesive-vinyl` and `translucent-film` (`scripts/prepare-site-media.sh:32,35,36`) visibly contains exhibition advertising, Chinese promotional copy, and third-party brand marks. It is not suitable under the explicit no-baked-promotional-copy constraint. The repeated use also makes two separate product families visually indistinguishable.

Select uncopied original photographs without watermarks or embedded promotional artwork, and use distinct appropriate images for the two signage families. Re-run the preparation script after replacing the mappings.

### Important — The overlaminate asset is sourced from the car-wrapping photo set, not an overlaminate/protection detail

`scripts/prepare-site-media.sh:39` maps `Chrome Vinyl For Car Wrapping/DSC_9598.JPG` to `overlaminate-roll-red.webp`. The visual is a chrome/red wrapping-film roll; naming it a “protective” overlaminate in `src/media-manifest.js:38` does not make it representative of the Overlaminate family. This fails the required family-specific curation. `cold-lamination-roll-orange.webp` is likewise sourced from the same Chrome Vinyl For Car Wrapping set at line 40, so its material identity should be verified and replaced if it is also a wrapping film.

Use genuine overlaminate and cold-lamination roll/protection photographs, with alts that state only visible, supportable details.

### Important — The required manifest validation has no passing execution evidence

Task 1 requires `bash scripts/prepare-site-media.sh && node scripts/test-media-manifest.mjs` to pass. The report accurately records that Node is unavailable, and I independently confirmed no `node` executable is on PATH. Therefore the test has not passed in the reviewed environment; it cannot provide the claimed validation gate until run in a Node-enabled checkout.

Run and report the exact passing command in the intended Node/Vite environment after the asset corrections.

### Important — The fallback encoder has an undeclared runtime dependency

When the local `sips` cannot write WebP, `scripts/prepare-site-media.sh:17-27` depends on `python3` and `Pillow`, neither of which is declared or preflighted by the project. The script will fail unclearly on a macOS host without that module, even though it is intended to be a deterministic asset-preparation command. Add a clear preflight/error message (or document and declare the required encoder) before invoking the fallback.

## Notes on the automated test

`scripts/test-media-manifest.mjs` appropriately checks exact home keys, category coverage, `/media/` URLs, file existence within `public`, and a 1200 px minimum width. It cannot validate the most important curation constraints—product-family match, orientation, watermarks, and embedded promotional copy—which is why visual review caught the blockers above. Keep the structural test, but add a reviewed source/asset allowlist or documented visual-approval step so future substitutions do not silently regress those constraints.

## Re-review criteria

1. Replace the four blocked selections (the One Way Vision and Wall Decals outputs, the watermarked car wrap, and the baked-copy signage source) with appropriate, unwatermarked original photographs.
2. Correct/verify overlaminate and cold-lamination material selection and update manifest alts to match what is visible.
3. Preserve project-owned 1200 px-or-wider WebP outputs and the exact manifest key coverage.
4. Run and capture a passing `bash scripts/prepare-site-media.sh && node scripts/test-media-manifest.mjs` in a Node-enabled environment.
5. Make the fallback encoder’s dependency explicit or fail with an actionable preflight message.

## Re-review — 2026-08-18

### Decision

**APPROVED**

All previous Critical and Important findings are resolved. The current pipeline meets Task 1's structural, asset-quality, and code-quality requirements.

### Re-review evidence

- Independently ran `bash -n scripts/prepare-site-media.sh` and `/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-media-manifest.mjs`; the manifest test reported `PASS: validated 8 family mappings and 5 homepage assets`.
- Visually inspected every current production asset in `public/media`: three homepage derivatives and eight family derivatives. Each is a 1600 px-wide WebP under the project, has normal orientation, and contains no watermark, screenshot, or baked promotional overlay.
- The One Way Vision output is now an unbranded perforated-film roll, while Wall Decals is a separate interior botanical mural; their SHA-256 hashes differ and their manifest alts describe the depicted media.
- Self-Adhesive Vinyl, Translucent Film, Car Wrapping, Overlaminate, and Cold Lamination each now use distinct, clean material/product imagery. The latter two visibly show protection/release-liner material details and the manifest accurately presents them as representative details rather than unsupported applications.
- Homepage automotive is now separate from Car Wrapping and has no watermark. It intentionally shares the PPF source, which is appropriate for the paint-protection visual and is not a prohibited cross-family conflation.
- `scripts/prepare-site-media.sh` now preflights Python/Pillow WebP support before taking the fallback path. Its cleanup is restricted to explicitly named retired outputs, and all current source-to-destination mappings are explicit and quoted.
- `scripts/test-media-manifest.mjs` retains the structural assertions and adds a reviewed-asset allowlist plus byte-distinct checks for the previously conflated category/home mappings.

### Prior findings disposition

| Prior finding | Re-review result |
| --- | --- |
| One Way Vision and Wall Decals used the same incorrect exterior billboard | Resolved: distinct, correctly matched perforated-film and interior-wall-decal assets. |
| Watermarked Jeep and promotional exhibition signage | Resolved: replaced by clean source images with no visible watermark or promotional overlay. |
| Chrome wrap used as overlaminate/cold-lamination media | Resolved: replaced by distinct protection-film and release-liner material details. |
| No passing Node validation evidence | Resolved: independently passed with the available Node runtime. |
| Undeclared Pillow fallback dependency | Resolved: actionable Python/Pillow/WebP preflight added. |

# Printable Wrap Task 4 Report

## Result

Implemented and integrated the local-only printable chrome configurator on the exact `Printable Super Glossy Chrome Wrap Film` series route.

## Files

- `src/components/PrintableWrapConfigurator.jsx`: upload lifecycle, controls, placement state, finish and mode selection.
- `src/main.jsx`: lazy exact-series mounting isolated from classic colours.
- `src/content/site-content.js`: English configurator copy.
- `src/polish.css`: desktop/mobile layout and control styling.
- `scripts/test-printable-wrap-configurator.mjs`: source contracts.
- `package.json`: configurator test registration.

## TDD and verification

- RED: configurator source-contract test failed before component and route existed.
- GREEN: `pnpm test-printable-wrap-configurator` → `Printable wrap configurator source contracts passed`.
- Regression: `pnpm test-release` → all release suites passed.
- Build: `pnpm build` → production build completed successfully; only the existing Three.js chunk-size warning remains.
- `git diff --check` produced no errors.

## Lifecycle and isolation

- Accept list is exactly PNG/JPEG/WebP and validation uses the Task 1 helper.
- Each replacement revokes the previous object URL; remove and unmount revoke the current URL.
- No network upload or `fetch` is used.
- Reset restores centred placement, Glossy and artwork-position mode.
- The component mounts only for the exact printable series; classic-colour rendering remains separate.

## Commit

Original isolated implementation: `8a5da13`; integrated on main as `343928b`.

## Concerns

No known functional blocker. Final rendered material and image manipulation still require Task 5 browser verification.

## Important review remediation

- Artwork is decoded with `createImageBitmap` before an object URL can reach `TextureLoader`.
- Limits are explicit: maximum 8192 px on either edge and maximum 32,000,000 total pixels.
- Decode failure and dimension overflow produce English inline errors; decoded bitmaps and every created object URL have bounded ownership and cleanup.
- Configurator status is now `idle` / `loading` / `ready` / `error`; Viewer reports TextureLoader loading, success and failure against the active URL.
- Texture failure detaches artwork, preserves the Silver substrate, revokes the failed URL, resets the chooser and permits another upload.

## Fix commit

`344304962761b206fca4c464486a78248d7e7a3f`

## Post-commit command output

```text
$ pnpm test-printable-wrap && pnpm test-printable-wrap-scene && pnpm test-printable-wrap-viewer && pnpm test-printable-wrap-configurator
$ node scripts/test-printable-wrap-state.mjs
Printable wrap state tests passed
$ node scripts/test-printable-wrap-scene.mjs && node scripts/test-printable-wrap-webgl.mjs
Actual GLB: 1 owned paint, 10 shared non-paint meshes, 11 shared geometries; dispose: owned=1 shared=0
Printable wrap isolation, Silver, full alpha/depth/blending, shader, projection, finish and disposal checks passed
Printable wrap WebGL map-alpha isolation passed: {"baseline":[116,116,116,255],"mapped":[58,58,58,128],"baselineRgb":[116,116,116],"mappedRgb":[116,116,116]}
$ node scripts/test-printable-wrap-viewer.mjs
Printable wrap viewer source contracts passed
$ node scripts/test-printable-wrap-configurator.mjs
Printable wrap configurator source contracts passed
```

```text
$ pnpm test-release
$ pnpm validate:content && pnpm test-polish && pnpm test-cybertruck && pnpm test-scroll && pnpm test-language && pnpm test-home-media && pnpm test-product-wheel && pnpm test-category-media && pnpm test-accessibility-assets && pnpm test-printable-wrap
$ node scripts/validate-content.mjs && pnpm test-content
Validated 82 brochure-backed products.
$ node scripts/test-site-content.mjs
English site content tests passed
$ node scripts/test-site-polish.mjs
Site polish regression checks passed
$ node scripts/test-cybertruck-config.mjs && node scripts/test-cybertruck-scene.mjs
Cybertruck configuration tests passed
Cybertruck isolation, material shape, alpha and disposal checks passed
$ node scripts/test-scroll-navigation.mjs
Validated hash navigation decisions.
$ node scripts/test-language.mjs
Validated 12 language options and 17 component keys.
$ node scripts/test-home-media.mjs
Validated homepage editorial media structure.
$ node scripts/test-product-wheel-navigation.mjs
Product wheel navigation tests passed
$ node scripts/test-category-media.mjs
PASS: validated category hero and product media semantics
$ node scripts/test-accessibility-assets.mjs
PASS: validated semantic heading, mobile navigation, reduced motion and local production assets
$ node scripts/test-printable-wrap-state.mjs
Printable wrap state tests passed
```

```text
$ pnpm build
$ vite build
vite v8.2.2 building client environment for production...
transforming...
✓ 2391 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                        0.47 kB │ gzip:   0.32 kB
dist/assets/index-Bbig2o4r.css                        72.69 kB │ gzip:  14.64 kB
dist/assets/CybertruckViewer-BPF5hKdR.js               5.67 kB │ gzip:   2.68 kB
dist/assets/PrintableWrapConfigurator-Bc9g_aH2.js     15.38 kB │ gzip:   5.66 kB
dist/assets/index-BwC0j6Qx.js                        253.48 kB │ gzip:  79.32 kB
dist/assets/RoomEnvironment-CFplJaj0.js            1,029.62 kB │ gzip: 280.72 kB

✓ built in 963ms
[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification.
```

```text
$ git diff --check HEAD^ HEAD
$ git rev-parse HEAD
344304962761b206fca4c464486a78248d7e7a3f
```

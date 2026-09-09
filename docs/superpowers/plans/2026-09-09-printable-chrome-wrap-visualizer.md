# Printable Chrome Wrap Visualizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Silver mirror-chrome Cybertruck configurator to `Printable Super Glossy Chrome Wrap Film`, allowing a local image upload to be positioned on the vehicle's left side and previewed with glossy or matte overlaminate.

**Architecture:** Keep upload validation and placement math in pure modules, keep Three.js material/projection work in a dedicated printable viewer component, and mount that component only for the exact printable series. The uploaded texture is projected in model-local space onto classified left-side paint meshes, while the existing classic-colour viewer and exported alpha contract remain isolated.

**Tech Stack:** React 19, Three.js, React Three Fiber, Drei, Vite, Node assertion tests, browser-based visual verification.

## Global Constraints

- The configurator renders only for `Printable Super Glossy Chrome Wrap Film`.
- Base paint is fixed Silver mirror chrome; classic-colour parameters and every material alpha value remain unchanged.
- Artwork affects only left-side paint panels, not glass, tyres, wheels, wheel arches, chassis, lights, trim, or the opposite side.
- Uploads stay local to the current browser session and are never sent to a server.
- Accept PNG, JPEG, and WebP; preserve image aspect ratio and PNG transparency.
- Provide artwork drag positioning, scale and rotation sliders, Glossy/Matte selection, reset, replace, and remove.

---

### Task 1: Upload validation and placement state

**Files:**
- Create: `src/printable-wrap-state.js`
- Create: `scripts/test-printable-wrap-state.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `validateArtworkFile(file): { valid: true } | { valid: false, message: string }`
- Produces: `DEFAULT_PRINT_PLACEMENT: { x: number, y: number, scale: number, rotation: number }`
- Produces: `updatePrintPlacement(placement, patch): placement`
- Produces: `finishMaterialSettings(finish): { roughness, clearcoat, clearcoatRoughness, useGrain }`

- [ ] **Step 1: Write failing pure-state tests**

```js
import assert from 'node:assert/strict'
import { DEFAULT_PRINT_PLACEMENT, finishMaterialSettings, updatePrintPlacement, validateArtworkFile } from '../src/printable-wrap-state.js'

assert.deepEqual(validateArtworkFile({ type: 'image/png', size: 2_000_000 }), { valid: true })
assert.equal(validateArtworkFile({ type: 'image/svg+xml', size: 2_000 }).valid, false)
assert.equal(validateArtworkFile({ type: 'image/jpeg', size: 16_000_000 }).valid, false)
assert.deepEqual(DEFAULT_PRINT_PLACEMENT, { x: 0, y: 0, scale: 1, rotation: 0 })
assert.equal(updatePrintPlacement(DEFAULT_PRINT_PLACEMENT, { scale: 8 }).scale, 2.5)
assert.equal(updatePrintPlacement(DEFAULT_PRINT_PLACEMENT, { x: -8 }).x, -1)
assert.equal(finishMaterialSettings('glossy').useGrain, false)
assert.equal(finishMaterialSettings('matte').useGrain, true)
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm test-printable-wrap`
Expected: FAIL because `src/printable-wrap-state.js` does not exist.

- [ ] **Step 3: Implement bounded state helpers**

```js
export const DEFAULT_PRINT_PLACEMENT = Object.freeze({ x: 0, y: 0, scale: 1, rotation: 0 })
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)))

export function validateArtworkFile(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file?.type)) return { valid: false, message: 'Choose a PNG, JPEG or WebP image.' }
  if (!file.size || file.size > 12_000_000) return { valid: false, message: 'Choose an image smaller than 12 MB.' }
  return { valid: true }
}

export function updatePrintPlacement(current, patch) {
  return {
    x: clamp(patch.x ?? current.x, -1, 1),
    y: clamp(patch.y ?? current.y, -1, 1),
    scale: clamp(patch.scale ?? current.scale, .35, 2.5),
    rotation: clamp(patch.rotation ?? current.rotation, -180, 180),
  }
}

export function finishMaterialSettings(finish) {
  return finish === 'matte'
    ? { roughness: .48, clearcoat: .12, clearcoatRoughness: .5, useGrain: true }
    : { roughness: .12, clearcoat: .75, clearcoatRoughness: .08, useGrain: false }
}
```

- [ ] **Step 4: Register and run the test**

Add `"test-printable-wrap": "node scripts/test-printable-wrap-state.mjs"` and include it in `test-release`.

Run: `pnpm test-printable-wrap`
Expected: `Printable wrap state tests passed`.

- [ ] **Step 5: Commit**

```bash
git add src/printable-wrap-state.js scripts/test-printable-wrap-state.mjs package.json
git commit -m "test: define printable wrap state"
```

### Task 2: Isolated printable material and left-side projection

**Files:**
- Create: `src/printable-wrap-scene.js`
- Create: `scripts/test-printable-wrap-scene.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `finishMaterialSettings(finish)` from Task 1.
- Produces: `createPrintableWrapInstance(source, grain): { scene, printMaterials, setArtwork, setPlacement, setFinish, dispose }`
- Each print material retains exported opacity, transparency, alpha test, depth and blending fields.

- [ ] **Step 1: Write a failing material-isolation test**

Create a synthetic scene containing named paint, glass, and body/trim meshes. Assert that only car-paint materials are cloned, cloned alpha fields exactly equal the source, Silver is `#B4B4B4`, non-paint materials retain identity, print uniforms exist, and `dispose()` releases only owned materials.

```js
assert.equal(instance.printMaterials.length, 1)
assert.equal(instance.printMaterials[0].color.getHexString(), 'b4b4b4')
assert.equal(instance.printMaterials[0].opacity, paint.opacity)
assert.equal(instance.scene.getObjectByName('glass').material, glass)
assert.ok(instance.printMaterials[0].userData.printUniforms.uArtwork)
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm test-printable-wrap-scene`
Expected: FAIL because the scene factory does not exist.

- [ ] **Step 3: Implement the scene factory**

Clone the GLB scene, reuse `mapMaterialShape`, classify paint by the same `car_paint`/`car_paint_mat` contract, and construct Silver `MeshPhysicalMaterial` instances. Attach `onBeforeCompile` uniforms for artwork, placement, rotation, projected model-local position, and an outward-normal left-side mask. Inject print sampling before the physical material colour is lit, blending with `texture alpha` and leaving opacity untouched.

The shader contract is:

```js
material.userData.printUniforms = {
  uArtwork: { value: null },
  uHasArtwork: { value: 0 },
  uOffset: { value: new THREE.Vector2() },
  uScale: { value: 1 },
  uRotation: { value: 0 },
}
```

Use model-local side-axis bounds measured from the paint meshes to normalize projected coordinates. Reject fragments outside the printable rectangle and require the surface normal to face the designated left side. `setFinish()` changes roughness, clear-coat settings and grain only; it never changes opacity, transparency, alpha test, or depth state.

- [ ] **Step 4: Verify shader and alpha contracts**

Run: `pnpm test-printable-wrap-scene && pnpm test-cybertruck`
Expected: both suites pass.

- [ ] **Step 5: Commit**

```bash
git add src/printable-wrap-scene.js scripts/test-printable-wrap-scene.mjs package.json
git commit -m "feat: add printable wrap material"
```

### Task 3: Printable Cybertruck viewer

**Files:**
- Create: `src/components/PrintableWrapViewer.jsx`
- Create: `scripts/test-printable-wrap-viewer.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes props: `{ artworkUrl, placement, finish, editMode, onPlacementChange }`.
- Consumes `createPrintableWrapInstance()` from Task 2.
- Produces an accessible Three.js stage with separate artwork-position and vehicle-rotation interaction modes.

- [ ] **Step 1: Write failing source-contract tests**

Assert the component loads `CYBERTRUCK_MODEL_PATH`, creates an isolated printable scene, decodes uploaded texture with `SRGBColorSpace`, updates uniforms without rebuilding the GLB, disposes textures, defaults to the left-side camera, and disables OrbitControls while artwork edit mode is active.

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm test-printable-wrap-viewer`
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement model, texture and pointer interaction**

Use the existing `Canvas`, `RoomEnvironment`, demand rendering, lighting, error boundary and camera framing patterns. Decode the object URL with `THREE.TextureLoader`, set `texture.colorSpace = THREE.SRGBColorSpace`, apply it through `setArtwork`, and dispose/revoke through owner callbacks.

When `editMode === 'positionArtwork'`, convert pointer deltas to bounded placement offsets:

```js
onPlacementChange({
  x: placement.x + deltaX / stageWidth,
  y: placement.y - deltaY / stageHeight,
})
```

Disable OrbitControls during artwork dragging. When `editMode === 'rotateVehicle'`, pointer input remains owned by OrbitControls.

- [ ] **Step 4: Run viewer and existing 3D tests**

Run: `pnpm test-printable-wrap-viewer && pnpm test-cybertruck`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/PrintableWrapViewer.jsx scripts/test-printable-wrap-viewer.mjs package.json
git commit -m "feat: build printable wrap viewer"
```

### Task 4: Configurator UI and exact-series routing

**Files:**
- Create: `src/components/PrintableWrapConfigurator.jsx`
- Create: `scripts/test-printable-wrap-configurator.mjs`
- Modify: `src/main.jsx:14-20,310-322`
- Modify: `src/content/site-content.js:125-142`
- Modify: `src/polish.css:95-166`
- Modify: `package.json`

**Interfaces:**
- Consumes state helpers from Task 1 and `PrintableWrapViewer` from Task 3.
- Produces a self-contained configurator mounted only for `activeSeries === 'Printable Super Glossy Chrome Wrap Film'`.

- [ ] **Step 1: Write failing routing and UI tests**

Assert exact-series detection, lazy loading, local file input with `accept="image/png,image/jpeg,image/webp"`, Glossy/Matte controls, edit/rotate modes, scale and rotation sliders, reset/remove actions, inline validation status, and no invocation of `fetch`/upload APIs.

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm test-printable-wrap-configurator`
Expected: FAIL because the configurator does not exist and the exact route is not mounted.

- [ ] **Step 3: Implement local upload lifecycle**

The configurator validates the selected file, creates one object URL, resets placement, and revokes the previous URL when replacing/removing/unmounting. It owns `{ artworkUrl, placement, finish, editMode, error }` and passes pure values to the viewer.

- [ ] **Step 4: Mount the exact series and add responsive styling**

In `CategoryPage`, define:

```js
const isPrintableChrome = activeSeries === 'Printable Super Glossy Chrome Wrap Film'
```

Render `<PrintableWrapConfigurator />` immediately below the series cards for that route. Use the existing 1440px section width and pale-blue visual system. Place controls beside the viewer on desktop and below it on mobile; keep every control outside the canvas with a minimum 44px touch target.

- [ ] **Step 5: Run configurator and release tests**

Run: `pnpm test-printable-wrap-configurator && pnpm test-release`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/PrintableWrapConfigurator.jsx src/main.jsx src/content/site-content.js src/polish.css scripts/test-printable-wrap-configurator.mjs package.json
git commit -m "feat: add printable chrome configurator"
```

### Task 5: Browser material tuning and final verification

**Files:**
- Modify if evidence requires: `src/printable-wrap-scene.js`
- Modify if evidence requires: `src/components/PrintableWrapViewer.jsx`
- Modify if evidence requires: `src/polish.css`
- Test asset: create a temporary transparent PNG outside the repository.

**Interfaces:**
- Consumes the complete configurator from Tasks 1-4.
- Produces a visually verified, production-buildable feature.

- [ ] **Step 1: Start the local production preview**

Run: `pnpm build && pnpm preview --host 127.0.0.1`
Expected: Vite prints a local preview URL.

- [ ] **Step 2: Verify the no-artwork state**

Open `#category=super-chrome-film&series=Printable%20Super%20Glossy%20Chrome%20Wrap%20Film`. Confirm the vehicle starts Silver, default camera exposes the left side, classic-colour controls are absent, and non-paint parts remain original.

- [ ] **Step 3: Verify artwork behaviour**

Upload a transparent PNG with an asymmetric coloured test mark. Confirm it appears only on left-side paint panels, transparency reveals Silver, dragging moves artwork rather than the camera, scale/rotation remain bounded, and orbit mode keeps the artwork attached.

- [ ] **Step 4: Verify finish and lifecycle behaviour**

Switch between Glossy and Matte and confirm visibly sharper versus softer/grainier reflections. Replace and remove the image, then confirm no stale artwork or console errors. Check desktop and a 390px mobile viewport.

- [ ] **Step 5: Run fresh completion verification**

Run: `pnpm test-release && pnpm build && git diff --check`
Expected: all tests pass, Vite build exits 0, and `git diff --check` prints no errors. The existing large Three.js chunk warning is non-blocking.

- [ ] **Step 6: Commit evidence-based tuning if required**

```bash
git add src/printable-wrap-scene.js src/components/PrintableWrapViewer.jsx src/polish.css
git commit -m "fix: tune printable wrap preview"
```

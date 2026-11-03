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


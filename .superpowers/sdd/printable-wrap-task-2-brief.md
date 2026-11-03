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


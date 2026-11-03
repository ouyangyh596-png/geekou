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


import assert from 'node:assert/strict'
import {
  DEFAULT_PRINT_PLACEMENT,
  finishMaterialSettings,
  updatePrintPlacement,
  validateArtworkFile,
} from '../src/printable-wrap-state.js'

assert.deepEqual(validateArtworkFile({ type: 'image/png', size: 2_000_000 }), { valid: true })
assert.equal(validateArtworkFile({ type: 'image/svg+xml', size: 2_000 }).valid, false)
assert.equal(validateArtworkFile({ type: 'image/jpeg', size: 16_000_000 }).valid, false)
assert.deepEqual(DEFAULT_PRINT_PLACEMENT, { x: 0, y: 0, scale: 1, rotation: 0 })
assert.equal(updatePrintPlacement(DEFAULT_PRINT_PLACEMENT, { scale: 8 }).scale, 2.5)
assert.equal(updatePrintPlacement(DEFAULT_PRINT_PLACEMENT, { x: -8 }).x, -1)
assert.equal(finishMaterialSettings('glossy').useGrain, false)
assert.equal(finishMaterialSettings('matte').useGrain, true)

console.log('Printable wrap state tests passed')

import assert from 'node:assert/strict'
import {
  ARTWORK_MAX_EDGE,
  ARTWORK_MAX_PIXELS,
  DEFAULT_PRINT_PLACEMENT,
  finishMaterialSettings,
  inspectArtworkFile,
  updatePrintPlacement,
  validateArtworkDimensions,
  validateArtworkFile,
} from '../src/printable-wrap-state.js'

assert.deepEqual(validateArtworkFile({ type: 'image/png', size: 2_000_000 }), { valid: true })
assert.equal(validateArtworkFile({ type: 'image/svg+xml', size: 2_000 }).valid, false)
assert.equal(validateArtworkFile({ type: 'image/jpeg', size: 16_000_000 }).valid, false)
assert.equal(ARTWORK_MAX_EDGE, 8192)
assert.equal(ARTWORK_MAX_PIXELS, 32_000_000)
assert.deepEqual(validateArtworkDimensions({ width: 8000, height: 4000 }), { valid: true })
assert.match(validateArtworkDimensions({ width: 8193, height: 1 }).message, /8192 px per side and 32 megapixels/)
assert.match(validateArtworkDimensions({ width: 8192, height: 4096 }).message, /8192 px per side and 32 megapixels/)
assert.match(validateArtworkDimensions({ width: 0, height: 1200 }).message, /could not read this image/i)

let decodedClosed = false
assert.deepEqual(await inspectArtworkFile({}, async () => ({
  width: 1600,
  height: 900,
  close() { decodedClosed = true },
})), { valid: true })
assert.equal(decodedClosed, true, 'preflight decoding must release its ImageBitmap')
assert.match((await inspectArtworkFile({}, async () => { throw new Error('decode failed') })).message, /could not read this image/i)
assert.deepEqual(DEFAULT_PRINT_PLACEMENT, { x: 0, y: 0, scale: 1, rotation: 0 })
assert.equal(updatePrintPlacement(DEFAULT_PRINT_PLACEMENT, { scale: 8 }).scale, 2.5)
assert.equal(updatePrintPlacement(DEFAULT_PRINT_PLACEMENT, { x: -8 }).x, -1)
assert.equal(finishMaterialSettings('glossy').useGrain, false)
assert.equal(finishMaterialSettings('matte').useGrain, true)

console.log('Printable wrap state tests passed')

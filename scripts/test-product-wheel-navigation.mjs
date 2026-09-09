import assert from 'node:assert/strict'
import { decideProductSwipe, decideProductWheel } from '../src/product-wheel-navigation.js'

assert.deepEqual(
  decideProductWheel({ index: 3, count: 11, deltaY: 80, blocked: false }),
  { type: 'select', index: 4 },
  'downward wheel selects the next product'
)
assert.deepEqual(
  decideProductWheel({ index: 3, count: 11, deltaY: -80, blocked: false }),
  { type: 'select', index: 2 },
  'upward wheel selects the previous product'
)
assert.deepEqual(
  decideProductWheel({ index: 3, count: 11, deltaY: 12, blocked: false }),
  { type: 'ignore' },
  'minor trackpad noise does not change products'
)
assert.deepEqual(
  decideProductWheel({ index: 3, count: 11, deltaY: 80, blocked: true }),
  { type: 'ignore' },
  'wheel input is throttled during a card transition'
)
assert.deepEqual(
  decideProductWheel({ index: 0, count: 11, deltaY: -80, blocked: false }),
  { type: 'release' },
  'upward scrolling leaves the first product'
)
assert.deepEqual(
  decideProductWheel({ index: 10, count: 11, deltaY: 80, blocked: false }),
  { type: 'release' },
  'downward scrolling leaves the final product'
)

assert.deepEqual(decideProductSwipe({ deltaX: -80, deltaY: 12 }), { type: 'select', offset: 1 },
  'a deliberate left swipe selects the next product')
assert.deepEqual(decideProductSwipe({ deltaX: 62, deltaY: -18 }), { type: 'select', offset: -1 },
  'a deliberate right swipe selects the previous product')
assert.deepEqual(decideProductSwipe({ deltaX: 55, deltaY: 120 }), { type: 'ignore' },
  'a mostly vertical mobile gesture keeps normal page scrolling')
assert.deepEqual(decideProductSwipe({ deltaX: 30, deltaY: 2 }), { type: 'ignore' },
  'a short horizontal gesture does not change products')

console.log('Product wheel navigation tests passed')

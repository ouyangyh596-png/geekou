import assert from 'node:assert/strict'
import { decideHashNavigation } from '../src/scroll-navigation.js'

assert.deepEqual(
  decideHashNavigation({ previousHash: '#category=one-way-vision', nextHash: '#products', savedHomeScroll: 684 }),
  { type: 'restore', top: 684 },
  'returning from a category to #products restores the exact saved home position'
)

assert.deepEqual(
  decideHashNavigation({ previousHash: '#product=sf1413', nextHash: '#products', savedHomeScroll: 421 }),
  { type: 'restore', top: 421 },
  'returning from a product to #products restores the exact saved home position'
)

assert.deepEqual(
  decideHashNavigation({ previousHash: '#products', nextHash: '#top', savedHomeScroll: 684 }),
  { type: 'top' },
  'the logo route always scrolls to the top'
)

assert.deepEqual(
  decideHashNavigation({ previousHash: '#category=one-way-vision', nextHash: '#company', savedHomeScroll: 684 }),
  { type: 'anchor', id: 'company' },
  'direct home anchors scroll to their sections instead of restoring a saved position'
)

assert.deepEqual(
  decideHashNavigation({ previousHash: '', nextHash: '#products', savedHomeScroll: 684 }),
  { type: 'anchor', id: 'products' },
  'a direct home #products link scrolls to the product section'
)

assert.deepEqual(
  decideHashNavigation({ previousHash: '#products', nextHash: '#product=sf1413', savedHomeScroll: 684 }),
  { type: 'top' },
  'detail and category routes start at the top'
)

console.log('Validated hash navigation decisions.')

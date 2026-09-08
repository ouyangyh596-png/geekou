import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { decideHashNavigation } from '../src/scroll-navigation.js'

const mainSource = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8')

assert.deepEqual(
  decideHashNavigation({ previousHash: '#category=one-way-vision', nextHash: '#products', savedHomeScroll: 684 }),
  { type: 'restore', top: 684 },
  'returning from a category to #products restores the exact saved home position'
)

assert.match(
  mainSource,
  /if \(action\.type === 'preserve'\) return;/,
  'the preserve action must be an explicit scroll no-op'
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

assert.deepEqual(
  decideHashNavigation({
    previousHash: '#category=one-way-vision',
    nextHash: '#category=one-way-vision&series=Cast%20PVC',
    savedHomeScroll: 684
  }),
  { type: 'preserve' },
  'selecting a series within the current category preserves the scroll position'
)

assert.deepEqual(
  decideHashNavigation({
    previousHash: '#category=one-way-vision&series=Cast%20PVC',
    nextHash: '#category=one-way-vision&series=Polymeric%20PVC',
    savedHomeScroll: 684
  }),
  { type: 'preserve' },
  'switching series within the current category preserves the scroll position'
)

assert.deepEqual(
  decideHashNavigation({
    previousHash: '#category=one-way-vision',
    nextHash: '#category=self-adhesive-vinyl&series=Polymeric%20PVC',
    savedHomeScroll: 684
  }),
  { type: 'top' },
  'switching categories starts at the top'
)

assert.deepEqual(
  decideHashNavigation({
    previousHash: '',
    nextHash: '#category=one-way-vision&series=Cast%20PVC',
    savedHomeScroll: 684
  }),
  { type: 'top' },
  'opening a series URL directly starts at the top'
)

console.log('Validated hash navigation decisions.')

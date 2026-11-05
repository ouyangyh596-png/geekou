import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { decideProductSwipe, decideProductWheel, createWheelGesture, createTouchGesture } from '../src/product-wheel-navigation.js'

const mainSource = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')

assert.match(mainSource, /const activeCardRef = useRef\(null\)/,
  'the active product card owns a dedicated wheel target ref')
assert.match(mainSource, /<article ref=\{activeCardRef\} className="stack-card stack-card-active stack-card-interactive">/,
  'the interactive active-card branch uses the wheel target ref')
assert.match(mainSource, /<a ref=\{activeCardRef\} href=\{'#category=' \+ selectedCategory\.slug\} className="stack-card stack-card-active"/,
  'the linked active-card branch uses the wheel target ref')
assert.match(mainSource, /wheelTarget\.addEventListener\('wheel', handleWheel, \{ passive: false \}\)/,
  'wheel navigation listens on the active card')
assert.match(mainSource, /wheelTarget\.removeEventListener\('wheel', handleWheel\)/,
  'wheel navigation cleans up the active-card listener')
assert.doesNotMatch(mainSource, /showcase\.addEventListener\('wheel'/,
  'the full product selector does not capture wheel navigation')

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

const gesture = createWheelGesture();
assert.deepEqual(gesture({index:3,count:11,deltaY:80,time:0}),{type:'select',index:4});
for(let time=10;time<1800;time+=10) assert.equal(gesture({index:4,count:11,deltaY:80,time}).type,'ignore','inertia cannot select another card');
assert.deepEqual(gesture({index:4,count:11,deltaY:80,time:2200}),{type:'select',index:5});
assert.match(mainSource,/if \(event.cancelable\) event.preventDefault\(\)/,'carousel captures wheel input');

const boundary = createWheelGesture();
assert.deepEqual(boundary({index:9,count:11,deltaY:80,time:0}), {type:'select',index:10});
assert.equal(boundary({index:10,count:11,deltaY:40,time:80}).type,'ignore','inertia remains captured after arriving at last card');
assert.equal(boundary({index:10,count:11,deltaY:2,time:400}).type,'release','new outward gesture releases immediately at edge');
assert.equal(boundary({index:10,count:11,deltaY:20,time:420}).type,'release','released gesture stays released');
const touch = createTouchGesture();
assert.equal(touch({index:3,count:11,deltaX:0,deltaY:-10}).type,'ignore');
assert.deepEqual(touch({index:3,count:11,deltaX:0,deltaY:-70}),{type:'select',index:4});
assert.equal(touch({index:4,count:11,deltaX:0,deltaY:-140}).type,'ignore','one selection per contact');
assert.equal(createTouchGesture()({index:0,count:11,deltaX:0,deltaY:8}).type,'release');
assert.equal(createTouchGesture()({index:10,count:11,deltaX:0,deltaY:-8}).type,'release');
assert.deepEqual(createTouchGesture()({index:3,count:11,deltaX:-70,deltaY:10}),{type:'select',index:4});
assert.match(mainSource,/addEventListener\('touchmove', handleTouchMove, \{ passive: false \}\)/);

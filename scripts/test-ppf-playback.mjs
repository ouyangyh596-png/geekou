import assert from 'node:assert/strict'
import { introFrameAt, scrubFrameAt } from '../src/ppf-sequence.js'
assert.equal(introFrameAt(0), 0)
assert.equal(introFrameAt(1000), 30)
assert.equal(introFrameAt(2434), 73)
assert.equal(introFrameAt(9000), 73)
for (const [progress, expected] of [[0,73], [.5,94], [1,114], [.5,94], [0,73], [-1,73], [2,114]]) {
  assert.equal(scrubFrameAt(progress, 0), expected)
}
assert.equal(scrubFrameAt(.6, .6), 73, 'handoff keeps the intro endpoint')
assert.equal(scrubFrameAt(1, .6), 114, 'remaining scroll reaches final frame')
assert.equal(scrubFrameAt(.2, .6), 73, 'reverse never replays intro')
assert.equal(scrubFrameAt(1, .95), 114)
assert.equal(scrubFrameAt(1, 1), 73, 'no tail autoplay when intro ends at bottom')
console.log('PPF intro timing and continuous scroll handoff PASS')

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const source = readFileSync(new URL('../src/components/PPFLayerAnimation.jsx', import.meta.url), 'utf8')
const fn = source.slice(source.indexOf('function expansionAt('), source.indexOf('\nexport default'))
const expansionAt = new Function(`${fn}; return expansionAt`)()
for (const [progress, expected] of [[-1,0],[0,0],[.15,0],[.375,.5],[.6,1],[.85,1],[.925,.5],[1,0],[2,0]]) {
  assert.ok(Math.abs(expansionAt(progress) - expected) < 1e-8, `phase ${progress}`)
}
let previous = 0
for (let i=0; i<=600; i++) {
  const progress=i/1000, expansion=expansionAt(progress)
  assert.ok(expansion >= previous && expansion <= 1, 'opening is bounded and monotonic')
  assert.ok(expansion - previous < .004, 'opening has no frame jumps')
  previous = expansion
}
const forward = Array.from({length:101}, (_,i) => expansionAt(i/100))
assert.deepEqual(Array.from({length:101}, (_,i) => expansionAt(1-i/100)).map(v=>Math.round(v*1e8)), forward.toReversed().map(v=>Math.round(v*1e8)), 'reverse retraces the same scroll positions')
console.log('PPF layered scroll phases, smooth easing, bounds and deterministic reverse PASS')

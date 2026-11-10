import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const source = readFileSync(new URL('../src/components/PPFLayerAnimation.jsx', import.meta.url), 'utf8')
const start = source.indexOf('function cubicBezier(')
assert.ok(start >= 0, 'animation exposes its easing helpers')
const fn = source.slice(start, source.indexOf('\nexport default'))
const { cubicBezier, ease, rawExpansionAt, layerExpansion } = new Function(`${fn}; return { cubicBezier, ease, rawExpansionAt, layerExpansion }`)()
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-8, message)
for (const [progress, expected] of [[-1,0],[0,0],[.15,0],[.375,.5],[.6,1],[.85,1],[.925,.5],[1,0],[2,0]]) {
  close(rawExpansionAt(progress), expected, `raw phase ${progress}`)
}
for (let i=0; i<=1000; i++) {
  const p=i/1000, raw=rawExpansionAt(p)
  assert.ok(raw >= 0 && raw <= 1)
  if (p <= .15) assert.equal(raw, 0)
  if (p >= .6 && p <= .85) close(raw, 1, 'expanded plateau')
}
for (const mapping of [ease, ...Array.from({length:4}, (_,index) => raw => layerExpansion(raw,index))]) {
  close(mapping(0), 0, 'closed endpoint')
  close(mapping(1), 1, 'fully expanded endpoint')
  let previous=0
  for (let i=0; i<=1000; i++) {
    const value=mapping(i/1000)
    assert.ok(value >= 0 && value <= 1 && value >= previous-1e-12, 'eased values are bounded and monotonic')
    previous=value
  }
}
assert.ok(ease(.5) > .8 && ease(.5) < 1, 'ease-out: fast peel, soft settle')
assert.ok(ease(.25)>.25 && ease(.75)>.75 && ease(.98)<1, 'ease-out lands softly')
close(cubicBezier(0,0,1,1)(.25), .25, 'linear Bezier control points')
for (let i=0; i<=100; i++) {
  const raw=i/100
  for (let layer=1; layer<4; layer++) assert.ok(layerExpansion(raw,layer-1)>=layerExpansion(raw,layer), 'upper layers lead')
}
for (let layer=1; layer<4; layer++) assert.ok(layerExpansion(.5,layer-1)>layerExpansion(.5,layer), 'layers have distinct staggered expansion')
for (let layer=0; layer<4; layer++) {
  const sample=p=>Math.round(layerExpansion(rawExpansionAt(p),layer)*1e8)
  const forward=Array.from({length:101}, (_,i)=>sample(i/100))
  assert.deepEqual(Array.from({length:101}, (_,i)=>sample(1-i/100)), forward.toReversed(), 'reverse retraces the same scroll positions')
}
console.log('PPF raw phases, cubic easing, layer stagger, bounds and deterministic reverse PASS')

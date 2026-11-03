import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const component = readFileSync(new URL('../src/components/PPFScrollSequence.jsx', import.meta.url), 'utf8')
const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')

for (const marker of ['ppf-sequence-sticky', 'requestAnimationFrame', 'prefers-reduced-motion', 'PPF_SEQUENCE', 'new Image', 'drawImage', 'canvas']) {
  assert.match(component, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), marker)
}
assert.match(component, /window\.scrollY/)
assert.match(component, /frameIndex/)
assert.match(main, /<PPFScrollSequence\s*\/>/)
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
assert.match(styles, /\.ppf-sequence[^}]*background:#0b3154/)
assert.match(styles, /\.ppf-sequence-stage[^}]*width:100%/)
assert.match(styles, /\.ppf-sequence-inner[^}]*position:relative/)
assert.match(styles, /\.ppf-sequence-sticky\{[^}]*position:sticky/)
assert.match(component, /PPF_SEQUENCE\.forEach/)
assert.match(component, /ppf-sequence-copy--top/)
assert.match(styles, /\.ppf-sequence-copy--top[^}]*position:relative/)
assert.match(styles, /\.ppf-sequence-canvas[^}]*mix-blend-mode:screen/)
const polish = readFileSync(new URL('../src/polish.css', import.meta.url), 'utf8')
assert.match(polish, /\.ppf-sequence-inner[^}]*grid-template-columns:minmax\(0,5fr\) minmax\(0,7fr\)/)
assert.match(polish, /\.ppf-sequence-copy\.ppf-sequence-copy--top[^}]*position:relative; inset:auto[^}]*opacity:1; transform:none/)
assert.match(polish, /\.ppf-sequence-copy--top h2[^}]*color:white/)
assert.match(polish, /@media\(max-width:800px\)[\s\S]*?\.ppf-sequence-inner[^}]*grid-template-columns:1fr/)
assert.match(polish, /@media\(prefers-reduced-motion:reduce\)[^}]*\.ppf-sequence-track[^}]*height:auto/)

// Late loading frames must not replace the current still in reduced motion.
const images = []
const drawn = []
const MockImage = class { constructor() { images.push(this) } }
const preloadSource = component.slice(component.indexOf('function preloadFrame('), component.indexOf('export default'))
const preload = new Function('Image', 'PPF_SEQUENCE', 'drawFrame', `${preloadSource}; return preloadFrame`)(
  MockImage, Array.from({ length: 115 }, (_, index) => `frame-${index}`), (_, image) => drawn.push(image),
)
const frames = new Map()
const ready = { current: 70, callback() {} }
preload(0, frames, {}, ready)
preload(70, frames, {}, ready)
images[1].onload()
images[0].onload()
assert.deepEqual(drawn, [images[1]], 'late first frame must not overwrite static frame 70')
assert.equal(preload(70, frames, {}, ready), images[1], 'reuse cached images')
console.log('PPF scroll sequence structure PASS')

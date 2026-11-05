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
assert.match(polish, /\.ppf-sequence-inner[^}]*grid-template-columns:1fr/)
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

// Exercise the component's actual scroll update in both directions, including section boundaries.
const updateSource = component.slice(component.indexOf('    const update = () => {'), component.indexOf('    const onScroll ='))
let top = 900
let selectedFrame
let presence
const section = {
  offsetHeight: 2340,
  getBoundingClientRect: () => ({ top, bottom: top + 2340 }),
  style: { setProperty: (_, value) => { presence = value } },
}
const viewport = { innerHeight: 900, scrollY: 0 }
const update = new Function('sectionRef', 'window', 'PPF_SEQUENCE', 'setFrameIndex', `
  const rafRef = {}, readyRef = { current: {} }, frameRef = { current: 0 }, frames = new Map(), canvas = {};
  const preloadFrame = () => {}, drawFrame = () => {}, setProgress = () => {};
  ${updateSource}; return update;
`)({ current: section }, viewport, Array(115), frame => { selectedFrame = frame })
for (const [position, expectedFrame, expectedPresence] of [
  [900, 0, 0], [450, 0, .5], [0, 0, 1], [-720, 57, 1],
  [-1440, 114, 1], [-1890, 114, .5], [-2340, 114, 0], [0, 0, 1],
]) {
  top = position
  update()
  assert.equal(selectedFrame, expectedFrame, `frame at section top ${top}`)
  assert.equal(presence, expectedPresence, `transition at section top ${top}`)
}
console.log('PPF scroll frames, entry, exit and reverse traversal PASS')

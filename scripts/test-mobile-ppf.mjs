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
assert.match(component, /activeLoads < 4/)
assert.match(component, /ppf-sequence-copy--top/)
assert.match(styles, /\.ppf-sequence-copy--top[^}]*position:relative/)
assert.match(styles, /\.ppf-sequence-canvas[^}]*mix-blend-mode:screen/)
const polish = readFileSync(new URL('../src/polish.css', import.meta.url), 'utf8')
assert.match(polish, /\.ppf-sequence-inner[^}]*grid-template-columns:1fr/)
assert.match(polish, /\.ppf-sequence-copy\.ppf-sequence-copy--top[^}]*position:relative; inset:auto[^}]*opacity:1; transform:none/)
assert.match(polish, /\.ppf-sequence-copy--top h2[^}]*color:white/)
assert.match(polish, /@media\(max-width:800px\)[\s\S]*?\.ppf-sequence-inner[^}]*grid-template-columns:1fr/)
assert.match(polish, /@media\(prefers-reduced-motion:reduce\)[^}]*\.ppf-sequence-track[^}]*height:auto/)

// Desktop polish must not leak into the production canvas sequence.
assert.match(polish, /\.ppf-sequence \{ background-color:var\(--colour-navy\); background-image:radial-gradient/)
assert.match(polish, /\.ppf-sequence::before \{ background:repeating-linear-gradient/)
assert.doesNotMatch(polish, /\.ppf-sequence:not\(\.ppf-sequence-mobile\)/)
assert.match(polish, /\.ppf-sequence-desktop \.ppf-sequence-inner \{[^}]*grid-template-columns:minmax/)
for (const rule of polish.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (rule[1].trim() === '.ppf-sequence-sticky') assert.doesNotMatch(rule[2], /overflow:hidden|isolation:isolate/)
  if (rule[1].trim() === '.ppf-sequence-stage') assert.doesNotMatch(rule[2], /aspect-ratio:400 \/ 380|height:760px/)
}

// Run the actual effect with deterministic browser timing/loading boundaries.
const { PPF_SEQUENCE, introFrameAt, scrubFrameAt } = await import('../src/ppf-sequence.js')
const effect = component.slice(component.indexOf('    const canvas = canvasRef.current'), component.indexOf('\n  }, [])'))
function harness(reduced = false) {
  let now = 0, nextId = 0, shown = -1, intersection
  const callbacks = new Map(), images = [], events = new Map(), draws = []
  const motion = { matches: reduced, addEventListener() {}, removeEventListener() {} }
  const viewport = { innerHeight:1000, scrollY:0, devicePixelRatio:2,
    matchMedia: () => motion,
    addEventListener: (name, fn) => events.set(name, fn),
    removeEventListener: name => events.delete(name),
  }
  const canvas = { width:0, height:0,
    getBoundingClientRect: () => ({width:800,height:450}),
    getContext: () => ({clearRect() {}, drawImage: image => draws.push(image.src)}),
  }
  const section = { offsetHeight:2600, getBoundingClientRect: () => ({top:-viewport.scrollY}) }
  class Image {
    constructor() { images.push(this); this.complete = false; this.naturalWidth = 0 }
  }
  class IntersectionObserver {
    constructor(callback) { intersection = callback }
    observe() {} disconnect() {}
  }
  class ResizeObserver { observe() {} disconnect() {} }
  const cleanup = new Function('canvasRef','sectionRef','window','Image','IntersectionObserver','ResizeObserver',
    'requestAnimationFrame','cancelAnimationFrame','setFrameIndex','setProgress','PPF_SEQUENCE','introFrameAt','scrubFrameAt', effect)(
    {current:canvas},{current:section},viewport,Image,IntersectionObserver,ResizeObserver,
    fn => { callbacks.set(++nextId, fn); return nextId }, id => callbacks.delete(id),
    value => { shown = value }, () => {}, PPF_SEQUENCE,introFrameAt,scrubFrameAt)
  const loadAll = () => {
    for (let index = 0; index < images.length; index++) {
      const image = images[index]
      if (image.complete) continue
      image.complete = true; image.naturalWidth = 1920; image.naturalHeight = 1080
      image.onload?.()
    }
  }
  const advance = duration => {
    for (let elapsed = 0; elapsed < duration; elapsed += 10) {
      now += 10
      const pending = [...callbacks.values()]; callbacks.clear()
      pending.forEach(callback => callback(now))
    }
  }
  return {canvas,images,draws,callbacks,cleanup,loadAll,advance,
    frame: () => shown,
    enter: () => intersection([{isIntersecting:true}]),
    scroll: progress => { viewport.scrollY = progress * 1600; events.get('scroll')?.() },
  }
}
const playback = harness()
assert.equal(playback.images.length,4,'bounded progressive loading')
playback.enter(); playback.advance(1000)
assert.equal(playback.frame(),-1,'buffering does not advance over undecoded frames')
playback.loadAll(); playback.advance(1000)
assert.ok(playback.frame() >= 29 && playback.frame() <= 30)
playback.advance(1600)
assert.equal(playback.frame(),73)
assert.equal(playback.callbacks.size,0,'idle intro endpoint does not spin RAF')
for (const [position,frame] of [[.5,94],[1,114],[.5,94],[0,73]]) {
  playback.scroll(position); playback.advance(1500); assert.equal(playback.frame(),frame)
}
assert.equal(playback.canvas.width,1600)
assert.equal(playback.canvas.height,900)
playback.cleanup(); assert.equal(playback.callbacks.size,0)
const late = harness()
late.loadAll(); late.enter(); late.scroll(1); late.advance(4000)
assert.equal(late.frame(),73,'late intro completion cannot autoplay the tail')
late.scroll(.5); late.advance(100)
late.scroll(1); late.advance(1500)
assert.equal(late.frame(),114,'scrolling back and forward re-arms the endpoint')
late.cleanup()
const reduced = harness(true)
assert.deepEqual(reduced.images.map(image => image.src),[PPF_SEQUENCE[114]])
reduced.loadAll(); reduced.advance(100)
assert.equal(reduced.frame(),114)
assert.equal(reduced.callbacks.size,0)
reduced.cleanup()
console.log('PPF component buffering, intro, handoff, reverse, DPR, reduced motion and cleanup PASS')

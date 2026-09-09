import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const componentUrl = new URL('../src/components/PrintableWrapViewer.jsx', import.meta.url)
assert.ok(existsSync(componentUrl), 'printable wrap needs its own viewer component')

const source = readFileSync(componentUrl, 'utf8')

assert.match(source, /useGLTF\(CYBERTRUCK_MODEL_PATH\)/,
  'the printable viewer must load the shared Cybertruck GLB')
assert.match(source, /createPrintableWrapInstance\(scene, grain\)/,
  'the cached GLB must be cloned through the printable scene factory')
assert.match(source, /const model = useMemo\([\s\S]*?\}, \[scene, grain\]\)/,
  'placement, finish and artwork changes must not rebuild the GLB instance')

assert.match(source, /new THREE\.TextureLoader\(\)/,
  'artwork must be decoded by Three TextureLoader')
assert.match(source, /onArtworkStatusChange\?\.\(\{ status: 'loading', url: artworkUrl \}\)/,
  'the viewer must report loading before TextureLoader begins decoding')
assert.match(source, /onArtworkStatusChange\?\.\(\{ status: 'ready', url: artworkUrl \}\)/,
  'the viewer must report ready only from TextureLoader success')
assert.match(source, /onArtworkStatusChange\?\.\(\{[\s\S]*?status: 'error',[\s\S]*?url: artworkUrl,[\s\S]*?message:/,
  'TextureLoader failure must be reported to the configurator')
assert.match(source, /texture\.colorSpace = THREE\.SRGBColorSpace/,
  'uploaded colour artwork must be sampled as sRGB')
assert.match(source, /model\.setArtwork\(texture\)/,
  'a decoded texture must be applied through the printable instance')
assert.match(source, /texture\.dispose\(\)/,
  'the viewer must release its owned GPU texture')
assert.match(source, /model\.setArtwork\(null\)/,
  'replacement and unmount cleanup must detach the old artwork')

assert.match(source, /model\.setPlacement\(placement\)/,
  'placement updates must flow into uniforms on the existing instance')
assert.match(source, /model\.setFinish\(finish\)/,
  'finish updates must flow into materials on the existing instance')
assert.match(source, /frameloop="demand"/,
  'the printable stage must render on demand')
assert.ok((source.match(/invalidate\(\)/g) ?? []).length >= 4,
  'camera, texture, placement and finish updates must invalidate demand rendering')

assert.match(source, /LEFT_SIDE_CAMERA_DIRECTION\s*=\s*new THREE\.Vector3\(1,\s*\.42,\s*\.18\)/,
  'the default camera must face the model from its +X printable left side')
assert.match(source, /enabled=\{editMode !== 'positionArtwork'\}/,
  'OrbitControls must be disabled while artwork positioning owns pointer input')
assert.match(source, /if \(editMode !== 'positionArtwork'\) return/,
  'rotate mode must leave pointer input to OrbitControls')
assert.match(source, /deltaX\s*\/\s*stageWidth/,
  'horizontal pointer deltas must be normalized to stage width')
assert.match(source, /deltaY\s*\/\s*stageHeight/,
  'vertical pointer deltas must be normalized to stage height')
assert.match(source, /stageWidth\s*=\s*Math\.max\(width, 1\)/,
  'a temporarily zero-width stage must not produce infinite placement')
assert.match(source, /stageHeight\s*=\s*Math\.max\(height, 1\)/,
  'a temporarily zero-height stage must not produce infinite placement')
assert.match(source, /onPlacementChange\(\{\s*x:\s*nextX,\s*y:\s*nextY\s*\}\)/,
  'pointer movement must callback position only, preserving slider-owned scale and rotation')
assert.match(source, /Math\.min\(1, Math\.max\(-1,/,
  'pointer placement must stay within the Task 1 bounds')
assert.match(source, /aria-label="Interactive printable Cybertruck wrap preview"/,
  'the Three.js stage needs an accessible name')
assert.match(source, /role="region"/,
  'the stage label must be exposed through a nameable landmark role')

console.log('Printable wrap viewer source contracts passed')

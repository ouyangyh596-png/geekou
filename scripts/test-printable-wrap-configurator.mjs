import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const readSource = relativePath => {
  const url = new URL(relativePath, import.meta.url)
  return existsSync(url) ? readFileSync(url, 'utf8') : ''
}

const main = readSource('../src/main.jsx')
const component = readSource('../src/components/PrintableWrapConfigurator.jsx')
const content = readSource('../src/content/site-content.js')
const styles = readSource('../src/polish.css')

assert.match(main, /React\.lazy\(\(\) => import\('\.\/components\/PrintableWrapConfigurator\.jsx'\)\)/,
  'the printable configurator must be lazy loaded')
assert.match(main, /const isPrintableChrome = activeSeries === 'Printable Super Glossy Chrome Wrap Film'/,
  'the printable configurator route must match the complete series name exactly')
assert.match(main, /\{isPrintableChrome && <PrintableWrapConfigurator \/>\}/,
  'the exact printable route must mount the configurator')
assert.match(main, /const isClassicColours = activeSeries === 'Super Chrome Film classic colours'/,
  'the classic-colours route must remain independently matched')

assert.ok(component, 'the printable configurator component must exist')
assert.match(component, /type="file"/)
assert.match(component, /accept="image\/png,image\/jpeg,image\/webp"/,
  'the local chooser must advertise only the supported artwork formats')
assert.match(component, /validateArtworkFile\(file\)/,
  'selected artwork must pass through the Task 1 validator')
assert.match(component, /URL\.createObjectURL\(file\)/,
  'accepted artwork must use a local object URL')
assert.ok((component.match(/URL\.revokeObjectURL\(/g) ?? []).length >= 2,
  'replacement/removal and unmount must revoke object URLs')
assert.doesNotMatch(component, /\b(?:fetch|XMLHttpRequest|FormData)\b/,
  'the configurator must not call network upload APIs')

assert.match(component, /value="glossy"/)
assert.match(component, /value="matte"/)
assert.match(component, /'positionArtwork'/)
assert.match(component, /'rotateVehicle'/)
assert.match(component, /type="range"[\s\S]*?min="0\.35"[\s\S]*?max="2\.5"/,
  'the scale control must expose the Task 1 bounds')
assert.match(component, /type="range"[\s\S]*?min="-180"[\s\S]*?max="180"/,
  'the rotation control must expose the Task 1 bounds')
assert.match(component, /updatePrintPlacement\(current, patch\)/,
  'viewer dragging and sliders must share bounded placement updates')
assert.match(component, /handleReset/)
assert.match(component, /handleRemove/)
assert.match(component, /role=\{error \? 'alert' : 'status'\}/,
  'upload validation feedback must be announced inline')
assert.match(component, /<PrintableWrapViewer[\s\S]*?artworkUrl=\{artworkUrl\}[\s\S]*?placement=\{placement\}[\s\S]*?finish=\{finish\}[\s\S]*?editMode=\{editMode\}/,
  'the configurator must pass pure state values to the viewer')

assert.match(content, /printableWrap:\s*\{/,
  'printable UI copy must live in the English content module')
assert.match(styles, /\.printable-wrap-config\s*\{[^}]*width:min\(1440px,calc\(100% - 72px\)\)/,
  'the configurator must reuse the 1440px section width')
assert.match(styles, /\.printable-wrap-layout\s*\{[^}]*display:grid[^}]*grid-template-columns:/,
  'desktop controls must sit beside the viewer')
assert.match(styles, /@media \(max-width: 800px\)[\s\S]*?\.printable-wrap-layout\s*\{[^}]*grid-template-columns:minmax\(0,1fr\)/,
  'mobile controls must stack below the viewer')
assert.match(styles, /\.printable-control[^}]*min-height:44px/,
  'interactive printable controls must meet the 44px touch target')
assert.match(styles, /\.printable-wrap-controls[^}]*grid-column:/,
  'controls must occupy a separate layout column outside the canvas')

console.log('Printable wrap configurator source contracts passed')

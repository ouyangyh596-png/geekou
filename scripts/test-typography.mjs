import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'

const css = readFileSync(new URL('../src/polish.css', import.meta.url), 'utf8')

for (const file of [
  'space-grotesk-latin.woff2',
  'manrope-latin.woff2',
  'dm-mono-regular-latin.woff2',
  'dm-mono-medium-latin.woff2',
]) {
  const path = new URL(`../public/fonts/${file}`, import.meta.url)
  assert.ok(existsSync(path) && statSync(path).size > 1000, `${file} must be a real local font`)
}

assert.match(css, /--font-display:\s*"Space Grotesk"/)
assert.match(css, /--font-text:\s*Manrope/)
assert.match(css, /--font-mono:\s*"DM Mono"/)
assert.equal((css.match(/font-display:\s*swap/g) || []).length, 4)

console.log('Typography asset and token checks passed')

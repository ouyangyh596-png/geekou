import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'

const css = readFileSync(new URL('../src/polish.css', import.meta.url), 'utf8')

for (const file of [
  'barlow-semi-condensed-500-latin.woff2',
  'barlow-semi-condensed-600-latin.woff2',
  'manrope-latin.woff2',
  'dm-mono-regular-latin.woff2',
  'dm-mono-medium-latin.woff2',
]) {
  const path = new URL(`../public/fonts/${file}`, import.meta.url)
  assert.ok(existsSync(path) && statSync(path).size > 1000, `${file} must be a real local font`)
}

assert.match(css, /--font-display:\s*"Barlow Semi Condensed"/)
assert.doesNotMatch(css, /--font-display:\s*"Space Grotesk"/)
assert.doesNotMatch(css, /font-family:\s*"Space Grotesk"/)
for (const weight of [500, 600]) {
  assert.match(css, new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*"Barlow Semi Condensed";[^}]*src:\\s*url\\("/fonts/barlow-semi-condensed-${weight}-latin\\.woff2"\\)[^}]*font-weight:\\s*${weight};[^}]*\\}`))
}
assert.match(css, /--font-text:\s*Manrope/)
assert.match(css, /--font-mono:\s*"DM Mono"/)
assert.equal((css.match(/font-display:\s*swap/g) || []).length, 5)
assert.match(css, /body,\s*\.home-page[^}]*font-family:\s*var\(--font-text\)/s)
assert.match(css, /h1,\s*h2,\s*h3,\s*h4[^}]*font-family:\s*var\(--font-display\)/s)
assert.match(css, /\.home-page h1,[^}]*font-family:\s*var\(--font-display\)/s)
assert.match(css, /\.kicker[^}]*font-family:\s*var\(--font-mono\)/s)
assert.match(css, /--font-serif:[^;]+Bodoni 72/)
assert.match(css, /\.landing h1 em[\s\S]*font-family:\s*var\(--font-serif\)/)
assert.match(css, /\.statement h2 \.company-title-years[^}]*font-family:\s*var\(--font-serif\)/s)

console.log('Typography asset, token and semantic mapping checks passed')

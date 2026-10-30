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

for (const token of [
  '--colour-navy:', '--colour-blue:', '--colour-ink:', '--colour-muted:',
  '--colour-paper:', '--colour-mist:', '--colour-line:',
  '--type-hero:', '--type-section:', '--type-card:', '--content-width:', '--page-gutter:',
]) assert.ok(css.includes(token), `${token} must be defined`)

assert.match(css, /h1,\s*h2,\s*h3,\s*h4[^}]*font-weight:\s*500;[^}]*letter-spacing:\s*-\.02em/)
assert.match(css, /body,\s*\.home-page[^}]*color:\s*var\(--colour-ink\);[^}]*background:\s*var\(--colour-paper\)/)

const globalTokens = css.match(/:root\s*\{([^}]+)\}/)[1]
for (const [token, value] of Object.entries({
  '--colour-navy': '#0b2f4d', '--colour-blue': '#0068c9', '--colour-ink': '#102f49',
  '--colour-muted': '#526f86', '--colour-paper': '#f8fbfd', '--colour-mist': '#eaf2f7',
  '--colour-line': '#cbdbe6', '--type-hero': 'clamp(72px, 6.7vw, 96px)',
  '--type-section': 'clamp(64px, 5.8vw, 84px)', '--type-card': 'clamp(22px, 2.2vw, 36px)',
  '--content-width': '1440px', '--page-gutter': 'clamp(36px, 5vw, 72px)',
})) assert.ok(globalTokens.includes(`${token}: ${value};`), `${token} must use the approved desktop value`)

const mobileTokens = css.match(/@media\s*\(max-width:\s*800px\)\s*\{\s*:root\s*\{([^}]+)\}/)?.[1] || ''
for (const [token, value] of Object.entries({
  '--type-hero': 'clamp(36px, 12vw, 50px)', '--type-section': 'clamp(38px, 12.5vw, 54px)',
  '--type-card': 'clamp(20px, 7vw, 30px)', '--page-gutter': '20px',
})) assert.ok(mobileTokens.includes(`${token}: ${value};`), `${token} must use the approved mobile value`)

// Inspect every applicable polish rule so a later legacy declaration cannot silently
// restore the old shared scale or compressed tracking after the token layer.
for (const [selector, token] of [
  ['.statement h2', '--type-section'], ['.showcase h2', '--type-section'],
  ['.technology h2', '--type-section'], ['.contact h2', '--type-section'],
  ['.tech-card h3', '--type-card'], ['.series-card h2', '--type-card'],
]) {
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) => selectors.split(',').some(value => value.trim() === selector))
  assert.ok(rules.length, `${selector} must have a semantic scale`)
  for (const [, , declarations] of rules) {
    const size = declarations.match(/font-size:\s*([^;]+);/)
    if (size) assert.equal(size[1], `var(${token})`, `${selector} must retain its token scale in every polish rule`)
  }
}
assert.doesNotMatch(css, /letter-spacing:\s*-\.(?:0[4-9]|[1-9])\d*em/,
  'polish rules must not reintroduce extreme negative heading tracking')
assert.match(css, /\.landing h1 em[^}]*letter-spacing:\s*-\.035em;[^}]*line-height:\s*1;/s)
assert.match(css, /\.statement h2 \.company-title-years[^}]*letter-spacing:\s*-\.035em;[^}]*line-height:\s*1;/s)

// Read only the final non-home refinement layer. Existing legacy selector names
// are insufficient: require the semantic values that this task introduces.
const nonHome = css.split('/* Non-home typography and viewer-adjacent contrast. */')[1] || ''
const [nonHomeDesktop, nonHomeMobile = ''] = nonHome.split('@media (max-width: 800px)')
function declarationFor(source, selector, property) {
  const rules = [...source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) => selectors.split(',').some(value => value.trim() === selector))
  const declarations = rules.flatMap(([, , body]) => body.split(';'))
    .map(value => value.trim()).filter(value => value.startsWith(`${property}:`))
  return declarations.at(-1)?.slice(property.length + 1).trim()
}
function expectRole(source, selector, properties) {
  for (const [property, expected] of Object.entries(properties)) {
    assert.equal(declarationFor(source, selector, property), expected,
      `${selector} must use ${property}: ${expected} in the final non-home layer`)
  }
}
for (const selector of ['.category-page h1', '.detail-hero h1', '.detail-copy h1']) {
  expectRole(nonHomeDesktop, selector, {
    'font-family': 'var(--font-display)', 'font-size': 'clamp(56px, 6vw, 82px)',
    'line-height': '1.04', 'letter-spacing': '-.02em',
  })
  expectRole(nonHomeMobile, selector, { 'font-size': 'clamp(40px, 12vw, 54px)' })
}
for (const selector of ['.series-card h2', '.category-product h2', '.product-card h2']) {
  expectRole(nonHomeDesktop, selector, {
    'font-family': 'var(--font-display)', 'font-size': 'var(--type-card)',
    'line-height': '1.12', 'letter-spacing': '-.02em',
  })
}
for (const selector of [
  '.category-page-copy > p:not(.kicker)', '.detail-hero > div > p:last-child',
  '.detail-description', '.series-card p', '.category-product section p',
  '.cybertruck-config p:not(.kicker)', '.printable-wrap-heading > p',
]) expectRole(nonHomeDesktop, selector, {
  'font-family': 'var(--font-text)', 'max-width': 'min(62ch, 100%)',
  'font-size': 'clamp(14px, 1.2vw, 18px)', 'line-height': '1.75', 'color': 'var(--colour-muted)',
})
for (const selector of [
  '.category-index', '.series-card > span', '.category-page-media > span',
  '.category-product section small', '.detail-model', '.detail-label',
  '.product-spec-table-head', '.product-spec-table-row strong',
  '.cybertruck-picker-label', '.printable-control-group legend', '.printable-control-label',
  '.printable-sliders label', '.printable-sliders output',
]) expectRole(nonHomeDesktop, selector, { 'font-family': 'var(--font-mono)' })
expectRole(nonHomeDesktop, '.product-spec-table', {
  'font-family': 'var(--font-text)', 'font-size': '13px', 'line-height': '1.6',
  'border-color': 'color-mix(in srgb, var(--colour-line) 65%, transparent)',
})
for (const selector of ['.product-spec-table-head span', '.product-spec-table-row > *']) {
  expectRole(nonHomeDesktop, selector, {
    padding: '20px 16px', 'border-color': 'color-mix(in srgb, var(--colour-line) 65%, transparent)',
  })
  expectRole(nonHomeMobile, selector, { padding: '16px 12px' })
}
for (const selector of ['.cybertruck-config h2', '.printable-wrap-heading h2']) {
  expectRole(nonHomeDesktop, selector, {
    'font-family': 'var(--font-display)', 'font-size': 'clamp(38px, 4.5vw, 68px)',
    'line-height': '1.04', 'letter-spacing': '-.02em',
  })
  expectRole(nonHomeMobile, selector, { 'font-size': 'clamp(34px, 9vw, 48px)' })
}
for (const selector of [
  '.cybertruck-config button', '.cybertruck-config input', '.printable-wrap-controls button',
  '.printable-wrap-controls input', '.printable-upload-control', '.printable-finish-options label',
]) expectRole(nonHomeDesktop, selector, { 'font-family': 'var(--font-text)' })
expectRole(nonHomeDesktop, '.cybertruck-config h2 em', { color: 'var(--colour-blue)' })
expectRole(nonHomeDesktop, '.cybertruck-config .viewer-gesture-hint', {
  color: 'var(--colour-ink)', background: 'var(--colour-paper)',
})
expectRole(nonHomeDesktop, '.cybertruck-config .viewer-placeholder', {
  color: 'var(--colour-ink)', background: 'var(--colour-paper)',
})
expectRole(nonHomeDesktop, '.category-page .viewer-error', {
  color: 'var(--colour-paper)', background: 'var(--colour-navy)',
})
expectRole(nonHomeDesktop, '.category-page .viewer-error p', { color: 'var(--colour-paper) !important' })
for (const selector of ['.printable-upload-note', '.printable-control-help', '.cybertruck-picker-label span']) {
  expectRole(nonHomeDesktop, selector, { color: 'var(--colour-muted)' })
}

console.log('Typography asset, token and semantic mapping checks passed')

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')
const viewer = readFileSync(new URL('../src/components/CybertruckViewer.jsx', import.meta.url), 'utf8')
const polish = readFileSync(new URL('../src/polish.css', import.meta.url), 'utf8')
assert.ok(/<PreviewBoundary(?:\s[^>]*)?>\s*<React.Suspense/.test(main), 'lazy 3D download failures must not unmount the page')
assert.match(main, /<a ref=\{activeCardRef\} href=\{'#category=' \+ selectedCategory.slug\}/,
  'every family card offers a real product detail link');
assert.doesNotMatch(main, /const activeCard = <div className="stack-card stack-card-active"/,
  'card content must not nest another positioned active card')
assert.match(main, /content.company.titleLead.*content.company.titleEmphasis/,
  'company title must use localized segments without splitting English words')
assert.match(viewer, /cybertruck-drag-hint-dismissed/, 'drag hint dismissal must persist across visits')
assert.match(viewer, /onPointerDown=.*onPointerMove=/s, 'viewer must detect a real pointer drag')
assert.match(viewer, /viewer-gesture-hint/, 'viewer must render an animated drag affordance')
assert.match(polish, /\.cybertruck-viewer\s*{[^}]*background:\s*transparent/s,
  'detail viewer must not render the old dark background')
assert.match(polish, /@keyframes\s+viewer-gesture-drag/, 'drag affordance must animate')
assert.match(polish, /\.stack-card-content:not\(\.stack-card-content-interactive\) \.stack-card-copy/,
  'standard homepage cards must rebalance their copy after model pills are removed')
assert.match(polish, /\.product-gesture-hint\s*\{[^}]*position:\s*relative/s,
  'product gesture guidance occupies normal flow below the card')
assert.match(polish, /@keyframes\s+product-wheel-scroll/, 'desktop wheel guidance must animate')
assert.match(polish, /@keyframes\s+product-swipe/, 'mobile swipe guidance must animate')
assert.match(polish, /\.product-gesture-hint\.is-hidden\s*\{[^}]*opacity:\s*0/s,
  'gesture guidance hides after the first successful interaction')
assert.match(polish, /@media\s*\(max-width:\s*800px\)[\s\S]*?\.product-wheel-hint\s*\{[^}]*display:\s*none/s,
  'mobile layouts hide the desktop wheel cue')
assert.match(polish, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.product-wheel-icon i[^{]*\{[^}]*animation:\s*none\s*!important/s,
  'reduced motion disables product gesture animations')
console.log('Site polish regression checks passed')

assert.match(main, /<CybertruckViewer colour=\{selectedColour\}/, 'homepage retains the interactive car');
assert.match(main, /<a className="stack-cta" href=\{.*selectedCategory.slug/, 'Chrome has a detail link');
assert.match(polish, /animation:carousel-shuffle 650ms/, 'rounded cards keep shuffle motion');
assert.doesNotMatch(polish, /visibility:hidden; pointer-events:none/, 'stacked cards remain visible');
assert.match(viewer, /!ready && <div className="model-cover"/, 'preview remains until model ready');
assert.match(viewer, /enableZoom=\{false\}/, 'viewer cannot consume wheel for zoom');

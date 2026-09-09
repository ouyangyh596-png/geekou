import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')
const viewer = readFileSync(new URL('../src/components/CybertruckViewer.jsx', import.meta.url), 'utf8')
const polish = readFileSync(new URL('../src/polish.css', import.meta.url), 'utf8')
assert.ok(/<PreviewBoundary>\s*<React.Suspense/.test(main), 'lazy 3D download failures must not unmount the page')
assert.match(main, /<a[^>]+className="stack-cta"[^>]+href=|<a[^>]+href=[^>]+className="stack-cta"/,
  'interactive Car Wrap Film must offer a real Explore products link')
assert.doesNotMatch(main, /const activeCard = <div className="stack-card stack-card-active"/,
  'card content must not nest another positioned active card')
assert.match(main, /companyYearsUnit, , companyIndustry/,
  'company title must skip the existing of instead of dropping expertise')
assert.match(viewer, /cybertruck-drag-hint-dismissed/, 'drag hint dismissal must persist across visits')
assert.match(viewer, /onPointerDown=.*onPointerMove=/s, 'viewer must detect a real pointer drag')
assert.match(viewer, /viewer-gesture-hint/, 'viewer must render an animated drag affordance')
assert.match(polish, /\.cybertruck-viewer\s*{[^}]*background:\s*transparent/s,
  'detail viewer must not render the old dark background')
assert.match(polish, /@keyframes\s+viewer-gesture-drag/, 'drag affordance must animate')
assert.match(polish, /\.stack-card-content:not\(\.stack-card-content-interactive\) \.stack-card-copy/,
  'standard homepage cards must rebalance their copy after model pills are removed')
assert.match(polish, /\.product-gesture-hint\s*\{[^}]*position:\s*absolute/s,
  'product gesture guidance is anchored to the product selector')
assert.match(polish, /@keyframes\s+product-wheel-scroll/, 'desktop wheel guidance must animate')
assert.match(polish, /@keyframes\s+product-swipe/, 'mobile swipe guidance must animate')
assert.match(polish, /\.product-gesture-hint\.is-hidden\s*\{[^}]*opacity:\s*0/s,
  'gesture guidance hides after the first successful interaction')
assert.match(polish, /@media\s*\(max-width:\s*800px\)[\s\S]*?\.product-wheel-hint\s*\{[^}]*display:\s*none/s,
  'mobile layouts hide the desktop wheel cue')
assert.match(polish, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.product-wheel-icon i[^{]*\{[^}]*animation:\s*none\s*!important/s,
  'reduced motion disables product gesture animations')
console.log('Site polish regression checks passed')

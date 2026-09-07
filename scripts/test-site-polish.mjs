import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')
assert.ok(/<PreviewBoundary>\s*<React.Suspense/.test(main), 'lazy 3D download failures must not unmount the page')
assert.match(main, /<a[^>]+className="stack-cta"[^>]+href=|<a[^>]+href=[^>]+className="stack-cta"/,
  'interactive Car Wrap Film must offer a real Explore products link')
assert.doesNotMatch(main, /const activeCard = <div className="stack-card stack-card-active"/,
  'card content must not nest another positioned active card')
assert.match(main, /companyYearsUnit, , companyIndustry/,
  'company title must skip the existing of instead of dropping expertise')
console.log('Site polish regression checks passed')

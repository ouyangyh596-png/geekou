import assert from 'node:assert/strict'
import { englishSiteContent } from '../src/content/site-content.js'

const contentRecordKeys = new Set(['name', 'description'])
const forbiddenKeys = /^(?:dimensions?|duration|frame|frames|height|href|image|media|path|route|src|timing|url|width)$/i
const forbiddenValue = /(?:^\/|https?:\/\/|\.(?:avif|gif|jpe?g|mp4|png|svg|webm|webp)$)/i

function assertEditorSafeContent(value, location = 'englishSiteContent') {
  if (typeof value === 'string') {
    assert.ok(value.trim(), `${location} must be a non-empty string`)
    assert.doesNotMatch(value, forbiddenValue, `${location} must not contain a route, URL, or media path`)
    return
  }

  if (Array.isArray(value)) {
    assert.ok(value.length, `${location} must not be an empty array`)
    const containsStrings = value.every(item => typeof item === 'string')
    const containsCopyRecords = value.every(item => item && typeof item === 'object' && !Array.isArray(item))
    assert.ok(containsStrings || containsCopyRecords, `${location} must contain only strings or copy records`)
    value.forEach((item, index) => {
      if (containsCopyRecords) {
        assert.deepEqual(Object.keys(item).sort(), [...contentRecordKeys].sort(), `${location}[${index}] must contain only name and description`)
      }
      assertEditorSafeContent(item, `${location}[${index}]`)
    })
    return
  }

  assert.ok(value && typeof value === 'object', `${location} must be a string, array, or object`)
  for (const [key, item] of Object.entries(value)) {
    assert.doesNotMatch(key, forbiddenKeys, `${location}.${key} crosses the content-only boundary`)
    assertEditorSafeContent(item, `${location}.${key}`)
  }
}

const sections = ['navigation', 'home', 'technology', 'company', 'contact', 'categories', 'products', 'cybertruck']
assert.deepEqual(Object.keys(englishSiteContent), sections)
for (const section of sections) assert.ok(englishSiteContent[section], `Missing ${section}`)
for (const key of ['products', 'technology', 'company', 'contact', 'talk']) {
  assert.equal(typeof englishSiteContent.navigation[key], 'string')
  assert.ok(englishSiteContent.navigation[key].trim())
}
for (const slug of ['one-way-vision', 'self-adhesive-vinyl', 'translucent-film', 'ppf', 'car-wrapping', 'overlaminate', 'cold-lamination', 'wall-decals']) {
  assert.ok(englishSiteContent.categories[slug], `Missing category copy: ${slug}`)
}
assert.ok(englishSiteContent.home.heroTitle)
assert.ok(englishSiteContent.products.productLibrary)
assert.ok(englishSiteContent.cybertruck.title)
assert.deepEqual(englishSiteContent.home.ppfSequence, {
  presentationLabel: 'PPF product motion presentation',
  kicker: 'SO-FINE / PPF SYSTEM',
  titleLead: 'Protection',
  titleEmphasis: 'in motion.',
  description: 'Paint protection film engineered for clarity, resilience and a precise finish across every curve.',
  action: 'Explore PPF',
  canvasLabelPrefix: 'SO-FINE paint protection film rendering frame',
  progressLabelPrefix: 'Frame',
  progressLabelInfix: 'of'
})
assertEditorSafeContent(englishSiteContent)
console.log('English site content tests passed')

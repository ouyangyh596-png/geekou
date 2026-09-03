import assert from 'node:assert/strict'
import { englishSiteContent } from '../src/content/site-content.js'

const sections = ['navigation', 'home', 'technology', 'company', 'contact', 'categories', 'products', 'cybertruck']
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
console.log('English site content tests passed')

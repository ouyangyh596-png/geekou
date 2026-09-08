import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { brochureSeries } from '../src/brochure-data.js'
import { capabilities, companyProfile } from '../src/content/company.js'
import { englishSiteContent } from '../src/content/site-content.js'
import { copy } from '../src/language.js'

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
for (const slug of ['one-way-vision', 'self-adhesive-vinyl', 'translucent-film', 'ppf', 'car-wrapping', 'overlaminate', 'cold-lamination', 'wall-decals', 'decorative-film']) {
  assert.ok(englishSiteContent.categories[slug], `Missing category copy: ${slug}`)
}
assert.ok(englishSiteContent.home.heroTitle)
assert.ok(englishSiteContent.products.productLibrary)
assert.ok(englishSiteContent.cybertruck.title)
assert.equal(copy.en.products, englishSiteContent.navigation.products)
assert.equal(companyProfile.title, englishSiteContent.company.title)
assert.deepEqual(englishSiteContent.technology, {
  kicker: 'THE SO-FINE DIFFERENCE',
  title: 'Precision is\nthe foundation.',
  introduction: 'Every layer is considered — from selected raw materials to final inspection.',
  capabilities: [
    { name: 'Established in 2005', description: 'Two decades of focused experience in self-adhesive materials' },
    { name: 'R&D and Quality Control', description: 'Dedicated laboratory testing and well controlled production flow' },
    { name: 'Integrated Operation', description: 'Raw material handling, coating know-how, manufacturing, service' },
    { name: 'Application Expertise', description: 'Solutions for digital printing, signage and automotive detailing' }
  ]
})
assert.deepEqual(englishSiteContent.company.paragraphs, [
  'Established in 2005, SO-FINE has grown into an integrated group specializing in self-adhesive material handling, manufacturing, scientific research, sales and services.',
  'Our state-of-the-art production facilities with latest tchnology, well-equipped R&D laboratory and quality-control system, carefully selected domestic and imported raw materials, combined with entensive coating expertise to gurantee superior output for customers.',
  'Recognized as an Innovative Technology Enterprise, our teams remain committed to consistent quality and responsive service for signage and automotive-detailing industry.'
])
assert.equal(capabilities[2][1], englishSiteContent.technology.capabilities[2].name)
assert.equal(brochureSeries['car-wrapping'].displayName, englishSiteContent.categories['car-wrapping'].displayName)
assert.equal(
  englishSiteContent.categories['one-way-vision'].intro,
  'Perforated printable film is made with selected raw materials and optimal adhesive formulation for vehicle, retail and building-glass graphics. Highly printable, easy to apply and remove without residue.'
)
assert.deepEqual(
  englishSiteContent.categories['one-way-vision'].series,
  [
    { name: 'Monomeric PVC', description: 'Low initial tack for ease of application. Vibrant graphic visible from outside, clear outward view from the interior.' },
    { name: 'Polymeric PVC', description: 'Excellent dimensional stability, resistant to shrinkage and deformationfor long-term outdoor application.' },
    { name: 'Cast PVC', description: 'Highly-conformable flexible material for demanding application, available in dual color structure, white/white, white/black or black/black.' },
    { name: 'Perforated PET', description: 'PVC-free solution for long durability, environmentally friendly commitment. Available either with adhesive or without adhesive.' }
  ]
)
assert.equal(
  englishSiteContent.categories['self-adhesive-vinyl'].intro,
  'A range of self-adhesive vinyl with varied thicknesses, finishes, adhesive and liner configurations for large-format solvent, eco-solvent, UV and latex printing.'
)
assert.deepEqual(
  englishSiteContent.categories['self-adhesive-vinyl'].series,
  [
    { name: 'Monomeric PVC', description: 'Ideal choice for short-medium term and point-of-purchase promotional applications. Let your creation stunning!' },
    { name: 'Polymeric PVC', description: 'All-round choice for a multitude of long-term digital print applications. Specialized air-egress\u00a0(bubble-free) technology ensures easy installation and no more bubbles and wrinkles.' },
    { name: 'Super Transparent PVC Vinyl', description: 'Ultra clear film is perfect solution for graphic application on glass, makes your signage noticeably attractive while remains partially see-through.' },
    { name: 'Super Glossy PVC Vinyl', description: 'Looking for a substrate to shine your creation? The vinyl is with surface glossiness up to xx (60), makes the graphic more vivid and gives maximum visual appeal.' }
  ]
)
assert.equal(
  englishSiteContent.categories['translucent-film'].intro,
  'Translucent polymeric PVC film with saturated colour, excellent weathering resistance and coated with solvent-based pressure-sensitive adhesive for illuminated graphics.'
)
assert.deepEqual(englishSiteContent.categories['translucent-film'].series, [
  {
    name: 'SF6000 Series',
    description: 'Up to 2.22m width, the first seamless translucent film in the world, suitable for dry or wet application. 5-year outdoor weathering warranty.'
  },
  {
    name: 'SF9000 Series',
    description: 'Perforated translucent film with 20% perforation ratio, dual-color visual effect for day & night: different color appears under natural daylight and one color visible when backlit at night.'
  }
])
assert.equal(englishSiteContent.categories['translucent-film'].displayName, 'Translucent Film')
assert.equal(
  englishSiteContent.categories.ppf.intro,
  'Automotive protection and finish films designed for scratch resistance, easy cleaning and a refined surface appearance.'
)
assert.equal(
  englishSiteContent.categories.overlaminate.intro,
  'Cast and polymeric PVC overlaminate films with clear permanent adhesive and PET liner for printed-graphic protection.'
)
assert.equal(
  englishSiteContent.categories['cold-lamination'].intro,
  'Cold lamination films in monomeric PVC, polymeric PVC, PET and floor-lamination PVC constructions.'
)
assert.equal(
  englishSiteContent.categories['wall-decals'].intro,
  'Decorative self-adhesive wall-covering materials that conform around 90\u00b0 corners without lifting, provide a customized and unique touch to any space.'
)
assert.deepEqual(
  englishSiteContent.categories['wall-decals'].series,
  [
    { name: 'PVC-Coated Polyester Fabric', description: 'Universal ink compatible, 250gsm PVC-coated polyester fabric with textureed surface finish suitable for wall, floor and carpet application.' },
    { name: '100% Polyester', description: '115gsm printable polyester fabric with textile structure, high-tack removable adhesive, alternative to traditional paint, wall paper renovation.' }
  ]
)
assert.equal(
  englishSiteContent.categories['decorative-film'].intro,
  'High-performance self-adhesive vinyl designed for interior renovation, furniture upgrading, commercial space decoration and marine interior apaoplications.'
)
assert.deepEqual(englishSiteContent.categories['decorative-film'].series, [
  {
    name: 'Decorative Film',
    description: 'High-performance self-adhesive vinyl designed for interior renovation, furniture upgrading, commercial space decoration and marine interior apaoplications.'
  }
])
assert.deepEqual(
  brochureSeries['decorative-film'],
  {
    displayName: 'Decorative Film',
    eyebrow: 'SO-FINE / DECORATIVE FILM',
    intro: 'High-performance self-adhesive vinyl designed for interior renovation, furniture upgrading, commercial space decoration and marine interior apaoplications.',
    series: [[
      'Decorative Film',
      'High-performance self-adhesive vinyl designed for interior renovation, furniture upgrading, commercial space decoration and marine interior apaoplications.'
    ]]
  }
)

for (const modulePath of ['../src/language.js', '../src/content/company.js', '../src/brochure-data.js']) {
  const source = await readFile(new URL(modulePath, import.meta.url), 'utf8')
  assert.match(source, /import\s*{\s*englishSiteContent\s*}/, `${modulePath} must import centralized English copy`)
}
for (const [modulePath, inlineCopy] of [
  ['../src/main.jsx', ['SUPER CHROME FILM', 'Every layer is considered', 'Preview the finish across a Cybertruck surface']],
  ['../src/components/PPFScrollSequence.jsx', ['PPF product motion presentation', 'Paint protection film engineered for clarity']]
]) {
  const source = await readFile(new URL(modulePath, import.meta.url), 'utf8')
  assert.match(source, /import\s*{\s*englishSiteContent\s*}/, `${modulePath} must import centralized English copy`)
  for (const copyValue of inlineCopy) {
    assert.ok(!source.includes(copyValue), `${modulePath} must not contain inline English copy: ${copyValue}`)
  }
}
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

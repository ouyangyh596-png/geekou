import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { catalogProducts } from '../src/catalog.js'
import { brochureSeries } from '../src/brochure-data.js'

const expectedCatalogue = {
  'one-way-vision': [
    ['SF1413', 'Monomeric PVC'], ['SF1414', 'Monomeric PVC'], ['SF1912', 'Monomeric PVC'], ['SF1913', 'Monomeric PVC'], ['SF1914', 'Monomeric PVC'], ['SF1132', 'Monomeric PVC'], ['SF1133', 'Monomeric PVC'], ['SF1134', 'Monomeric PVC'], ['SF1974', 'Monomeric PVC'],
    ['SF1963', 'Polymeric PVC'], ['SF1964', 'Polymeric PVC'], ['SF1865', 'Polymeric PVC'], ['SF1994', 'Polymeric PVC'],
    ['SF1882', 'Cast PVC'], ['SF1883', 'Cast PVC'], ['SF1884', 'Cast PVC'], ['SF9927', 'Cast PVC'],
    ['SF1503', 'Perforated PET'], ['SF1513', 'Perforated PET'], ['SF1563', 'Perforated PET']
  ],
  'self-adhesive-vinyl': [
    ['SF2410', 'Monomeric PVC'], ['SF2413', 'Monomeric PVC'], ['SF2610', 'Monomeric PVC'], ['SF2611', 'Monomeric PVC'], ['SF2612', 'Monomeric PVC'], ['SF2616', 'Monomeric PVC'], ['SF2619', 'Monomeric PVC'], ['SF2622', 'Monomeric PVC'], ['SF2690', 'Monomeric PVC'], ['SF2643', 'Monomeric PVC'], ['SF2930', 'Monomeric PVC'],
    ['SF21602', 'Polymeric PVC'], ['SF21802', 'Polymeric PVC'], ['SF21102', 'Polymeric PVC'], ['SF29160', 'Polymeric PVC'],
    ['SF2900', 'Super Transparent PVC Vinyl'], ['SF2901', 'Super Transparent PVC Vinyl'],
    ['SF2800', 'Super Glossy PVC Vinyl'], ['SF2832', 'Super Glossy PVC Vinyl']
  ],
  'translucent-film': [['SF6000', 'SF6000 Series'], ...['SF-9010', 'SF-9011', 'SF-9012', 'SF-9013', 'SF-9014', 'SF-9015', 'SF-9016', 'SF-9017', 'SF-9019', 'SF-9020', 'SF-9021', 'SF-9023'].map(model => [model, 'SF9000 PERFORATED DUAL-COLOR FILM'])],
  ppf: [['AF1880', 'premium'], ['AF1850', 'premium'], ['AF1610', 'econo'], ['AF1650', 'econo']],
  'cast-wrap-vinyl': [
    ['SF5501', 'White Printable Film'], ['SF5511', 'White Printable Film'],
    ['SF5503', 'Ultra Clear Printable Film'], ['SF5513', 'Ultra Clear Printable Film'],
    ['SF9908', 'Reflective Printable Film'],
    ['SF5601', 'Overlaminate Film'], ['SF5602', 'Overlaminate Film'], ['SF5602-1', 'Overlaminate Film'], ['SF5603', 'Overlaminate Film'], ['SF5606', 'Overlaminate Film'], ['SF5609', 'Overlaminate Film']
  ],
  'polymeric-wrap-vinyl': [
    ['SF5505', 'White Printable Film'], ['SF5525', 'White Printable Film'],
    ['SF5604', 'Overlaminate Film'], ['SF5607', 'Overlaminate Film']
  ],
  'super-chrome-film': [
    ['AF-20521M', 'Super Chrome Film classic colours'],
    ['AF-20280M', 'Super Chrome Film classic colours'],
    ['AF-20100M', 'Super Chrome Film classic colours'],
    ['AF-20401M', 'Super Chrome Film classic colours'],
    ['AF-20850M', 'Super Chrome Film classic colours'],
    ['AF-20701M', 'Super Chrome Film classic colours'],
    ['AF-20801M', 'Super Chrome Film classic colours'],
    ['AF-20601M', 'Super Chrome Film classic colours'],
    ['AF-20403M', 'Super Chrome Film classic colours'],
    ['AF-20100G', 'Printable Super Chrome Film']
  ],
  'pvc-free-film': [['AF1831', 'PVC-Free Film'], ['AF1840', 'PVC-Free Film']],
  'cold-lamination': [
    ['SF3180', 'Monomeric PVC'], ['SF3181', 'Monomeric PVC'], ['SF3182', 'Monomeric PVC'],
    ['SF3300', 'Polymeric PVC'], ['SF3301', 'Polymeric PVC'], ['SF3200', 'PET'],
    ['SF3400', 'Floor Lamination PVC'], ['SF3410', 'Floor Lamination PVC']
  ],
  'wall-decals': [['SF4001', 'PVC-Coated Polyester Fabric'], ['SF4002', '100% Polyester']],
  'decorative-film': []
}

const expectedCategories = Object.keys(expectedCatalogue)
const bannedScrapedText = /Wholesale Factory|Site Map|--Language--|18px|admin@|Product Origin|Delivery Time|Supply Capacity/i

function assertCleanStrings(value, path) {
  if (typeof value === 'string') {
    assert.doesNotMatch(value, bannedScrapedText, `${path}: scraped text is not allowed`)
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => assertCleanStrings(item, `${path}[${index}]`))
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => assertCleanStrings(item, `${path}.${key}`))
  }
}

assert.deepEqual(Object.keys(brochureSeries), expectedCategories)
assert.deepEqual(
  Object.values(brochureSeries).map(series => series.displayName),
  [
    'One Way Vision Film',
    'Self-Adhesive Vinyl',
    'Translucent Film',
    'Paint Protection Film',
    'Cast Wrap Vinyl',
    'Polymeric Wrap Vinyl',
    'Super Chrome Film',
    'PVC-Free Film',
    'Cold Lamination Film',
    'Wall Decals SAV Materials',
    'Decorative Film'
  ],
  'Every brochure family must have its exact visible display name'
)
assert.equal(catalogProducts.length, 93, 'The brochure catalogue must contain exactly 93 models')
assert.deepEqual(
  [...new Set(catalogProducts.map(product => product.category))].sort(),
  expectedCategories.filter(category => expectedCatalogue[category].length > 0).sort(),
  'Every catalogue product must belong to one of the final product families'
)

for (const [category, expectedModels] of Object.entries(expectedCatalogue)) {
  const actualModels = catalogProducts
    .filter(product => product.category === category)
    .map(({ model, group }) => [model, group])
  assert.deepEqual(actualModels, expectedModels, `${category}: model sequence or group mapping differs from the brochure`)
}

const sf9927 = catalogProducts.find(product => product.model === 'SF9927')
assert.equal(sf9927.group, 'Cast PVC', 'SF9927 must appear under the Cast PVC series')
assert.equal(sf9927.specs.find(([label]) => label === 'Material')?.[1], 'Cast Reflective PVC', 'SF9927 displayed Material must remain Cast Reflective PVC')

const models = catalogProducts.map(product => product.model)
assert.equal(new Set(models).size, models.length, 'Every model must be unique')

for (const product of catalogProducts) {
  assert.ok(product.model && product.title && product.description && product.slug, `${product.model}: required string is missing`)
  assert.ok(product.specs.length > 0, `${product.model}: missing specifications`)
  assert.ok(product.specs.every(([label, value]) => label && value), `${product.model}: empty specification`)
  assert.match(product.image, /^\//, `${product.model}: image must be local and start with /`)
  assert.doesNotMatch(product.image, /^(?:https?:)?\/\/|hero-factory/i, `${product.model}: remote and hero-factory images are not allowed`)
  assert.ok(Array.isArray(product.gallery) && product.gallery.length > 0, `${product.model}: gallery must contain local assets`)
  assert.ok(product.gallery.every(image => /^\//.test(image) && !/^(?:https?:)?\/\/|hero-factory/i.test(image)), `${product.model}: invalid gallery image`)
  for (const image of [product.image, ...product.gallery]) {
    const assetPath = path.resolve('public', `.${image}`)
    assert.ok(assetPath.startsWith(`${path.resolve('public')}${path.sep}`), `${product.model}: image must remain inside public/`)
    assert.ok(fs.existsSync(assetPath), `${product.model}: image asset is missing: ${image}`)
  }
  assertCleanStrings(product, product.model)
}

assertCleanStrings(brochureSeries, 'brochureSeries')

const af1840 = catalogProducts.find(product => product.model === 'AF1840')
assert.ok(af1840, 'AF1840 is missing')
assert.ok(!af1840.specs.some(([label]) => label === 'Print compatibility'), 'AF1840 must not claim unsupported print compatibility')

const sf1503 = catalogProducts.find(product => product.model === 'SF1503')
assert.ok(sf1503, 'SF1503 is missing')
assert.ok(sf1503.specs.some(([label, value]) => label === 'Print compatibility' && value === 'SOL / ESOL / UV / Latex'), 'SF1503 must support SOL / ESOL / UV / Latex')

const perforatedPet = brochureSeries['one-way-vision'].series.find(([name]) => name === 'Perforated PET')
assert.ok(perforatedPet, 'Perforated PET series is missing')
assert.equal(
  perforatedPet[1],
  'PVC-free solution for long durability, environmentally friendly commitment. Available either with adhesive or without adhesive.',
  'Perforated PET must preserve the approved English copy'
)

const sf6000 = catalogProducts.find(product => product.model === 'SF6000')
assert.ok(sf6000, 'SF6000 is missing')
assert.deepEqual(sf6000.specs, [
  ['Film', 'Matte polymeric PVC'], ['SF6000 thickness', '3.2 mil (approx. 80 μm)'],
  ['Maximum width', '2.22 m'], ['SF6000 liner', '75 micron PET']
])
const sf9000 = catalogProducts.filter(product => product.group === 'SF9000 PERFORATED DUAL-COLOR FILM')
assert.equal(sf9000.length, 12)
for (const item of sf9000) assert.deepEqual(item.specs, [
  ['Film', 'Dual color polymeric PVC'], ['SF9000 thickness', '180 mic'],
  ['SF9000 perforation', '20%'], ['SF9000 liner', '140 gsm PE coated paper']
])
const printableChrome = catalogProducts.find(product => product.model === 'AF-20100G')
assert.equal(new Map(printableChrome.specs).get('Color'), 'Printable Super Glossy Chrome Wrap Film')
for (const key of ['Material', 'Thickness', 'Finish', 'Adhesive', 'Liner', 'Print compatibility']) {
  assert.ok(new Map(printableChrome.specs).get(key), `AF-20100G preserves ${key}`)
}

const expectedFallbacks = {
  SF6000: '/products/translucent-film-family.svg',
  AF1880: '/products/ppf-family.svg',
  AF1610: '/products/ppf-family.svg',
  AF1650: '/products/ppf-family.svg',
  AF1850: '/products/ppf-family.svg',
  SF5601: '/products/polymeric car wrapping film-1.jpg',
  SF5602: '/products/polymeric car wrapping film-1.jpg',
  SF5603: '/products/polymeric car wrapping film-1.jpg',
  SF5606: '/products/polymeric car wrapping film-1.jpg',
  SF5609: '/products/polymeric car wrapping film-1.jpg',
  SF5604: '/products/polymeric car wrapping film-1.jpg',
  SF5607: '/products/polymeric car wrapping film-1.jpg'
}

for (const [model, image] of Object.entries(expectedFallbacks)) {
  const product = catalogProducts.find(candidate => candidate.model === model)
  assert.equal(product?.image, image, `${model}: incorrect family fallback image`)
  assert.ok(fs.existsSync(new URL(`../public${image}`, import.meta.url)), `${model}: fallback asset is missing`)
}

console.log(`Validated ${catalogProducts.length} brochure-backed products.`)

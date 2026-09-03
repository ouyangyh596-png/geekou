import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { catalogProducts } from '../src/catalog.js'
import { brochureSeries } from '../src/brochure-data.js'

const expectedCatalogue = {
  'one-way-vision': [
    ['SF1413', 'Monomeric PVC'], ['SF1414', 'Monomeric PVC'], ['SF1912', 'Monomeric PVC'], ['SF1913', 'Monomeric PVC'], ['SF1914', 'Monomeric PVC'], ['SF1132', 'Monomeric PVC'], ['SF1133', 'Monomeric PVC'], ['SF1134', 'Monomeric PVC'], ['SF1974', 'Monomeric PVC'],
    ['SF1963', 'Polymeric PVC'], ['SF1964', 'Polymeric PVC'], ['SF1865', 'Polymeric PVC'], ['SF1994', 'Polymeric PVC'],
    ['SF1892', 'Cast PVC'], ['SF1893', 'Cast PVC'], ['SF1894', 'Cast PVC'],
    ['SF1503', 'Perforated PET'], ['SF1513', 'Perforated PET'], ['SF1563', 'Perforated PET']
  ],
  'self-adhesive-vinyl': [
    ['SF2410', 'Monomeric PVC'], ['SF2413', 'Monomeric PVC'], ['SF2610', 'Monomeric PVC'], ['SF2611', 'Monomeric PVC'], ['SF2612', 'Monomeric PVC'], ['SF2616', 'Monomeric PVC'], ['SF2619', 'Monomeric PVC'], ['SF2622', 'Monomeric PVC'], ['SF2690', 'Monomeric PVC'], ['SF2643', 'Monomeric PVC'], ['SF2930', 'Monomeric PVC'],
    ['SF21602', 'Polymeric PVC'], ['SF21802', 'Polymeric PVC'], ['SF21102', 'Polymeric PVC'], ['SF29160', 'Polymeric PVC'],
    ['SF2900', 'Super Transparent PVC Vinyl'], ['SF2901', 'Super Transparent PVC Vinyl'],
    ['SF2800', 'Super Glossy PVC Vinyl'], ['SF2832', 'Super Glossy PVC Vinyl']
  ],
  'translucent-film': [['SF6000', 'SF6000 Series']],
  ppf: [['AF1810', 'High-Clarity TPU Protection'], ['AF1850', 'High-Clarity TPU Protection']],
  'car-wrapping': [
    ['SF5501', 'Cast PVC Wrap Film'], ['SF5511', 'Cast PVC Wrap Film'], ['SF5503', 'Cast PVC Wrap Film'], ['SF5513', 'Cast PVC Wrap Film'], ['SF9908', 'Cast PVC Wrap Film'], ['AF50100G', 'Cast PVC Wrap Film'],
    ['SF5505', 'Polymeric PVC Wrap Film'], ['SF5525', 'Polymeric PVC Wrap Film'],
    ['AF1831', 'PVC-Free Film'], ['AF1840', 'PVC-Free Film'],
    ['AF-50202M', 'Classic Colours'], ['AF-50403M', 'Classic Colours'], ['AF-50880M', 'Classic Colours'], ['AF-50720M', 'Classic Colours'], ['AF-50800M', 'Classic Colours'], ['AF-50810M', 'Classic Colours'], ['AF-50280M', 'Classic Colours'], ['AF-50700M', 'Classic Colours'], ['AF-50521M', 'Classic Colours'], ['AF-50100M', 'Classic Colours'], ['AF-50601M', 'Classic Colours'], ['AF-50701M', 'Classic Colours'], ['AF-50405M', 'Classic Colours'], ['AF-50850M', 'Classic Colours']
  ],
  overlaminate: [
    ['SF5601', 'Cast PVC Overlaminate Film'], ['SF5602', 'Cast PVC Overlaminate Film'], ['SF5603', 'Cast PVC Overlaminate Film'], ['SF5606', 'Cast PVC Overlaminate Film'], ['SF5609', 'Cast PVC Overlaminate Film'],
    ['SF5604', 'Polymeric PVC Overlaminate Film'], ['SF5607', 'Polymeric PVC Overlaminate Film']
  ],
  'cold-lamination': [
    ['SF3180', 'Monomeric PVC'], ['SF3181', 'Monomeric PVC'], ['SF3182', 'Monomeric PVC'],
    ['SF3300', 'Polymeric PVC'], ['SF3301', 'Polymeric PVC'], ['SF3200', 'PET'],
    ['SF3400', 'Floor Lamination PVC'], ['SF3401', 'Floor Lamination PVC']
  ],
  'wall-decals': [['SF4001', 'PVC-Coated Polyester Fabric'], ['SF4002', '100% Polyester']]
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
    'Translucent Film - SF6000 Series',
    'Paint Protection Film',
    'Car Wrap Film',
    'Overlaminate Film',
    'Cold Lamination Film',
    'Wall Decals Self-Adhesive Material'
  ],
  'Every brochure family must have its exact visible display name'
)
assert.equal(catalogProducts.length, 82, 'The brochure catalogue must contain exactly 82 models')
assert.deepEqual(catalogProducts.map(product => product.category), expectedCategories.flatMap(category => expectedCatalogue[category].map(() => category)))

for (const [category, expectedModels] of Object.entries(expectedCatalogue)) {
  const actualModels = catalogProducts
    .filter(product => product.category === category)
    .map(({ model, group }) => [model, group])
  assert.deepEqual(actualModels, expectedModels, `${category}: model sequence or group mapping differs from the brochure`)
}

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
assert.match(perforatedPet[1], /30%/, 'Perforated PET must state its 30% ratio')
assert.doesNotMatch(perforatedPet[1], /20%/, 'Perforated PET must not claim a 20% ratio')

const sf6000 = catalogProducts.find(product => product.model === 'SF6000')
assert.ok(sf6000, 'SF6000 is missing')
for (const [label, value] of [
  ['Face thickness without adhesive', '80 µm (ISO 534-80)'],
  ['Face thickness with adhesive', '100 µm (ISO 534-80)'],
  ['Release liner', '75 µm matte PET (ISO 534-80)'],
  ['Features', '2.22 m seamless width'],
  ['Features', 'High release power; no curling'],
  ['Features', 'Five-year outdoor weathering warranty'],
  ['Features', 'High strength and tear resistance; mildew and UV resistance'],
  ['Features', 'Vibrant high-saturation color; low day/night color variation']
]) {
  assert.ok(sf6000.specs.some(([actualLabel, actualValue]) => actualLabel === label && actualValue === value), `SF6000: missing ${label} - ${value}`)
}

const expectedFallbacks = {
  SF6000: '/products/translucent-film-family.svg',
  AF1810: '/products/ppf-family.svg',
  AF1850: '/products/ppf-family.svg',
  SF5601: '/products/overlaminate-family.svg',
  SF5602: '/products/overlaminate-family.svg',
  SF5603: '/products/overlaminate-family.svg',
  SF5606: '/products/overlaminate-family.svg',
  SF5609: '/products/overlaminate-family.svg',
  SF5604: '/products/overlaminate-family.svg',
  SF5607: '/products/overlaminate-family.svg'
}

for (const [model, image] of Object.entries(expectedFallbacks)) {
  const product = catalogProducts.find(candidate => candidate.model === model)
  assert.equal(product?.image, image, `${model}: incorrect family fallback image`)
  assert.ok(fs.existsSync(new URL(`../public${image}`, import.meta.url)), `${model}: fallback asset is missing`)
}

console.log(`Validated ${catalogProducts.length} brochure-backed products.`)

const images = {
  'one-way-vision': '/products/sf1413-1.jpg',
  'self-adhesive-vinyl': '/products/sf2410-1.jpg',
  'translucent-film': '/products/translucent-film-family.svg',
  ppf: '/products/ppf-family.svg',
  'car-wrapping': '/products/polymeric car wrapping film-1.jpg',
  overlaminate: '/products/overlaminate-family.svg',
  'cold-lamination': '/products/sf3180-1.jpg',
  'wall-decals': '/products/sf4001-1.jpg'
}

const modelImages = {
  SF1413: '/products/sf1413-1.jpg',
  SF1865: '/products/sf1865-1.jpg',
  SF1913: '/products/sf1913-1.jpg',
  SF1914: '/products/sf1914-1.jpg',
  SF2410: '/products/sf2410-1.jpg',
  SF2610: '/products/sf2610-1.jpg',
  SF3180: '/products/sf3180-1.jpg',
  SF3182: '/products/sf3182-1.jpg',
  SF3300: '/products/sf3300-1.jpg',
  SF3301: '/products/sf3301-1.jpg',
  SF4001: '/products/sf4001-1.jpg',
  SF4002: '/products/sf4002-1.jpg'
}

const familyTitles = {
  'one-way-vision': 'One Way Vision Film',
  'self-adhesive-vinyl': 'Self-Adhesive Vinyl',
  'translucent-film': 'Translucent Film',
  ppf: 'Paint Protection Film',
  'car-wrapping': 'Car Wrap Film',
  overlaminate: 'Overlaminate Film',
  'cold-lamination': 'Cold Lamination Film',
  'wall-decals': 'Wall Decals Self-Adhesive Material'
}

const familyDescriptions = {
  'one-way-vision': 'Perforated printable film for vehicle, retail and building-glass graphics.',
  'self-adhesive-vinyl': 'Self-adhesive vinyl for large-format digital printing applications.',
  'translucent-film': 'Translucent polymeric PVC film for illuminated graphics.',
  ppf: 'Automotive protection and finish film.',
  'car-wrapping': 'High-conformability vehicle wrap film.',
  overlaminate: 'Protective PVC overlaminate film for printed graphics.',
  'cold-lamination': 'Cold lamination film for graphic protection.',
  'wall-decals': 'Decorative self-adhesive material for interior surfaces.'
}

const compatible = 'SOL / ESOL / UV / Latex'
const solventCompatible = 'SOL / ESOL / UV'

function product(category, group, model, specs, options = {}) {
  const image = options.image ?? modelImages[model] ?? images[category]
  return {
    family: familyTitles[category], category, group, model,
    title: options.title ?? familyTitles[category],
    description: options.description ?? familyDescriptions[category],
    image, gallery: [image], specs, slug: model.toLowerCase()
  }
}

function oneWay(model, group, thickness, adhesive, liner, ratio, hole, printCompatibility = compatible) {
  return product('one-way-vision', group, model, [
    ['Material', group], ['Thickness', thickness], ['Adhesive', adhesive], ['Liner', liner],
    ['Perforation ratio', ratio], ['Hole size', hole], ['Print compatibility', printCompatibility]
  ])
}

function vinyl(model, group, thickness, finish, adhesive, liner, printCompatibility = compatible) {
  return product('self-adhesive-vinyl', group, model, [
    ['Material', group], ['Thickness', thickness], ['Finish', finish], ['Adhesive', adhesive],
    ['Liner', liner], ['Print compatibility', printCompatibility]
  ])
}

function wrap(model, group, thickness, finish, adhesive, liner, printCompatibility = compatible) {
  const specs = [
    ['Material', group], ['Thickness', thickness], ['Finish', finish], ['Adhesive', adhesive],
    ['Liner', liner]
  ]
  if (printCompatibility) specs.push(['Print compatibility', printCompatibility])
  return product('car-wrapping', group, model, specs)
}

function overlaminate(model, group, thickness, finish, adhesive, liner) {
  return product('overlaminate', group, model, [
    ['Material', group], ['Thickness', thickness], ['Finish', finish], ['Adhesive', adhesive], ['Liner', liner]
  ])
}

function coldLaminate(model, material, thickness, finish, adhesive, liner) {
  return product('cold-lamination', material, model, [
    ['Material', material], ['Thickness', thickness], ['Finish', finish], ['Adhesive', adhesive], ['Liner', liner]
  ])
}

export const catalogProducts = [
  oneWay('SF1413', 'Monomeric PVC', '140 µm', 'Transparent removable', 'Perforated paper laminated with paper liner', '30%', '1.5 mm', solventCompatible),
  oneWay('SF1414', 'Monomeric PVC', '160 µm', 'Transparent removable', 'Perforated paper laminated with paper liner', '40%', '1.5 mm'),
  oneWay('SF1912', 'Monomeric PVC', '160 µm', 'Transparent removable', 'Universal liner', '20%', '1.5 mm'),
  oneWay('SF1913', 'Monomeric PVC', '160 µm', 'Transparent removable', 'Universal liner', '30%', '1.5 mm'),
  oneWay('SF1914', 'Monomeric PVC', '160 µm', 'Transparent removable', 'Universal liner', '40%', '1.5 mm'),
  oneWay('SF1132', 'Monomeric PVC', '180 µm', 'Transparent removable', 'Universal liner', '20%', '1.5 mm'),
  oneWay('SF1133', 'Monomeric PVC', '180 µm', 'Transparent removable', 'Universal liner', '30%', '1.5 mm'),
  oneWay('SF1134', 'Monomeric PVC', '180 µm', 'Transparent removable', 'Universal liner', '40%', '1.5 mm'),
  oneWay('SF1974', 'Monomeric PVC', '180 µm', 'Transparent removable', 'Universal liner', '40%', '1.0 mm'),
  oneWay('SF1963', 'Polymeric PVC', '140 µm', 'Transparent removable', 'Universal liner', '30%', '1.5 mm'),
  oneWay('SF1964', 'Polymeric PVC', '160 µm', 'Transparent removable', 'Universal liner', '40%', '1.5 mm'),
  oneWay('SF1865', 'Polymeric PVC', '160 µm', 'Transparent removable', 'Universal liner', '50%', '2.0 mm'),
  oneWay('SF1994', 'Polymeric PVC', '180 µm', 'Transparent removable', 'Universal liner', '40%', '1.5 mm'),
  oneWay('SF1892', 'Cast PVC', '120 µm', 'Transparent removable', 'Universal liner', '20%', '1.5 mm'),
  oneWay('SF1893', 'Cast PVC', '120 µm', 'Transparent removable', 'Universal liner', '30%', '1.5 mm'),
  oneWay('SF1894', 'Cast PVC', '120 µm', 'Transparent removable', 'Universal liner', '40%', '1.5 mm'),
  oneWay('SF1503', 'Perforated PET', '100 µm', 'Transparent removable', 'One-side PE-coated liner', '30%', '1.5 mm'),
  oneWay('SF1513', 'Perforated PET', '100 µm', 'Transparent removable', 'Perforated paper laminated with PE-coated liner', '30%', '1.5 mm', solventCompatible),
  oneWay('SF1563', 'Perforated PET', '200 µm', 'N/A', '50 µm transparent PET', '30%', '1.5 mm'),

  vinyl('SF2410', 'Monomeric PVC', '80 µm', 'Glossy', 'Transparent permanent', 'PE-coated paper liner', solventCompatible),
  vinyl('SF2413', 'Monomeric PVC', '80 µm', 'Matte', 'Grey permanent', 'PE-coated paper liner', solventCompatible),
  vinyl('SF2610', 'Monomeric PVC', '100 µm', 'Glossy', 'Transparent permanent', 'PE-coated paper liner', solventCompatible),
  vinyl('SF2611', 'Monomeric PVC', '100 µm', 'Matte', 'Transparent permanent', 'PE-coated paper liner', solventCompatible),
  vinyl('SF2612', 'Monomeric PVC', '100 µm', 'Glossy', 'Grey permanent', 'PE-coated paper liner', solventCompatible),
  vinyl('SF2616', 'Monomeric PVC', '100 µm', 'Glossy', 'Transparent high tack', 'PE-coated paper liner', solventCompatible),
  vinyl('SF2619', 'Monomeric PVC', '100 µm', 'Matte', 'Grey high tack', 'PE-coated paper liner', solventCompatible),
  vinyl('SF2622', 'Monomeric PVC', '100 µm', 'Glossy', 'Grey permanent', 'Double PE-coated paper liner'),
  vinyl('SF2690', 'Monomeric PVC', '100 µm', 'Transparent glossy', 'Transparent permanent', 'PE-coated paper liner', solventCompatible),
  vinyl('SF2643', 'Monomeric PVC', '100 µm', 'Matte', 'Grey removable', 'Double PE-coated paper liner'),
  vinyl('SF2930', 'Monomeric PVC', '150 µm', 'Glossy', 'Transparent permanent', 'Embossed double PE-coated paper liner'),
  vinyl('SF21602', 'Polymeric PVC', '60 µm', 'Glossy', 'Grey removable', 'Embossed double PE-coated paper liner'),
  vinyl('SF21802', 'Polymeric PVC', '80 µm', 'Glossy', 'Grey removable', 'Embossed double PE-coated paper liner'),
  vinyl('SF21102', 'Polymeric PVC', '100 µm', 'Glossy', 'Grey removable', 'Embossed double PE-coated paper liner'),
  vinyl('SF29160', 'Polymeric PVC', '90 µm', 'High-opacity glossy', 'High-tack removable', 'Double PE-coated paper liner'),
  vinyl('SF2900', 'Super Transparent PVC Vinyl', '100 µm', 'Polymeric glossy', 'Transparent removable', 'PET liner'),
  vinyl('SF2901', 'Super Transparent PVC Vinyl', '100 µm', 'Monomeric', 'Transparent removable', 'PET liner'),
  vinyl('SF2800', 'Super Glossy PVC Vinyl', '100 µm', 'Super glossy', 'Transparent removable', 'Double PE-coated paper liner'),
  vinyl('SF2832', 'Super Glossy PVC Vinyl', '100 µm', 'Super glossy', 'Grey removable', 'Embossed double PE-coated paper liner'),

  product('translucent-film', 'SF6000 Series', 'SF6000', [
    ['Material', '3.2 mil polymeric PVC film'],
    ['Face thickness without adhesive', '80 µm (ISO 534-80)'], ['Face thickness with adhesive', '100 µm (ISO 534-80)'],
    ['Finish', 'Matte'], ['Adhesive', 'Solvent-based pressure-sensitive adhesive'], ['Release liner', '75 µm matte PET (ISO 534-80)'],
    ['Tensile strength (machine direction)', '>22 MPa (ISO 527)'], ['Elongation at break (machine direction)', '>150% (ISO 527)'],
    ['Shrinkage', '0.20 mm (FTM14)'], ['Initial adhesion on steel (20 minutes)', '8 N/25 mm (FTM1)'],
    ['Adhesion on steel (24 hours)', '9 N/25 mm (FTM1)'], ['Final adhesion on steel (72 hours)', '10 N/25 mm (FTM1)'],
    ['Minimum application temperature', '10 °C'], ['Service temperature', '-40 to +90 °C'],
    ['Humidity resistance', 'No effect (10 days exposure)'], ['Water resistance', 'No effect (24 hours immersion)'],
    ['Detergent (1% solution)', 'No effect (24 hours immersion)'], ['Isopropyl alcohol/water (20/80)', 'No effect (10 days exposure)'],
    ['Features', '2.22 m seamless width'], ['Features', 'High release power; no curling'], ['Features', 'Five-year outdoor weathering warranty'],
    ['Features', 'High strength and tear resistance; mildew and UV resistance'], ['Features', 'Vibrant high-saturation color; low day/night color variation'],
    ['Application', 'Illuminated graphics; dry or wet application']
  ]),

  product('ppf', 'High-Clarity TPU Protection', 'AF1810', [
    ['Material', 'High-clarity TPU protection film'],
    ['Application', 'Paint protection with scratch resistance, self-healing, corrosion resistance, easy cleaning and gloss enhancement']
  ], { description: 'High-clarity TPU paint-protection film with scratch resistance, self-healing and corrosion resistance.' }),
  product('ppf', 'High-Clarity TPU Protection', 'AF1850', [
    ['Material', 'High-clarity TPU protection film'],
    ['Application', 'Paint protection with scratch resistance, self-healing, corrosion resistance, easy cleaning and gloss enhancement']
  ], { description: 'High-clarity TPU paint-protection film with scratch resistance, self-healing and corrosion resistance.' }),

  wrap('SF5501', 'Cast PVC Wrap Film', '50 µm', 'Glossy', 'Light grey removable', 'Micro-embossed double PE-coated paper liner'),
  wrap('SF5511', 'Cast PVC Wrap Film', '50 µm', 'Glossy', 'Light grey removable', 'Micro-embossed PET liner'),
  wrap('SF5503', 'Cast PVC Wrap Film', '50 µm', 'Ultra-clear glossy', 'Transparent removable', 'Matte PET liner'),
  wrap('SF5513', 'Cast PVC Wrap Film', '50 µm', 'Ultra-clear glossy', 'Transparent removable', 'Micro-embossed PET liner'),
  wrap('SF9908', 'Cast PVC Wrap Film', '170 µm', 'Reflective film glossy', 'Transparent removable', 'Double PE-coated paper liner'),
  wrap('AF50100G', 'Cast PVC Wrap Film', '100 µm', 'Silver super glossy', 'Transparent removable', 'Matte PET liner'),
  wrap('SF5505', 'Polymeric PVC Wrap Film', '50 µm', 'Glossy', 'Light grey removable', 'Micro-embossed double PE-coated paper liner'),
  wrap('SF5525', 'Polymeric PVC Wrap Film', '60 µm', 'Glossy', 'Light grey removable', 'Embossed double PE-coated paper liner'),
  wrap('AF1831', 'PVC-Free Film', '50 µm', 'Glossy', 'Light grey removable', 'Embossed double PE-coated paper liner'),
  wrap('AF1840', 'PVC-Free Film', '50 µm', 'Glossy', 'Transparent removable', 'Matte PET liner', null),
  ...[
    ['AF-50202M', 'China Red'], ['AF-50403M', 'Maillard Copper'], ['AF-50880M', 'Purple Gold'],
    ['AF-50720M', 'Bluish Green'], ['AF-50800M', 'Bright Yellow'], ['AF-50810M', 'Glaze Yellow'],
    ['AF-50280M', 'Burgundy Red'], ['AF-50700M', 'Green'], ['AF-50521M', 'Twilight Purple'],
    ['AF-50100M', 'Silver'], ['AF-50601M', 'Dark Blue'], ['AF-50701M', 'Dark Green'],
    ['AF-50405M', 'Tungsten Steel'], ['AF-50850M', 'Rose Gold']
  ].map(([model, color]) => product('car-wrapping', 'Super Chrome Film Classic Colours', model, [['Color', color]], {
    title: color, description: `Classic ${color.toLowerCase()} car wrap film.`
  })),

  overlaminate('SF5601', 'Cast PVC Overlaminate Film', '50 µm', 'Glossy', 'Transparent permanent', 'Matte PET liner'),
  overlaminate('SF5602', 'Cast PVC Overlaminate Film', '50 µm', 'Matte', 'Transparent permanent', 'Matte PET liner'),
  overlaminate('SF5603', 'Cast PVC Overlaminate Film', '30 µm', 'Glossy', 'Transparent permanent', 'Matte PET liner'),
  overlaminate('SF5606', 'Cast PVC Overlaminate Film', '50 µm', 'Glossy self-healing', 'Transparent permanent', 'Matte PET liner'),
  overlaminate('SF5609', 'Cast PVC Overlaminate Film', '50 µm', 'Matte grainy textured', 'Transparent permanent', 'Matte PET liner'),
  overlaminate('SF5604', 'Polymeric PVC Overlaminate Film', '60 µm', 'Matte', 'Transparent permanent', 'Matte PET liner'),
  overlaminate('SF5607', 'Polymeric PVC Overlaminate Film', '60 µm', 'Super glossy', 'Transparent permanent', 'Matte PET liner'),

  coldLaminate('SF3180', 'Monomeric PVC', '70 µm', 'Glossy', 'Transparent permanent', 'PE-coated paper liner'),
  coldLaminate('SF3181', 'Monomeric PVC', '70 µm', 'Semi-matte', 'Transparent permanent', 'PE-coated paper liner'),
  coldLaminate('SF3182', 'Monomeric PVC', '70 µm', 'Matte', 'Transparent permanent', 'PE-coated paper liner'),
  coldLaminate('SF3300', 'Polymeric PVC', '60 µm', 'Glossy', 'Transparent permanent', 'PET liner'),
  coldLaminate('SF3301', 'Polymeric PVC', '60 µm', 'Matte', 'Transparent permanent', 'PET liner'),
  coldLaminate('SF3200', 'PET', '36 µm', 'Glossy', 'Transparent permanent', 'PET liner'),
  coldLaminate('SF3400', 'Floor Lamination PVC', '200 µm', 'Grainy textured', 'Transparent permanent', 'PE-coated paper liner'),
  coldLaminate('SF3401', 'Floor Lamination PVC', '100 µm', 'Grainy textured', 'Transparent permanent', 'PE-coated paper liner'),

  product('wall-decals', 'PVC-Coated Polyester Fabric', 'SF4001', [
    ['Material', 'PVC-coated polyester fabric'], ['Weight', '250 gsm'], ['Adhesive', 'High-tack removable'],
    ['Liner', 'Double PE-coated paper liner'], ['Print compatibility', compatible], ['Application', 'Walls, floors and carpets']
  ]),
  product('wall-decals', '100% Polyester', 'SF4002', [
    ['Material', '100% polyester'], ['Weight', '115 gsm'], ['Adhesive', 'High-tack removable'],
    ['Liner', 'Double PE-coated paper liner'], ['Print compatibility', compatible], ['Application', 'Decorative wall coverings']
  ])
]

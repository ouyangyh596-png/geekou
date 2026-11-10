import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { brochureSeries } from '../src/brochure-data.js';
import { catalogProducts } from '../src/catalog.js';
import { familyMedia } from '../src/media-manifest.js';
import { specificationValue, numericSpecificationColumns } from '../src/product-specs.js';

const main = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
const catalog = await readFile(new URL('../src/catalog.js', import.meta.url), 'utf8');

assert.match(catalog, /'decorative-film': '\/media\/families\/interior-wall-decals\.webp'/, 'catalog includes Decorative Film family image metadata');
assert.match(catalog, /'decorative-film': 'Decorative Film'/, 'catalog includes Decorative Film family title metadata');
assert.match(catalog, /'decorative-film': 'High-performance self-adhesive vinyl designed for interior renovation, furniture upgrading, commercial space decoration and marine interior apaoplications\.'/,
  'catalog includes the approved Decorative Film family description');
assert.deepEqual(familyMedia['decorative-film'], {
  hero: '/media/families/interior-wall-decals.webp',
  preview: '/media/families/interior-wall-decals.webp',
  alt: 'Interior bedroom with an installed botanical wall decal mural'
});
assert.equal(catalogProducts.some(product => product.category === 'decorative-film'), false, 'Decorative Film has no fabricated product record');

const decorativeFilmHash = '#category=decorative-film';
const decorativeFilmParams = new URLSearchParams(decorativeFilmHash.slice(1));
const decorativeFilmSlug = decorativeFilmParams.get('category');
const decorativeFilmInfo = brochureSeries[decorativeFilmSlug];
const decorativeFilmSeries = decorativeFilmParams.get('series') || (decorativeFilmInfo.series.length === 1 ? decorativeFilmInfo.series[0][0] : '');
const decorativeFilmItems = catalogProducts.filter(product => product.category === decorativeFilmSlug && (!decorativeFilmSeries || product.group === decorativeFilmSeries));

assert.equal(decorativeFilmSlug, 'decorative-film', 'Decorative Film hash resolves to its category slug');
assert.equal(decorativeFilmInfo.displayName, 'Decorative Film', 'Decorative Film route resolves its heading');
assert.equal(decorativeFilmInfo.intro, 'High-performance self-adhesive vinyl designed for interior renovation, furniture upgrading, commercial space decoration and marine interior apaoplications.', 'Decorative Film route resolves its approved copy');
assert.equal(familyMedia[decorativeFilmSlug].hero, '/media/families/interior-wall-decals.webp', 'Decorative Film route resolves its shared family image');
assert.equal(decorativeFilmSeries, 'Decorative Film', 'Decorative Film route selects its sole series');
assert.deepEqual(decorativeFilmItems, [], 'Decorative Film route has no product-table items');

assert.match(
  main,
  /const media = \{\.\.\.familyMedia\[category\.slug\], alt: content.mediaAlts\[category\.slug\]\};/,
  'CategoryPage reads its approved family media mapping'
);
const mediaComponent = await readFile(new URL('../src/components/CategoryMedia.jsx', import.meta.url), 'utf8');
assert.match(main, /<CategoryMedia key=\{category.slug\}/, 'media resets when category changes');
assert.match(mediaComponent, /if \(!source \|\| failed\) return null/, 'missing and failed media render no container');
assert.match(mediaComponent, /onError=\{\(\) => setFailed\(true\)\}/);
assert.match(
  main,
  /\{items\.length > 0 && <ProductTable items=\{items\} \/>\}/,
  'CategoryPage omits the product specification table when the selected series has no items'
);
assert.doesNotMatch(
  main,
  /href=\{'#product=' \+ item\.slug\}/,
  'product codes must not link to model detail pages'
);
assert.match(main, /<th scope="row">\{item\.model\}<\/th>/, 'product codes render as plain table text');
assert.doesNotMatch(main, /function Detail\(/, 'model detail content must be removed');
assert.doesNotMatch(main, /hash\.startsWith\('#product='\)/, 'model detail hash routes must be removed');
assert.match(main, /href="#products"/, 'the all-families hash link remains available');

assert.match(
  styles,
  /\.category-page-media\{[^}]*aspect-ratio:/,
  'category hero media reserves a stable aspect ratio'
);
assert.match(
  styles,
  /\.category-product>div\{[^}]*aspect-ratio:/,
  'product-grid media reserves a stable aspect ratio'
);
assert.match(
  styles,
  /@media\(max-width:800px\)\{[\s\S]*?\.category-page-media\{[^}]*aspect-ratio:/,
  'mobile category hero media uses a responsive aspect ratio'
);

const measurementRows = [
  { specs: [['Thickness', '50 µm'], ['Weight', '120 g/m²'], ['Temperature', '-40 to +90 °C'], ['Strength', '>22 MPa (ISO 527)'], ['Finish', 'Glossy']] },
  { specs: [['Thickness', '–'], ['Weight', '150 g/m²'], ['Temperature', '10 °C'], ['Strength', '24 MPa'], ['Finish', 'Matte']] }
];
assert.equal(specificationValue(measurementRows[1], 'Thickness'), 'N/A');
assert.equal(specificationValue(measurementRows[1], 'Missing'), 'N/A');
assert.equal(specificationValue({ specs: [['Empty', '  ']] }, 'Empty'), 'N/A');
assert.deepEqual([...numericSpecificationColumns(measurementRows, ['Thickness', 'Weight', 'Temperature', 'Strength', 'Finish', 'Missing'])], ['Thickness', 'Weight', 'Temperature', 'Strength']);
assert.match(catalog, /TODO:.*AF1810.*AF1850/, 'identical source specs remain marked for verified differences');
assert.deepEqual(catalogProducts.find(item => item.model === 'AF1810').specs, catalogProducts.find(item => item.model === 'AF1850').specs, 'no model differences are invented');

console.log('PASS: validated category media, source specs and numeric column formatting');

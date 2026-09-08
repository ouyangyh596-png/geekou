import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { brochureSeries } from '../src/brochure-data.js';
import { catalogProducts } from '../src/catalog.js';
import { familyMedia } from '../src/media-manifest.js';

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
  /const media = familyMedia\[category\.slug\];/,
  'CategoryPage reads its approved family media mapping'
);
assert.match(
  main,
  /className=\{'category-page-media category-page-media-' \+ category\.slug\}[\s\S]*?<img src=\{media\.hero\} alt=\{media\.alt\}/,
  'CategoryPage renders the mapped hero image with family alt text'
);
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
assert.match(main, /<strong>\{item\.model\}<\/strong>/, 'product codes render as plain table text');
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

console.log('PASS: validated category hero and product media semantics');

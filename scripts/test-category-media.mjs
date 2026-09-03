import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

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
  /<img src=\{product\.image\} alt=\{productImageAlt\(product, product\.image\)\} loading="lazy" decoding="async"/,
  'product-grid images use fallback-aware alt text and load efficiently'
);
assert.match(
  main,
  /alt=\{productImageAlt\(product, image, index\)\}/,
  'detail-gallery images use fallback-aware alt text'
);
assert.match(
  main,
  /href=\{'#product=' \+ product\.slug\}/,
  'product detail hash links remain available'
);
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

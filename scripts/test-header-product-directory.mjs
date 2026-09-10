import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { brochureSeries } from '../src/brochure-data.js';

const [main, styles] = await Promise.all([
  readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8')
]);

assert.match(main, /function ProductDirectory\(/, 'the header exposes a dedicated product directory component');
assert.equal(Object.keys(brochureSeries).length, 11, 'the directory source contains exactly eleven product families');
assert.match(main, /categories\.map\(category =>/, 'the directory is derived from the existing product-family data');
assert.match(main, /href=\{`#category=\$\{category\.slug\}`\}/, 'each directory entry routes directly to its category page');
assert.match(main, /className="product-nav-item"/, 'Products has a stable dropdown wrapper');
assert.match(styles, /\.product-directory/, 'the dropdown has scoped styles');
assert.match(styles, /\.product-nav-item:hover \.product-directory/, 'the dropdown opens when Products is hovered');
assert.match(styles, /\.product-nav-item:focus-within \.product-directory/, 'the dropdown opens for keyboard focus');
assert.match(styles, /@media\(max-width:800px\)\{\s*\.product-nav-item\{display:block\}\s*\.product-directory\{display:none/, 'the desktop dropdown is suppressed on mobile');
assert.match(styles, /\.nav-link::after/, 'the primary navigation underline is styled');
assert.match(styles, /\.header \.logo\{width:148px;height:148px\}/, 'the desktop brand mark has the enlarged display size');
assert.match(styles, /\.product-directory\{[^}]*border-radius:[^;}]+;[^}]*background:linear-gradient/, 'the dropdown uses a rounded layered card surface');
assert.match(styles, /\.product-directory-label\{[^}]*color:var\(--blue\)[^}]*font:[^;}]*12px/, 'the directory title is larger and uses the brand blue');
assert.match(styles, /\.product-directory ul\{[^}]*column-gap:[^;}]+;[^}]*row-gap:[^;}]+;[^}]*background:transparent/, 'the product grid uses open spacing instead of table separators');
assert.match(styles, /\.product-directory li\{[^}]*background:transparent/, 'directory cells do not look like table cells');
assert.match(styles, /\.product-directory a\{[^}]*color:var\(--blue\)/, 'every product family name uses the brand blue');
assert.match(styles, /\.product-directory a::before\{/, 'directory links provide a left accent on interaction');
assert.match(styles, /\.product-directory a:hover::before,\.product-directory a:focus-visible::before\{[^}]*transform:scaleY\(1\)/, 'the left blue accent appears on hover and keyboard focus');

console.log('PASS: header product directory contract is present');

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { brochureSeries } from '../src/brochure-data.js';

const [main, styles] = await Promise.all([
  readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8')
]);

assert.match(main, /function ProductDirectory\(/, 'the header exposes a dedicated product directory component');
assert.equal(Object.keys(brochureSeries).length, 9, 'the directory source contains exactly nine product families');
assert.match(main, /categories\.map\(category =>/, 'the directory is derived from the existing product-family data');
assert.match(main, /href=\{`#category=\$\{category\.slug\}`\}/, 'each directory entry routes directly to its category page');
assert.match(main, /className="product-nav-item"/, 'Products has a stable dropdown wrapper');
assert.match(styles, /\.product-directory/, 'the dropdown has scoped styles');
assert.match(styles, /\.product-nav-item:hover \.product-directory/, 'the dropdown opens when Products is hovered');
assert.match(styles, /\.product-nav-item:focus-within \.product-directory/, 'the dropdown opens for keyboard focus');
assert.match(styles, /@media\(max-width:800px\)\{\s*\.product-nav-item\{display:block\}\s*\.product-directory\{display:none/, 'the desktop dropdown is suppressed on mobile');
assert.match(styles, /\.nav-link::after/, 'the primary navigation underline is styled');

console.log('PASS: header product directory contract is present');

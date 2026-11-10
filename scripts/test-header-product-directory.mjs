import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { brochureSeries } from '../src/brochure-data.js';

const [main, styles, polish, picker] = await Promise.all([
  readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/polish.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/LanguagePicker.jsx', import.meta.url), 'utf8')
]);

assert.match(main, /function ProductDirectory\(/, 'the header exposes a dedicated product directory component');
assert.equal(Object.keys(brochureSeries).length, 11, 'the directory source contains exactly eleven product families');
assert.match(main, /categories\.map\(category =>/, 'the directory is derived from the existing product-family data');
assert.match(main, /href=\{`#category=\$\{category\.slug\}`\}/, 'each directory entry routes directly to its category page');
assert.match(main, /className="product-nav-item"/, 'Products has a stable dropdown wrapper');
assert.match(main, /<ChevronDown className="nav-chevron" size=\{14\} aria-hidden="true"\s*\/>/, 'Products carries an EFI-style downward chevron');
assert.match(styles, /\.product-directory/, 'the dropdown has scoped styles');
assert.match(styles, /\.product-nav-item:hover \.product-directory/, 'the dropdown opens when Products is hovered');
assert.match(styles, /\.product-nav-item:focus-within \.product-directory/, 'the dropdown opens for keyboard focus');
assert.match(styles, /@media\(max-width:800px\)\{\s*\.product-nav-item\{display:block\}\s*\.product-directory\{display:none/, 'the desktop dropdown is suppressed on mobile');
assert.match(styles, /\.nav-link::after/, 'the primary navigation underline is styled');
assert.match(polish, /\.header \.logo \{[^}]*width:112px/, 'the shared header uses the refreshed brand size');
assert.match(styles, /\.product-directory\{[^}]*border-radius:[^;}]+;[^}]*background:linear-gradient/, 'the dropdown uses a rounded layered card surface');
assert.match(styles, /\.product-directory-label\{[^}]*color:var\(--blue\)[^}]*font:[^;}]*12px/, 'the directory title is larger and uses the brand blue');
assert.match(styles, /\.product-directory ul\{[^}]*column-gap:[^;}]+;[^}]*row-gap:[^;}]+;[^}]*background:transparent/, 'the product grid uses open spacing instead of table separators');
assert.match(styles, /\.product-directory li\{[^}]*background:transparent/, 'directory cells do not look like table cells');
assert.match(styles, /\.product-directory a\{[^}]*color:var\(--blue\)/, 'every product family name uses the brand blue');
assert.match(styles, /\.product-directory a::before\{/, 'directory links provide a left accent on interaction');
assert.match(styles, /\.product-directory a:hover::before,\.product-directory a:focus-visible::before\{[^}]*transform:scaleY\(1\)/, 'the left blue accent appears on hover and keyboard focus');
assert.match(main, /<span className="product-directory-marker" aria-hidden="true"\s*\/>\{category\.name\}/, 'each product family name has a decorative directional marker');
assert.match(styles, /\.product-directory-marker\{[^}]*border-left:[^;}]*var\(--blue\)/, 'the product marker is a brand-blue right-pointing triangle');
assert.match(styles, /\.product-directory a:hover \.product-directory-marker,\.product-directory a:focus-visible \.product-directory-marker\{[^}]*transform:translateX\(/, 'the triangle reinforces the link direction on interaction');

const header = polish.split('/* Header:')[1].split('/* Hero */')[0];
assert.match(header, /\.header nav \{[^}]*gap:32px!important[^}]*font-size:15px!important/, 'navigation uses 15px type and 32px gaps');
assert.match(header, /\.header nav>\* \{[^}]*flex:0 0 auto/, 'legacy equal-width nav cells must not enlarge link spacing');
assert.match(header, /\.header \.nav-link \{[^}]*gap:6px/, 'Products keeps six pixels before its arrow');
assert.match(header, /\.header nav \{[^}]*height:auto/, 'navigation must fit inside the shared header height');
assert.match(header, /\.language-picker button \{[^}]*min-width:44px[^}]*min-height:48px/, 'toggle has touch-sized buttons');
assert.match(picker, /aria-pressed=\{code === lang\}/, 'active language is accessible');
assert.match(picker, /change\(code\)/, 'toggle updates language');
assert.doesNotMatch(picker, /<details|<summary/, 'no dropdown');
console.log('PASS: header product directory and refreshed language control contracts are present');

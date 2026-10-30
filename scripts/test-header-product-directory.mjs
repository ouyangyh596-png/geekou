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
assert.match(main, /<ChevronDown className="nav-chevron" size=\{14\} aria-hidden="true"\s*\/>/, 'Products carries an EFI-style downward chevron');
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
assert.match(main, /<span className="product-directory-marker" aria-hidden="true"\s*\/>\{category\.name\}/, 'each product family name has a decorative directional marker');
assert.match(styles, /\.product-directory-marker\{[^}]*border-left:[^;}]*var\(--blue\)/, 'the product marker is a brand-blue right-pointing triangle');
assert.match(styles, /\.product-directory a:hover \.product-directory-marker,\.product-directory a:focus-visible \.product-directory-marker\{[^}]*transform:translateX\(/, 'the triangle reinforces the link direction on interaction');

const efiHeader = styles.split('/* EFI-inspired two-tier header */')[1] || '';
assert.match(efiHeader, /grid-template-areas:\s*"brand \. actions"\s*"nav nav nav"/, 'desktop header uses a spacious two-tier structure');
assert.match(efiHeader, /\.header\{[^}]*background:#fff[^}]*border-bottom:/, 'the masthead uses a clean white surface and fine divider');
assert.match(efiHeader, /\.header nav\{[^}]*grid-area:nav[^}]*justify-content:space-between/, 'primary navigation forms the balanced lower row');
assert.match(efiHeader, /grid-template-columns:1fr auto 1fr/, 'the utility row uses equal outer columns for true symmetry');
assert.match(efiHeader, /\.header nav\{[^}]*justify-self:center[^}]*font-family:Manrope/, 'navigation is centered and uses the approved interface face');
assert.match(efiHeader, /\.header nav>\*\{[^}]*flex:1 1 0[^}]*justify-content:center/, 'all four primary navigation cells have equal width');
assert.match(efiHeader, /\.nav-chevron\{[^}]*transition:transform/, 'the product chevron has a polished motion treatment');
assert.match(efiHeader, /\.product-nav-item:hover \.nav-chevron,\.product-nav-item:focus-within \.nav-chevron\{[^}]*transform:rotate\(180deg\)/, 'the chevron rotates when the product menu opens');
assert.match(efiHeader, /\.header-actions\{[^}]*grid-area:actions/, 'language and contact controls sit in the upper utility row');
assert.match(efiHeader, /\.header-cta\{[^}]*border-radius:999px[^}]*background:var\(--blue\)/, 'contact action uses a rounded brand-blue capsule');
assert.match(efiHeader, /@media\(max-width:800px\)[\s\S]*\.header,\.landing \.header\{[^}]*background:#fff/, 'mobile retains the clean white masthead');

console.log('PASS: header product directory contract is present');

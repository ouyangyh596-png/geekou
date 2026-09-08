import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { englishSiteContent as content } from '../src/content/site-content.js';

const main = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

assert.match(
  main,
  /import\s*\{\s*familyMedia\s*,\s*homeMedia\s*\}\s*from\s*['"]\.\/media-manifest\.js['"];/,
  'the homepage imports the approved media manifest'
);

assert.match(main, /<video className="landing-video"[^>]*autoPlay muted loop playsInline/, 'the landing hero uses an autoplaying responsive video');
assert.match(main, /<source src="\/media\/home\/hero-factory\.mp4" type="video\/mp4" \/>/, 'the landing hero uses the local factory video');
assert.match(styles, /\.landing-image video\{[^}]*object-fit:cover/, 'the landing video fills the responsive hero without distortion');
assert.match(styles, /html:has\(\.home-page\)\{scroll-snap-type:none\}/, 'homepage scroll snapping is disabled');

assert.equal(content.home.heroTitle, 'SUPER CHROME FILM');
assert.match(main, /<div className="landing-brand-logos">[\s\S]*<h1 className="landing-title">\{content.home.heroTitle\}<\/h1>/, 'the visible hero lockup binds the brand title');
assert.equal(content.home.materialItems[1].description, 'Illuminated storefront light box and backlit window graphics at night');
assert.match(main, /homeMedia\.signage\} alt=\{content.home.materialItems\[1\].description\}/, 'the signage alt binds the installed illuminated scene');
assert.match(
  main,
  /homeMedia\.automotive\} alt=\{content.home.materialItems\[2\].description\}/,
  'the automotive tile alt describes the visible wrapped vehicle'
);
assert.match(
  main,
  /<span>\{content.home.materialItems\[2\].name\}<\/span>/,
  'the automotive tile label identifies the visible vehicle finish'
);
assert.match(main, /const \[selectedIndex, setSelectedIndex\] = useState\(0\);/, 'ProductShowcase owns the selected family index');
assert.match(main, /const selectedCategory = categories\[selectedIndex\];/, 'the selected category derives from the selected index');
assert.match(main, /const selectedMedia = familyMedia\[selectedCategory\.slug\];/, 'the selected family media derives from the selected category');
assert.doesNotMatch(main, /const selectedModels\s*=/, 'homepage cards must not calculate product model codes');
assert.match(main, /setSelectedIndex\(index => \(index \+ offset \+ categories\.length\) % categories\.length\)/, 'previous and next selection wraps around the category list');
assert.match(main, /className=\{'stack-selector' \+ \(isShuffling \? ' is-shuffling' : ''\)\}/, 'the stack selector exposes a shuffle state');
assert.match(main, /const handleTouchEnd = event =>/, 'mobile cards support horizontal swipe selection');
assert.match(main, /<div className="stack-controls">/, 'stack controls use the required class');
assert.match(main, /className="stack-card stack-card-prev"/, 'the previous family card is rendered');
assert.match(main, /className="stack-card stack-card-active"/, 'the active family card is rendered');
assert.match(main, /className="stack-card stack-card-next"/, 'the next family card is rendered');
assert.match(main, /<button type="button" aria-label=\{content.products.previousFamily\} onClick=\{\(\) => selectOffset\(-1\)\}>/, 'the previous control binds its accessible label');
assert.match(main, /<button type="button" aria-label=\{content.products.nextFamily\} onClick=\{\(\) => selectOffset\(1\)\}>/, 'the next control binds its accessible label');
assert.match(main, /<a href=\{'#category=' \+ selectedCategory\.slug\} className="stack-card stack-card-active" onClick=\{handleActiveClick\}>/, 'the active card remains the category navigation anchor');
assert.match(main, /key=\{selectedCategory\.slug\}/, 'active card content is keyed by the selected slug for entry animation');
assert.match(main, /<img src=\{selectedMedia\.preview\} alt=\{selectedMedia\.alt\} width="1200" height="800" loading="lazy" decoding="async" \/>/, 'the centre stage retains mapped selected media and alt text');
assert.match(main, /<span className="stack-index">\{String\(selectedIndex \+ 1\)\.padStart\(2, '0'\)\}<\/span>/, 'the active card shows the selected family index');
assert.match(main, /<strong>\{selectedCategory\.name\}<\/strong><small>\{selectedCategory\.description\}<\/small>/, 'the active card shows the selected name and description');
assert.doesNotMatch(main, /stack-model-list/, 'homepage cards must not render product model-code pills');
assert.match(main, /<span className="stack-cta">\{content.products.exploreProducts\} <ArrowUpRight size=\{20\} \/><\/span>/, 'the active card contains the explore CTA');
assert.match(main, /if \(event\.key === 'ArrowLeft'\) \{\s*event\.preventDefault\(\);\s*selectOffset\(-1\);\s*\} else if \(event\.key === 'ArrowRight'\) \{\s*event\.preventDefault\(\);\s*selectOffset\(1\);\s*\}/, 'only horizontal arrow keys are intercepted, leaving Enter centre-link navigation intact');
assert.doesNotMatch(main, /product-carousel/, 'the carousel implementation is completely removed');
assert.match(
  styles,
  /\.orbit-node\{[^}]*transition:transform 760ms cubic-bezier\(\.22,1,\.36,1\),opacity 420ms ease/,
  'normal-motion orbit nodes retain the exact required transform curve'
);
assert.match(
  styles,
  /\.orbit-node\[aria-pressed="true"\]\{[^}]*background:linear-gradient\([^}]*\)/,
  'the selected orbit node has a deep-blue gradient'
);
assert.match(styles, /\.orbit-node\[aria-pressed="true"\]\{[^}]*box-shadow:inset /, 'the selected orbit node has an inset highlight');
assert.match(styles, /\.orbit-node\[aria-pressed="true"\]\{[^}]*box-shadow:[^}]*,0 /, 'the selected orbit node has a layered shadow');
assert.match(styles, /\.orbit-node\[aria-pressed="true"\]\{[^}]*overflow:hidden/, 'the selected orbit node clips its sheen');
assert.match(styles, /\.orbit-node\[aria-pressed="true"\]\{[^}]*font-weight:[^}]*letter-spacing:/, 'the selected orbit node uses stronger readable typography');
assert.match(
  styles,
  /\.orbit-node\[aria-pressed="true"\]:after\{content:'';position:absolute;inset:1px;border-radius:inherit;background:linear-gradient\(115deg,transparent 28%,rgba\(255,255,255,\.42\) 48%,transparent 66%\);transform:translateX\(-130%\);animation:orbit-node-sheen 3\.8s cubic-bezier\(\.22,1,\.36,1\) infinite;pointer-events:none\}/,
  'the selected orbit node has the specified click-through sheen surface'
);
assert.match(styles, /@keyframes orbit-node-sheen\{[\s\S]*?transform:translateX\(130%\)/, 'the selected-node sheen has a sweep keyframe');
assert.match(
  styles,
  /@media\(prefers-reduced-motion:reduce\)\{[^}]*\.orbit-node\[aria-pressed="true"\]:after\{animation:none!important\}/,
  'reduced motion explicitly disables the selected-node sheen'
);

assert.match(
  main,
  /className="company-evidence[^>]*>[\s\S]*?<video className="company-evidence-video"[^>]*autoPlay muted playsInline[\s\S]*?factory-aerial\.mp4/,
  'the company section includes a non-looping factory video'
);
assert.match(
  main,
  /className="tech-card-lab-art"[^>]*aria-hidden="true"/,
  'laboratory SVG is hidden from assistive technology'
);

for (const anchor of ['products', 'technology', 'company', 'contact']) {
  assert.match(main, new RegExp(`id="${anchor}"`), `#${anchor} remains available`);
}

assert.match(
  styles,
  /@media\(max-width:600px\)\{[\s\S]*?\.landing-title\{font-size:clamp\(31px,9\.5vw,54px\)/,
  'the narrow mobile hero heading fits within its clipped landing container'
);

console.log('Validated homepage editorial media structure.');

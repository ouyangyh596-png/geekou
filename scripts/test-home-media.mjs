import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { englishSiteContent as content } from '../src/content/site-content.js';

const main = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
const polish = await readFile(new URL('../src/polish.css', import.meta.url), 'utf8');
const ppfSequence = await readFile(new URL('../src/components/PPFScrollSequence.jsx', import.meta.url), 'utf8');

assert.match(polish, /\.landing h1\.landing-title\s*\{[^}]*font-size:\s*var\(--type-hero\)/,
  'hero title uses the approved display scale');
assert.match(polish, /\.statement h2[^}]*font-size:\s*var\(--type-section\)/,
  'statement heading uses the section scale');
assert.match(polish, /\.landing h1\.landing-title\s*\{[^}]*background:\s*linear-gradient\(/,
  'chrome-film hero title keeps a controlled reflective gradient');

// Check the final homepage layer, so legacy declarations cannot satisfy these
// contracts while silently restoring old spacing, scale or muted colours.
const homepage = polish.split('/* Homepage hierarchy and rhythm. */')[1] || '';
const mobileStart = homepage.indexOf('@media (max-width: 800px)');
const desktop = homepage.slice(0, mobileStart);
const mobile = homepage.slice(mobileStart);
const declarationsFor = (source, selector) => [...source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, selectors]) => selectors.split(',').some(value => value.trim() === selector))
  .map(([, , declarations]) => declarations).join('\n');
for (const selector of [
  '.home-page .statement h2', '.home-page .showcase h2',
  '.home-page .technology h2', '.home-page .material-story h2', '.home-page .contact h2',
]) {
  const declarations = declarationsFor(desktop, selector);
  assert.match(declarations, /font-size:\s*var\(--type-section\)/, `${selector} uses the section scale`);
  assert.match(declarations, /line-height:\s*1\.02;/, `${selector} has readable heading leading`);
  assert.match(declarations, /white-space:\s*normal;/, `${selector} allows wrapping`);
  assert.doesNotMatch(declarationsFor(homepage, selector), /white-space:\s*nowrap/,
    `${selector} never forces a heading onto one line`);
}
const hero = declarationsFor(desktop, '.home-page .landing h1.landing-title');
assert.match(hero, /line-height:\s*1;/, 'hero has comfortable leading');
assert.match(hero, /letter-spacing:\s*-\.015em;/, 'hero uses restrained tracking');
assert.match(hero, /white-space:\s*normal;/, 'hero can wrap at every viewport');
assert.doesNotMatch(declarationsFor(homepage, '.home-page .landing h1.landing-title'), /white-space:\s*nowrap/,
  'hero refinement never forces the title onto one line');
for (const selector of [
  '.home-page .showcase h2 em', '.home-page .technology h2 em',
  '.home-page .material-story h2 em', '.home-page .contact h2 em',
]) assert.match(declarationsFor(desktop, selector), /color:\s*var\(--colour-blue\)/,
  `${selector} uses the dark blue accent on its light surface`);
for (const selector of ['.home-page .tech-card h3', '.home-page .stack-card-content strong']) {
  assert.match(declarationsFor(desktop, selector), /font-size:\s*var\(--type-card\)/,
    `${selector} uses the card scale`);
}
for (const selector of [
  '.home-page .company-layout .statement-copy p', '.home-page .showcase-head > p',
  '.home-page .tech-card p', '.home-page .contact .form-heading p',
]) {
  const declarations = declarationsFor(desktop, selector);
  assert.match(declarations, /max-width:\s*min\(62ch, 100%\)/, `${selector} limits reading length`);
  assert.match(declarations, /color:\s*var\(--colour-muted\)/, `${selector} uses accessible muted text`);
  assert.match(declarations, /font-size:\s*clamp\(14px,/, `${selector} never falls below 14px`);
}
for (const selector of [
  '.home-page .landing-copy', '.home-page .landing .header-inner', '.home-page .statement-inner',
  '.home-page .showcase-head', '.home-page .stack-selector', '.home-page .technology',
  '.home-page .material-story-head', '.home-page .material-story-grid', '.home-page .contact-inner',
]) assert.match(declarationsFor(desktop, selector), /width:\s*min\(var\(--content-width\), calc\(100% - 2 \* var\(--page-gutter\)\)\)/,
  `${selector} aligns to the shared content gutters`);
for (const selector of [
  '.home-page > .statement', '.home-page > .showcase', '.home-page > .technology',
  '.home-page > .material-story', '.home-page > .contact',
]) assert.match(declarationsFor(mobile, selector), /padding-block:\s*(?:8\d|9\d|10[0-4])px;/,
  `${selector} has 80–104px mobile section rhythm`);
assert.match(ppfSequence, /className="ppf-sequence-copy ppf-sequence-copy--top"[\s\S]*?<p>\{content\.description\}<\/p>/,
  'the PPF sequence renders supporting prose inside its top copy');
assert.match(declarationsFor(mobile, '.home-page .ppf-sequence-copy--top > p:not(.kicker)'), /font-size:\s*14px;/,
  'the rendered PPF supporting paragraph is at least 14px on mobile');

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
assert.match(main, /const nextIndex = \(selectedIndexRef\.current \+ offset \+ categories\.length\) % categories\.length;/, 'side-card and keyboard selection wraps around the category list');
assert.match(main, /className=\{'stack-selector' \+ \(isShuffling \? ' is-shuffling' : ''\)\}/, 'the stack selector exposes a shuffle state');
assert.match(main, /const handleTouchEnd = event =>/, 'mobile cards support horizontal swipe selection');
assert.match(main, /import \{ decideProductSwipe, decideProductWheel \} from '\.\/product-wheel-navigation\.js'/, 'the showcase imports boundary-aware gesture navigation');
assert.match(main, /addEventListener\('wheel', handleWheel, \{ passive: false \}\)/, 'desktop wheel handling can deliberately prevent vertical scrolling');
assert.match(main, /wheelDeltaRef\.current \+= event\.deltaY;/, 'small trackpad deltas accumulate into a deliberate gesture');
assert.match(main, /if \(shuffleBlockedRef\.current\) \{\s*wheelDeltaRef\.current = 0;/, 'wheel inertia is discarded while a transition is locked');
assert.match(main, /decideProductWheel\(\{ index: selectedIndexRef\.current, count: categories\.length, deltaY: wheelDeltaRef\.current, blocked: false \}\)/, 'wheel input uses the tested product-selection state machine');
assert.match(main, /const wheelTarget = activeCardRef\.current;/, 'desktop wheel activation is scoped to the active product card');
assert.match(main, /decideProductSwipe/, 'mobile gestures distinguish horizontal swipes from vertical scrolling');
assert.match(main, /setGestureHintDismissed\(true\)/, 'the interaction hint is dismissed after successful input');
assert.match(main, /className=\{'product-gesture-hint' \+ \(gestureHintDismissed \? ' is-hidden' : ''\)\}/, 'responsive gesture guidance exposes a dismissible state');
assert.match(main, /className="product-wheel-hint"/, 'desktop users receive a wheel hint');
assert.match(main, /className="product-swipe-hint"/, 'mobile users receive a horizontal swipe hint');
assert.doesNotMatch(main, /<div className="stack-controls">/, 'circular arrow controls are removed');
assert.match(main, /className="stack-card stack-card-prev"/, 'the previous family card is rendered');
assert.match(main, /className="stack-card stack-card-active"/, 'the active family card is rendered');
assert.match(main, /className="stack-card stack-card-next"/, 'the next family card is rendered');
assert.match(main, /<a ref=\{activeCardRef\} href=\{'#category=' \+ selectedCategory\.slug\} className="stack-card stack-card-active" onClick=\{handleActiveClick\}>/, 'the active card remains the category navigation anchor');
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

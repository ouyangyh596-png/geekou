import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const component = readFileSync('src/components/TvcShowcase.jsx', 'utf8');
const css = readFileSync('src/components/tvc-showcase.css', 'utf8');
const main = readFileSync('src/main.jsx', 'utf8');
for (const file of ['sofine-tvc-loop.webm', 'sofine-tvc-loop.mp4', 'sofine-tvc-loop-poster.jpg', 'sofine-tvc-full.mp4', 'sofine-tvc-full-poster.jpg']) {
  assert.ok(statSync(`public/media/tvc/${file}`).size > 1000, file);
  assert.ok(component.includes(file), `${file} must be connected`);
}
assert.doesNotMatch(component, /sofine-hero-(?:text|film)/);
assert.match(component, /autoPlay muted loop playsInline/);
assert.match(component, /allowMotion &&/);
assert.match(component, /min-width: 801px/);
assert.match(component, /prefers-reduced-motion: no-preference/);
assert.match(component, /addEventListener\('change'/);
assert.match(component, /showModal\(\)/);
assert.match(component, /\.play\(\)/);
assert.match(component, /\.pause\(\)/);
assert.match(component, /onCancel=/);
assert.match(component, /onClose=/);
assert.match(component, /controls playsInline/);
assert.match(component, /muted = false/);
assert.match(component, /document.body.style.overflow/);
assert.match(css, /100svh/);
assert.match(css, /linear-gradient/);
assert.ok(main.indexOf('<TvcShowcase') < main.indexOf('<section className="landing"'));
assert.match(main, /<PPFLayerAnimation/);
assert.match(main, /<ProductShowcase/);
console.log('TVC assets, playback policy, native modal and preserved section contracts passed');

const { englishSiteContent } = await import('../src/content/site-content.js');
assert.equal(englishSiteContent.home.tvc.title, 'Fine on Every Surface.');
assert.equal(englishSiteContent.home.tvc.subtitle, 'Films for cars, storefronts, signs and interiors: protect, restyle and refresh.');
assert.match(component, /className="tvc-brand"[^\n]*alt="SO-FINE"/);
assert.match(main, /<main className="home-page">\s*<Header \/>\s*<TvcShowcase/);
assert.equal(englishSiteContent.home.heroTitle, 'SUPER CHROME FILM');

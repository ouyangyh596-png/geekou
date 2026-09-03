import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brochureSeries as categories } from '../src/brochure-data.js';
import { familyMedia, homeMedia } from '../src/media-manifest.js';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicRoot = resolve(projectRoot, 'public');
const requiredHomeMedia = ['hero', 'materialDetail', 'signage', 'automotive', 'company'];
const reviewedFamilyAssets = {
  'one-way-vision': '/media/families/one-way-vision-window-application.webp',
  'self-adhesive-vinyl': '/media/families/self-adhesive-bus-graphics.webp',
  'translucent-film': '/media/families/translucent-lightbox-application.webp',
  ppf: '/media/families/paint-protection-film-layers.webp',
  'car-wrapping': '/media/families/car-wrapping-color-rolls.webp',
  overlaminate: '/media/families/overlaminate-protective-roll.webp',
  'cold-lamination': '/media/families/cold-lamination-film-roll.webp',
  'wall-decals': '/media/families/interior-wall-decals.webp'
};

function assertMediaFile(url, label) {
  assert.match(url, /^\/media\//, `${label} must use a /media/ URL`);

  const filePath = resolve(publicRoot, `.${url}`);
  assert.ok(filePath.startsWith(`${publicRoot}/`), `${label} must stay within public`);
  assert.ok(existsSync(filePath), `${label} must reference an existing file: ${url}`);

  const dimensions = spawnSync('sips', ['-g', 'pixelWidth', filePath], { encoding: 'utf8' });
  assert.equal(dimensions.status, 0, `${label} could not be inspected with sips`);
  const width = Number(dimensions.stdout.match(/pixelWidth: (\d+)/)?.[1]);
  assert.ok(width >= 1200, `${label} must be at least 1200px wide (received ${width}px)`);
}

function fileForMediaUrl(url) {
  return resolve(publicRoot, `.${url}`);
}

function assertDistinctMedia(first, second) {
  const firstHash = createHash('sha256').update(readFileSync(fileForMediaUrl(first.url))).digest('hex');
  const secondHash = createHash('sha256').update(readFileSync(fileForMediaUrl(second.url))).digest('hex');
  assert.notEqual(firstHash, secondHash, `${first.label} and ${second.label} must use distinct reviewed imagery`);
}

function mediaHash(url) {
  return createHash('sha256').update(readFileSync(fileForMediaUrl(url))).digest('hex');
}

assert.deepEqual(Object.keys(homeMedia).sort(), requiredHomeMedia.sort(), 'homeMedia must expose the complete homepage set');
for (const key of requiredHomeMedia) {
  assertMediaFile(homeMedia[key], `homeMedia.${key}`);
}

assert.equal(homeMedia.signage, '/media/home/illuminated-signage-application.webp', 'homepage signage must show an installed illuminated application');
assert.equal(homeMedia.automotive, '/media/home/automotive-wrapped-mclaren.webp', 'homepage automotive story must use the reviewed wrapped vehicle asset');
assert.equal(
  mediaHash(homeMedia.automotive),
  '5893082469aa6101365fc1bc188f7c9f17aa6a614662cebb7f1e6e45e1ba1453',
  'the reviewed wrapped vehicle must not be replaced without renewed semantic review'
);
assert.equal(homeMedia.company, '/media/home/production-equipment.webp', 'company evidence must show distinct production equipment');

for (const slug of Object.keys(categories)) {
  const entry = familyMedia[slug];
  assert.ok(entry, `familyMedia is missing ${slug}`);
  assert.equal(typeof entry.alt, 'string', `${slug} must have English alt text`);
  assert.ok(entry.alt.trim().length > 0, `${slug} alt text cannot be blank`);
  assert.equal(entry.hero, reviewedFamilyAssets[slug], `${slug} must use its reviewed category asset`);
  assert.equal(entry.preview, reviewedFamilyAssets[slug], `${slug} preview must use its reviewed category asset`);
  assertMediaFile(entry.hero, `${slug}.hero`);
  assertMediaFile(entry.preview, `${slug}.preview`);
}

assert.deepEqual(Object.keys(familyMedia).sort(), Object.keys(categories).sort(), 'familyMedia must map exactly the catalogue category slugs');
assertDistinctMedia(
  { label: 'One Way Vision', url: familyMedia['one-way-vision'].hero },
  { label: 'Wall Decals', url: familyMedia['wall-decals'].hero }
);
assertDistinctMedia(
  { label: 'Self-Adhesive Vinyl', url: familyMedia['self-adhesive-vinyl'].hero },
  { label: 'Translucent Film', url: familyMedia['translucent-film'].hero }
);
assertDistinctMedia(
  { label: 'Homepage automotive', url: homeMedia.automotive },
  { label: 'Car Wrapping Film', url: familyMedia['car-wrapping'].hero }
);
assertDistinctMedia(
  { label: 'Homepage hero', url: homeMedia.hero },
  { label: 'Company production evidence', url: homeMedia.company }
);
console.log(`PASS: validated ${Object.keys(categories).length} family mappings and ${requiredHomeMedia.length} homepage assets`);

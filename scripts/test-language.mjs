import assert from 'node:assert/strict'
import { copy, languageOptions } from '../src/language.js'

const componentKeys = [
  'products', 'technology', 'company', 'contact', 'talk',
  'productLibrary', 'choose', 'surface', 'start',
  'view', 'productDetail', 'specs', 'made', 'perform',
  'back', 'request', 'allFamilies'
]
const verifiedCompany = {
  companyKicker: 'SO-FINE / ESTABLISHED 2005',
  companyTitle: '20 years of industrial expertise.'
}

const resolve = (language, key) => copy[language]?.[key] ?? copy.en[key] ?? key

assert.equal(languageOptions.length, 12)
for (const [, language] of languageOptions) {
  for (const key of componentKeys) {
    assert.ok(resolve(language, key).trim(), `${language}:${key} is blank`)
  }
  assert.equal(resolve(language, 'companyKicker'), verifiedCompany.companyKicker)
  assert.equal(resolve(language, 'companyTitle'), verifiedCompany.companyTitle)
}

console.log(`Validated ${languageOptions.length} language options and ${componentKeys.length} component keys.`)

const { resolveContent } = await import('../src/language.js');
const { englishSiteContent } = await import('../src/content/site-content.js');
const { chineseSiteContent } = await import('../src/content/site-content.zh.js');
function verifyChinese(base, translated, path='content') {
  if(typeof base === 'string') { assert.equal(typeof translated,'string',path); assert.ok(translated.trim(),path); return; }
  for(const key of Object.keys(base)) verifyChinese(base[key],translated?.[key],`${path}.${key}`);
}
verifyChinese(englishSiteContent,chineseSiteContent);
for(const [,language] of languageOptions) {
 const resolved=resolveContent(language);
 assert.ok(resolved.home.heroSubtitle);
 assert.ok(resolved.contact.sendLabel);
}
assert.equal(resolveContent('zh').products.familyCountLabel,'个系列');
assert.equal(resolveContent('unknown').home.heroTitle,englishSiteContent.home.heroTitle);
assert.equal(resolveContent('zh',{x:'Fallback'},{x:''}).x,'Fallback');
assert.deepEqual(languageOptions.slice(8,11).map(([name])=>name),['Polski','Türkçe','Українська']);
console.log('All Chinese content leaves and recursive English fallback passed');

const { readFile } = await import('node:fs/promises');
const boundary = await readFile(new URL('../src/components/PreviewBoundary.jsx', import.meta.url), 'utf8');
assert.ok(boundary.includes('this.props.copy.error'));
assert.ok(boundary.includes('this.props.copy.reload'));
const printableViewer = await readFile(new URL('../src/components/PrintableWrapViewer.jsx', import.meta.url), 'utf8');
assert.ok(printableViewer.includes('aria-label={copy.printableWrap.viewerLabel}'));
assert.ok(printableViewer.includes('<ViewerBoundary copy={copy}>'));
const { validateArtworkFile, inspectArtworkFile } = await import('../src/printable-wrap-state.js');
const validation = resolveContent('zh').cybertruck.printableWrap.validation;
assert.equal(validateArtworkFile({ type: 'text/plain' }, validation).message, validation.fileType);
assert.equal(validateArtworkFile({ type: 'image/png', size: 13_000_000 }, validation).message, validation.fileSize);
assert.equal((await inspectArtworkFile({}, async () => ({width: 9000, height: 1}), validation)).message, validation.dimensionsError);
assert.equal((await inspectArtworkFile({}, async () => { throw new Error('decode') }, validation)).message, validation.decode);
console.log('Localized preview boundaries, accessible labels and upload failures passed');

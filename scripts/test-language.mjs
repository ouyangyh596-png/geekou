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

assert.deepEqual(languageOptions.map(([,code]) => code), ['en', 'zh'])
for (const [, language] of languageOptions) {
  for (const key of componentKeys) {
    assert.ok(resolve(language, key).trim(), `${language}:${key} is blank`)
  }
  if (language === 'en') assert.equal(resolve(language, 'companyKicker'), verifiedCompany.companyKicker)
  if (language === 'en') assert.equal(resolve(language, 'companyTitle'), verifiedCompany.companyTitle)
}

console.log(`Validated ${languageOptions.length} language options and ${componentKeys.length} component keys.`)

const { resolveContent } = await import('../src/language.js');
const { englishSiteContent } = await import('../src/content/site-content.js');
const { chineseSiteContent } = await import('../src/content/site-content.zh.js');
function verifyChinese(base, translated, path='content') {
  if(typeof base === 'string') { assert.equal(typeof translated,'string',path); assert.ok(translated.trim(),path); assert.deepEqual(translated.match(/\b(?:SF|AF)[-A-Z0-9]*\d[A-Z0-9-]*\b/g) || [], base.match(/\b(?:SF|AF)[-A-Z0-9]*\d[A-Z0-9-]*\b/g) || [], `${path}: model numbers`); return; }
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

const { normalizeLanguage } = await import('../src/language.js');
assert.equal(normalizeLanguage('unsupported'), 'en');
assert.equal(normalizeLanguage(null), 'en');
assert.equal(normalizeLanguage('zh'), 'zh');
assert.equal(resolveContent('en').home.ppfSequence.layers.length, 4);
assert.equal(resolveContent('zh').home.ppfSequence.layers[0], '自修复面涂层');
assert.equal(chineseSiteContent.categories['super-chrome-film'].displayName, 'Super Chrome Film');
for (const [slug, category] of Object.entries(englishSiteContent.categories)) {
  const zhName = chineseSiteContent.categories[slug].displayName;
  if (slug !== 'super-chrome-film') assert.notEqual(zhName, category.displayName, slug + ' displayName should be Chinese');
  assert.ok(zhName.length > 0);
  for (const series of chineseSiteContent.categories[slug].series) {
    assert.ok(!series.description.includes('xx (60)'), slug + ' must not keep the gloss placeholder');
  }
}

const { localizeInquiryError } = await import('../src/inquiry-errors.js');
assert.equal(localizeInquiryError('Please provide a valid email address.', 'zh'), '请输入有效的电子邮箱地址。');
assert.equal(localizeInquiryError('name must be 120 characters or fewer.', 'zh'), '姓名不得超过 120 个字符。');

assert.deepEqual(resolveContent('en').categories.ppf.series.map(item => item.name), ['Premium PPF', 'Econo PPF', 'Colored PPF']);
assert.deepEqual(resolveContent('zh').categories.ppf.series.map(item => item.name), ['卓越PPF', '经济PPF', '彩色PPF']);
assert.equal(resolveContent('en').categories.ppf.series[2].description, 'Solid Color · Metallic Finish · Carbon Fiber');
assert.equal(resolveContent('zh').categories.ppf.series[2].description, '纯色 · 金属效果 · 碳纤维');

const { catalogProducts } = await import('../src/catalog.js');
const { specificationValue, overviewColumns } = await import('../src/product-specs.js');
const colourways = [
  [
    "SF-9010",
    "Perforated White",
    "白色双色膜"
  ],
  [
    "SF-9011",
    "Perforated Regal Red",
    "皇家红双色膜"
  ],
  [
    "SF-9012",
    "Perforated Sultan Blue",
    "苏丹蓝双色膜"
  ],
  [
    "SF-9013",
    "Perforated Holly Green",
    "冬青绿双色膜"
  ],
  [
    "SF-9014",
    "Perforated Gold Nugget",
    "金色双色膜"
  ],
  [
    "SF-9015",
    "Perforated Dark Blue",
    "深蓝双色膜"
  ],
  [
    "SF-9016",
    "Perforated China Red",
    "中国红双色膜"
  ],
  [
    "SF-9017",
    "Perforated Cool Grey",
    "冷灰双色膜"
  ],
  [
    "SF-9019",
    "Perforated Black",
    "黑色双色膜"
  ],
  [
    "SF-9020",
    "Perforated Gold Metallic",
    "茅台金双色膜"
  ],
  [
    "SF-9021",
    "Perforated Deep Brown",
    "棕色双色膜"
  ],
  [
    "SF-9023",
    "Perforated Burgundy",
    "酒红色双色膜"
  ]
];
const sf9000 = catalogProducts.filter(item => item.group === 'SF9000 PERFORATED DUAL-COLOR FILM');
assert.deepEqual(sf9000.map(item => [item.model, item.color]), colourways.map(([code, en]) => [code, en]));
for (const [code, en, zh] of colourways) {
  const item = sf9000.find(item => item.model === code);
  assert.equal(specificationValue(item, 'Color', resolveContent('en').specValues), en);
  assert.equal(specificationValue(item, 'Color', resolveContent('zh').specValues), zh);
}
const expectedSpecs = {
  SF6000: [
    ['Film', '膜材', 'Matte polymeric PVC', '哑光高分子 PVC'],
    ['Film thickness', '膜厚', '3.2 mil (approx. 80 μm)', '约80 μm（3.2 mil）'],
    ['Maximum width', '最大幅宽', '2.22 m', '2.22 米'],
    ['Liner', '底膜', '75 micron PET', '75 μm PET']
  ],
  'SF-9010': [
    ['Film', '膜材', 'Dual color polymeric PVC', '高分子双色 PVC'],
    ['Film thickness', '厚度', '180 mic', '180 μm'],
    ['Perforation ratio', '开孔率', '20%', '20%'],
    ['Liner', '底纸', '140 gsm PE coated paper', '140 g/m² PE 底纸']
  ]
};
for (const [code, expected] of Object.entries(expectedSpecs)) {
  const item = catalogProducts.find(item => item.model === code);
  assert.equal(item.specs.length, 4);
  for (const [index, [key]] of item.specs.entries()) {
    assert.deepEqual([
      resolveContent('en').specLabels[key], resolveContent('zh').specLabels[key],
      specificationValue(item, key, resolveContent('en').specValues),
      specificationValue(item, key, resolveContent('zh').specValues)
    ], expected[index]);
  }
}
const chrome = catalogProducts.filter(item => item.category === 'super-chrome-film');
assert.deepEqual(overviewColumns(chrome), ['Color']);
for (const group of new Set(chrome.map(item => item.group))) {
  assert.deepEqual(overviewColumns(chrome.filter(item => item.group === group)), ['Color']);
}
for (const category of new Set(catalogProducts.map(item => item.category))) {
  if (['super-chrome-film', 'translucent-film'].includes(category)) continue;
  const items = catalogProducts.filter(item => item.category === category);
  assert.deepEqual(overviewColumns(items), [...new Set(items.flatMap(item => item.specs.map(([key]) => key)))]);
}
console.log('PASS: contextual film labels, bilingual specifications, 12 ordered colourways and Chrome overview columns');

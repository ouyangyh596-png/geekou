import assert from 'node:assert/strict';
import { catalogProducts } from '../src/catalog.js';

let productMedia;
try {
  productMedia = await import('../src/product-media.js');
} catch {
  assert.fail('src/product-media.js must define testable product image semantics');
}

const { productImageAlt } = productMedia;
assert.equal(typeof productImageAlt, 'function', 'productImageAlt must be exported');

const fallbackModels = ['SF6000', 'AF1810', 'AF1850', 'SF5601', 'SF5602', 'SF5603', 'SF5606', 'SF5609', 'SF5604', 'SF5607'];
for (const model of fallbackModels) {
  const product = catalogProducts.find(candidate => candidate.model === model);
  assert.ok(product, `${model}: product is missing`);
  assert.equal(
    productImageAlt(product, product.image),
    `${product.family} family illustration, representative image for ${model}`,
    `${model}: family fallback must not be announced as exact SKU photography`
  );
  assert.equal(
    productImageAlt(product, product.image, 0),
    `${product.family} family illustration, representative image for ${model}`,
    `${model}: detail fallback must retain representative-family wording`
  );
}

const sf1413 = catalogProducts.find(product => product.model === 'SF1413');
assert.equal(
  productImageAlt(sf1413, sf1413.image),
  'SF1413 — One Way Vision Film product image',
  'model-specific grid media should retain exact-model wording'
);
assert.equal(
  productImageAlt(sf1413, sf1413.image, 0),
  'SF1413 product view 1',
  'model-specific detail media should retain numbered-view wording'
);

console.log(`PASS: validated representative fallback semantics for ${fallbackModels.length} products`);

const familyFallbackImages = new Set([
  '/products/translucent-film-family.svg',
  '/products/ppf-family.svg',
  '/products/overlaminate-family.svg'
]);

export function productImageAlt(product, image, viewIndex) {
  if (familyFallbackImages.has(image)) {
    return `${product.family} family illustration, representative image for ${product.model}`;
  }

  if (viewIndex === undefined) {
    return `${product.model} — ${product.family} product image`;
  }

  return `${product.model} product view ${viewIndex + 1}`;
}

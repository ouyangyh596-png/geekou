const familyFallbackImages = new Set([
  '/products/translucent-film-family.svg',
  '/products/ppf-family.svg',
  '/products/overlaminate-family.svg'
]);

export function productImageAlt(product, image, viewIndex) {
  if (familyFallbackImages.has(image)) {
    return `${product.family} family illustration, representative image for ${product.model}`;
  }

  if (image === '/products/polymeric car wrapping film-1.jpg') return `${product.family} family photograph, representative image for ${product.model}`;

  if (viewIndex === undefined) {
    return `${product.model} — ${product.family} product image`;
  }

  return `${product.model} product view ${viewIndex + 1}`;
}

// Empty, placeholder-only and missing media never reserve a visual panel.
export function categoryHero(media) {
  const source = media?.hero;
  return typeof source === 'string' && source.trim() && !familyFallbackImages.has(source) ? source : null;
}

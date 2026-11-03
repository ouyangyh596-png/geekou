import { useState } from 'react';
import { categoryHero } from '../product-media.js';

export default function CategoryMedia({ media, slug, index, count }) {
  const [failed, setFailed] = useState(false);
  const source = categoryHero(media);
  if (!source || failed) return null;
  return <div className={'category-page-media category-page-media-' + slug}>
    <img src={source} alt={media.alt} width="1600" height="900" decoding="async" onError={() => setFailed(true)} />
    <span aria-hidden="true">{String(index + 1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span>
  </div>;
}

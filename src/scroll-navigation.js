const HOME_ANCHORS = new Set(['#products', '#technology', '#company', '#contact'])

const isDetailRoute = hash => hash.startsWith('#product=') || hash.startsWith('#category=')

const getCategory = hash => {
  if (!hash.startsWith('#category=')) return ''
  return new URLSearchParams(hash.slice(1)).get('category') || ''
}

export function decideHashNavigation({ previousHash = '', nextHash = '', savedHomeScroll = 0 }) {
  if (nextHash === '#top' || !nextHash) return { type: 'top' }

  if (nextHash === '#products' && isDetailRoute(previousHash)) {
    return { type: 'restore', top: Math.max(0, Number(savedHomeScroll) || 0) }
  }

  if (HOME_ANCHORS.has(nextHash)) return { type: 'anchor', id: nextHash.slice(1) }

  const previousCategory = getCategory(previousHash)
  const nextCategory = getCategory(nextHash)
  if (previousCategory && previousCategory === nextCategory) return { type: 'preserve' }

  return { type: 'top' }
}

export function isHomeRoute(hash = '') {
  return !isDetailRoute(hash) && hash !== '#admin'
}

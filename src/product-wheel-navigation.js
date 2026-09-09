const WHEEL_THRESHOLD = 24

export function decideProductWheel({ index, count, deltaY, blocked = false }) {
  if (blocked || !Number.isFinite(deltaY) || Math.abs(deltaY) < WHEEL_THRESHOLD) {
    return { type: 'ignore' }
  }

  const nextIndex = index + (deltaY > 0 ? 1 : -1)
  if (nextIndex < 0 || nextIndex >= count) return { type: 'release' }

  return { type: 'select', index: nextIndex }
}

export function decideProductSwipe({ deltaX, deltaY }) {
  if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return { type: 'ignore' }
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return { type: 'ignore' }

  return { type: 'select', offset: deltaX < 0 ? 1 : -1 }
}

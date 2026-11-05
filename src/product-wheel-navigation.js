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

// A released gesture belongs to the page for its entire inertia tail.
// A selected gesture stays captured, even if it has just reached an edge.
export function createWheelGesture(idleMs = 240) {
  let lastTime = -Infinity
  let state = 'pending'
  let accumulated = 0
  return ({ index, count, deltaY, time }) => {
    if (time - lastTime >= idleMs) { state = 'pending'; accumulated = 0 }
    lastTime = time
    if (state === 'release') return { type: 'release' }
    if (state === 'selected' || !Number.isFinite(deltaY) || deltaY === 0) return { type: 'ignore' }
    if ((index === 0 && deltaY < 0) || (index === count - 1 && deltaY > 0)) {
      state = 'release'
      return { type: 'release' }
    }
    accumulated += deltaY
    const action = decideProductWheel({ index, count, deltaY: accumulated })
    if (action.type === 'select') state = 'selected'
    return action
  }
}

// Touch offsets are measured from contact start, so each contact selects once.
export function createTouchGesture() {
  let state = 'pending'
  return ({ index, count, deltaX, deltaY }) => {
    if (state === 'release') return { type: 'release' }
    if (state === 'selected' || !Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return { type: 'ignore' }
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : -deltaY
    if (!delta) return { type: 'ignore' }
    if ((index === 0 && delta < 0) || (index === count - 1 && delta > 0)) {
      state = 'release'
      return { type: 'release' }
    }
    if (Math.abs(delta) < 48) return { type: 'ignore' }
    state = 'selected'
    return { type: 'select', index: index + Math.sign(delta) }
  }
}

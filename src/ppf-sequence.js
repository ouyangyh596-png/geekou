export const PPF_SEQUENCE = Array.from(
  { length: 115 },
  (_, index) => `/assets/ppf-sequence/frame-${String(index).padStart(3, '0')}.png`,
)

// 74 intro frames at 30 fps, followed by the 41-frame scroll tail.
export const introFrameAt = elapsed => Math.min(73, Math.max(0, Math.floor(elapsed * 30 / 1000)))
export const scrubFrameAt = (progress, anchor = 0) => 73 + Math.round(
  Math.max(0, Math.min(1, (progress - anchor) / (1 - anchor || 1))) * 41,
)

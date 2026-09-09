export const DEFAULT_PRINT_PLACEMENT = Object.freeze({ x: 0, y: 0, scale: 1, rotation: 0 })
export const ARTWORK_MAX_EDGE = 8192
export const ARTWORK_MAX_PIXELS = 32_000_000

const ARTWORK_DECODE_ERROR = 'We could not read this image. Choose a valid PNG, JPEG or WebP image.'
const ARTWORK_DIMENSION_ERROR = 'Choose an image no larger than 8192 px per side and 32 megapixels.'

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)))

export function validateArtworkFile(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file?.type)) {
    return { valid: false, message: 'Choose a PNG, JPEG or WebP image.' }
  }
  if (!file.size || file.size > 12_000_000) {
    return { valid: false, message: 'Choose an image smaller than 12 MB.' }
  }
  return { valid: true }
}

export function validateArtworkDimensions(image) {
  const width = Number(image?.width)
  const height = Number(image?.height)
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return { valid: false, message: ARTWORK_DECODE_ERROR }
  }
  if (width > ARTWORK_MAX_EDGE || height > ARTWORK_MAX_EDGE || width * height > ARTWORK_MAX_PIXELS) {
    return { valid: false, message: ARTWORK_DIMENSION_ERROR }
  }
  return { valid: true }
}

export async function inspectArtworkFile(file, decodeImage = globalThis.createImageBitmap) {
  if (typeof decodeImage !== 'function') return { valid: false, message: ARTWORK_DECODE_ERROR }

  let decodedImage
  try {
    decodedImage = await decodeImage(file)
    return validateArtworkDimensions(decodedImage)
  } catch {
    return { valid: false, message: ARTWORK_DECODE_ERROR }
  } finally {
    decodedImage?.close?.()
  }
}

export function updatePrintPlacement(current, patch) {
  return {
    x: clamp(patch.x ?? current.x, -1, 1),
    y: clamp(patch.y ?? current.y, -1, 1),
    scale: clamp(patch.scale ?? current.scale, 0.35, 2.5),
    rotation: clamp(patch.rotation ?? current.rotation, -180, 180),
  }
}

export function finishMaterialSettings(finish) {
  return finish === 'matte'
    ? { roughness: 0.48, clearcoat: 0.12, clearcoatRoughness: 0.5, useGrain: true }
    : { roughness: 0.12, clearcoat: 0.75, clearcoatRoughness: 0.08, useGrain: false }
}

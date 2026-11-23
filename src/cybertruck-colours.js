export const CYBERTRUCK_MODEL_PATH = '/models/Tesla_Cybertruck3.glb'

export const classicColours = [
  { id: 'twilight-purple', name: 'Twilight Purple', hex: '#5E1287' },
  { id: 'burgundy-red', name: 'Burgundy Red', hex: '#640000' },
  { id: 'silver', name: 'Silver', hex: '#B4B4B4' },
  { id: 'tungsten-steel', name: 'Tungsten Steel', hex: '#646464' },
  { id: 'rose-gold', name: 'Rose Gold', hex: '#80564D' },
  { id: 'dark-green', name: 'Dark Green', hex: '#003816' },
  { id: 'bronze-gold', name: 'Bronze Gold', hex: '#A88746' },
  { id: 'dark-blue', name: 'Dark Blue', hex: '#2A3655' },
  { id: 'bronze-copper', name: 'Bronze Copper', hex: '#34270F' }
]

export const DEFAULT_CLASSIC_COLOUR = classicColours.find(colour => colour.id === 'dark-green').hex

const excludedMaterialWords = /glass|window|tire|tyre|wheel|rubber|lamp|light|headlight|taillight|interior|seat|trim|chrome|metallic/i
const bodyMaterialWords = /body|paint|panel|hood|roof|door|fender|bumper|chassis|car/i

export function isLikelyCybertruckBodyMaterial(name = '') {
  if (excludedMaterialWords.test(name)) return false
  return bodyMaterialWords.test(name)
}

export function mapMaterialShape(material, transform) {
  return Array.isArray(material) ? material.map(transform) : transform(material)
}

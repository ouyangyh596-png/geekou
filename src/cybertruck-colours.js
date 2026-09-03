export const CYBERTRUCK_MODEL_PATH = '/models/Tesla_Cybertruck3.glb'

export const classicColours = [
  { id: 'china-red', name: 'China Red', hex: '#B51D2A' },
  { id: 'maillard-copper', name: 'Maillard Copper', hex: '#A95729' },
  { id: 'purple-gold', name: 'Purple Gold', hex: '#76518F' },
  { id: 'bluish-green', name: 'Bluish Green', hex: '#3D8C87' },
  { id: 'bright-yellow', name: 'Bright Yellow', hex: '#E9BF25' },
  { id: 'glaze-yellow', name: 'Glaze Yellow', hex: '#D89C22' },
  { id: 'burgundy-red', name: 'Burgundy Red', hex: '#641D32' },
  { id: 'green', name: 'Green', hex: '#2B7653' },
  { id: 'twilight-purple', name: 'Twilight Purple', hex: '#433C72' },
  { id: 'silver', name: 'Silver', hex: '#A7B1B6' },
  { id: 'dark-blue', name: 'Dark Blue', hex: '#183C73' },
  { id: 'dark-green', name: 'Dark Green', hex: '#173F35' },
  { id: 'tungsten-steel', name: 'Tungsten Steel', hex: '#525C67' },
  { id: 'rose-gold', name: 'Rose Gold', hex: '#C88678' }
]

const excludedMaterialWords = /glass|window|tire|tyre|wheel|rubber|lamp|light|headlight|taillight|interior|seat|trim|chrome|metallic/i
const bodyMaterialWords = /body|paint|panel|hood|roof|door|fender|bumper|chassis|car/i

export function isLikelyCybertruckBodyMaterial(name = '') {
  if (excludedMaterialWords.test(name)) return false
  return bodyMaterialWords.test(name)
}

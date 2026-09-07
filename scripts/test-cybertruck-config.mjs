import assert from 'node:assert/strict'
import { classicColours, CYBERTRUCK_MODEL_PATH, DEFAULT_CLASSIC_COLOUR, isLikelyCybertruckBodyMaterial, mapMaterialShape } from '../src/cybertruck-colours.js'

assert.equal(CYBERTRUCK_MODEL_PATH, '/models/Tesla_Cybertruck3.glb')
assert.ok(classicColours.length >= 6)
assert.equal(classicColours[0].id, 'china-red')
const expectedClassicColours = new Map([
  ['burgundy-red', '#640000'],
  ['maillard-copper', '#34270F'],
  ['dark-green', '#003816'],
  ['dark-blue', '#00164D'],
  ['silver', '#B4B4B4'],
  ['china-red', '#A0000F'],
  ['tungsten-steel', '#646464'],
  ['twilight-purple', '#5E1287'],
  ['purple-gold', '#AD5400']
])
for (const [id, expectedHex] of expectedClassicColours) {
  assert.equal(classicColours.find(colour => colour.id === id)?.hex, expectedHex, `${id} uses the approved RGB value`)
}
assert.equal(DEFAULT_CLASSIC_COLOUR, '#003816')
assert.equal(isLikelyCybertruckBodyMaterial('Body_Paint'), true)
assert.equal(isLikelyCybertruckBodyMaterial('Front_Glass'), false)
const singleMaterial = { name: 'paint' }
assert.equal(mapMaterialShape(singleMaterial, material => ({ ...material, changed: true })).changed, true)
assert.equal(Array.isArray(mapMaterialShape(singleMaterial, material => material)), false)
assert.equal(mapMaterialShape([singleMaterial], material => material).length, 1)
console.log('Cybertruck configuration tests passed')

import assert from 'node:assert/strict'
import { classicColours, CYBERTRUCK_MODEL_PATH, DEFAULT_CLASSIC_COLOUR, isLikelyCybertruckBodyMaterial } from '../src/cybertruck-colours.js'

assert.equal(CYBERTRUCK_MODEL_PATH, '/models/Tesla_Cybertruck3.glb')
assert.ok(classicColours.length >= 6)
assert.equal(classicColours[0].id, 'china-red')
assert.equal(DEFAULT_CLASSIC_COLOUR, '#1E6B3A')
assert.equal(isLikelyCybertruckBodyMaterial('Body_Paint'), true)
assert.equal(isLikelyCybertruckBodyMaterial('Front_Glass'), false)
console.log('Cybertruck configuration tests passed')

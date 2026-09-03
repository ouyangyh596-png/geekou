import assert from 'node:assert/strict'
import { classicColours, CYBERTRUCK_MODEL_PATH, isLikelyCybertruckBodyMaterial } from '../src/cybertruck-colours.js'

assert.equal(CYBERTRUCK_MODEL_PATH, '/models/Tesla_Cybertruck3.glb')
assert.ok(classicColours.length >= 6)
assert.equal(classicColours[0].id, 'china-red')
assert.equal(isLikelyCybertruckBodyMaterial('Body_Paint'), true)
assert.equal(isLikelyCybertruckBodyMaterial('Front_Glass'), false)
console.log('Cybertruck configuration tests passed')

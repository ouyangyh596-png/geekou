import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { PPF_SEQUENCE } from '../src/ppf-sequence.js'

assert.equal(PPF_SEQUENCE.length, 115)
assert.equal(PPF_SEQUENCE[0], '/assets/ppf-sequence/frame-000.png')
assert.equal(PPF_SEQUENCE.at(-1), '/assets/ppf-sequence/frame-114.png')
for (const url of PPF_SEQUENCE) assert.equal(existsSync(`public${url}`), true, url)
console.log('PPF sequence manifest PASS')

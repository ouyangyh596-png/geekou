import assert from 'node:assert/strict'
import { copy, languageOptions } from '../src/language.js'

const componentKeys = [
  'products', 'technology', 'company', 'contact', 'talk',
  'productLibrary', 'choose', 'surface', 'start',
  'view', 'productDetail', 'specs', 'made', 'perform',
  'back', 'request', 'allFamilies'
]
const verifiedCompany = {
  companyKicker: 'SO-FINE / ESTABLISHED 2005',
  companyTitle: '20 years of industrial expertise.'
}

const resolve = (language, key) => copy[language]?.[key] ?? copy.en[key] ?? key

assert.equal(languageOptions.length, 12)
for (const [, language] of languageOptions) {
  for (const key of componentKeys) {
    assert.ok(resolve(language, key).trim(), `${language}:${key} is blank`)
  }
  assert.equal(resolve(language, 'companyKicker'), verifiedCompany.companyKicker)
  assert.equal(resolve(language, 'companyTitle'), verifiedCompany.companyTitle)
}

console.log(`Validated ${languageOptions.length} language options and ${componentKeys.length} component keys.`)

import assert from 'node:assert/strict'
import { BODY_LIMIT_BYTES, validateInquiry } from '../server/request-validation.mjs'
import { getAdminToken, isAuthorizedToken } from '../server/admin-auth.mjs'
import { getRateLimitKey } from '../server/client-ip.mjs'
import { safeInquiryError } from '../src/inquiry-errors.js'

const validInquiry = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+86-574-8716-7701',
  subject: 'Material inquiry',
  message: 'Please send the relevant product details.'
}

assert.equal(BODY_LIMIT_BYTES, 64 * 1024)
assert.deepEqual(validateInquiry(validInquiry), { ok: true, value: validInquiry })

for (const [field, max] of Object.entries({ name: 120, email: 254, phone: 60, subject: 200, message: 5000 })) {
  const value = field === 'email' ? `${'a'.repeat(max - 11)}@example.com` : 'x'.repeat(max + 1)
  const result = validateInquiry({ ...validInquiry, [field]: value })
  assert.equal(result.ok, false, `${field} over ${max} characters must be rejected`)
}

assert.equal(validateInquiry({ ...validInquiry, email: 'not-an-email' }).ok, false)
assert.equal(validateInquiry({ ...validInquiry, message: '   ' }).ok, false)
assert.equal(getAdminToken({ NODE_ENV: 'production' }), null, 'production requires an explicit admin token')
assert.equal(getAdminToken({ NODE_ENV: 'production', SOFINE_ADMIN_TOKEN: '   ' }), null, 'blank production tokens are not allowed')
assert.equal(getAdminToken({ NODE_ENV: 'production', SOFINE_ADMIN_TOKEN: 'secure-token' }), 'secure-token')
assert.equal(getAdminToken({ NODE_ENV: 'development' }), 'sofine-local-admin')
assert.equal(isAuthorizedToken('', 'secure-token'), false)
assert.equal(isAuthorizedToken('   ', 'secure-token'), false)
assert.equal(isAuthorizedToken('secure-token', 'secure-token'), true)

assert.equal(
  getRateLimitKey({ socketAddress: '127.0.0.1', forwardedFor: '198.51.100.10', trustProxy: false }),
  '127.0.0.1',
  'forwarding headers are ignored unless TRUST_PROXY=1'
)
assert.equal(
  getRateLimitKey({ socketAddress: '127.0.0.1', forwardedFor: ' invalid,  198.51.100.10 , 203.0.113.8', trustProxy: true }),
  '198.51.100.10',
  'trusted proxies use the first valid trimmed forwarded address'
)
assert.equal(
  getRateLimitKey({ socketAddress: '127.0.0.1', forwardedFor: 'not-an-address', trustProxy: true }),
  '127.0.0.1',
  'invalid forwarding headers fall back to the socket address'
)

assert.equal(safeInquiryError({ error: 'name must be 120 characters or fewer.' }, 'Generic fallback.'), 'name must be 120 characters or fewer.')
assert.equal(safeInquiryError({ error: '<script>alert(1)</script>' }, 'Generic fallback.'), 'Generic fallback.')
assert.equal(safeInquiryError({}, 'Generic fallback.'), 'Generic fallback.')

console.log('Validated inquiry bounds and admin-token rules.')

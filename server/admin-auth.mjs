const LOCAL_ADMIN_TOKEN = 'sofine-local-admin'

const normalizedToken = token => typeof token === 'string' ? token.trim() : ''

export function getAdminToken(env = process.env) {
  const configuredToken = normalizedToken(env.SOFINE_ADMIN_TOKEN)
  if (configuredToken) return configuredToken
  return env.NODE_ENV === 'production' ? null : LOCAL_ADMIN_TOKEN
}

export function isAuthorizedToken(providedToken, expectedToken) {
  const provided = normalizedToken(providedToken)
  const expected = normalizedToken(expectedToken)
  return Boolean(provided && expected && provided === expected)
}

import { isIP } from 'node:net'

export function getRateLimitKey({ socketAddress, forwardedFor, trustProxy = false }) {
  if (trustProxy && typeof forwardedFor === 'string') {
    for (const rawAddress of forwardedFor.split(',')) {
      const address = rawAddress.trim()
      if (isIP(address)) return address
    }
  }

  return typeof socketAddress === 'string' && socketAddress.trim() ? socketAddress.trim() : 'unknown'
}

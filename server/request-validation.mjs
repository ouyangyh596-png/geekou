export const BODY_LIMIT_BYTES = 64 * 1024

const FIELD_LIMITS = {
  name: 120,
  email: 254,
  phone: 60,
  subject: 200,
  message: 5000
}

const requiredFields = new Set(['name', 'email', 'subject', 'message'])

export function validateInquiry(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'Invalid inquiry payload.' }

  const value = {}
  for (const [field, maxLength] of Object.entries(FIELD_LIMITS)) {
    const raw = data[field] ?? ''
    if (typeof raw !== 'string') return { ok: false, error: `${field} must be text.` }
    if (raw.length > maxLength) return { ok: false, error: `${field} must be ${maxLength} characters or fewer.` }
    const trimmed = raw.trim()
    if (requiredFields.has(field) && !trimmed) return { ok: false, error: 'Please complete all required fields.' }
    value[field] = trimmed
  }

  if (!/^\S+@\S+\.\S+$/.test(value.email)) return { ok: false, error: 'Please provide a valid email address.' }
  return { ok: true, value }
}

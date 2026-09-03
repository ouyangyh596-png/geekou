const safeError = /^(?:Invalid inquiry payload\.|Please complete all required fields\.|Please provide a valid email address\.|Request body is too large\.|Too many inquiry attempts\. Please try again later\.|(?:name|email|phone|subject|message) must be (?:text\.|\d+ characters or fewer\.))$/

export function safeInquiryError(payload, fallback) {
  const error = typeof payload?.error === 'string' ? payload.error.trim() : ''
  return error.length <= 200 && safeError.test(error) ? error : fallback
}

export async function readInquiryError(response, fallback) {
  try {
    return safeInquiryError(await response.json(), fallback)
  } catch {
    return fallback
  }
}

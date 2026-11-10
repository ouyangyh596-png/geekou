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

export function localizeInquiryError(error, language) {
  if (language !== 'zh') return error;
  const messages = {
    'Invalid inquiry payload.': '咨询内容格式无效。',
    'Please complete all required fields.': '请填写所有必填项。',
    'Please provide a valid email address.': '请输入有效的电子邮箱地址。',
    'Request body is too large.': '提交的内容过大。',
    'Too many inquiry attempts. Please try again later.': '咨询提交过于频繁，请稍后再试。'
  };
  const match = error.match(/^(name|email|phone|subject|message) must be (text\.|(\d+) characters or fewer\.)$/);
  if (match) return `${{name:'姓名',email:'电子邮箱',phone:'电话',subject:'主题',message:'留言'}[match[1]]}${match[3] ? `不得超过 ${match[3]} 个字符。` : '必须为文本。'}`;
  return messages[error] || error;
}

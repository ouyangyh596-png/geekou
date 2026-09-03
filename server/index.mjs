import { createServer } from 'node:http'
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { getAdminToken, isAuthorizedToken } from './admin-auth.mjs'
import { getRateLimitKey } from './client-ip.mjs'
import { BODY_LIMIT_BYTES, validateInquiry } from './request-validation.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = resolve(root, 'dist')
const dbPath = resolve(root, 'server/data/sofine.db')
const isProduction = process.env.NODE_ENV === 'production'
const trustProxy = process.env.TRUST_PROXY === '1'
const adminToken = getAdminToken(process.env)
const port = Number(process.env.PORT || 8787)

if (isProduction && !adminToken) throw new Error('SOFINE_ADMIN_TOKEN is required when NODE_ENV=production.')
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.')

mkdirSync(dirname(dbPath), { recursive: true })
const db = new DatabaseSync(dbPath)
db.exec(`CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, subject TEXT NOT NULL,
  message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL
)`)

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
}

const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(body))
}

const httpError = (status, message) => Object.assign(new Error(message), { status })

const readBody = req => new Promise((resolveBody, reject) => {
  const declaredLength = Number(req.headers['content-length'])
  if (Number.isFinite(declaredLength) && declaredLength > BODY_LIMIT_BYTES) {
    req.resume()
    reject(httpError(413, 'Request body is too large.'))
    return
  }

  let size = 0
  let settled = false
  const chunks = []
  const fail = error => {
    if (settled) return
    settled = true
    reject(error)
  }

  req.on('data', chunk => {
    if (settled) return
    size += chunk.length
    if (size > BODY_LIMIT_BYTES) {
      fail(httpError(413, 'Request body is too large.'))
      req.resume()
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => {
    if (settled) return
    try {
      settled = true
      resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
    } catch {
      reject(httpError(400, 'Invalid JSON.'))
    }
  })
  req.on('error', error => fail(error))
})

const inquiryAttempts = new Map()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 10 * 60 * 1000

function isInquiryRateLimited(req) {
  const ip = getRateLimitKey({
    socketAddress: req.socket.remoteAddress,
    forwardedFor: req.headers['x-forwarded-for'],
    trustProxy
  })
  const now = Date.now()
  const attempts = (inquiryAttempts.get(ip) || []).filter(timestamp => now - timestamp < RATE_WINDOW_MS)
  if (attempts.length >= RATE_LIMIT) {
    inquiryAttempts.set(ip, attempts)
    return true
  }
  attempts.push(now)
  inquiryAttempts.set(ip, attempts)
  return false
}

function staticPath(pathname) {
  let decodedPath
  try {
    decodedPath = decodeURIComponent(pathname)
  } catch {
    return null
  }
  const candidate = resolve(distRoot, `.${decodedPath}`)
  const relativePath = relative(distRoot, candidate)
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) return null
  return candidate
}

function sendFile(req, res, filePath) {
  res.writeHead(200, { 'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream' })
  if (req.method === 'HEAD') return res.end()
  createReadStream(filePath).on('error', () => {
    if (!res.headersSent) json(res, 500, { ok: false, error: 'Unable to read static asset.' })
    else res.destroy()
  }).pipe(res)
}

function serveProductionStatic(req, res, url) {
  if (!['GET', 'HEAD'].includes(req.method)) return false
  const filePath = staticPath(url.pathname)
  if (filePath && existsSync(filePath) && statSync(filePath).isFile()) {
    sendFile(req, res, filePath)
    return true
  }
  if (!extname(url.pathname)) {
    const indexPath = resolve(distRoot, 'index.html')
    if (existsSync(indexPath)) {
      sendFile(req, res, indexPath)
      return true
    }
  }
  return false
}

const authorized = req => isAuthorizedToken(req.headers['x-admin-token'], adminToken)

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS'
    })
    return res.end()
  }

  const url = new URL(req.url, 'http://localhost')
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true })
    if (req.method === 'POST' && url.pathname === '/api/inquiries') {
      if (isInquiryRateLimited(req)) return json(res, 429, { ok: false, error: 'Too many inquiry attempts. Please try again later.' })
      const data = await readBody(req)
      const validation = validateInquiry(data)
      if (!validation.ok) return json(res, 400, { ok: false, error: validation.error })
      const { name, email, phone, subject, message } = validation.value
      const result = db.prepare('INSERT INTO inquiries (name,email,phone,subject,message,created_at) VALUES (?,?,?,?,?,?)')
        .run(name, email, phone, subject, message, new Date().toISOString())
      return json(res, 201, { ok: true, id: Number(result.lastInsertRowid) })
    }
    if (req.method === 'GET' && url.pathname === '/api/inquiries') {
      if (!authorized(req)) return json(res, 401, { ok: false, error: 'Unauthorized' })
      return json(res, 200, { ok: true, inquiries: db.prepare('SELECT * FROM inquiries ORDER BY id DESC').all() })
    }
    const match = url.pathname.match(/^\/api\/inquiries\/(\d+)$/)
    if (req.method === 'PATCH' && match) {
      if (!authorized(req)) return json(res, 401, { ok: false, error: 'Unauthorized' })
      const data = await readBody(req)
      const status = ['new', 'read', 'replied', 'archived'].includes(data.status) ? data.status : 'new'
      db.prepare('UPDATE inquiries SET status=? WHERE id=?').run(status, Number(match[1]))
      return json(res, 200, { ok: true })
    }
    if (url.pathname.startsWith('/api/')) return json(res, 404, { ok: false, error: 'Not found' })
    if (isProduction && serveProductionStatic(req, res, url)) return
    json(res, 404, { ok: false, error: 'Not found' })
  } catch (error) {
    json(res, error.status || 500, { ok: false, error: error.message || 'Internal server error.' })
  }
})

server.listen(port, '0.0.0.0', () => console.log(`SO-FINE server listening on http://0.0.0.0:${port}`))

import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const nextPort = () => 41000 + Math.floor(Math.random() * 10000)

function startServer({ production = false, token, trustProxy = false, port = nextPort() } = {}) {
  const child = spawn(process.execPath, ['server/index.mjs'], {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: production ? 'production' : 'test',
      PORT: String(port),
      TRUST_PROXY: trustProxy ? '1' : '0',
      ...(token === undefined ? {} : { SOFINE_ADMIN_TOKEN: token })
    },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let output = ''
  child.stdout.on('data', chunk => { output += chunk })
  child.stderr.on('data', chunk => { output += chunk })
  return { child, port, output: () => output }
}

async function waitForHealth(port) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`)
      if (response.ok) return
    } catch {}
    await delay(50)
  }
  throw new Error(`Server on ${port} did not become healthy.`)
}

async function stop(child) {
  if (child.exitCode !== null) return
  child.kill('SIGTERM')
  await new Promise(resolve => child.once('exit', resolve))
}

async function request(port, path, options = {}) {
  return fetch(`http://127.0.0.1:${port}${path}`, options)
}

const invalidInquiry = { name: '', email: 'invalid', phone: '', subject: '', message: '' }

const api = startServer()
try {
  await waitForHealth(api.port)
  assert.equal((await request(api.port, '/api/inquiries')).status, 401, 'admin reads require a header token')
  assert.equal((await request(api.port, '/api/inquiries?token=sofine-local-admin')).status, 401, 'query-string tokens are rejected')
  assert.equal((await request(api.port, '/api/inquiries', { headers: { 'x-admin-token': 'sofine-local-admin' } })).status, 200)
  assert.equal((await request(api.port, '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400)
  assert.equal((await request(api.port, '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...invalidInquiry, name: 'x'.repeat(121), email: 'x@example.com', subject: 'Inquiry', message: 'Hello' }) })).status, 400)
  assert.equal((await request(api.port, '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...invalidInquiry, message: 'x'.repeat(64 * 1024) }) })).status, 413)
} finally {
  await stop(api.child)
}

const rateLimited = startServer()
try {
  await waitForHealth(rateLimited.port)
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal((await request(rateLimited.port, '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.10' }, body: JSON.stringify(invalidInquiry) })).status, 400)
  }
  assert.equal((await request(rateLimited.port, '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.11' }, body: JSON.stringify(invalidInquiry) })).status, 429, 'forwarded headers are ignored by default')
} finally {
  await stop(rateLimited.child)
}

const trustedProxy = startServer({ trustProxy: true })
try {
  await waitForHealth(trustedProxy.port)
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal((await request(trustedProxy.port, '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.10' }, body: JSON.stringify(invalidInquiry) })).status, 400)
  }
  assert.equal((await request(trustedProxy.port, '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.11' }, body: JSON.stringify(invalidInquiry) })).status, 400, 'TRUST_PROXY=1 respects the forwarded client address')
  assert.equal((await request(trustedProxy.port, '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.10' }, body: JSON.stringify(invalidInquiry) })).status, 429)
} finally {
  await stop(trustedProxy.child)
}

const missingProductionToken = startServer({ production: true })
const productionExitCode = await new Promise(resolve => missingProductionToken.child.once('exit', resolve))
assert.notEqual(productionExitCode, 0, 'production must not start without SOFINE_ADMIN_TOKEN')
assert.match(missingProductionToken.output(), /SOFINE_ADMIN_TOKEN is required/)

const production = startServer({ production: true, token: 'test-production-token' })
try {
  await waitForHealth(production.port)
  const fallback = await request(production.port, '/category/one-way-vision')
  assert.equal(fallback.status, 200, 'production serves the SPA fallback')
  assert.match(fallback.headers.get('content-type') || '', /text\/html/)
  assert.equal((await request(production.port, '/assets/does-not-exist.js')).status, 404, 'missing static assets do not fall back to HTML')
} finally {
  await stop(production.child)
}

console.log('Validated API limits, authentication, trusted-proxy rate limiting and production static serving without creating inquiries.')

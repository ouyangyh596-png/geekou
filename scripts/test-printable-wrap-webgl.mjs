import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dependencyRoot = resolve(dirname(process.execPath), '..')
const playwrightModule = resolve(dependencyRoot, 'node_modules/playwright/index.mjs')
const viteEntry = resolve(root, 'node_modules/vite/bin/vite.js')
const origin = 'http://127.0.0.1:4182'
const browserCache = resolve(homedir(), 'Library/Caches/ms-playwright')
const browserExecutable = readdirSync(browserCache)
  .filter(entry => entry.startsWith('chromium_headless_shell-'))
  .sort()
  .reverse()
  .map(entry => resolve(browserCache, entry, 'chrome-headless-shell-mac-arm64/chrome-headless-shell'))
  .find(existsSync)

assert.ok(existsSync(playwrightModule), 'the bundled Playwright module must be available')
assert.ok(browserExecutable, 'the bundled Playwright Chromium browser must be available')

const server = spawn(process.execPath, [viteEntry, '--host', '127.0.0.1', '--port', '4182', '--strictPort'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverLog = ''
server.stdout.on('data', chunk => { serverLog += chunk })
server.stderr.on('data', chunk => { serverLog += chunk })

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const response = await fetch(origin)
      if (response.ok) return
    } catch {
      // Vite is still starting.
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 100))
  }
  throw new Error(`Vite did not start:\n${serverLog}`)
}

const { chromium } = await import(pathToFileURL(playwrightModule))
let browser
try {
  await waitForServer()
  browser = await chromium.launch({ headless: true, executablePath: browserExecutable })
  const page = await browser.newPage()
  await page.goto(origin, { waitUntil: 'domcontentloaded' })
  const result = await page.evaluate(async () => {
    const THREE = await import('/@id/three')
    const { createPrintableWrapInstance } = await import('/src/printable-wrap-scene.js')
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(16, 16, false)
    const target = new THREE.WebGLRenderTarget(16, 16, {
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    })
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 10)
    camera.position.set(5, 0, 0)
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld(true)
    const artwork = new THREE.DataTexture(new Uint8Array([255, 0, 255, 0]), 1, 1, THREE.RGBAFormat)
    artwork.needsUpdate = true

    const render = sourceMap => {
      const paint = new THREE.MeshStandardMaterial({
        name: 'car_paint_mat',
        color: '#173f24',
        map: sourceMap,
        opacity: 1,
        transparent: true,
      })
      const source = new THREE.Group()
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 6), paint)
      mesh.name = 'car_paint'
      source.add(mesh)
      const instance = createPrintableWrapInstance(source)
      const printMaterial = instance.printMaterials[0]
      printMaterial.metalness = 0
      printMaterial.roughness = 1
      printMaterial.clearcoat = 0
      instance.setArtwork(artwork)
      instance.scene.add(new THREE.AmbientLight(0xffffff, Math.PI))
      renderer.setRenderTarget(target)
      renderer.clear()
      renderer.render(instance.scene, camera)
      const pixels = new Uint8Array(16 * 16 * 4)
      renderer.readRenderTargetPixels(target, 0, 0, 16, 16, pixels)
      const offset = (8 * 16 + 8) * 4
      const pixel = [...pixels.slice(offset, offset + 4)]
      instance.dispose()
      mesh.geometry.dispose()
      paint.dispose()
      return pixel
    }

    const baseline = render(null)
    const sourceMap = new THREE.DataTexture(new Uint8Array([32, 224, 64, 128]), 1, 1, THREE.RGBAFormat)
    sourceMap.needsUpdate = true
    const mapped = render(sourceMap)
    const unpremultiply = pixel => pixel.slice(0, 3).map(channel => Math.round(channel * 255 / pixel[3]))
    const output = { baseline, mapped, baselineRgb: unpremultiply(baseline), mappedRgb: unpremultiply(mapped) }
    sourceMap.dispose()
    artwork.dispose()
    target.dispose()
    renderer.dispose()
    return output
  })

  assert.ok(result.baseline[3] >= 254, `opaque baseline alpha must be 255: ${result.baseline}`)
  assert.ok(Math.abs(result.mapped[3] - 128) <= 1, `source map alpha must survive: ${result.mapped}`)
  for (let channel = 0; channel < 3; channel++) {
    assert.ok(
      Math.abs(result.mappedRgb[channel] - result.baselineRgb[channel]) <= 2,
      `transparent artwork/source map RGB tinted Silver: ${JSON.stringify(result)}`,
    )
  }
  console.log(`Printable wrap WebGL map-alpha isolation passed: ${JSON.stringify(result)}`)
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { finishMaterialSettings } from '../src/printable-wrap-state.js'

const modulePath = new URL('../src/printable-wrap-scene.js', import.meta.url)
assert.ok(existsSync(modulePath), 'printable wrap needs an isolated scene factory')
const { createPrintableWrapInstance } = await import(modulePath)

const alphaMap = new THREE.Texture()
const map = new THREE.Texture()
const grain = new THREE.Texture()
const artwork = new THREE.Texture()
const paint = new THREE.MeshStandardMaterial({
  name: 'car_paint_mat', color: '#173f24', map, alphaMap,
  opacity: .63, transparent: true, alphaTest: .24, alphaHash: true,
  alphaToCoverage: true, premultipliedAlpha: true, side: THREE.DoubleSide,
  forceSinglePass: true, depthWrite: false, depthTest: false, depthFunc: THREE.GreaterDepth,
  blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.DstColorFactor,
  blendEquation: THREE.SubtractEquation, blendSrcAlpha: THREE.DstAlphaFactor,
  blendDstAlpha: THREE.OneMinusDstAlphaFactor, blendEquationAlpha: THREE.ReverseSubtractEquation,
  blendColor: new THREE.Color('#123456'), blendAlpha: .37,
  polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 3,
})
const glass = new THREE.MeshPhysicalMaterial({ name: 'glass_windows_mat', opacity: .3, transparent: true })
const trim = new THREE.MeshStandardMaterial({ name: 'body_mat', color: '#08090a' })
const geometry = new THREE.BoxGeometry(2, 2, 6)
geometry.boundingBox = null
const source = new THREE.Group()
source.position.set(11, 22, 33)
source.rotation.set(.2, .5, -.4)
source.scale.set(2, 3, 4)
const body = new THREE.Mesh(geometry, paint)
body.name = 'car_paint'
source.add(body)
for (const [name, material] of [['glass', glass], ['body', [trim]], ['carpet', trim]]) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(100, 100, 100)
  source.add(mesh)
}
const sourceJSON = JSON.stringify(source.toJSON())
const a = createPrintableWrapInstance(source, grain)
const b = createPrintableWrapInstance(source, grain)
assert.notEqual(a.scene, source)
assert.notEqual(a.scene, b.scene)
assert.equal(a.printMaterials.length, 1)
const material = a.printMaterials[0]
assert.ok(material.isMeshPhysicalMaterial)
assert.equal(material.color.getHexString(), 'b4b4b4')
assert.equal(material.metalness, 1)
assert.equal(a.scene.getObjectByName('car_paint').material, material)
assert.equal(a.scene.getObjectByName('glass').material, glass)
assert.deepEqual(a.scene.getObjectByName('body').material, [trim])
assert.equal(a.scene.getObjectByName('carpet').material, trim)
a.scene.traverse(object => { if (object.isMesh) assert.equal(object.geometry, geometry) })
assert.equal(geometry.boundingBox, null, 'measuring projection must not mutate shared geometry')

const preservedFields = [
  'opacity', 'transparent', 'alphaTest', 'alphaHash', 'alphaToCoverage', 'premultipliedAlpha',
  'alphaMap', 'map', 'side', 'forceSinglePass', 'depthWrite', 'depthTest', 'depthFunc',
  'blending', 'blendSrc', 'blendDst', 'blendEquation', 'blendSrcAlpha', 'blendDstAlpha',
  'blendEquationAlpha', 'blendAlpha', 'blendColor', 'polygonOffset', 'polygonOffsetFactor', 'polygonOffsetUnits',
]
function assertPreserved() {
  for (const field of preservedFields) assert.deepEqual(material[field], paint[field], field)
}
assertPreserved()
const uniforms = material.userData.printUniforms
assert.equal(uniforms.uArtwork.value, null)
assert.equal(uniforms.uHasArtwork.value, 0)
assert.deepEqual(uniforms.uOffset.value.toArray(), [0, 0])
assert.equal(uniforms.uScale.value, 1)
assert.equal(uniforms.uRotation.value, 0)
a.setArtwork(artwork)
assert.equal(uniforms.uArtwork.value, artwork)
assert.equal(uniforms.uHasArtwork.value, 1)
a.setPlacement({ x: .25, y: -.4, scale: 1.7, rotation: 90 })
assert.deepEqual(uniforms.uOffset.value.toArray(), [.25, -.4])
assert.equal(uniforms.uScale.value, 1.7)
assert.equal(uniforms.uRotation.value, Math.PI / 2, 'Task 1 degrees become shader radians')
assert.equal(b.printMaterials[0].userData.printUniforms.uArtwork.value, null)
assert.equal(b.printMaterials[0].userData.printUniforms.uScale.value, 1)
for (const finish of ['matte', 'gloss', 'matte', 'gloss']) {
  a.setFinish(finish)
  const settings = finishMaterialSettings(finish)
  for (const key of ['roughness', 'clearcoat', 'clearcoatRoughness']) assert.equal(material[key], settings[key])
  assert.equal(material.roughnessMap, settings.useGrain ? grain : null)
  assert.equal(material.color.getHexString(), 'b4b4b4')
  assert.equal(uniforms.uArtwork.value, artwork)
  assertPreserved()
}
a.setArtwork(null)
assert.equal(uniforms.uHasArtwork.value, 0)
assert.equal(uniforms.uArtwork.value, null)
assert.equal(JSON.stringify(source.toJSON()), sourceJSON, 'source scene/material state stays untouched')

const shader = { uniforms: {}, vertexShader: THREE.ShaderLib.physical.vertexShader, fragmentShader: THREE.ShaderLib.physical.fragmentShader }
material.onBeforeCompile(shader)
for (const [key, value] of Object.entries(uniforms)) assert.equal(shader.uniforms[key], value)
assert.match(shader.vertexShader, /uMeshToModel \* vec4\( transformed, 1\.0 \)/)
assert.match(shader.vertexShader, /uModelNormalMatrix \* objectNormal/)
assert.match(shader.fragmentShader, /normalize\( vPrintNormal \)\.x > 0\.5/)
assert.match(shader.fragmentShader, /vec2\( -vPrintPosition\.z, vPrintPosition\.y \)/)
assert.match(shader.fragmentShader, /uProjectionMin/)
assert.match(shader.fragmentShader, /uProjectionSize/)
assert.match(shader.fragmentShader, /printUv = .*uOffset.*uScale/)
assert.match(shader.fragmentShader, /cos\( uRotation \)/)
assert.match(shader.fragmentShader, /sin\( uRotation \)/)
assert.match(shader.fragmentShader, /greaterThanEqual\( printUv, vec2\( 0\.0 \) \)/)
assert.match(shader.fragmentShader, /lessThanEqual\( printUv, vec2\( 1\.0 \) \)/)
assert.match(shader.fragmentShader, /diffuseColor\.rgb = mix\( diffuseColor\.rgb, printTexel\.rgb, printTexel\.a \)/)
const injection = shader.fragmentShader.slice(shader.fragmentShader.indexOf('// PRINT_BASE_COLOR_BEGIN'), shader.fragmentShader.indexOf('// PRINT_BASE_COLOR_END'))
assert.ok(injection.length > 0)
assert.doesNotMatch(injection, /discard|diffuseColor\.a\s*=|opacity\s*=|gl_FragColor|gl_FragDepth/)
assert.ok(shader.fragmentShader.indexOf('// PRINT_BASE_COLOR_END') < shader.fragmentShader.indexOf('#include <lights_physical_fragment>'))
for (const chunk of ['alphamap_fragment', 'alphatest_fragment', 'alphahash_fragment', 'opaque_fragment']) {
  assert.ok(shader.fragmentShader.includes(`#include <${chunk}>`), `${chunk} remains intact`)
}
assert.deepEqual(uniforms.uProjectionMin.value.toArray(), [-3, -1])
assert.deepEqual(uniforms.uProjectionSize.value.toArray(), [6, 2])
assert.ok(uniforms.uMeshToModel.value.equals(new THREE.Matrix4()), 'outer root transform excluded')

// Multiple paint mesh transforms must project into one common model-local rectangle.
const nested = new THREE.Group()
const pivot = new THREE.Group()
pivot.position.set(0, 2, 1)
pivot.rotation.x = Math.PI / 2
pivot.scale.set(1, 2, 3)
nested.add(pivot)
const panel = new THREE.Mesh(geometry, [trim, paint])
panel.name = 'door'
panel.position.set(0, 1, 0)
pivot.add(panel)
const namedPaint = new THREE.Mesh(geometry, trim)
namedPaint.name = 'CAR_PAINT.001'
nested.add(namedPaint)
const c = createPrintableWrapInstance(nested)
assert.equal(c.printMaterials.length, 2, 'mesh-name and material-name contracts both classify paint')
assert.equal(c.scene.getObjectByName('door').material[0], trim)
assert.equal(c.scene.getObjectByName('door').material[1], c.printMaterials[0])
const cu = c.printMaterials[0].userData.printUniforms
pivot.updateMatrix()
panel.updateMatrix()
const expectedMatrix = pivot.matrix.clone().multiply(panel.matrix)
assert.ok(cu.uMeshToModel.value.equals(expectedMatrix))
assert.ok(cu.uModelNormalMatrix.value.equals(new THREE.Matrix3().getNormalMatrix(expectedMatrix)))
assert.equal(c.printMaterials[1].userData.printUniforms.uProjectionMin, cu.uProjectionMin)
c.scene.rotation.y = 1.2
c.scene.scale.setScalar(.01)
c.scene.updateMatrixWorld(true)
assert.ok(cu.uMeshToModel.value.equals(expectedMatrix), 'viewer transform cannot move the print')

// Explicit resource ownership: neither cached GLB resources nor caller textures are owned.
const resources = [geometry, paint, trim, glass, map, alphaMap, grain, artwork, ...b.printMaterials]
let sharedDisposals = 0
let ownedDisposals = 0
resources.forEach(resource => resource.addEventListener('dispose', () => sharedDisposals++))
material.addEventListener('dispose', () => ownedDisposals++)
a.dispose()
a.dispose()
assert.equal(ownedDisposals, 1, 'owned materials released once, even under repeated cleanup')
assert.equal(sharedDisposals, 0, 'cached geometry/materials and caller textures remain live')
b.dispose()
c.dispose()
const empty = createPrintableWrapInstance(new THREE.Group())
assert.deepEqual(empty.printMaterials, [])
empty.setArtwork(null)
empty.setPlacement({ x: 0, y: 0, scale: 1, rotation: 0 })
empty.setFinish('matte')
empty.dispose()

// Exercise the actual asset as well as the synthetic naming/alpha edge cases.
const bytes = readFileSync(new URL('../public/models/Tesla_Cybertruck3.glb', import.meta.url))
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')
const real = createPrintableWrapInstance(gltf.scene)
assert.equal(real.printMaterials.length, 1)
let sharedMeshes = 0
let realSharedDisposals = 0
let realOwnedDisposals = 0
real.scene.traverse(object => {
  if (!object.isMesh) return
  const original = gltf.scene.getObjectByName(object.name)
  assert.equal(object.geometry, original.geometry)
  original.geometry.addEventListener('dispose', () => realSharedDisposals++)
  original.material.addEventListener('dispose', () => realSharedDisposals++)
  if (object.name === 'car_paint') {
    for (const field of preservedFields) assert.deepEqual(object.material[field], original.material[field], `GLB ${field}`)
  } else {
    assert.equal(object.material, original.material, `GLB ${object.name} remains shared`)
    sharedMeshes++
  }
})
assert.equal(sharedMeshes, 10)
const realUniforms = real.printMaterials[0].userData.printUniforms
assert.ok(Math.abs(realUniforms.uProjectionSize.value.x - 5.982898437) < 1e-6)
assert.ok(Math.abs(realUniforms.uProjectionSize.value.y - 1.448123281) < 1e-6)
real.printMaterials[0].addEventListener('dispose', () => realOwnedDisposals++)
real.dispose()
assert.equal(realOwnedDisposals, 1)
assert.equal(realSharedDisposals, 0)
console.log('Actual GLB: 1 owned paint, 10 shared non-paint meshes, 11 shared geometries; dispose: owned=1 shared=0')
console.log('Printable wrap isolation, Silver, full alpha/depth/blending, shader, projection, finish and disposal checks passed')

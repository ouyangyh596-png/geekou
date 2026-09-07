import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import * as THREE from 'three'

const modulePath = new URL('../src/cybertruck-scene.js', import.meta.url)
assert.ok(existsSync(modulePath), 'viewer needs an isolated scene factory, not a shared cached scene')
const { createCybertruckInstance } = await import(modulePath)
const source = new THREE.Group()
const geometry = new THREE.BoxGeometry()
const paint = new THREE.MeshPhysicalMaterial({ color: '#173f24', opacity: 1, transparent: false, roughness: .205 })
paint.name = 'car_paint_mat'
const body = new THREE.Mesh(geometry, paint)
body.name = 'car_paint'
source.add(body)
const trim = new THREE.MeshPhysicalMaterial({ color: '#08090a', opacity: 1, transparent: false })
trim.name = 'body_mat'
const skirts = new THREE.Mesh(geometry, [trim])
skirts.name = 'body'
source.add(skirts)
const glass = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ opacity: .3, transparent: true }))
glass.name = 'glass_windows'
source.add(glass)
const a = createCybertruckInstance(source)
const b = createCybertruckInstance(source)
assert.notEqual(a.scene, source)
assert.notEqual(a.scene, b.scene)
assert.equal(a.paintMaterials.length, 1, 'only the dedicated car-paint surface changes colour')
assert.equal(Array.isArray(a.scene.children[0].material), false, 'single-material meshes must still render without groups')
assert.equal(Array.isArray(a.scene.children[1].material), true)
assert.equal(a.scene.children[1].material[0], trim, 'wheel arches, skirts and chassis keep the exported dark body material')
assert.equal(a.scene.children[1].material[0].color.getHexString(), '08090a')
assert.equal(a.scene.children[0].geometry, geometry, 'geometry is shared read-only')
for (const material of a.paintMaterials) {
  assert.equal(material.opacity, paint.opacity)
  assert.equal(material.transparent, paint.transparent)
  assert.equal(material.alphaTest, paint.alphaTest)
  assert.equal(material.depthWrite, paint.depthWrite)
  assert.equal(material.roughness, .205)
  material.color.set('#B51D2A')
}
assert.equal(source.children[0].material.color.getHexString(), '173f24', 'source paint remains unchanged')
assert.notEqual(b.paintMaterials[0].color.getHexString(), 'b51d2a', 'viewers do not share paint')
assert.equal(a.scene.children[2].material.opacity, .3, 'glass alpha stays untouched')
let disposed = 0
a.paintMaterials.forEach(material => material.addEventListener('dispose', () => disposed++))
a.dispose()
assert.equal(disposed, 1, 'owned paint shader is released')
b.dispose()
geometry.dispose()
paint.dispose()
trim.dispose()
glass.material.dispose()
console.log('Cybertruck isolation, material shape, alpha and disposal checks passed')

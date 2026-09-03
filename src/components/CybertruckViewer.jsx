import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CYBERTRUCK_MODEL_PATH, isLikelyCybertruckBodyMaterial } from '../cybertruck-colours.js'

const excludedName = name => /glass|window|tire|tyre|wheel|rubber|lamp|light|headlight|taillight|interior|seat|trim|chrome|metallic/i.test(name)

function makeMicroTexture() {
  const size = 32
  const data = new Uint8Array(size * size * 4)
  for (let i = 0; i < data.length; i += 4) {
    const value = 112 + Math.floor(Math.random() * 96)
    data[i] = value; data[i + 1] = value; data[i + 2] = value; data[i + 3] = 255
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(18, 18)
  texture.needsUpdate = true
  return texture
}

function CybertruckModel({ colour }) {
  const { scene } = useGLTF(CYBERTRUCK_MODEL_PATH)
  const bodyMaterials = useRef([])
  const microTexture = useMemo(() => makeMicroTexture(), [])

  useEffect(() => () => microTexture.dispose(), [microTexture])

  useEffect(() => {
    bodyMaterials.current = []
    const candidates = []
    scene.traverse(object => {
      if (!object.isMesh) return
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      const isBody = materials.some(material => isLikelyCybertruckBodyMaterial(`${object.name} ${material?.name || ''}`))
      if (isBody) candidates.push({ object, materials })
      else if (!materials.some(material => excludedName(`${object.name} ${material?.name || ''}`)) && materials.some(material => material?.transparent !== true)) candidates.push({ object, materials, fallback: true })
    })
    const named = candidates.filter(candidate => !candidate.fallback)
    const selected = named.length ? named : candidates.slice(0, Math.max(1, Math.ceil(candidates.length * 0.55)))
    selected.forEach(({ object, materials }) => {
      object.material = materials.map(material => {
        const next = material.clone()
        next.color.set(colour)
        next.metalness = 0.88
        next.roughness = 0.28
        next.roughnessMap = microTexture
        next.clearcoat = 0.32
        next.clearcoatRoughness = 0.18
        next.needsUpdate = true
        bodyMaterials.current.push(next)
        return next
      })
    })
  }, [scene, colour, microTexture])

  useEffect(() => {
    bodyMaterials.current.forEach(material => material.color.set(colour))
  }, [colour])

  const bounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    return { scale: 3.2 / Math.max(size.x, size.y, size.z), center }
  }, [scene])

  return <primitive object={scene} scale={bounds.scale} position={[-bounds.center.x * bounds.scale, -bounds.center.y * bounds.scale, -bounds.center.z * bounds.scale]} />
}

function Loading() { return <div className="cybertruck-loading">Loading surface study…</div> }

export default function CybertruckViewer({ colour }) {
  return <div className="cybertruck-viewer" aria-label="Interactive Cybertruck colour preview">
    <Canvas camera={{ position: [4.2, 2.1, 4.8], fov: 32 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 4]} intensity={3.2} />
        <directionalLight position={[-4, 2, -2]} intensity={1.5} color="#8fb8ff" />
        <Environment preset="city" />
        <CybertruckModel colour={colour} />
        <OrbitControls enablePan={false} minDistance={3.2} maxDistance={7.5} enableDamping dampingFactor={0.08} />
      </Suspense>
    </Canvas>
    <Suspense fallback={<Loading />}><Loading /></Suspense>
  </div>
}

useGLTF.preload(CYBERTRUCK_MODEL_PATH)

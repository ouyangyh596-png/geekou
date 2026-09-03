import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CYBERTRUCK_MODEL_PATH, mapMaterialShape } from '../cybertruck-colours.js'

function createMicroRoughness() {
  const size = 32
  const data = new Uint8Array(size * size * 4)
  for (let index = 0; index < data.length; index += 4) {
    const grain = 128 + Math.floor(Math.random() * 72)
    data[index] = grain; data[index + 1] = grain; data[index + 2] = grain; data[index + 3] = 255
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(22, 22); texture.needsUpdate = true
  return texture
}

function CybertruckModel({ colour }) {
  const { scene } = useGLTF(CYBERTRUCK_MODEL_PATH)
  const microRoughness = useMemo(createMicroRoughness, [])
  useEffect(() => () => microRoughness.dispose(), [microRoughness])
  useEffect(() => {
    scene.traverse(object => {
      if (!object.isMesh) return
      object.frustumCulled = false
      const name = `${object.name} ${object.material?.name || ''}`
      if (!/^(body|car_paint)|body_mat|car_paint_mat/i.test(name)) return
      object.material = mapMaterialShape(object.material, source => {
        const material = new THREE.MeshPhysicalMaterial({
          color: colour,
          metalness: 1,
          roughness: 0.205,
          clearcoat: 0.28,
          clearcoatRoughness: 0.2,
          roughnessMap: microRoughness,
          envMapIntensity: 1.35,
          side: source.side,
        })
        // The exported body material contains an out-of-range specular factor.
        // Rebuild the paint shader, but preserve Blender's alpha contract.
        material.name = source.name
        material.opacity = source.opacity
        material.transparent = source.transparent
        material.alphaTest = source.alphaTest
        material.depthWrite = source.depthWrite
        material.depthTest = source.depthTest
        material.blending = source.blending
        material.needsUpdate = true
        return material
      })
    })
  }, [scene, colour, microRoughness])
  return <Center disableY><primitive object={scene} scale={0.55} /></Center>
}

export default function CybertruckViewer({ colour }) {
  return <div className="cybertruck-viewer" aria-label="Interactive Cybertruck colour preview">
    <Canvas camera={{ position: [0, 1.25, 6.4], fov: 32 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}><hemisphereLight skyColor="#eef7ff" groundColor="#24352a" intensity={2.2} /><ambientLight intensity={0.55} /><directionalLight position={[4, 6, 4]} intensity={5.5} color="#fff4e7" /><directionalLight position={[-4, 2, -2]} intensity={3.2} color="#9fc8ff" /><directionalLight position={[0, 1, -6]} intensity={2.8} color="#d8fff0" /><Environment preset="forest" environmentIntensity={1.8} /><CybertruckModel colour={colour} /><OrbitControls enablePan={false} target={[0, 0.15, 0]} minDistance={3.2} maxDistance={7.5} enableDamping dampingFactor={0.08} /></Suspense>
    </Canvas>
  </div>
}

useGLTF.preload(CYBERTRUCK_MODEL_PATH)

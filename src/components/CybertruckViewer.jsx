import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { CYBERTRUCK_MODEL_PATH } from '../cybertruck-colours.js'
import { createCybertruckInstance } from '../cybertruck-scene.js'

const DRAG_HINT_STORAGE_KEY = 'cybertruck-drag-hint-dismissed'

function createMicroRoughness() {
  const size = 64
  const data = new Uint8Array(size * size * 4)
  for (let index = 0; index < data.length; index += 4) {
    const grain = 232 + ((index * 13 + (index >> 4) * 7) % 24)
    data[index] = grain; data[index + 1] = grain; data[index + 2] = grain; data[index + 3] = 255
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(28, 28)
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

function CybertruckModel({ colour }) {
  const { scene } = useGLTF(CYBERTRUCK_MODEL_PATH)
  const grain = useMemo(createMicroRoughness, [])
  const model = useMemo(() => {
    const instance = createCybertruckInstance(scene, grain)
    const bounds = new THREE.Box3().setFromObject(instance.scene)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const scale = 3.4 / Math.max(size.x, size.y, size.z)
    instance.scene.scale.multiplyScalar(scale)
    instance.scene.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
    return instance
  }, [scene, grain])
  const target = useMemo(() => new THREE.Color(colour), [colour])
  const { invalidate } = useThree()
  const initialized = useRef(false)
  useEffect(() => {
    if (!initialized.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      model.paintMaterials.forEach(material => material.color.copy(target))
      initialized.current = true
    }
    invalidate()
  }, [model, target, invalidate])
  useFrame((_, delta) => {
    let changing = false
    model.paintMaterials.forEach(material => {
      const difference = Math.abs(material.color.r - target.r) + Math.abs(material.color.g - target.g) + Math.abs(material.color.b - target.b)
      if (difference < .0005) material.color.copy(target)
      else {
        material.color.lerp(target, 1 - Math.exp(-10 * Math.min(delta, .1)))
        changing = true
      }
    })
    if (changing) invalidate()
  })
  useEffect(() => () => { model.dispose(); grain.dispose() }, [model, grain])
  return <primitive object={model.scene} dispose={null} />
}

function CameraRig() {
  const { camera, size, invalidate } = useThree()
  const controls = useRef()
  useEffect(() => {
    const distance = 5.6 * Math.max(1, 1.25 / (size.width / size.height))
    camera.position.copy(new THREE.Vector3(1, .42, .8).normalize().multiplyScalar(distance)).add(new THREE.Vector3(0, .48, 0))
    camera.lookAt(0, .48, 0)
    camera.updateProjectionMatrix()
    controls.current?.update()
    invalidate()
  }, [camera, size.width, size.height, invalidate])
  return <OrbitControls ref={controls} makeDefault enablePan={false} enableZoom={false}
    target={[0, .48, 0]} minPolarAngle={.35} maxPolarAngle={Math.PI / 2.05}
    enableDamping dampingFactor={.09} rotateSpeed={.6} />
}

function StudioEnvironment() {
  const { gl } = useThree()
  const target = useMemo(() => {
    const room = new RoomEnvironment()
    // Lit studio walls fill the broad chrome panels; black HDRI backgrounds
    // otherwise make flat metal surfaces look unpainted at some angles.
    room.add(new THREE.AmbientLight('#ffffff', .7))
    const generator = new THREE.PMREMGenerator(gl)
    const result = generator.fromScene(room, .04)
    room.dispose()
    generator.dispose()
    return result
  }, [gl])
  useEffect(() => () => target.dispose(), [target])
  return <Environment map={target.texture} environmentIntensity={1.1} />
}

class ViewerBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <div className="viewer-error" role="status"><p>The 3D preview could not load.</p><button type="button" onClick={() => { useGLTF.clear(CYBERTRUCK_MODEL_PATH); this.setState({ failed: false }) }}>Try again</button><p>You can still explore every product and colour below.</p></div> : this.props.children
  }
}

export default function CybertruckViewer({ colour }) {
  const host = useRef()
  const pointerStart = useRef(null)
  const [entered, setEntered] = useState(false)
  const [hintState, setHintState] = useState(() => {
    try { return window.localStorage.getItem(DRAG_HINT_STORAGE_KEY) === '1' ? 'hidden' : 'visible' }
    catch { return 'visible' }
  })
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setEntered(true); observer.disconnect() }
    }, { rootMargin: '300px' })
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [])

  const dismissDragHint = () => {
    if (hintState !== 'visible') return
    try { window.localStorage.setItem(DRAG_HINT_STORAGE_KEY, '1') } catch { /* Hint still hides when storage is unavailable. */ }
    setHintState(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'hidden' : 'dismissing')
  }
  const handlePointerDown = event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    pointerStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
  }
  const handlePointerMove = event => {
    const start = pointerStart.current
    if (!start || start.id !== event.pointerId) return
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 8) dismissDragHint()
  }
  const clearPointer = event => {
    if (pointerStart.current?.id === event.pointerId) pointerStart.current = null
  }
  return <div ref={host} className="cybertruck-viewer" aria-label="Interactive Cybertruck colour preview"
    onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={clearPointer} onPointerCancel={clearPointer}
    onTouchStart={event => event.stopPropagation()} onTouchEnd={event => event.stopPropagation()}>
    <ViewerBoundary>{entered && <Canvas frameloop="demand" camera={{ position: [5, 2.2, 4], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={<Html center><span className="viewer-loading" role="status">Loading 3D preview…</span></Html>}>
        <hemisphereLight intensity={1.2} color="#eef7ff" groundColor="#64716a" />
        <directionalLight position={[4, 6, 4]} intensity={2.4} color="#fff7eb" />
        <directionalLight position={[-4, 3, -3]} intensity={1.6} color="#c7deff" />
        <StudioEnvironment />
        <CybertruckModel colour={colour} />
        <CameraRig />
      </Suspense>
    </Canvas>}</ViewerBoundary>
    {hintState !== 'hidden' && <div className={'viewer-gesture-hint' + (hintState === 'dismissing' ? ' is-dismissing' : '')}
      role="status" onAnimationEnd={() => hintState === 'dismissing' && setHintState('hidden')}>
      <span className="viewer-gesture-track" aria-hidden="true"><span className="viewer-gesture-pointer">
        <svg viewBox="0 0 24 24"><path d="M7.4 3.2c.9 0 1.6.7 1.6 1.6v5.1l.7-.8c.6-.7 1.7-.7 2.3-.1l.5.6.5-.3c.7-.4 1.6-.2 2.1.4l.4.6.5-.2c.9-.3 1.8.2 2.1 1.1l.4 1.4c.5 1.8.1 3.8-1.2 5.2l-1.5 1.7c-.7.8-1.8 1.3-2.9 1.3h-2.6c-1.2 0-2.3-.5-3.1-1.4l-3.6-4.2a1.7 1.7 0 0 1 .2-2.4c.7-.6 1.7-.5 2.3.1l.7.8V4.8c0-.9.7-1.6 1.6-1.6Z" /></svg>
      </span></span>
      <span>Drag to rotate</span>
    </div>}
  </div>
}

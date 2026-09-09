import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Html, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { CYBERTRUCK_MODEL_PATH } from '../cybertruck-colours.js'
import { createPrintableWrapInstance } from '../printable-wrap-scene.js'

const LEFT_SIDE_CAMERA_DIRECTION = new THREE.Vector3(1, .42, .18)

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

function PrintableWrapModel({ artworkUrl, placement, finish, onArtworkStatusChange }) {
  const { scene } = useGLTF(CYBERTRUCK_MODEL_PATH)
  const grain = useMemo(createMicroRoughness, [])
  const model = useMemo(() => {
    const instance = createPrintableWrapInstance(scene, grain)
    const bounds = new THREE.Box3().setFromObject(instance.scene)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const scale = 3.4 / Math.max(size.x, size.y, size.z)
    instance.scene.scale.multiplyScalar(scale)
    instance.scene.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
    return instance
  }, [scene, grain])
  const { invalidate } = useThree()

  useEffect(() => {
    model.setPlacement(placement)
    invalidate()
  }, [model, placement, invalidate])

  useEffect(() => {
    model.setFinish(finish)
    invalidate()
  }, [model, finish, invalidate])

  useEffect(() => {
    model.setArtwork(null)
    invalidate()
    if (!artworkUrl) return undefined

    let active = true
    let released = false
    let texture
    const releaseTexture = () => {
      if (released || !texture) return
      released = true
      texture.dispose()
    }
    onArtworkStatusChange?.({ status: 'loading', url: artworkUrl })
    texture = new THREE.TextureLoader().load(
      artworkUrl,
      () => {
        if (!active) return
        model.setArtwork(texture)
        onArtworkStatusChange?.({ status: 'ready', url: artworkUrl })
        invalidate()
      },
      undefined,
      () => {
        if (!active) return
        model.setArtwork(null)
        releaseTexture()
        onArtworkStatusChange?.({
          status: 'error',
          url: artworkUrl,
          message: 'We could not load this image preview. Choose the artwork again.',
        })
        invalidate()
      },
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.magFilter = THREE.LinearFilter

    return () => {
      active = false
      model.setArtwork(null)
      releaseTexture()
      invalidate()
    }
  }, [model, artworkUrl, invalidate, onArtworkStatusChange])

  useEffect(() => () => {
    model.dispose()
    grain.dispose()
  }, [model, grain])

  return <primitive object={model.scene} dispose={null} />
}

function CameraRig({ editMode }) {
  const { camera, size, invalidate } = useThree()
  const controls = useRef()
  useEffect(() => {
    const distance = 5.6 * Math.max(1, 1.25 / (size.width / size.height))
    camera.position.copy(LEFT_SIDE_CAMERA_DIRECTION).normalize().multiplyScalar(distance).add(new THREE.Vector3(0, .48, 0))
    camera.lookAt(0, .48, 0)
    camera.updateProjectionMatrix()
    controls.current?.update()
    invalidate()
  }, [camera, size.width, size.height, invalidate])
  return <OrbitControls ref={controls} makeDefault enabled={editMode !== 'positionArtwork'}
    enablePan={false} enableZoom={false} target={[0, .48, 0]}
    minPolarAngle={.35} maxPolarAngle={Math.PI / 2.05}
    enableDamping dampingFactor={.09} rotateSpeed={.6} />
}

function StudioEnvironment() {
  const { gl } = useThree()
  const target = useMemo(() => {
    const room = new RoomEnvironment()
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
    return this.state.failed ? <div className="viewer-error" role="status"><p>The 3D preview could not load.</p><button type="button" onClick={() => { useGLTF.clear(CYBERTRUCK_MODEL_PATH); this.setState({ failed: false }) }}>Try again</button><p>You can still configure your artwork while the preview reloads.</p></div> : this.props.children
  }
}

export default function PrintableWrapViewer({ artworkUrl, placement, finish, editMode, onPlacementChange, onArtworkStatusChange }) {
  const host = useRef()
  const activePointer = useRef(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setEntered(true); observer.disconnect() }
    }, { rootMargin: '300px' })
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => { activePointer.current = null }, [editMode])

  const handlePointerDown = event => {
    if (editMode !== 'positionArtwork') return
    if (event.button !== 0 && event.pointerType === 'mouse') return
    activePointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      placementX: placement.x,
      placementY: placement.y,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.preventDefault()
  }

  const handlePointerMove = event => {
    if (editMode !== 'positionArtwork') return
    const start = activePointer.current
    if (!start || start.id !== event.pointerId) return
    const { width, height } = event.currentTarget.getBoundingClientRect()
    const stageWidth = Math.max(width, 1)
    const stageHeight = Math.max(height, 1)
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    const nextX = Math.min(1, Math.max(-1, start.placementX + deltaX / stageWidth))
    const nextY = Math.min(1, Math.max(-1, start.placementY - deltaY / stageHeight))
    activePointer.current = {
      ...start,
      x: event.clientX,
      y: event.clientY,
      placementX: nextX,
      placementY: nextY,
    }
    onPlacementChange({ x: nextX, y: nextY })
    event.preventDefault()
  }

  const clearPointer = event => {
    if (activePointer.current?.id !== event.pointerId) return
    activePointer.current = null
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return <div ref={host} className="cybertruck-viewer printable-wrap-viewer"
    role="region" aria-label="Interactive printable Cybertruck wrap preview"
    onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
    onPointerUp={clearPointer} onPointerCancel={clearPointer}
    style={{ touchAction: editMode === 'positionArtwork' ? 'none' : 'auto' }}>
    <ViewerBoundary>{entered && <Canvas frameloop="demand" camera={{ position: [5, 2.2, .9], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={<Html center><span className="viewer-loading" role="status">Loading 3D preview…</span></Html>}>
        <hemisphereLight intensity={1.2} color="#eef7ff" groundColor="#64716a" />
        <directionalLight position={[4, 6, 4]} intensity={2.4} color="#fff7eb" />
        <directionalLight position={[-4, 3, -3]} intensity={1.6} color="#c7deff" />
        <StudioEnvironment />
        <PrintableWrapModel artworkUrl={artworkUrl} placement={placement} finish={finish} onArtworkStatusChange={onArtworkStatusChange} />
        <CameraRig editMode={editMode} />
      </Suspense>
    </Canvas>}</ViewerBoundary>
  </div>
}

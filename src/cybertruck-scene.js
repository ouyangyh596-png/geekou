import * as THREE from 'three'
import { mapMaterialShape } from './cybertruck-colours.js'

// Geometry and original materials belong to the GLTF cache. Never mutate/dispose
// them: the carousel and detail view can be mounted at different times.
export function createCybertruckInstance(source, roughnessMap = null) {
  const scene = source.clone(true)
  const paintMaterials = []
  scene.traverse(object => {
    if (!object.isMesh) return
    object.material = mapMaterialShape(object.material, original => {
      if (!/^car_paint(?:$|[_.])/i.test(object.name) &&
          !/^car_paint_mat/i.test(original.name)) return original
      const material = new THREE.MeshPhysicalMaterial({
        name: original.name,
        color: original.color,
        metalness: 1,
        roughness: .205,
        roughnessMap,
        clearcoat: .24,
        clearcoatRoughness: .22,
        envMapIntensity: 1.25,
        side: original.side,
        // Preserve the exported Blender alpha/depth contract verbatim.
        opacity: original.opacity,
        transparent: original.transparent,
        alphaTest: original.alphaTest,
        alphaMap: original.alphaMap,
        depthWrite: original.depthWrite,
        depthTest: original.depthTest,
        blending: original.blending,
      })
      paintMaterials.push(material)
      return material
    })
  })
  return { scene, paintMaterials, dispose: () => paintMaterials.forEach(material => material.dispose()) }
}

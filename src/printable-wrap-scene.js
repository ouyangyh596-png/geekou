import * as THREE from 'three'
import { mapMaterialShape } from './cybertruck-colours.js'
import { finishMaterialSettings } from './printable-wrap-state.js'

const isPaint = (object, material) => /^car_paint(?:$|[_.])/i.test(object.name) || /^car_paint_mat/i.test(material.name)

function attachPrintShader(material, uniforms) {
  material.userData.printUniforms = uniforms
  material.customProgramCacheKey = () => 'printable-wrap-left-v2'
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `
      #include <common>
      uniform mat4 uMeshToModel;
      uniform mat3 uModelNormalMatrix;
      varying vec3 vPrintPosition;
      varying vec3 vPrintNormal;
    `).replace('#include <project_vertex>', `
      vPrintPosition = ( uMeshToModel * vec4( transformed, 1.0 ) ).xyz;
      vPrintNormal = uModelNormalMatrix * objectNormal;
      #include <project_vertex>
    `)
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
      #include <common>
      uniform sampler2D uArtwork;
      uniform float uHasArtwork;
      uniform vec2 uOffset;
      uniform float uScale;
      uniform float uRotation;
      uniform vec2 uProjectionMin;
      uniform vec2 uProjectionSize;
      varying vec3 vPrintPosition;
      varying vec3 vPrintNormal;
    `).replace('#include <map_fragment>', `
      #ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D( map, vMapUv );
        #ifdef DECODE_VIDEO_TEXTURE
          sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
        #endif
        // Preserve the exported map alpha without tinting fixed Silver or artwork.
        diffuseColor.a *= sampledDiffuseColor.a;
      #endif
    `).replace('#include <color_fragment>', `
      #include <color_fragment>
      // PRINT_BASE_COLOR_BEGIN
      // +X is the GLB's left side. Use exported outward normals, never view-facing normals.
      if ( uHasArtwork > 0.5 && normalize( vPrintNormal ).x > 0.5 ) {
        vec2 printSide = vec2( -vPrintPosition.z, vPrintPosition.y );
        vec2 printUv = ( printSide - uProjectionMin ) / uProjectionSize;
        printUv = ( printUv - vec2( 0.5 ) - uOffset ) / uScale;
        float printCos = cos( uRotation );
        float printSin = sin( uRotation );
        // Inverse rotation maps the surface back into the artwork's coordinates.
        printUv = mat2( printCos, -printSin, printSin, printCos ) * printUv + vec2( 0.5 );
        if ( all( greaterThanEqual( printUv, vec2( 0.0 ) ) ) && all( lessThanEqual( printUv, vec2( 1.0 ) ) ) ) {
          vec4 printTexel = texture2D( uArtwork, printUv );
          diffuseColor.rgb = mix( diffuseColor.rgb, printTexel.rgb, printTexel.a );
        }
      }
      // PRINT_BASE_COLOR_END
    `)
  }
}

// Clone only the scene graph and paint. Cached geometry, non-paint materials and
// caller-supplied artwork/grain/alpha textures remain shared and are never disposed.
export function createPrintableWrapInstance(source, grain = null) {
  const scene = source.clone(true)
  const printMaterials = []
  const bounds = new THREE.Box3()
  const point = new THREE.Vector3()
  const commonUniforms = {
    uArtwork: { value: null },
    uHasArtwork: { value: 0 },
    uOffset: { value: new THREE.Vector2() },
    uScale: { value: 1 },
    uRotation: { value: 0 },
    uProjectionMin: { value: new THREE.Vector2() },
    uProjectionSize: { value: new THREE.Vector2(1, 1) },
  }
  scene.updateMatrixWorld(true)
  scene.traverse(object => {
    if (!object.isMesh) return
    // Preserve GLB internal transforms but exclude the viewer/root transform.
    // Each mesh owns a shader material so its local-to-model matrix is independent.
    const meshToModel = new THREE.Matrix4()
    for (let node = object; node && node !== scene; node = node.parent) {
      meshToModel.premultiply(node.matrix)
    }
    const hasMaterialGroups = Array.isArray(object.material)
    const paintMaterialIndices = new Set()
    object.material = mapMaterialShape(object.material, (original, materialIndex = 0) => {
      if (!isPaint(object, original)) return original
      paintMaterialIndices.add(materialIndex)
      const material = new THREE.MeshPhysicalMaterial()
      // Base Material.copy preserves ALL exported alpha/depth/blending fields,
      // including custom blend factors/equations, coverage/hash and polygon offset.
      THREE.Material.prototype.copy.call(material, original)
      material.alphaMap = original.alphaMap ?? null
      material.map = original.map ?? null // A base map can carry exported alpha too.
      material.color.set('#B4B4B4')
      material.metalness = 1
      attachPrintShader(material, {
        ...commonUniforms,
        uMeshToModel: { value: meshToModel },
        uModelNormalMatrix: { value: new THREE.Matrix3().getNormalMatrix(meshToModel) },
      })
      printMaterials.push(material)
      return material
    })
    if (paintMaterialIndices.size === 0) return
    // Read positions directly: computeBoundingBox() would mutate cached geometry.
    const positions = object.geometry.getAttribute('position')
    if (!positions) return
    const expandByVertex = vertexIndex => {
      point.fromBufferAttribute(positions, vertexIndex).applyMatrix4(meshToModel)
      bounds.expandByPoint(point)
    }
    if (!hasMaterialGroups) {
      for (let vertexIndex = 0; vertexIndex < positions.count; vertexIndex++) expandByVertex(vertexIndex)
      return
    }
    const indices = object.geometry.getIndex()
    const elementCount = indices?.count ?? positions.count
    const drawStart = object.geometry.drawRange.start
    const drawEnd = Math.min(drawStart + object.geometry.drawRange.count, elementCount)
    for (const group of object.geometry.groups) {
      if (!paintMaterialIndices.has(group.materialIndex ?? 0)) continue
      const groupStart = Math.max(group.start, drawStart)
      const groupEnd = Math.min(group.start + group.count, drawEnd)
      for (let elementIndex = groupStart; elementIndex < groupEnd; elementIndex++) {
        expandByVertex(indices ? indices.getX(elementIndex) : elementIndex)
      }
    }
  })
  if (!bounds.isEmpty()) {
    // In a left-side view, front (+Z) is on the image's left; Y remains up.
    commonUniforms.uProjectionMin.value.set(-bounds.max.z, bounds.min.y)
    commonUniforms.uProjectionSize.value.set(
      Math.max(bounds.max.z - bounds.min.z, 1e-6),
      Math.max(bounds.max.y - bounds.min.y, 1e-6),
    )
  }

  function setFinish(finish) {
    const { roughness, clearcoat, clearcoatRoughness, useGrain } = finishMaterialSettings(finish)
    for (const material of printMaterials) {
      const roughnessMap = useGrain ? grain : null
      if (material.roughnessMap !== roughnessMap) material.needsUpdate = true
      material.roughness = roughness
      material.clearcoat = clearcoat
      material.clearcoatRoughness = clearcoatRoughness
      material.roughnessMap = roughnessMap
    }
  }
  setFinish('gloss')
  let disposed = false
  return {
    scene,
    printMaterials,
    setArtwork(texture) {
      commonUniforms.uArtwork.value = texture
      commonUniforms.uHasArtwork.value = texture ? 1 : 0
    },
    // Placement comes from Task 1's validated state (rotation is in degrees).
    setPlacement({ x, y, scale, rotation }) {
      commonUniforms.uOffset.value.set(x, y)
      commonUniforms.uScale.value = scale
      commonUniforms.uRotation.value = THREE.MathUtils.degToRad(rotation)
    },
    setFinish,
    dispose() {
      if (disposed) return
      disposed = true
      printMaterials.forEach(material => material.dispose())
    },
  }
}

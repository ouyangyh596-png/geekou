# Printable Chrome Wrap Visualizer — Task 2 完成报告

状态：完成并已提交；无阻塞项。

- 唯一需求：完整读取 `printable-wrap-task-2-brief.md`，未从其他计划引入需求。
- Task 1：已读取 `src/printable-wrap-state.js`，复用 `finishMaterialSettings`；placement 的 rotation 按度输入、转弧度送入 shader。
- 基线 SHA：`f8a4a672f28c85085328dd2d618f96372c3db511`。
- 实现 SHA：`947f1822bbecdbf95838fa648bd30f124ca43802`。
- 提交：`feat: add printable wrap material`，在用户指定的当前项目直接提交。
- 提交仅含 brief 指定的三个文件：`src/printable-wrap-scene.js`、`scripts/test-printable-wrap-scene.mjs`、`package.json`。本报告在提交后记录 SHA，作为本地交接文件保留，不在上述提交内。

## RED / GREEN 证据

本环境初次执行 pnpm 脚本时报 `sh: node: command not found`；这是环境问题，不算 RED。之后所有命令均先执行以下会话级 PATH 设置，没有修改项目或全局配置：

```sh
export PATH="/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
```

修改前基线：`pnpm test-printable-wrap && pnpm test-cybertruck`，exit 0：

```text
$ node scripts/test-printable-wrap-state.mjs
Printable wrap state tests passed
$ node scripts/test-cybertruck-config.mjs && node scripts/test-cybertruck-scene.mjs
Cybertruck configuration tests passed
Cybertruck isolation, material shape, alpha and disposal checks passed
```

RED：先添加 synthetic isolation/shader/finish/dispose 测试与 package 脚本，尚未创建实现文件。运行 `pnpm test-printable-wrap-scene`，exit 1，相关原始输出：

```text
$ node scripts/test-printable-wrap-scene.mjs
AssertionError [ERR_ASSERTION]: printable wrap needs an isolated scene factory
    at file:///Users/geekou/Documents/%E5%85%AC%E5%8F%B8%E7%BD%91%E7%AB%99/scripts/test-printable-wrap-scene.mjs:7:8
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: false,
  expected: true,
  operator: '==',
  diff: 'simple'
Node.js v24.19.0
[ELIFECYCLE] Command failed with exit code 1.
```

随后实现 factory，首次 `pnpm test-printable-wrap-scene && pnpm test-cybertruck` 即 GREEN。另补充真实 GLB 回归断言（没有额外生产代码改动）。提交前最终命令：

```sh
pnpm test-printable-wrap-scene && pnpm test-cybertruck && pnpm test-printable-wrap && pnpm build && git diff --check
```

最终 exit 0；测试输出：

```text
$ node scripts/test-printable-wrap-scene.mjs
Actual GLB: 1 owned paint, 10 shared non-paint meshes, 11 shared geometries; dispose: owned=1 shared=0
Printable wrap isolation, Silver, full alpha/depth/blending, shader, projection, finish and disposal checks passed
$ node scripts/test-cybertruck-config.mjs && node scripts/test-cybertruck-scene.mjs
Cybertruck configuration tests passed
Cybertruck isolation, material shape, alpha and disposal checks passed
$ node scripts/test-printable-wrap-state.mjs
Printable wrap state tests passed
$ vite build
vite v8.2.2 building client environment for production...
✓ 2387 modules transformed.
dist/index.html                               0.47 kB │ gzip:   0.32 kB
dist/assets/index-DnarFx5u.css               68.85 kB │ gzip:  13.94 kB
dist/assets/index-DoM-Ou6a.js               251.71 kB │ gzip:  78.64 kB
dist/assets/CybertruckViewer-i5Z5J__1.js  1,034.90 kB │ gzip: 282.90 kB
✓ built in 712ms
(!) Some chunks are larger than 500 kB after minification.
```

`git diff --check`、`git diff --cached --check` 均无输出并成功。

## 材质分类与 dispose 证据

复用 `mapMaterialShape`，完全沿用现有 viewer 的分类契约：mesh 名匹配 `/^car_paint(?:$|[_.])/i`，或 material 名匹配 `/^car_paint_mat/i`。不采用 body/trim 的宽泛猜测。

真实 `public/models/Tesla_Cybertruck3.glb` 通过 GLTFLoader 解析后的 identity 断言：

| 网格 | 材质处理 | 几何处理 |
| --- | --- | --- |
| car_paint | 唯一独占 MeshPhysicalMaterial；Silver #B4B4B4、metalness 1 | 与源对象严格相等 |
| body | 原 body_mat 严格同一对象 | 与源对象严格相等 |
| glass_light、glass_windows | 原玻璃材质严格同一对象 | 与源对象严格相等 |
| interior、light、trunk | 原材质严格同一对象 | 与源对象严格相等 |
| wheel_BL、wheel_BR、wheel_FL、wheel_FR | 原 wheel_mat 严格同一对象 | 与源对象严格相等 |

- 真实 GLB：1 个 owned paint、10 个非车漆网格保留材质、11 个网格全部共享几何。监听 dispose 后：owned=1、shared=0。
- 合成场景：单材质和数组形状保持；另一个实例的 paint/uniforms 不受改动；重复 `dispose()` 仅触发 owned material 一次。geometry、源 paint/trim/glass、map、alphaMap、grain、artwork、另一实例材质的 dispose 计数均为 0。
- 合成场景源 scene/material 的序列化快照前后一致；原 geometry.boundingBox 保持 null，测量不调用会写入共享 geometry 的 computeBoundingBox。
- 使用 `THREE.Material.prototype.copy` 保留基础渲染字段；单独共享原 alphaMap 与 map，保留 map 携带的 alpha。断言覆盖 opacity、transparent、alphaTest、alphaHash、alphaToCoverage、premultipliedAlpha、alphaMap、map、side、forceSinglePass、depthWrite/Test/Func、blending、全部 blend factors/equations（包括 Alpha 变体）、blendColor/Alpha、polygonOffset 及其 factor/units。
- matte/gloss 往返切换后重复上述字段断言，全部保持源值。只更新 roughness、clearcoat、clearcoatRoughness、roughnessMap；纹理开关只设置必要的材质重编译标志。

## 投影与 WebGL 验证

- GLB 中 wheel_BL / wheel_FL 位于 +X，故指定模型局部 +X 为左侧；模型前方为 +Z，侧面投影为 (-Z,Y)。保留 GLB 子节点的旋转/缩放，排除 scene 根节点的 viewer 变换。
- 由车漆网格 position 数据测量，真实 GLB 的 projection min 为 `[-2.9907585182162757, 0.45549860930202113]`，size 为 `[5.982898437155785, 1.448123281161195]`。非车漆网格不扩展投影边界。
- 每个 mesh 的独占材质持有自己的 mesh-to-model / inverse-transpose normal 矩阵；所有车漆共用同一模型的 placement / bounds。测试含嵌套旋转、非均匀缩放、多材质、多实例、空场景及外层 viewer 变换。
- shader 在 color_fragment 后、物理光照前注入，仅执行 `diffuseColor.rgb = mix(diffuseColor.rgb, printTexel.rgb, printTexel.a)`。左右判断来自原始 outward normal，不受视角翻面影响；归一化法线 X > 0.5 才接受。超出 [0,1] 的采样坐标不应用印花，不 discard 车体。
- alpha/map/test/hash/opaque shader chunks 原样保留；注入区域不写 alpha、opacity、gl_FragColor 或 gl_FragDepth。

按 browser 技能进行了本地实际 WebGL 编译及 readRenderTargetPixels 补充验证，增加了 GPU 证据，没有修改任何页面源文件。启动命令为 `pnpm dev --host 127.0.0.1 --port 5192 --strictPort`；临时浏览器页及此测试服务器已关闭。

测试使用真实 factory + BoxGeometry(2,2,6)、64×64 render target、opacity=.63、纯红/全透明 DataTexture、正交相机。为让 RGB 差异可测，仅在测试实例将 metalness 设为 0 并加 AmbientLight；生产默认 metalness=1 已由 Node 测试断言。

```text
errors: []
base:        [68, 68, 68, 161]
left:        [149, 0, 0, 161]
transparent: [68, 68, 68, 161]
outside:     [68, 68, 68, 161]
right:       [68, 68, 68, 161]
roof:        [68, 68, 68, 161]
rotated:     [149, 0, 0, 161]
matte:       [153, 0, 0, 161]
pass: true
```

浏览器临时测试因直接导入 Three.js 与 Vite 预构建模块并存，出现一次 `Multiple instances of Three.js being imported` 测试装载警告；shader 编译错误为零。这不是生产文件的重复依赖变更。

## 自审与 concerns

- 逐项对照唯一 brief，自审通过：API、Silver、精确分类、共享几何/非车漆、完整 alpha/depth/blending、baseColor-only shader、左侧法线/矩形遮罩、finish 与资源释放均有证据。
- 使用 TDD、完成前验证和收尾流程；由于任务已明确批准，未另行设计或新建 worktree。没有可用的子代理工具，本报告是主代理自审，不宣称完成独立代码评审。
- Task 1 文件、现有 Cybertruck viewer、GLB、其他页面/UI 均未修改；没有接入或实现后续 Task。
- 原有 `.superpowers/sdd/progress.md`（8 additions）、`scripts/test-rendered-ui.mjs`（2 additions / 1 deletion）和其他未跟踪交接文件保留，未暂存或提交。
- 无阻塞 concern。构建存在 CybertruckViewer >500 kB 分块告警；与本次独立 factory 的功能验证分开记录，未越界调整打包。
- 当前针对静态 GLB；setPlacement 接收 Task 1 校验后的完整 placement。纹理生命周期仍由调用方负责。本任务没有验证未来 UI 的最终视觉效果或上传流程。
- Git 提示使用系统自动推断的提交者身份；未擅自修改用户 Git 配置。

## 2026-09-09 审阅问题修复

状态：审阅要求已修复并单独提交；本节及整份报告未进入提交。

- 修复前 SHA：`947f1822bbecdbf95838fa648bd30f124ca43802`。
- 修复 SHA：`521d727d84ea6bd51d966c46e890a1cfa446000c`。
- 提交：`fix: preserve printable silver and paint bounds`。
- 提交文件：
  - `src/printable-wrap-scene.js`
  - `scripts/test-printable-wrap-scene.mjs`
  - `scripts/test-printable-wrap-webgl.mjs`
  - `package.json`
- 未提交本报告，也未暂存/提交原有 `.superpowers/sdd/progress.md`、`scripts/test-rendered-ui.mjs` 或其他无关脏文件。

### 根因与实现

- Three r185 的标准 `map_fragment` 在印花混合前执行 `diffuseColor *= sampledDiffuseColor`，使源 `material.map` 的 RGB 调制固定 Silver；透明 artwork 因此露出被染色的底色。现保留 `material.map`/`USE_MAP` 及其采样，但 shader 只执行 `diffuseColor.a *= sampledDiffuseColor.a`，所以源 map alpha、后续 alphaMap/alphaTest/hash 与材质 opacity 语义保持，RGB 不再参与 Silver 或 artwork。
- 旧投影逻辑只记录一个 mesh 是否包含任一 paint material，随后把 geometry 的全部 position 顶点加入 bounds。现记录被分类为 paint 的 material indices；多材质 mesh 只遍历对应 geometry groups 引用的 indexed/non-indexed 顶点，并与 draw range 求交。单材质真实 GLB 路径保持不变。

### TDD / 回归敏感性证据

所有命令使用：

```sh
node_bin=/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
export PATH="$node_bin:$PATH"
```

修复前基线，exit 0：

```sh
pnpm test-printable-wrap-scene && pnpm test-cybertruck
```

```text
$ node scripts/test-printable-wrap-scene.mjs
Actual GLB: 1 owned paint, 10 shared non-paint meshes, 11 shared geometries; dispose: owned=1 shared=0
Printable wrap isolation, Silver, full alpha/depth/blending, shader, projection, finish and disposal checks passed
$ node scripts/test-cybertruck-config.mjs && node scripts/test-cybertruck-scene.mjs
Cybertruck configuration tests passed
Cybertruck isolation, material shape, alpha and disposal checks passed
```

RED 1：先添加 source-map alpha-only shader 契约，未改生产代码；`pnpm test-printable-wrap-scene` exit 1：

```text
AssertionError [ERR_ASSERTION]: source map RGB must not modulate fixed Silver or artwork
actual fragment shader still contained: #include <map_fragment>
```

RED 2：完成 alpha-only 最小修复后，同一命令在多材质 group fixture 处 exit 1：

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
actual:   [ -1000, 0 ]
expected: [ -2, 0 ]
```

新增可复现 WebGL 像素测试后，临时恢复旧 `diffuseColor *= sampledDiffuseColor` 再运行 `node scripts/test-printable-wrap-webgl.mjs`，exit 1；随后恢复修复：

```text
AssertionError [ERR_ASSERTION]: transparent artwork/source map RGB tinted Silver:
{"baseline":[116,116,116,255],"mapped":[7,51,15,128],"baselineRgb":[116,116,116],"mappedRgb":[14,102,30]}
```

GREEN：恢复 alpha-only 代码后 `pnpm test-printable-wrap-scene` exit 0：

```text
$ node scripts/test-printable-wrap-scene.mjs && node scripts/test-printable-wrap-webgl.mjs
Actual GLB: 1 owned paint, 10 shared non-paint meshes, 11 shared geometries; dispose: owned=1 shared=0
Printable wrap isolation, Silver, full alpha/depth/blending, shader, projection, finish and disposal checks passed
Printable wrap WebGL map-alpha isolation passed: {"baseline":[116,116,116,255],"mapped":[58,58,58,128],"baselineRgb":[116,116,116],"mappedRgb":[116,116,116]}
```

该 GPU 结果证明：彩色 source map 的 alpha 128 仍进入最终 alpha；全透明紫色 artwork 下，去预乘 RGB 与无 map Silver 基线完全一致，未受 source map 的绿色 RGB 染色。

### 真实 GLB 契约

- projection tolerance 固定为 `1e-6`。
- projection min 固定为 `[-2.9907585182162757, 0.45549860930202113]`。
- projection size 固定为 `[5.982898437155785, 1.448123281161195]`。
- `wheel_BL`/`wheel_FL` 的模型局部中心为正 X，`wheel_BR`/`wheel_FR` 为负 X，测试据此固化“+X 是左侧”。
- 真实 `car_paint` 同时存在 `position.x > 1 && transformedNormal.x > 0.5` 的左侧 outward normals，以及 `position.x < -1 && transformedNormal.x < -0.5` 的右侧反向 normals；shader 继续用 inverse-transpose `uModelNormalMatrix * objectNormal` 与 `normal.x > 0.5` 契约。

### 提交前完整验证

命令，exit 0：

```sh
pnpm test-printable-wrap-scene && pnpm test-cybertruck && pnpm test-printable-wrap && pnpm build && git diff --check
```

```text
$ node scripts/test-printable-wrap-scene.mjs && node scripts/test-printable-wrap-webgl.mjs
Actual GLB: 1 owned paint, 10 shared non-paint meshes, 11 shared geometries; dispose: owned=1 shared=0
Printable wrap isolation, Silver, full alpha/depth/blending, shader, projection, finish and disposal checks passed
Printable wrap WebGL map-alpha isolation passed: {"baseline":[116,116,116,255],"mapped":[58,58,58,128],"baselineRgb":[116,116,116],"mappedRgb":[116,116,116]}
$ node scripts/test-cybertruck-config.mjs && node scripts/test-cybertruck-scene.mjs
Cybertruck configuration tests passed
Cybertruck isolation, material shape, alpha and disposal checks passed
$ node scripts/test-printable-wrap-state.mjs
Printable wrap state tests passed
$ vite build
✓ 2387 modules transformed.
✓ built in 590ms
```

`git diff --check`、`git diff --cached --check` 均无输出并成功。构建仅保留既有 CybertruckViewer 大于 500 kB 的 chunk warning。当前环境没有可调用的独立 reviewer 子代理；已按 code-reviewer checklist 对规格、真实行为、边界、资源所有权和提交范围完成主代理自审，未发现 Critical/Important 问题。

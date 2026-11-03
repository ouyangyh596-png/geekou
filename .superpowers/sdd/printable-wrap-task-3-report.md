# Printable Chrome Wrap Visualizer — Task 3 Report

## 状态与提交

- 状态：完成。
- 提交：`507e21d3d15fe8c80714b799ba5ab73e499023b3`（`feat: build printable wrap viewer`）。
- 提交文件仅有：
  - `src/components/PrintableWrapViewer.jsx`
  - `scripts/test-printable-wrap-viewer.mjs`
  - `package.json`
- `src/components/CybertruckViewer.jsx` 未修改。原有 `.superpowers/sdd/progress.md`、`scripts/test-rendered-ui.mjs` 及其他未跟踪交接文件均未暂存、未提交。
- 本报告在取得最终提交 SHA 后生成，未回改上述提交。

## 实现摘要

- 新增独立 `PrintableWrapViewer`，复用经典 viewer 的 `Canvas`、懒进入视口、`RoomEnvironment`、灯光、错误边界、模型缩放和相机 framing 模式。
- 通过 `useGLTF(CYBERTRUCK_MODEL_PATH)` 读取共享缓存 GLB；`createPrintableWrapInstance(scene, grain)` 只在 `scene` 或 grain 改变时创建实例。`placement`、`finish` 和 artwork texture 各自由 effect 调用 `setPlacement`、`setFinish`、`setArtwork`，不会因控件更新重建 GLB/scene instance。
- artwork 使用 `THREE.TextureLoader` 解码，纹理在上传前设置 `THREE.SRGBColorSpace` 和线性放大过滤。URL 替换、加载失败或组件卸载时先从实例 detach，再由幂等 owner cleanup 调用 `texture.dispose()`；`active` guard 阻止过期加载回调把旧 texture 重新绑定。对象 URL 的创建/revoke 仍由计划中的 Task 4 configurator 持有，本 viewer 不释放父组件所有的 URL。
- 默认相机从模型局部 `+X`（Task 2 已验证为可打印左侧）方向观察，并带少量 `+Z` 前侧角度。
- `editMode === 'positionArtwork'` 时禁用 OrbitControls、捕获主 pointer，并把每段 pointer delta 按当前 stage 尺寸归一化到 `[-1, 1]`。回调严格只发送 `{ x, y }`，不覆盖 slider 持有的 `scale`/`rotation`。零宽高 stage 使用 1px 下限，避免无穷/NaN placement。
- `editMode === 'rotateVehicle'` 时外层 pointer handler 立即返回，输入由 OrbitControls 持有。
- Canvas 使用 `frameloop="demand"`；相机、placement、finish、artwork 绑定/解绑都显式 `invalidate()`。stage 使用带可访问名称的 `role="region"`。

## TDD：RED / GREEN

所有有效测试运行均使用工作区 bundled Node：

```sh
export PATH="/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
```

环境预检第一次运行因 shell 找不到 `node` 而 exit 1；这是运行环境错误，不计作 RED。加载 bundled Node 后重新运行。

### RED 1：Task 3 source contracts

先创建 `scripts/test-printable-wrap-viewer.mjs` 与 package script，未创建生产组件。`pnpm test-printable-wrap-viewer` exit 1：

```text
AssertionError [ERR_ASSERTION]: printable wrap needs its own viewer component
actual: false
expected: true
```

### GREEN 1：核心 viewer

新增 viewer 的模型、texture、uniform effect、相机、OrbitControls 和 pointer 路径后，同一命令 exit 0：

```text
Printable wrap viewer source contracts passed
```

### RED / GREEN 2：零尺寸 stage

自审补充零宽高边界测试，生产代码尚未保护分母时 exit 1：

```text
AssertionError [ERR_ASSERTION]: a temporarily zero-width stage must not produce infinite placement
```

加入 `Math.max(width, 1)` / `Math.max(height, 1)` 后，同一命令 exit 0。

### RED / GREEN 3：可访问 stage 名称

自审补充可命名 landmark 契约，只有 `aria-label`、没有 nameable role 时 exit 1：

```text
AssertionError [ERR_ASSERTION]: the stage label must be exposed through a nameable landmark role
```

加入 `role="region"` 后，同一命令 exit 0。

## 最终验证

提交前完整命令：

```sh
pnpm test-printable-wrap-viewer && \
pnpm test-printable-wrap-scene && \
pnpm test-cybertruck && \
pnpm test-printable-wrap && \
pnpm build && \
git diff --check
```

结果：exit 0。

```text
Printable wrap viewer source contracts passed
Actual GLB: 1 owned paint, 10 shared non-paint meshes, 11 shared geometries; dispose: owned=1 shared=0
Printable wrap isolation, Silver, full alpha/depth/blending, shader, projection, finish and disposal checks passed
Printable wrap WebGL map-alpha isolation passed
Cybertruck configuration tests passed
Cybertruck isolation, material shape, alpha and disposal checks passed
Printable wrap state tests passed
vite: 2387 modules transformed; built in 586ms
```

`git diff --check` 与暂存后的 `git diff --cached --check` 均无输出并成功。暂存清单核对为 3 个目标文件，提交统计为 273 insertions。

## 自审

- 规格逐项核对：共享模型路径、独立 scene factory、sRGB texture、texture 生命周期、uniform/material 原位更新、左侧默认相机、edit mode 输入所有权、position-only delta callback、bounded placement、demand invalidation、可访问 stage 均有 source contract 和/或既有 Task 1/2 行为测试覆盖。
- 资源所有权核对：viewer 只 dispose 自己创建的 artwork texture、grain 和 printable instance owned materials；不 dispose `useGLTF` 缓存 geometry/material，也不 revoke 父层 object URL。
- 异步核对：旧 texture effect cleanup 先 detach 并 dispose；迟到的成功/失败 callback 被 `active` guard 丢弃；`released` guard 防止 error + cleanup 重复 dispose。
- 交互核对：pointer ref 保存最近一次已发 placement，所以连续 move 不依赖 React 父层同步 rerender；回调不 spread 原 placement，不会回写 scale/rotation。
- 隔离核对：经典 viewer 无 diff；提交内无 UI 路由、上传 configurator、CSS 或其他后续 Task 4/5 工作。
- 当前环境没有独立 reviewer subagent 工具；本节为主代理按 brief 和 code-reviewer checklist 的自审，不宣称独立评审。

## Concerns

- 构建成功但保留既有 `CybertruckViewer` chunk 大于 500 kB 的 Vite warning；不是本任务引入，未越界调整拆包。
- 本 Task 按计划只做 source-contract 与既有真实 GLB/WebGL 回归；组件尚未由 Task 4 路由挂载，因此最终页面中的 upload/revoke 集成和实际拖拽视觉验收仍属于后续 Task 4/5。
- Git 使用系统自动推断的提交者身份并输出提示；未擅自修改用户 Git 配置。

# Cybertruck Classic Colours 3D 交互设计

## 目标

在首页 `Super Chrome Film / Classic Colours` 产品模块中加入 Tesla Cybertruck GLB 模型。用户点击色相选项后，车身漆面实时更换颜色，并保持镜面高光与细微粗糙颗粒，呈现哑面电镀效果。

## 视觉与材质

- 使用 `/models/Tesla_Cybertruck3.glb` 作为模型资源。
- 仅修改车身相关材质；车窗、轮胎、灯组和内饰保留 GLB 原始材质。
- 车身材质使用动态颜色、较高 metalness 和中低 roughness，形成金属镜面反射。
- 使用程序化噪声或细微 normal/roughness 变化叠加颗粒，不改变车身轮廓。
- 色卡沿用 Classic Colours 现有布局与品牌色，选中状态有清晰但克制的视觉反馈。

## 交互

- 桌面端：拖拽旋转模型，滚轮调整相机距离。
- 手机端：单指拖动旋转，双指缩放；不阻断页面纵向滚动。
- 点击色卡立即切换车身颜色，并使用短时平滑过渡。
- 模型首次进入视口时懒加载，避免影响首页首屏性能。
- WebGL、模型或资源加载失败时，显示现有 Classic Colours 卡片内容作为降级方案。

## 组件边界

- `src/components/CybertruckViewer.jsx`：Three.js 场景、GLB 加载、材质识别、相机控制和生命周期清理。
- `src/cybertruck-colours.js`：颜色名称、色值、材质参数和车身材质识别规则。
- `src/styles.css`：查看器容器、色卡、响应式布局和加载/错误状态。
- `src/main.jsx`：在 Classic Colours 产品模块挂载查看器与色卡。
- `public/models/Tesla_Cybertruck3.glb`：模型资源。

## 性能与兼容性

- 使用 `@react-three/fiber` 与 `@react-three/drei`，复用 React 生命周期。
- 使用 `IntersectionObserver` 或等效机制延迟初始化。
- 限制像素比，移动端优先保证稳定帧率。
- 组件卸载时释放 renderer、材质、几何体和纹理。
- `prefers-reduced-motion` 下关闭自动旋转与过渡动画。

## 验收标准

1. Classic Colours 模块可看到 Cybertruck，模型不变形、不拉伸。
2. 点击每个色相后，车身颜色变化，车窗/轮胎/灯组不被错误染色。
3. 车身同时具备金属反光和细微颗粒质感。
4. 桌面端旋转/缩放和手机端触摸交互可用，页面仍可纵向滚动。
5. 模型加载失败时页面不白屏，保留产品模块内容。
6. `pnpm build` 和现有测试通过。

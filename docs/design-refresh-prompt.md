# SO-FINE 官网视觉优化任务（给 Codex）

你在仓库 `~/Documents/公司网站`（Vite + React + @react-three/fiber，单页应用，hash 路由 `#category=<slug>`）中工作。样式主要在 `src/styles.css`、`src/polish.css`、`src/detail.css`，文案在 `src/content/site-content.js`、`src/content/company.js`，多语言在 `src/language.js`，产品轮播在 `src/product-wheel-navigation.js`，3D 车在 `src/components/CybertruckViewer.jsx`。线上版本：https://so-fine-site.pages.dev/

## 设计目标
SO-FINE 是做广告印刷基材、车身改色膜、PPF、单透膜、冷裱膜等胶粘制品的工厂。整站要呈现"精密工业材料品牌"的高级感：克制、干净、有秩序，参考 3M、Avery Dennison、Apple 产品页的节奏。少即是多，宁可留白也不要放空容器或占位图。

## 全局规则（先做这一步）
1. **建立设计令牌**：在 `styles.css` 顶部用 CSS 变量统一定义颜色、字号、间距、圆角、阴影。删除 `polish.css` 里与之冲突的硬编码值。
   - 颜色：主色 navy `#0B1F3A`，品牌蓝 `#0A60C8`，浅底 `#F4F7FB`，正文灰 `#4A5568`，次要灰 `#6B7280`，分割线 `#E5E9F0`。金色只保留在页头渐变线一处。
   - 字号阶梯（桌面）：Display 72 / H1 56 / H2 40 / H3 24 / Body 17 / Small 14 / Label 12。**全站不允许小于 12px 的文字**（现在导航、表单标签、页脚、轮播侧卡有 10–11px）。移动端按 0.75 比例缩放。
   - 间距只用 8 的倍数（8/16/24/32/48/64/96/128），区块上下内边距统一 128px（移动端 72px）。
2. **字体收敛到 2 套**：标题用现有的窄体 grotesque，正文和标签用同一款几何无衬线。衬线斜体只保留在每个区块标题的一个强调词上（如 "surface."），其他地方去掉。小号大写追踪标签字距统一为 0.12em。
3. **统一容器**：所有页面用同一个 `.container { max-width: 1280px; margin: 0 auto; padding-inline: 32px; }`。修复分类页页头比首页右移约 55px 的问题（给 html 加 `scrollbar-gutter: stable`，并确保两类页面用同一个容器）。
4. **滚动渐显动画**：缩短为 400ms、位移不超过 16px，触发阈值提前（`rootMargin: '0px 0px -10% 0px'`），保证标题出现在视口时已经完全可读。尊重 `prefers-reduced-motion`。

## 逐区块修改
### 页头
- 导航链接 15px，链接间距 32px，Products 下拉箭头与文字间留 6px，与下一个链接拉开。
- 语言选择器改成自定义下拉，显示当前语言，选项统一用各语言的自称：English, Español, العربية, Русский, Deutsch, Português, Français, Italiano, Polski, Türkçe, Українська, 中文。修复切换后仍显示 "English" 的问题。

### 首屏 Hero
- 标题 "SUPER CHROME FILM" 去掉彩虹渐变，改纯白，并在视频上加自下而上的深色渐变遮罩（`linear-gradient(to top, rgba(11,31,58,.75), transparent 60%)`），文字放在左下角而非压在车上。
- 按钮文案改为 "Explore products"。
- 删除底部黑条和 "SO-FINE | AUTOFACE" 水印，让视频干净地衔接下一区块。
- 补一行副标题（如 "Precision-engineered films for print, wrap and protection."）。

### PPF 区块 "Protection in motion."
- 文字与 3D 渲染分栏：文字左 5 列，渲染右 7 列，不再叠在一起。确保标题对比度 ≥ 4.5:1。

### 工厂区块 "20 years of industrial expertise"
- 修正错别字：tchnology→technology，entensive→extensive，gurantee→guarantee。
- 遮罩加深到 60%，文字放在左侧单独一块半透明 navy 面板中，正文 17px、行高 1.6、最大行宽 60ch。
- "SO-FINE FACTORY / AERIAL VIEW" 标签提高对比度（白色 70% 不透明度）。
- 加一排 3–4 个关键数字（成立年份、工厂面积、年产能、出口国家数），用大号数字 + 小标签的形式。数字请留 TODO 占位，由我提供真实数据，不要编造。

### 产品轮播 "Choose a surface"
- 减少滚动劫持：一次滚轮手势最多前进 1 张，且整个区块的固定滚动距离缩短到不超过 4 屏；鼠标在卡片上时滚动也不能被卡住。增加左右箭头按钮和底部进度点，支持键盘左右键。
- 侧边卡片去掉倾斜，只做缩放 0.9 + 不透明度 0.5，侧卡标签至少 13px。
- Super Chrome 卡（07）：3D 模型加载前显示一张静态封面图和骨架屏，不要出现空白；车模型放大到占卡片 70% 宽度，色板放在卡片底部一行。
- 删除文本中游离的 "071 / 115" 计数，计数格式统一为 "07 / 11"。
- 产品族顺序按业务重要性排，并与页头下拉菜单保持一致。

### "Precision is the foundation" 网格
- 删除右下角空白格，改成 2×2 + 1 张横跨的大卡，或 3 列 × 2 行时补满 6 格。
- 背景杂图（PVC 颗粒、勾、握手、打印机）全部替换为统一风格的线性图标（使用已安装的 `lucide-react`，描边 1.5px，品牌蓝），图标 32px 放在卡片左上，去掉低透明度背景图。

### 联系区块和页脚
- 表单改为两栏布局：左侧标题、邮箱、电话、地址信息，右侧表单，填满宽度。
- 表单标签 13px，输入框高度 48px，聚焦时底线变品牌蓝。
- "PROJECT INQUIRY" 标签与右侧说明文字对齐到同一基线。
- 页脚文字 14px，颜色用正文灰，三栏间距 64px，加上版权行。

### 分类页（`#category=*`）
- PPF 页：产品卡下方那块约 960×340 的空灰底面板，没有图时直接隐藏（检查 `product-media.js` 的取图逻辑，图片缺失时不渲染容器）。
- Cast Wrap Vinyl 页：卡片上下的空白灰条同理隐藏；四张卡等高（flex + `margin-top:auto` 让 "View models" 链接底部对齐）；修正 revets→rivets。
- 规格表：表头 navy 底白字或浅底加粗，正文 14px，隔行浅底，数字列右对齐，"–" 占位改为空白或 "N/A"。表格在移动端可横向滚动并固定第一列。
- 规格表中两行内容完全相同的（AF1810、AF1850），留 TODO 让我补差异字段，不要编造。

### 多语言
- 中文版目前只翻译了导航和少量标题。把 `site-content.js` 中所有面向用户的文案都接入 `language.js`，中文翻译补齐 Hero、PPF、工厂、轮播卡片、网格、表单、页脚。避免同一行中英混排（如 "产品库 / 11 FAMILIES" 改为 "产品库 / 11 个系列"）。其他语言缺失的文案回退到英文，不要留空。

## 验收标准
- 运行 `pnpm test-release` 全部通过；如有测试断言依赖旧样式或旧文案，更新测试而不是删掉。
- 在 1440、1024、390 三种宽度下逐页截图自查：无小于 12px 文字、无空白占位容器、无文字压在高亮背景上、首页与分类页页头位置一致。
- 每完成一个区块做一次独立 commit，信息格式 `style: <区块> ...`。
- 完成后列出所有 TODO（需要我提供的真实数据和图片）。

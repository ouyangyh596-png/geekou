# Printable Chrome Wrap Visualizer — Task 1 Report

## 改动文件

- `src/printable-wrap-state.js`
  - 新增 `validateArtworkFile(file)`：仅接受 PNG、JPEG、WebP，且文件大小必须大于 0 且不超过 12 MB。
  - 新增冻结的 `DEFAULT_PRINT_PLACEMENT`：`{ x: 0, y: 0, scale: 1, rotation: 0 }`。
  - 新增 `updatePrintPlacement(placement, patch)`：将 x/y 限制在 `[-1, 1]`，scale 限制在 `[0.35, 2.5]`，rotation 限制在 `[-180, 180]`。
  - 新增 `finishMaterialSettings(finish)`：提供 matte 与 glossy 的纯状态材质参数。
- `scripts/test-printable-wrap-state.mjs`
  - 新增 Node 原生断言测试，覆盖 brief 要求的文件类型、文件大小、默认位置、位置边界和覆膜 grain 状态。
- `package.json`
  - 新增 `test-printable-wrap` 脚本。
  - 将 `test-printable-wrap` 加入 `test-release`。

## TDD 验证

### RED

命令：

```bash
/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/test-printable-wrap-state.mjs
```

输出摘要：退出码 `1`；Node 报告 `ERR_MODULE_NOT_FOUND`，因为实现文件 `src/printable-wrap-state.js` 尚不存在。

### GREEN

命令：

```bash
PATH=/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH /Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm test-printable-wrap
```

输出摘要：退出码 `0`；`Printable wrap state tests passed`。

回归命令：

```bash
PATH=/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH /Users/geekou/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm test-release
```

输出摘要：退出码 `0`；内容校验、polish、Cybertruck、滚动、语言、首页媒体、产品轮盘、分类媒体、无障碍资源及 Printable wrap state 测试全部通过。

## 自审结果

- 已完整按 brief 实现 4 个导出接口，未增加 UI、网络或持久化逻辑。
- 已验证 `git diff --check` 与暂存区 diff 检查通过。
- 提交前暂存区仅包含 brief 指定的 3 个文件。
- 仓库原有脏文件未修改、未暂存、未提交。
- 当前环境没有默认 `node` 命令，因此测试使用工作区提供的 bundled Node/pnpm 路径；这不影响测试结果。

## 提交

`f8a4a67` (`test: define printable wrap state`)

## Concerns

无功能性 concerns。报告文件按用户要求在提交后生成，因此未纳入本次 brief 指定的代码提交；仓库其他既有脏文件仍保持原状。

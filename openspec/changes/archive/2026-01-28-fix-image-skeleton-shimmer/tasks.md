# Tasks: fix-image-skeleton-shimmer

## Implementation Tasks

1. **修复 shimmer 动画 CSS**
   - [x] 修改 `@keyframes md-image-shimmer`，将 `background-position` 改为从 `-200% 0` 到 `200% 0`
   - [x] 为 `.md-image-skeleton` 添加 `linear` 缓动：`animation: md-image-shimmer 1.5s linear infinite;`

2. **稳定块 key 生成策略**
   - [x] 修改 `BlockCache.generateKey()`，仅使用 `index` 生成 key
   - [x] 移除 source hash，避免流式输入时 key 变化导致组件重建

3. **构建并验证**
   - [x] 运行 `pnpm build:core` 和 `pnpm build:react`
   - [x] 在 Storybook 中验证图片骨架屏流光效果
   - [x] 确认组件不再频繁重建（通过日志验证）

4. **清理调试代码**
   - [x] 移除 `StreamingImage.tsx` 中的调试日志
   - [x] 移除 `StreamingMarkdown.tsx` 中的调试日志

## Validation
- [x] 图片加载时显示流光动画
- [x] 流光从左向右平滑扫过
- [x] 组件实例在流式输入过程中保持稳定

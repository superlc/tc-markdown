# Change: 优化链接和图片的流式显示

## Why
当前流式渲染中，链接和图片在 URL 完整前会被完全缓冲，导致用户看到内容"突然出现"而非渐进式显示，体验不佳。

## What Changes

### 链接优化
- **当前行为**：缓冲 `[text](` 直到 URL 完整才显示
- **新行为**：一旦检测到链接结构 `[`，立即显示为链接（用占位 URL），链接文字逐字填充

### 图片优化
- **当前行为**：缓冲 `![alt](` 直到 URL 完整才显示
- **新行为**：一旦检测到图片结构 `![`，立即显示占位图，URL 完整后替换为实际图片

## Impact
- Affected specs: `markdown-streaming`
- Affected code:
  - `packages/core/src/streaming/stream-buffer.ts`（修改链接/图片缓冲策略）
  - `packages/core/src/inline-prediction/completer.ts`（增强链接/图片补全逻辑）
  - 可能需要配置占位图 URL

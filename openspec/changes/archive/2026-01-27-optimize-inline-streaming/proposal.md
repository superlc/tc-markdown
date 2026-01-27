# Change: 优化行内标记流式显示

## Why
当前流式渲染中，行内强调标记（如 `**粗体**`、`*斜体*`、`` `代码` ``）会被完全缓冲，直到检测到闭合标记才一次性显示。这导致用户看到的效果是文字"突然出现"而非"逐字流出"，体验不佳。

## What Changes
- **移除 emphasis 和 inline-code 的缓冲策略**：不再在 `stream-buffer.ts` 中缓冲这些标记
- **依赖 InlineCompleter 自动补全**：当流式输入 `**我` 时，直接输出并由 `InlineCompleter` 补全为 `**我**`，渲染为粗体
- **保留链接/图片的缓冲**：链接 `[text](url)` 需要结构完整才能正确渲染，保持缓冲策略

## Impact
- Affected specs: `markdown-streaming`
- Affected code: 
  - `packages/core/src/streaming/stream-buffer.ts`（移除 emphasis、inline-code 识别器）
  - 无需修改 `InlineCompleter`（已具备补全能力）

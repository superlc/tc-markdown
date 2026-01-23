# Change: 支持流式渲染（高性能增量方案）

## Why
当前 Markdown 组件只能在内容完整传入后一次性渲染。在 AI 对话、实时协作等场景中，内容是逐字/逐块流式到达的。用户需要看到内容实时渲染，而非等待全部内容加载完成。

**性能痛点**：简单的"每次追加重新解析全部内容"方案复杂度为 O(n²)，在长内容场景下会导致明显卡顿。

## What Changes

### @tc/md-core
- 新增 `createStreamingParser()` - 高性能增量解析器
- 采用**分块缓存策略**：仅重新解析未稳定的最后一个块，已稳定块复用缓存的 HAST
- 新增块边界检测器，识别段落、标题、代码块、列表、引用等块级边界
- 为每个块生成稳定的 key，支持框架增量渲染

### @tc/md-react
- 新增 `StreamingMarkdown` 组件 - 声明式流式渲染
- 新增 `useStreamingMarkdown` Hook - 命令式细粒度控制
- 基于 key 的增量 DOM 更新，稳定块不重新渲染
- RAF 批处理 + 可配置更新间隔

### @tc/md-vue
- 新增 `StreamingMarkdown` 组件
- 新增 `useStreamingMarkdown` Composable
- 响应式增量 VNode 生成
- 块级事件支持（`@block-stable`）

## Impact
- Affected specs: `markdown-streaming` (新增)
- Affected code:
  - `packages/core/src/streaming.ts` - 增量解析器
  - `packages/core/src/block-splitter.ts` - 块边界检测
  - `packages/core/src/block-cache.ts` - 块缓存管理
  - `packages/react/src/StreamingMarkdown.tsx`
  - `packages/react/src/useStreamingMarkdown.ts`
  - `packages/vue/src/StreamingMarkdown.ts`
  - `packages/vue/src/useStreamingMarkdown.ts`

## Performance Goals

| 指标 | 目标 |
|------|------|
| 单次 `append()` 延迟 | < 5ms (p99) |
| 渲染帧率 | ≥ 30fps |
| 内存增长 | < 1MB/分钟 |
| 缓存命中率（典型追加场景） | > 90% |

## Use Cases
1. **AI 聊天应用**: LLM 响应逐 token 流式输出，实时渲染 Markdown
2. **实时协作编辑**: 多人协作时内容实时同步渲染
3. **大文件渐进加载**: 大型文档分块加载时渐进显示

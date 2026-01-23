# Design: 流式渲染

## Context
Markdown 内容在 AI 对话场景中通常是流式到达的（如 SSE/WebSocket），当前组件需要等待完整内容才能渲染，导致用户体验不佳。

## Goals
- 支持内容逐块追加并实时渲染
- 保持渲染结果与非流式模式一致
- API 简洁易用
- **高性能增量解析**：避免重复解析已处理内容
- **增量渲染**：仅更新变化的 DOM 节点，减少重渲染开销

## Non-Goals
- 不实现虚拟滚动（大文档优化）
- 不实现协同编辑冲突处理
- 不改变现有非流式 API

## Decisions

### 1. 增量解析策略（高性能方案）

**Decision**: 采用**分块解析 + 稳定块缓存**策略

**核心思路**:
1. 将 Markdown 按块级元素（段落、标题、代码块、列表等）分割
2. 已闭合的稳定块直接复用缓存的 HAST，不重新解析
3. 仅对**最后一个可能未完成的块**进行重新解析
4. 新到达的完整块追加到缓存

```typescript
interface BlockCache {
  /** 块的原始文本 */
  source: string;
  /** 解析后的 HAST 节点 */
  hast: HastNode;
  /** 块是否稳定（已闭合） */
  stable: boolean;
  /** 块的唯一标识（用于增量渲染） */
  key: string;
}
```

**解析流程**:
```
新内容到达
    │
    ▼
按块级边界分割（空行、标题开始等）
    │
    ▼
┌─────────────────────────────────────┐
│ 对比已缓存的稳定块                    │
│ - 相同 → 复用缓存 HAST              │
│ - 新块 → 解析并标记为稳定            │
│ - 最后块 → 重新解析（可能未完成）     │
└─────────────────────────────────────┘
    │
    ▼
合并 HAST 节点，返回完整树
```

**块边界检测规则**:
- 空行（`\n\n`）分隔段落
- `#` 开头表示新标题块
- ` ``` ` 开头/结尾分隔代码块
- `-`/`*`/`1.` 开头识别列表项
- `>` 开头识别引用块
- `---`/`***` 识别分隔线

**稳定性判断**:
- 段落：遇到空行或新块开始即稳定
- 代码块：遇到闭合 ` ``` ` 即稳定
- 列表：遇到非列表项内容即稳定
- 其他块级元素：遇到空行即稳定

**Rationale**:
- 相比全量重新解析，性能提升 **5-10x**（典型场景）
- 块级解析与 Markdown 语法结构天然契合
- 缓存命中率高（AI 输出通常是追加模式）
- 实现复杂度可控，无需 fork remark-parse

**Alternatives considered**:
- 全量重新解析：简单但性能差，O(n²) 复杂度
- 字符级增量解析：需 fork remark-parse，维护成本过高
- 基于 diff 的更新：仍需全量解析，仅优化渲染层

### 2. 增量渲染策略

**Decision**: 采用 **Keyed HAST Nodes + 框架原生 Diff** 策略

**核心思路**:
1. 每个块级 HAST 节点携带稳定的 `key`
2. React/Vue 利用 key 进行高效 diff
3. 稳定块的 key 不变，框架跳过其 DOM 更新
4. 仅最后一个非稳定块可能触发 DOM 更新

```typescript
// HAST 节点附加 key
interface KeyedHastNode extends HastNode {
  properties: {
    'data-block-key': string;  // 稳定的块标识
    [key: string]: any;
  };
}
```

**Key 生成策略**:
- 稳定块：`stable-{blockIndex}-{contentHash前8位}`
- 非稳定块：`pending-{blockIndex}`

**React 渲染优化**:
```tsx
// 使用 memo 缓存稳定块的渲染结果
const StableBlock = memo(({ hast, blockKey }) => {
  return hastToReact(hast);
}, (prev, next) => prev.blockKey === next.blockKey);
```

**Vue 渲染优化**:
```vue
<template>
  <div v-for="block in blocks" :key="block.key">
    <component :is="renderBlock(block)" />
  </div>
</template>
```

**Rationale**:
- 利用框架原生 virtual DOM diff，无需手动操作 DOM
- Key 稳定性保证已渲染内容不闪烁
- 内存开销小（仅存储 key，不缓存 DOM 引用）

### 3. API 设计

**Decision**: 提供命令式 Parser 和声明式组件两种 API

```typescript
// 命令式 (Core) - 支持增量解析
const parser = createStreamingParser(options);
parser.append('# Hello');
parser.append(' World\n\n');
parser.append('New paragraph');

// 获取当前 HAST（含块级 key）
const { hast, blocks } = parser.getState();
// blocks: [{ key: 'stable-0-a1b2c3d4', stable: true }, { key: 'pending-1', stable: false }]

// 声明式 (React) - 自动增量渲染
<StreamingMarkdown 
  content={streamContent}  // 累积内容字符串
  onComplete={() => {}} 
/>

// Hook - 细粒度控制
const { 
  element,           // 渲染结果
  append,            // 追加内容
  reset,             // 重置
  blocks,            // 当前块状态
  stats              // 性能统计
} = useStreamingMarkdown(options);
```

### 4. 渲染更新频率

**Decision**: 智能批处理 + 可配置节流

**默认行为**:
- 使用 `requestAnimationFrame` 批处理同一帧内的多次 `append()`
- 每帧最多触发一次渲染更新

**可配置选项**:
```typescript
interface StreamingOptions {
  /** 最小更新间隔（ms），默认 16（约 60fps） */
  minUpdateInterval?: number;
  /** 最大批处理等待时间（ms），默认 50 */
  maxBatchWait?: number;
  /** 禁用批处理，每次 append 立即更新 */
  immediate?: boolean;
}
```

### 5. 未闭合块处理

**Decision**: 特殊样式标记 + 占位符

**代码块未闭合**:
```typescript
// 自动添加视觉提示
{
  type: 'element',
  tagName: 'pre',
  properties: { 
    'data-pending': true,
    className: ['code-block', 'code-block--pending']
  },
  children: [...]
}
```

**CSS 样式**:
```css
.code-block--pending {
  border-right: 2px solid #007acc;
  animation: cursor-blink 1s infinite;
}
```

## Performance Analysis

### 时间复杂度对比

| 场景 | 全量重解析 | 分块缓存（本方案） |
|------|-----------|------------------|
| 追加 n 次，每次 k 字符 | O(n²k) | O(nk) |
| 典型 AI 输出（1000 tokens） | ~500ms 总计 | ~50ms 总计 |

### 内存占用

| 组件 | 占用 |
|------|------|
| 块缓存（100 块） | ~200KB |
| HAST 树 | ~100KB |
| Key 映射表 | ~10KB |

### 基准测试目标

- 单次 `append()` 延迟：< 5ms（p99）
- 渲染帧率：≥ 30fps（持续流式输入时）
- 内存增长：< 1MB/分钟（持续流式输入）

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 块边界检测错误 | 提供 fallback 到全量解析；详尽测试边界情况 |
| 非稳定块频繁重解析 | 检测稳定性变化频率，动态调整策略 |
| Key 冲突 | 使用内容 hash + 位置索引组合 |
| 内存泄漏 | 实现 `reset()` 清理；组件卸载时自动清理 |

## Open Questions
- [x] ~~是否需要支持取消/中断正在进行的流式渲染？~~ → 通过 `reset()` 支持
- [x] ~~未闭合代码块的视觉表现如何处理？~~ → 使用 pending 样式 + 光标动画
- [ ] 是否需要暴露块级事件（如 `onBlockStable`）？
- [ ] 是否支持自定义块边界检测规则？

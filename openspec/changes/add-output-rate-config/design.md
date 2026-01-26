# Design: 流式输出速率配置

## Context
流式渲染组件目前仅负责解析和渲染，输出速率完全由调用方控制。用户希望有内置的速率配置，默认提供舒缓的阅读体验。

## Goals
- 提供开箱即用的速率预设
- 默认中等速度，舒缓可读
- 支持精细自定义
- 不影响现有 API

## Design

### 速率预设定义

| 预设 | interval (ms) | chunkSize (字符) | 等效速度 |
|------|---------------|------------------|----------|
| `slow` | 50 | 1 | ~20 字符/秒 |
| `medium` | 30 | 2 | ~67 字符/秒 |
| `fast` | 10 | 5 | ~500 字符/秒 |
| `instant` | 0 | Infinity | 立即显示 |

**默认值**: `medium`

### 类型定义

```typescript
// 预设速率
type OutputRatePreset = 'slow' | 'medium' | 'fast' | 'instant';

// 自定义速率配置
interface OutputRateCustom {
  /** 每次输出的间隔时间 (ms) */
  interval: number;
  /** 每次输出的字符数 */
  chunkSize: number;
}

// 速率配置
type OutputRate = OutputRatePreset | OutputRateCustom;
```

### OutputRateController API

```typescript
class OutputRateController {
  constructor(rate?: OutputRate);
  
  /** 开始按速率输出内容 */
  start(
    content: string, 
    onChunk: (chunk: string, accumulated: string) => void,
    onComplete?: () => void
  ): void;
  
  /** 暂停输出 */
  pause(): void;
  
  /** 恢复输出 */
  resume(): void;
  
  /** 停止并重置 */
  stop(): void;
  
  /** 跳过剩余内容，立即完成 */
  skipToEnd(): void;
  
  /** 更新速率（运行时） */
  setRate(rate: OutputRate): void;
  
  /** 当前状态 */
  readonly status: 'idle' | 'running' | 'paused' | 'complete';
  readonly progress: number; // 0-1
}
```

### 使用示例

```tsx
// React - 使用预设
<StreamingMarkdown 
  source={fullContent}
  outputRate="medium"  // 默认值，可省略
/>

// React - 自定义速率
<StreamingMarkdown 
  source={fullContent}
  outputRate={{ interval: 40, chunkSize: 3 }}
/>

// React Hook
const { element, start, pause, progress } = useStreamingMarkdown({
  outputRate: 'slow',
});

// 开始输出
start(markdownSource);
```

### 与现有 `content` prop 的关系

当前 `StreamingMarkdown` 接收 `content` 作为已累积的内容。新增 `source` + `outputRate` 模式：

| 模式 | Props | 行为 |
|------|-------|------|
| 外部控制 | `content` | 组件仅渲染，速率由外部控制 |
| 内置速率 | `source` + `outputRate` | 组件按配置速率自动输出 |

两种模式互斥，`source` 优先级高于 `content`。

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 新旧 API 混淆 | 文档明确说明两种模式；TypeScript 类型约束 |
| 速率预设不满足所有场景 | 提供自定义配置；预设值可根据反馈调整 |

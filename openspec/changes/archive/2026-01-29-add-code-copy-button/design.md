# Design: add-code-copy-button

## Overview

为代码块添加复制按钮功能，采用组件包装 + CSS 样式的方案实现。

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      渲染层                                  │
├─────────────────────────────────────────────────────────────┤
│   React CodeBlock        │        Vue CodeBlock             │
│   ├── 包装 <pre> 元素     │        ├── 包装 <pre> 元素       │
│   ├── 渲染复制按钮        │        ├── 渲染复制按钮          │
│   └── 处理点击事件        │        └── 处理点击事件          │
├─────────────────────────────────────────────────────────────┤
│                      样式层 (@superlc/md-core)               │
│   └── styles/markdown.css                                   │
│       ├── .md-code-block-wrapper  (容器)                    │
│       ├── .md-copy-button         (复制按钮)                │
│       └── .md-copy-button--copied (复制成功状态)            │
└─────────────────────────────────────────────────────────────┘
```

## Key Decisions

### 1. 组件实现方式

**方案 A**：自定义组件覆盖 `<pre>` 元素（采用）

```tsx
// React
<Markdown components={{ pre: CodeBlock }}>...</Markdown>

// Vue
<Markdown :components="{ pre: CodeBlock }" />
```

**优点**：
- 复用现有的 `components` 覆盖机制
- 用户可选择性启用/禁用
- 不侵入核心解析逻辑

**方案 B**：在核心解析时注入按钮节点

**缺点**：
- 侵入核心逻辑，增加复杂度
- HAST 层面难以处理交互逻辑

### 2. 复制 API 选择

使用 Clipboard API 作为主要方案：

```typescript
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案
    return fallbackCopy(text);
  }
}
```

### 3. 内置 vs 可选

**决策**：内置 CodeBlock 组件，通过 `copyButton` prop 控制

```tsx
// 默认启用
<Markdown>...</Markdown>

// 禁用复制按钮
<Markdown copyButton={false}>...</Markdown>

// 使用自定义组件完全覆盖
<Markdown components={{ pre: MyCustomPre }}>...</Markdown>
```

### 4. 视觉反馈

- 复制按钮默认半透明，hover 时高亮
- 复制成功后显示 ✓ 图标，2 秒后恢复
- 按钮位置：代码块右上角

## Component API

### React

```tsx
interface MarkdownProps {
  // ... existing props
  
  /** 是否显示代码块复制按钮，默认 true */
  copyButton?: boolean;
  
  /** 复制成功回调 */
  onCodeCopy?: (code: string) => void;
}
```

### Vue

```vue
<Markdown
  :copy-button="true"
  @code-copy="handleCopy"
/>
```

## CSS Variables

```css
:root {
  /* 复制按钮 */
  --md-copy-button-bg: rgba(255, 255, 255, 0.1);
  --md-copy-button-bg-hover: rgba(255, 255, 255, 0.2);
  --md-copy-button-color: var(--md-color-text-muted);
  --md-copy-button-color-hover: var(--md-color-text);
  --md-copy-button-success: #22c55e;
}
```

## File Changes

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `packages/core/src/styles/markdown.css` | MODIFIED | 添加复制按钮样式 |
| `packages/react/src/components/CodeBlock.tsx` | NEW | React 代码块组件 |
| `packages/react/src/Markdown.tsx` | MODIFIED | 集成 CodeBlock，添加 copyButton prop |
| `packages/react/src/streaming/StreamingMarkdown.tsx` | MODIFIED | 集成 CodeBlock |
| `packages/vue/src/components/CodeBlock.ts` | NEW | Vue 代码块组件 |
| `packages/vue/src/Markdown.ts` | MODIFIED | 集成 CodeBlock，添加 copyButton prop |
| `packages/vue/src/streaming/StreamingMarkdown.ts` | MODIFIED | 集成 CodeBlock |

## Testing Strategy

1. **单元测试**：验证 `copyToClipboard` 工具函数
2. **组件测试**：验证按钮渲染、点击交互、状态变化
3. **Storybook**：添加代码块复制功能演示

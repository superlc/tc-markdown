# Tasks: add-code-copy-button

## Implementation Tasks

### Phase 1: 核心样式

- [x] **T1**: 在 `packages/core/src/styles/markdown.css` 添加复制按钮样式
  - 添加 CSS 变量定义（浅色/暗黑模式）
  - 添加 `.md-code-block-wrapper` 容器样式
  - 添加 `.md-copy-button` 按钮样式（默认、hover、active 状态）
  - 添加 `.md-copy-button--copied` 成功状态样式
  - 验证：目测浅色/暗黑模式下样式正确

### Phase 2: React 实现

- [x] **T2**: 创建 `packages/react/src/components/CodeBlock.tsx`
  - 实现 `CodeBlock` 组件，包装 `<pre>` 元素
  - 实现复制按钮渲染逻辑
  - 实现 `copyToClipboard` 工具函数
  - 实现复制成功/失败状态管理
  - 验证：单元测试通过

- [x] **T3**: 集成 CodeBlock 到 `packages/react/src/Markdown.tsx`
  - 添加 `copyButton` prop（默认 `true`）
  - 添加 `onCodeCopy` 回调 prop
  - 默认使用内置 CodeBlock 组件覆盖 `pre` 元素
  - 验证：Storybook 中代码块显示复制按钮，点击可复制

- [x] **T4**: 集成 CodeBlock 到 `packages/react/src/streaming/StreamingMarkdown.tsx`
  - 复用 `copyButton` 和 `onCodeCopy` props
  - 仅在 `stable: true` 的代码块显示复制按钮
  - 验证：流式渲染时，代码块完成后显示按钮

### Phase 3: Vue 实现

- [x] **T5**: 创建 `packages/vue/src/components/CodeBlock.ts`
  - 实现 `CodeBlock` 组件（Vue 3 Composition API）
  - 复用 React 版本的复制逻辑
  - 验证：单元测试通过

- [x] **T6**: 集成 CodeBlock 到 `packages/vue/src/Markdown.ts`
  - 添加 `copyButton` prop（默认 `true`）
  - 添加 `code-copy` 事件
  - 默认使用内置 CodeBlock 组件
  - 验证：Storybook 中功能正常

- [x] **T7**: 集成 CodeBlock 到 `packages/vue/src/streaming/StreamingMarkdown.ts`
  - 复用 `copyButton` prop 和 `code-copy` 事件
  - 仅在稳定代码块显示按钮
  - 验证：流式渲染功能正常

### Phase 4: 文档与测试

- [x] **T8**: 添加 Storybook 示例
  - 在 React stories 添加代码复制功能演示
  - 包含启用/禁用、回调等场景
  - 验证：Storybook 中可交互验证

- [x] **T9**: 导出类型定义
  - 确保 `copyButton` 和 `onCodeCopy` 类型正确导出
  - 验证：TypeScript 类型检查通过

## Dependencies

```
T1 ─┬─> T2 ─> T3 ─> T4
    └─> T5 ─> T6 ─> T7
T3 ─> T8
T4 ─> T9
T7 ─> T9
```

- T1 为基础，T2-T4（React）和 T5-T7（Vue）可并行
- T8、T9 在主功能完成后执行

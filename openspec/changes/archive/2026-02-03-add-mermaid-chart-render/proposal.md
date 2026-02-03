# Change: 添加 Mermaid 图表渲染支持

## Why

用户在技术文档中广泛使用 Mermaid 语法绘制流程图、时序图、甘特图等图表。当前组件库不支持 Mermaid 渲染，用户只能看到原始代码块，降低了文档的可读性和可用性。

## What Changes

- 新增 Mermaid 代码块识别与渲染功能
- 支持图片/代码双模式切换显示
- 图片模式：支持放大、缩小、重置、下载功能
- 代码模式：支持代码复制（复用已有 code-copy 能力）
- React 和 Vue 组件均需支持

## Impact

- 新增 specs: `mermaid-render`
- 影响代码:
  - `packages/core/src/` - 可能需要新增 Mermaid 相关处理逻辑
  - `packages/react/src/` - 新增 MermaidBlock 组件
  - `packages/vue/src/` - 新增 MermaidBlock 组件
  - `packages/core/src/styles/` - Mermaid 渲染器样式

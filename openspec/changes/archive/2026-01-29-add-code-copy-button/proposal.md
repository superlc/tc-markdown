# Proposal: add-code-copy-button

## Summary

为代码块添加一键复制功能，用户点击按钮即可将代码内容复制到剪贴板。

## Motivation

### 问题

- 用户在查看代码示例时，需要手动选中代码文本再复制，操作繁琐
- 长代码块难以完整选中，容易遗漏或多选
- 这是现代技术文档的标配功能，缺失会影响用户体验

### 预期收益

- 提升用户体验，一键复制代码
- 符合用户对技术文档类组件的预期
- 增强组件库的功能完整性

## Scope

### In Scope

- 代码块（`<pre><code>`）右上角显示复制按钮
- 点击后将代码内容复制到剪贴板
- 复制成功/失败的视觉反馈
- React 和 Vue 组件同步支持
- 支持通过 prop 禁用复制按钮
- 纯 CSS 样式，支持浅色/暗黑模式

### Out of Scope

- 复制行内代码（`<code>` 非代码块内）
- 复制部分代码（选中区域复制）
- 自定义复制按钮图标

## Risks & Mitigations

| 风险 | 缓解措施 |
|------|----------|
| Clipboard API 兼容性 | 使用 `navigator.clipboard.writeText`，现代浏览器均支持；降级使用 `document.execCommand` |
| 流式渲染时代码块内容变化 | 复制按钮仅在代码块稳定（`stable: true`）后显示 |
| SSR 环境 | 复制逻辑仅在客户端执行 |

## Related Changes

- 扩展 `markdown-styles` 规范，添加复制按钮样式
- 可能需要为 React/Vue 组件添加内部状态管理

## References

- 类似实现：GitHub、MDN、VitePress 等技术文档站点

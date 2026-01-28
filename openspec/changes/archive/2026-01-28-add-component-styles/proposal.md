# Proposal: add-component-styles

## Why

当前 Markdown 组件的样式仅存在于 Storybook 的 `stories/styles.css` 中，用户使用 `@tc/md-react` 或 `@tc/md-vue` 时需要自行编写所有排版样式。这导致：

1. **开箱即用体验差** — 裸组件渲染出来没有任何排版美化
2. **重复劳动** — 每个项目都要写一遍基础排版
3. **React/Vue 割裂** — 样式无法复用

## What Changes

采用**纯 CSS + CSS 变量**方案，在 `@tc/md-core` 中提供一份框架无关的基础样式，支持：

- **CSS 变量定制**：所有颜色、字号、间距通过 `--md-*` 变量暴露，用户覆盖即可定制
- **浅色/暗黑模式**：通过 `prefers-color-scheme` 媒体查询自动切换，同时支持手动 class 切换（`.md-light` / `.md-dark`）
- **框架复用**：React/Vue 包直接 re-export core 的样式文件
- **禁止行内样式**：组件内部不再使用 `style` 属性，所有样式通过 class + CSS 文件管理

### 用户使用方式

```tsx
// React
import '@tc/md-react/styles.css';
// 或直接从 core
import '@tc/md-core/styles.css';

<Markdown className="markdown-body">...</Markdown>
```

```css
/* 定制主题 */
:root {
  --md-color-link: #007aff;
}
/* 强制暗黑 */
.markdown-body.md-dark {
  --md-color-bg: #0d1117;
}
```

## Scope

- 新增 `packages/core/src/styles/markdown.css`
- 修改 React/Vue 的 vite.config 以复制/导出样式
- 更新 package.json exports
- 重构组件移除所有行内 `style` 属性，改用 class

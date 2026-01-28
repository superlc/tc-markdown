# Tasks: add-component-styles

## Implementation Tasks

- [x] **创建 CSS 变量体系**
  - 在 `packages/core/src/styles/markdown.css` 定义 `--md-*` 变量（颜色、字号、间距、圆角）
  - 浅色模式变量放 `:root`，暗黑模式通过 `@media (prefers-color-scheme: dark)` 覆盖

- [x] **实现手动模式切换**
  - 支持 `.md-light` / `.md-dark` class 强制切换模式，优先级高于媒体查询

- [x] **迁移现有样式**
  - 将 `stories/styles.css` 中的 `.markdown-body` 排版样式迁移到 core，用变量替换硬编码值

- [x] **配置构建导出**
  - 修改 `packages/core/vite.config.ts`，将 CSS 复制到 `dist/styles.css`
  - 更新 `packages/core/package.json` 的 exports 添加 `./styles.css`
  - React/Vue 包 re-export 到 core 样式

- [x] **更新 Storybook 引用**
  - 将 `stories/styles.css` 改为 `@import '@tc/md-core/styles.css'`
  - 保留 Storybook 专用的 demo 样式（如 `.streaming-demo`）

- [x] **移除组件行内样式**
  - 重构 `StreamingImage.tsx`，将行内样式改为 `.md-image-*` class
  - 重构 `AnimationText.tsx`，移除 `ANIMATION_KEYFRAMES` 导出，动画定义在 CSS 中
  - 动态尺寸（`width`/`height`）保留 style 属性（符合设计文档例外规则）

## Validation

- [x] 引入 `@tc/md-core/styles.css` 后组件有默认排版
- [x] CSS 变量可被用户覆盖
- [x] `prefers-color-scheme: dark` 下自动切换暗黑配色
- [x] `.md-dark` class 可强制暗黑模式
- [x] 构建产物包含 `styles.css` 且可正常引入
- [x] 组件源码中仅保留动态尺寸的 style 属性

# Design: add-component-styles

## 架构决策

### 样式放置位置

```
packages/core/src/styles/
├── markdown.css      # 主样式文件（变量 + 排版）
└── themes/           # 未来可扩展的预设主题（可选）
```

选择放在 `@tc/md-core` 而非各框架包的理由：
1. **单一来源** — 避免 React/Vue 维护两份
2. **框架无关** — 纯 CSS 无任何运行时依赖
3. **用户可直接引入** — 不强制使用特定框架包

### CSS 变量命名规范

```css
/* 颜色 */
--md-color-text          /* 正文颜色 */
--md-color-text-muted    /* 次要文字（引用、注释） */
--md-color-link          /* 链接 */
--md-color-bg            /* 背景 */
--md-color-bg-code       /* 行内代码背景 */
--md-color-border        /* 边框、分割线 */

/* 字体 */
--md-font-family         /* 正文字体 */
--md-font-family-mono    /* 代码字体 */
--md-font-size-base      /* 基础字号 */
--md-line-height         /* 行高 */

/* 间距 */
--md-spacing-block       /* 块元素间距 */
--md-spacing-inline      /* 行内元素间距 */

/* 圆角 */
--md-radius              /* 通用圆角 */
```

### 浅色/暗黑模式实现

```css
/* 浅色（默认） */
:root, .md-light {
  --md-color-text: #24292e;
  --md-color-bg: #ffffff;
  /* ... */
}

/* 暗黑（系统偏好） */
@media (prefers-color-scheme: dark) {
  :root:not(.md-light) {
    --md-color-text: #c9d1d9;
    --md-color-bg: #0d1117;
    /* ... */
  }
}

/* 暗黑（强制） */
.md-dark {
  --md-color-text: #c9d1d9;
  --md-color-bg: #0d1117;
  /* ... */
}
```

优先级逻辑：
1. `.md-dark` / `.md-light` 最高（用户手动控制）
2. `prefers-color-scheme` 次之（系统偏好）
3. `:root` 默认浅色

### 构建流程

```
core/src/styles/markdown.css
       │
       ▼  vite build (copy plugin)
core/dist/styles.css
       │
       ├──▶ @tc/md-react/styles.css (re-export)
       └──▶ @tc/md-vue/styles.css (re-export)
```

React/Vue 包通过 `package.json` 的 `exports` 字段指向 core 的 CSS，无需复制：

```json
{
  "exports": {
    "./styles.css": "./node_modules/@tc/md-core/dist/styles.css"
  }
}
```

或在各包 `src/` 下创建 `styles.css`：
```css
@import '@tc/md-core/styles.css';
```

## 不做的事情

- **不提供 SCSS/LESS** — 纯 CSS 变量已足够定制
- **不提供 JS theme 对象** — 避免运行时开销
- **不内置多套预设主题** — 首版只提供默认浅色/暗黑，未来可扩展
- **不使用行内样式** — 所有样式通过 class 管理，便于用户覆盖

## 行内样式迁移策略

组件中现有的 `style` 属性需迁移到 CSS class：

| 组件 | 现有行内样式 | 迁移后 class |
|------|-------------|-------------|
| `StreamingImage` | `SKELETON_STYLE` | `.md-image-skeleton` |
| `StreamingImage` | 容器 `position: relative` | `.md-image-container` |
| `AnimationText` | 动画相关 | `.md-animation-text` |

**例外情况**：
- 动态计算的尺寸（如图片 `width`/`height` 来自 data 属性）可保留行内样式
- 这类属性应通过 `style` 而非 class，因为值是运行时确定的

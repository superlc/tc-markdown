# markdown-styles Specification

## Purpose
TBD - created by archiving change add-component-styles. Update Purpose after archive.
## Requirements
### Requirement: 默认样式导出
组件库 MUST 导出一份可直接引入的 CSS 样式文件。

#### Scenario: 用户引入默认样式
- **Given** 用户安装了 `@tc/md-react` 或 `@tc/md-vue`
- **When** 用户执行 `import '@tc/md-react/styles.css'`
- **Then** 页面中 `.markdown-body` 容器内的 Markdown 元素获得默认排版样式

#### Scenario: 从 core 包引入样式
- **Given** 用户只安装了 `@tc/md-core`
- **When** 用户执行 `import '@tc/md-core/styles.css'`
- **Then** 获得与框架包相同的样式效果

---

### Requirement: CSS 变量定制
所有视觉属性 MUST 通过 CSS 变量暴露，允许用户覆盖。

#### Scenario: 覆盖链接颜色
- **Given** 用户已引入默认样式
- **When** 用户在自己的 CSS 中设置 `:root { --md-color-link: red; }`
- **Then** 所有 `.markdown-body a` 的颜色变为红色

#### Scenario: 覆盖代码字体
- **Given** 用户已引入默认样式
- **When** 用户设置 `--md-font-family-mono: 'Fira Code', monospace`
- **Then** 代码块和行内代码使用新字体

---

### Requirement: 浅色/暗黑模式自动切换
样式 MUST 响应系统颜色偏好，自动切换浅色或暗黑配色。

#### Scenario: 系统偏好暗黑模式
- **Given** 用户操作系统设置为暗黑模式
- **When** 页面加载且未手动指定模式
- **Then** `.markdown-body` 使用暗黑配色（深色背景、浅色文字）

#### Scenario: 系统偏好浅色模式
- **Given** 用户操作系统设置为浅色模式
- **When** 页面加载
- **Then** `.markdown-body` 使用浅色配色（浅色背景、深色文字）

---

### Requirement: 手动模式切换
用户 MUST 可通过 class 强制指定浅色或暗黑模式，优先级高于系统偏好。

#### Scenario: 强制暗黑模式
- **Given** 用户操作系统为浅色模式
- **When** 用户在容器上添加 `.md-dark` class
- **Then** 该容器内使用暗黑配色

#### Scenario: 强制浅色模式
- **Given** 用户操作系统为暗黑模式
- **When** 用户在容器上添加 `.md-light` class
- **Then** 该容器内使用浅色配色

#### Scenario: 嵌套模式切换
- **Given** 页面根元素有 `.md-dark`
- **When** 某个子容器添加 `.md-light`
- **Then** 该子容器及其后代使用浅色配色

---

### Requirement: 禁止组件行内样式
组件内部 MUST NOT 使用行内 `style` 属性，所有样式通过 class + CSS 文件管理。

#### Scenario: 组件源码无行内样式
- **Given** 组件库源码（`packages/react/src/**/*.tsx`, `packages/vue/src/**/*.vue`）
- **When** 搜索 `style=` 或 `:style=` 属性
- **Then** 不存在任何匹配项（动态计算的尺寸除外，如 `width`/`height` 来自 props）

#### Scenario: 用户可通过 CSS 覆盖组件样式
- **Given** 用户想修改 StreamingImage 骨架屏颜色
- **When** 用户设置 `.md-image-skeleton { background: blue; }`
- **Then** 骨架屏背景变为蓝色


# mermaid-render Specification

## Purpose
TBD - created by archiving change add-mermaid-chart-render. Update Purpose after archive.
## Requirements
### Requirement: Mermaid 图表渲染

系统 SHALL 识别 Markdown 中的 Mermaid 代码块（```mermaid）并渲染为可视化图表。

#### Scenario: 识别 Mermaid 代码块

- **GIVEN** Markdown 内容包含 ```mermaid 代码块
- **WHEN** 渲染 Markdown
- **THEN** 系统 SHALL 识别该代码块为 Mermaid 图表
- **AND** 使用 MermaidBlock 组件渲染

#### Scenario: 渲染流程图

- **GIVEN** Mermaid 代码为有效的 flowchart 语法
- **WHEN** MermaidBlock 组件挂载
- **THEN** 系统 SHALL 异步加载 Mermaid 库
- **AND** 渲染 SVG 图表显示在组件中

#### Scenario: 渲染时序图

- **GIVEN** Mermaid 代码为有效的 sequenceDiagram 语法
- **WHEN** 渲染完成
- **THEN** 时序图 SHALL 正确显示参与者、消息和箭头

#### Scenario: 渲染失败处理

- **GIVEN** Mermaid 代码存在语法错误
- **WHEN** 渲染失败
- **THEN** 系统 SHALL 显示错误提示信息
- **AND** 自动切换到代码模式供用户检查

#### Scenario: 加载状态

- **GIVEN** Mermaid 库正在加载或图表正在渲染
- **WHEN** 用户查看组件
- **THEN** 系统 SHALL 显示 loading skeleton 占位

---

### Requirement: 图片/代码模式切换

系统 SHALL 支持在图片渲染模式和源代码模式之间切换显示。

#### Scenario: 默认显示图片模式

- **GIVEN** Mermaid 代码块渲染成功
- **WHEN** 组件首次显示
- **THEN** 默认 SHALL 显示图片模式（SVG 图表）
- **AND** 工具栏中图片按钮高亮

#### Scenario: 切换到代码模式

- **GIVEN** 当前为图片模式
- **WHEN** 用户点击"代码"按钮
- **THEN** 视图 SHALL 切换为代码模式
- **AND** 显示 Mermaid 源代码
- **AND** 代码块 SHALL 带有复制按钮

#### Scenario: 切换回图片模式

- **GIVEN** 当前为代码模式
- **WHEN** 用户点击"图片"按钮
- **THEN** 视图 SHALL 切换回图片模式
- **AND** 显示已渲染的 SVG 图表

#### Scenario: 代码模式复制功能

- **GIVEN** 当前为代码模式
- **WHEN** 用户点击复制按钮
- **THEN** Mermaid 源代码 SHALL 被复制到剪贴板
- **AND** 复用现有代码复制功能和反馈

---

### Requirement: 图片模式缩放控制

系统 SHALL 在图片模式下提供放大、缩小、重置缩放功能。

#### Scenario: 放大图表

- **GIVEN** 当前为图片模式，缩放比例未达到最大值
- **WHEN** 用户点击"放大"按钮（+）
- **THEN** 图表 SHALL 放大一个步长（默认 25%）
- **AND** 缩放 SHALL 有平滑过渡动画

#### Scenario: 缩小图表

- **GIVEN** 当前为图片模式，缩放比例未达到最小值
- **WHEN** 用户点击"缩小"按钮（-）
- **THEN** 图表 SHALL 缩小一个步长（默认 25%）
- **AND** 缩放 SHALL 有平滑过渡动画

#### Scenario: 缩放边界限制

- **GIVEN** 缩放比例已达到最大值（400%）或最小值（25%）
- **WHEN** 用户点击对应的缩放按钮
- **THEN** 该按钮 SHALL 显示为禁用状态
- **AND** 点击 SHALL 无效果

#### Scenario: 重置缩放

- **GIVEN** 图表已被放大或缩小
- **WHEN** 用户点击"重置"按钮
- **THEN** 图表 SHALL 恢复到初始缩放比例（100%）
- **AND** 重置 SHALL 有平滑过渡动画

#### Scenario: 缩放状态持久化

- **GIVEN** 用户已调整缩放比例
- **WHEN** 切换到代码模式再切换回图片模式
- **THEN** 缩放比例 SHALL 保持用户调整后的值

---

### Requirement: 全屏模式查看

系统 SHALL 支持在全屏覆盖层中查看复杂图表，提供更大的操作空间。

#### Scenario: 进入全屏模式

- **GIVEN** 图表已成功渲染
- **WHEN** 用户点击"全屏"按钮
- **THEN** 系统 SHALL 显示全屏覆盖层
- **AND** 覆盖层 SHALL 渲染到 body（使用 Portal）
- **AND** 背景 SHALL 为半透明深色遮罩
- **AND** 图表 SHALL 自动适配容器大小显示完整内容

> **变更说明**: 新增 "图表 SHALL 自动适配容器大小显示完整内容" 要求，进入全屏时默认执行适配操作而非固定 100% 缩放。

### Requirement: 图表下载功能

系统 SHALL 支持将渲染后的图表下载到本地。

#### Scenario: 下载为 PNG

- **GIVEN** 图表已成功渲染
- **WHEN** 用户点击"下载"按钮
- **THEN** 系统 SHALL 将 SVG 转换为 PNG 格式
- **AND** 触发浏览器下载
- **AND** 文件名 SHALL 为 `mermaid-chart-{timestamp}.png`

#### Scenario: 下载包含背景色

- **GIVEN** 当前为暗黑模式
- **WHEN** 用户下载图表
- **THEN** PNG 图片 SHALL 包含适当的背景色
- **AND** 保证图表在各种背景下可读

#### Scenario: 下载大型图表

- **GIVEN** 图表 SVG 尺寸较大
- **WHEN** 用户下载图表
- **THEN** PNG 图片 SHALL 保持原始分辨率
- **AND** 下载过程 SHALL 显示 loading 状态

---

### Requirement: Mermaid 功能配置

系统 SHALL 支持通过 prop 配置 Mermaid 渲染功能。

#### Scenario: 默认不启用

- **GIVEN** 使用 `<Markdown>` 组件未指定 `mermaid` prop
- **WHEN** 渲染包含 mermaid 代码块的内容
- **THEN** mermaid 代码块 SHALL 作为普通代码块渲染
- **AND** 不进行图表渲染

#### Scenario: 启用 Mermaid 渲染

- **GIVEN** 使用 `<Markdown mermaid={true}>` （React）或 `:mermaid="true"` （Vue）
- **WHEN** 渲染包含 mermaid 代码块的内容
- **THEN** mermaid 代码块 SHALL 渲染为图表

#### Scenario: Mermaid 库懒加载

- **GIVEN** 启用 mermaid 功能
- **WHEN** 页面首次加载时不包含 mermaid 代码块
- **THEN** Mermaid 库 SHALL NOT 被加载
- **WHEN** 首次遇到 mermaid 代码块
- **THEN** Mermaid 库 SHALL 动态加载

---

### Requirement: Mermaid 工具栏样式

系统 SHALL 提供 Mermaid 工具栏的默认样式，支持浅色/暗黑模式及 CSS 变量定制。

#### Scenario: 工具栏布局

- **GIVEN** MermaidBlock 组件渲染
- **WHEN** 显示工具栏
- **THEN** 工具栏 SHALL 显示在内容区域上方
- **AND** 包含模式切换按钮组和操作按钮组

#### Scenario: 浅色模式样式

- **GIVEN** 系统或容器为浅色模式
- **WHEN** 渲染 MermaidBlock
- **THEN** 工具栏和图表容器 SHALL 使用浅色主题样式

#### Scenario: 暗黑模式样式

- **GIVEN** 系统或容器为暗黑模式
- **WHEN** 渲染 MermaidBlock
- **THEN** 工具栏和图表容器 SHALL 使用暗黑主题样式
- **AND** Mermaid 图表 SHALL 使用暗黑主题渲染

#### Scenario: CSS 变量定制

- **GIVEN** 用户自定义 `--md-mermaid-bg` 变量
- **WHEN** 渲染 MermaidBlock
- **THEN** 图表容器背景 SHALL 使用自定义值

---

### Requirement: 流式渲染兼容

系统 SHALL 在流式渲染场景下正确处理 Mermaid 代码块。

#### Scenario: 非稳定状态显示代码

- **GIVEN** 流式输入 mermaid 代码块，代码块未闭合（`stable: false`）
- **WHEN** 渲染进行中
- **THEN** 系统 SHALL 显示为普通代码块
- **AND** 不尝试渲染图表

#### Scenario: 稳定后渲染图表

- **GIVEN** 流式输入 mermaid 代码块
- **WHEN** 代码块闭合，标记为 `stable: true`
- **THEN** 系统 SHALL 触发 Mermaid 渲染
- **AND** 显示渲染后的图表


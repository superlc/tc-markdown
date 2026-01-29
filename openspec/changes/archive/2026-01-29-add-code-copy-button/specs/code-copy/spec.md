# code-copy Specification

## Purpose

为代码块提供一键复制功能，提升用户在查看代码示例时的操作效率。

## ADDED Requirements

### Requirement: 代码块复制按钮

系统 SHALL 在代码块（`<pre><code>`）右上角显示复制按钮，点击后将代码内容复制到剪贴板。

#### Scenario: 代码块显示复制按钮

- **GIVEN** Markdown 内容包含围栏代码块
- **WHEN** 渲染完成
- **THEN** 代码块右上角 SHALL 显示复制按钮
- **AND** 按钮默认状态为半透明图标

#### Scenario: 点击复制成功

- **GIVEN** 代码块已渲染且显示复制按钮
- **WHEN** 用户点击复制按钮
- **THEN** 代码内容 SHALL 被复制到剪贴板
- **AND** 按钮 SHALL 显示成功状态（✓ 图标）
- **AND** 2 秒后 SHALL 恢复默认状态

#### Scenario: 复制失败处理

- **GIVEN** Clipboard API 不可用或权限被拒绝
- **WHEN** 用户点击复制按钮
- **THEN** 系统 SHALL 尝试降级方案（execCommand）
- **AND** 若仍失败，按钮 SHALL 显示错误状态

#### Scenario: 鼠标悬停反馈

- **GIVEN** 代码块显示复制按钮
- **WHEN** 用户鼠标悬停在按钮上
- **THEN** 按钮 SHALL 高亮显示
- **AND** 显示 "复制代码" 提示文字（title 属性）

---

### Requirement: 复制功能配置

系统 SHALL 支持通过 prop 控制复制按钮的显示与行为。

#### Scenario: 默认启用

- **GIVEN** 使用 `<Markdown>` 组件未指定 `copyButton` prop
- **WHEN** 渲染包含代码块的内容
- **THEN** 复制按钮 SHALL 默认显示

#### Scenario: 禁用复制按钮

- **GIVEN** 使用 `<Markdown copyButton={false}>` （React）或 `:copy-button="false"` （Vue）
- **WHEN** 渲染包含代码块的内容
- **THEN** 复制按钮 SHALL NOT 显示

#### Scenario: 复制回调

- **GIVEN** 使用 `<Markdown onCodeCopy={handler}>` （React）或 `@code-copy="handler"` （Vue）
- **WHEN** 用户成功复制代码
- **THEN** `handler` SHALL 被调用
- **AND** 参数为被复制的代码字符串

---

### Requirement: 流式渲染兼容

系统 SHALL 在流式渲染场景下正确处理复制按钮。

#### Scenario: 非稳定代码块不显示按钮

- **GIVEN** 流式输入代码块，代码块未闭合（`stable: false`）
- **WHEN** 渲染进行中
- **THEN** 复制按钮 SHALL NOT 显示
- **AND** 避免用户复制不完整代码

#### Scenario: 代码块稳定后显示按钮

- **GIVEN** 流式输入代码块
- **WHEN** 代码块闭合，标记为 `stable: true`
- **THEN** 复制按钮 SHALL 显示

---

### Requirement: 复制按钮样式

系统 SHALL 提供复制按钮的默认样式，支持浅色/暗黑模式及 CSS 变量定制。

#### Scenario: 浅色模式样式

- **GIVEN** 系统或容器为浅色模式
- **WHEN** 渲染代码块
- **THEN** 复制按钮 SHALL 使用浅色主题样式
- **AND** 按钮背景与代码块背景协调

#### Scenario: 暗黑模式样式

- **GIVEN** 系统或容器为暗黑模式
- **WHEN** 渲染代码块
- **THEN** 复制按钮 SHALL 使用暗黑主题样式

#### Scenario: CSS 变量定制

- **GIVEN** 用户自定义 `--md-copy-button-bg` 变量
- **WHEN** 渲染代码块
- **THEN** 复制按钮背景 SHALL 使用自定义值

#### Scenario: 成功状态样式

- **GIVEN** 复制成功
- **WHEN** 按钮显示成功状态
- **THEN** 图标 SHALL 变为 ✓
- **AND** 图标颜色 SHALL 为绿色（`--md-copy-button-success`）

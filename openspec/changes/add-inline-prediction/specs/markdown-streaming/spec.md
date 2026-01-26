# markdown-streaming Specification (Delta)

## ADDED Requirements

### Requirement: 行内标记预测补全
系统 SHALL 提供 `InlineCompleter` 类，在流式渲染时智能补全未闭合的行内标记，避免视觉闪烁。

#### Scenario: 粗体预测
- **GIVEN** 流式输入 `这是**粗体`
- **WHEN** 解析该块
- **THEN** 自动补全为 `这是**粗体**`
- **AND** 渲染为 `<strong data-predicted="true">粗体</strong>`

#### Scenario: 斜体预测
- **GIVEN** 流式输入 `这是*斜体`
- **WHEN** 解析该块
- **THEN** 自动补全为 `这是*斜体*`
- **AND** 渲染为 `<em data-predicted="true">斜体</em>`

#### Scenario: 行内代码预测
- **GIVEN** 流式输入 `` 这是`代码 ``
- **WHEN** 解析该块
- **THEN** 自动补全为 `` 这是`代码` ``
- **AND** 渲染为 `<code data-predicted="true">代码</code>`

#### Scenario: 删除线预测
- **GIVEN** 流式输入 `这是~~删除`
- **WHEN** 解析该块
- **THEN** 自动补全为 `这是~~删除~~`
- **AND** 渲染为 `<del data-predicted="true">删除</del>`

#### Scenario: 链接预测（URL 未闭合）
- **GIVEN** 流式输入 `[链接](https://example.com`
- **WHEN** 解析该块
- **THEN** 自动补全为 `[链接](https://example.com)`
- **AND** 渲染为带 `data-predicted="true"` 的链接

#### Scenario: 链接预测（文本未闭合）
- **GIVEN** 流式输入 `[链接文本`
- **WHEN** 解析该块
- **THEN** 自动补全为 `[链接文本]()`
- **AND** 渲染为带 `data-predicted="true"` 的链接占位

#### Scenario: 嵌套标记预测
- **GIVEN** 流式输入 `**粗体*斜体`
- **WHEN** 解析该块
- **THEN** 按嵌套顺序补全 `**粗体*斜体***`
- **AND** 正确渲染嵌套结构

#### Scenario: 转义字符不预测
- **GIVEN** 流式输入 `这是\*不是斜体`
- **WHEN** 解析该块
- **THEN** `\*` 不被视为行内标记开始
- **AND** 保持纯文本渲染

#### Scenario: 真正闭合后移除预测标记
- **GIVEN** 已预测渲染 `<strong data-predicted="true">粗体</strong>`
- **WHEN** 用户输入闭合标记 `**`
- **THEN** 移除 `data-predicted` 属性
- **AND** 渲染为 `<strong>粗体</strong>`

---

### Requirement: 行内预测配置
系统 SHALL 支持配置行内预测行为。

#### Scenario: 禁用行内预测
- **GIVEN** 配置 `enableInlinePrediction: false`
- **WHEN** 流式输入 `这是**粗体`
- **THEN** 保持原有行为，显示为纯文本

#### Scenario: 默认启用预测
- **GIVEN** 未配置 `enableInlinePrediction`
- **WHEN** 创建流式解析器
- **THEN** 默认 `enableInlinePrediction: true`

#### Scenario: 选择性启用预测类型
- **GIVEN** 配置 `predictedInlineTypes: ['bold', 'code']`
- **WHEN** 流式输入包含斜体标记
- **THEN** 仅粗体和代码被预测
- **AND** 斜体保持原有行为

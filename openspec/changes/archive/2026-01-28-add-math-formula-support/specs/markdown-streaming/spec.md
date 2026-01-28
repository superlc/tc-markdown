# markdown-streaming Specification Delta

## ADDED Requirements

### Requirement: 数学公式渲染
系统 SHALL 支持 LaTeX 语法的数学公式渲染，使用 KaTeX 作为渲染引擎。

#### Scenario: 启用数学公式支持
- **GIVEN** 创建 processor 时配置 `math: true`
- **WHEN** 解析包含数学公式的 Markdown
- **THEN** 公式 SHALL 被正确解析并渲染

#### Scenario: 行内公式渲染
- **GIVEN** Markdown 内容包含 `$E = mc^2$`
- **WHEN** `math: true` 配置启用
- **THEN** 渲染为行内数学公式
- **AND** 显示为格式化的 $E = mc^2$

#### Scenario: 块级公式渲染
- **GIVEN** Markdown 内容包含：
  ```
  $$
  \sum_{i=1}^{n} i = \frac{n(n+1)}{2}
  $$
  ```
- **WHEN** `math: true` 配置启用
- **THEN** 渲染为独立居中的块级公式
- **AND** 正确显示求和符号和分数

#### Scenario: 默认不启用
- **GIVEN** 未配置 `math` 选项
- **WHEN** 创建 processor
- **THEN** 数学公式 SHALL NOT 被解析
- **AND** `$...$` 和 `$$...$$` 显示为原始文本

#### Scenario: 流式渲染数学公式
- **GIVEN** 流式输入包含数学公式
- **WHEN** 公式块完成输入
- **THEN** 公式 SHALL 正确渲染
- **AND** 流式过程中保持 pending 状态

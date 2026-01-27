# markdown-streaming Spec Delta

## ADDED Requirements

### Requirement: 表格渐进式显示
系统 SHALL 支持表格的渐进式流式显示，逐行渲染表格内容而非等待表格完整后一次性显示。

#### Scenario: 表格 header 行显示
- **GIVEN** 流式输入 `| Name | Age |\n`
- **WHEN** 解析器处理此内容
- **THEN** 暂时作为段落显示（表格结构未确认）

#### Scenario: 表格结构确认后显示
- **GIVEN** 流式输入 `| Name | Age |\n| --- | --- |\n`
- **WHEN** separator 行完成
- **THEN** 渲染为表格（含 header）
- **AND** 表格显示 pending 状态

#### Scenario: 数据行增量追加
- **GIVEN** 已显示表格 header + separator
- **WHEN** 追加 `| Alice | 25 |\n`
- **THEN** 表格增量更新，新增一行数据
- **AND** 不重新渲染已有的 header 行

#### Scenario: 多行数据逐行显示
- **GIVEN** 已显示表格 header + separator + 一行数据
- **WHEN** 继续追加 `| Bob | 30 |\n| Carol | 28 |\n`
- **THEN** 逐行增量显示新数据
- **AND** 每行追加时触发一次渲染更新

#### Scenario: 表格块 key 稳定
- **GIVEN** 表格正在流式输入
- **WHEN** 追加新行
- **THEN** 表格块的 key SHALL 保持不变
- **AND** React/Vue 复用同一组件实例

#### Scenario: 表格完成
- **GIVEN** 表格已有多行数据
- **WHEN** 遇到空行或其他块级元素
- **THEN** 表格块标记为 stable
- **AND** 移除 pending 状态

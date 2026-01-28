# markdown-streaming

## MODIFIED Requirements

### Requirement: 行内标记预测补全
系统 SHALL 提供 `InlineCompleter` 类，在流式渲染时智能补全未闭合的行内标记，避免视觉闪烁。

#### Scenario: 删除线预测（无闪现）
- **GIVEN** 流式输入以多次 `append()` 追加 `这是~~删除`（此时删除线未闭合）
- **WHEN** 解析器处理该块
- **THEN** 删除线内容 SHALL 以预测方式渲染为 `<del data-predicted="true">删除</del>`
- **AND** 用户在视觉上 SHALL NOT 看到“先渲染为纯文本，随后回溯变成删除线”的闪现

#### Scenario: 删除线预测（chunk 边界落在标记中）
- **GIVEN** 分两次追加 `这是~~删` 与 `除~~`
- **WHEN** 第一次追加完成
- **THEN** `删` SHALL 被渲染在预测删除线内（`<del data-predicted="true">删</del>`）
- **WHEN** 第二次追加完成（闭合出现）
- **THEN** `data-predicted` 属性 SHALL 被移除，渲染为最终的 `<del>删除</del>`

#### Scenario: 删除线预测（chunk 边界落在闭合标记中）
- **GIVEN** 分两次追加 `这是~~删除~` 与 `~`
- **WHEN** 第一段追加完成
- **THEN** 删除线内容仍 SHALL 以预测方式稳定渲染为删除线（不出现纯文本闪现）
- **WHEN** 第二段追加完成（闭合完整）
- **THEN** 渲染收敛为最终 `<del>删除</del>`

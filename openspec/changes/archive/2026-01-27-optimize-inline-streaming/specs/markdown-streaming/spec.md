## MODIFIED Requirements

### Requirement: 增量解析器（高性能）
系统 SHALL 提供 `createStreamingParser` 工厂函数，返回支持高性能增量解析的解析器实例。解析器采用分块缓存策略，避免重复解析已稳定的内容块。行内强调标记（粗体、斜体、行内代码）SHALL 逐字显示而非等待闭合后一次性显示。

#### Scenario: 创建解析器
- **GIVEN** 用户导入 `@tc/md-core`
- **WHEN** 调用 `createStreamingParser(options)`
- **THEN** 返回 `StreamingParser` 实例

#### Scenario: 追加内容并获取块状态
- **GIVEN** 已创建 `StreamingParser` 实例
- **WHEN** 调用 `parser.append('# Hello\n\nWorld')`
- **THEN** 内容被解析为块级结构
- **AND** 可通过 `parser.getState()` 获取包含块信息的状态
- **AND** 状态包含 `{ hast, blocks: [{ key, stable, source }] }`

#### Scenario: 稳定块缓存复用
- **GIVEN** 已追加 `# Title\n\nParagraph 1\n\n`
- **AND** 第一个标题块和段落块已标记为稳定
- **WHEN** 再次调用 `parser.append('Paragraph 2')`
- **THEN** 已稳定的块 SHALL NOT 被重新解析
- **AND** 仅解析新追加的内容
- **AND** 性能开销与新内容大小成正比，而非累积内容

#### Scenario: 代码块跨多次追加
- **GIVEN** 调用 `parser.append('```js\nconst x = 1;')`
- **WHEN** 代码块未闭合
- **THEN** 该块标记为 `stable: false`
- **AND** 后续 `append()` 继续追加到该块
- **WHEN** 调用 `parser.append('\n```\n\nNext')`
- **THEN** 代码块标记为 `stable: true`
- **AND** "Next" 开始新的非稳定块

#### Scenario: 完成解析
- **GIVEN** 已追加所有内容
- **WHEN** 调用 `parser.finish()`
- **THEN** 所有块标记为稳定
- **AND** 解析器标记为完成状态
- **AND** 后续 `append()` 调用 SHALL 抛出错误

#### Scenario: 重置解析器
- **GIVEN** 解析器包含已追加内容和缓存
- **WHEN** 调用 `parser.reset()`
- **THEN** 内部缓冲区和块缓存被清空
- **AND** 解析器可重新使用

#### Scenario: 性能统计
- **GIVEN** 已执行多次 `append()` 操作
- **WHEN** 调用 `parser.getStats()`
- **THEN** 返回性能统计信息
- **AND** 包含 `{ totalAppends, cacheHits, cacheMisses, avgParseTime }`

#### Scenario: 行内强调逐字显示
- **GIVEN** 流式输入 `**我`
- **WHEN** 解析器处理此内容
- **THEN** 输出渲染为粗体的"我"
- **AND** 后续追加 `是` 变为粗体的"我是"
- **AND** 追加 `加强文字**` 后显示完整的粗体"我是加强文字"

#### Scenario: 斜体逐字显示
- **GIVEN** 流式输入 `*斜`
- **WHEN** 解析器处理此内容
- **THEN** 输出渲染为斜体的"斜"
- **AND** 后续追加完成斜体效果

#### Scenario: 行内代码逐字显示
- **GIVEN** 流式输入 `` `code ``
- **WHEN** 解析器处理此内容
- **THEN** 输出渲染为行内代码的"code"
- **AND** 后续追加完成代码效果

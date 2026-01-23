# markdown-streaming Specification

## Purpose
TBD - created by archiving change add-streaming-render. Update Purpose after archive.
## Requirements
### Requirement: 增量解析器（高性能）
系统 SHALL 提供 `createStreamingParser` 工厂函数，返回支持高性能增量解析的解析器实例。解析器采用分块缓存策略，避免重复解析已稳定的内容块。

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

---

### Requirement: 块边界检测
系统 SHALL 正确识别 Markdown 块级元素边界，用于分块解析和缓存。

#### Scenario: 段落边界
- **GIVEN** 内容 `Paragraph 1\n\nParagraph 2`
- **WHEN** 解析完成
- **THEN** 识别为两个独立的段落块

#### Scenario: 标题边界
- **GIVEN** 内容 `Some text\n# Heading\nMore text`
- **WHEN** 解析
- **THEN** `# Heading` 开始新块
- **AND** 前后内容为独立块

#### Scenario: 列表边界
- **GIVEN** 内容 `- Item 1\n- Item 2\n\nParagraph`
- **WHEN** 解析
- **THEN** 列表项归为一个列表块
- **AND** 空行后的段落为新块

#### Scenario: 代码块边界
- **GIVEN** 内容包含围栏代码块
- **WHEN** 遇到开始 ` ``` `
- **THEN** 开始代码块，直到遇到闭合 ` ``` `
- **AND** 闭合后下一内容为新块

#### Scenario: 引用块边界
- **GIVEN** 内容 `> Quote line 1\n> Quote line 2\n\nNormal`
- **WHEN** 解析
- **THEN** 引用行归为一个引用块
- **AND** 空行后的段落为新块

---

### Requirement: 增量渲染（Keyed Nodes）
系统 SHALL 为每个块级 HAST 节点生成稳定的 key，支持框架进行高效的增量 DOM 更新。

#### Scenario: 稳定块 Key 不变
- **GIVEN** 块 `# Title` 已解析并标记为稳定
- **AND** 其 key 为 `stable-0-a1b2c3d4`
- **WHEN** 追加新内容到后续位置
- **THEN** 该块的 key SHALL 保持不变

#### Scenario: 非稳定块 Key 变化
- **GIVEN** 最后一个块为非稳定状态
- **WHEN** 向该块追加内容
- **THEN** 该块 key 可能变化（`pending-{index}` 格式）
- **AND** 框架 SHALL 重新渲染该块

#### Scenario: 块稳定后 Key 固化
- **GIVEN** 块从非稳定变为稳定
- **WHEN** 稳定性变化
- **THEN** key 从 `pending-x` 变为 `stable-x-{hash}`
- **AND** 后续追加不再改变此 key

---

### Requirement: React 流式渲染 Hook
系统 SHALL 提供 `useStreamingMarkdown` Hook，支持高性能增量渲染。

#### Scenario: 基本使用
- **GIVEN** React 函数组件
- **WHEN** 调用 `const { element, append, reset, blocks, stats } = useStreamingMarkdown(options)`
- **THEN** 返回包含渲染元素、控制方法和状态的对象

#### Scenario: 追加内容触发增量渲染
- **GIVEN** 已获取 `useStreamingMarkdown` 返回值
- **AND** 已渲染 2 个稳定块
- **WHEN** 调用 `append('New content')`
- **THEN** 稳定块 SHALL NOT 重新渲染（通过 key 跳过）
- **AND** 仅新块或非稳定块触发 DOM 更新

#### Scenario: 批处理更新
- **GIVEN** 默认配置
- **WHEN** 在同一帧内多次调用 `append()`
- **THEN** 渲染更新 SHALL 被批处理
- **AND** 每帧最多触发一次 DOM 更新

#### Scenario: 配置更新间隔
- **GIVEN** 配置 `useStreamingMarkdown({ minUpdateInterval: 100 })`
- **WHEN** 在 100ms 内多次调用 `append()`
- **THEN** 渲染更新间隔 SHALL 不小于 100ms

#### Scenario: 访问性能统计
- **GIVEN** 多次 `append()` 后
- **WHEN** 读取 `stats`
- **THEN** 返回 `{ totalAppends, cacheHits, cacheMisses, avgParseTime }`

---

### Requirement: React StreamingMarkdown 组件
系统 SHALL 提供 `StreamingMarkdown` 组件，作为流式渲染的声明式 API，内部使用增量渲染优化。

#### Scenario: 受控模式
- **GIVEN** 使用 `<StreamingMarkdown content={streamContent} />`
- **WHEN** `streamContent` 状态更新
- **THEN** 组件增量渲染，仅更新变化的块

#### Scenario: 完成回调
- **GIVEN** 使用 `<StreamingMarkdown content={content} isComplete={true} onComplete={callback} />`
- **WHEN** `isComplete` 变为 `true`
- **THEN** `onComplete` 回调被调用

#### Scenario: 未闭合块样式
- **GIVEN** 内容包含未闭合的代码块
- **WHEN** 渲染
- **THEN** 代码块 SHALL 显示 pending 视觉状态
- **AND** 包含 `data-pending="true"` 属性

---

### Requirement: Vue 流式渲染 Composable
系统 SHALL 提供 `useStreamingMarkdown` Composable，支持高性能增量渲染。

#### Scenario: 基本使用
- **GIVEN** Vue 3 setup 函数
- **WHEN** 调用 `const { vnode, append, reset, blocks, stats } = useStreamingMarkdown(options)`
- **THEN** 返回包含响应式 VNode、控制方法和状态的对象

#### Scenario: 追加内容触发响应式增量更新
- **GIVEN** 已获取 `useStreamingMarkdown` 返回值
- **AND** 已渲染稳定块
- **WHEN** 调用 `append('# Title')`
- **THEN** `vnode` 响应式更新
- **AND** 稳定块通过 key 复用，不重新创建 VNode

---

### Requirement: Vue StreamingMarkdown 组件
系统 SHALL 提供 `StreamingMarkdown` 组件，作为 Vue 流式渲染的声明式 API。

#### Scenario: Props 绑定
- **GIVEN** 使用 `<StreamingMarkdown :content="streamContent" />`
- **WHEN** `streamContent` ref 更新
- **THEN** 组件响应式增量更新

#### Scenario: 完成事件
- **GIVEN** 使用 `<StreamingMarkdown :content="content" :is-complete="true" @complete="handler" />`
- **WHEN** `is-complete` 变为 `true`
- **THEN** `complete` 事件被触发

#### Scenario: 块级事件（可选）
- **GIVEN** 使用 `<StreamingMarkdown @block-stable="handler" />`
- **WHEN** 某块从非稳定变为稳定
- **THEN** `block-stable` 事件被触发
- **AND** 事件参数包含块信息 `{ key, index, source }`


# markdown-streaming Specification

## Purpose
TBD - created by archiving change add-streaming-render. Update Purpose after archive.
## Requirements
### Requirement: 增量解析器（高性能）
系统 SHALL 提供 `createStreamingParser` 工厂函数，返回支持高性能增量解析的解析器实例。解析器采用分块缓存策略，避免重复解析已稳定的内容块。行内强调标记（粗体、斜体、行内代码）SHALL 逐字显示而非等待闭合后一次性显示。链接和图片 SHALL 在结构确定后逐步显示内容。

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

#### Scenario: 链接文字逐字显示
- **GIVEN** 流式输入 `[链`
- **WHEN** 解析器处理此内容
- **THEN** 输出渲染为链接的"链"（使用占位 URL）
- **AND** 后续追加 `接文字` 变为链接"链接文字"
- **AND** 追加 `](https://example.com)` 后链接指向实际 URL

#### Scenario: 图片使用占位图
- **GIVEN** 流式输入 `![加载中`
- **WHEN** 解析器处理此内容
- **THEN** 输出渲染为图片（使用占位图 URL）
- **AND** alt 文本为"加载中"
- **WHEN** 追加 `](https://example.com/image.png)`
- **THEN** 图片 URL 替换为实际地址

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

### Requirement: 输出速率控制器
系统 SHALL 提供 `OutputRateController` 类，用于控制流式内容的输出速率。

#### Scenario: 使用预设速率
- **GIVEN** 导入 `OutputRateController` 
- **WHEN** 创建实例 `new OutputRateController('medium')`
- **THEN** 使用中等速率配置（interval: 30ms, chunkSize: 2）

#### Scenario: 预设速率档位
- **GIVEN** 预设速率 `slow`、`medium`、`fast`、`instant`
- **WHEN** 分别使用这些预设
- **THEN** `slow` 为 50ms/1字符，`medium` 为 30ms/2字符，`fast` 为 10ms/5字符，`instant` 为立即输出

#### Scenario: 自定义速率
- **GIVEN** 创建实例 `new OutputRateController({ interval: 40, chunkSize: 3 })`
- **WHEN** 开始输出
- **THEN** 按 40ms 间隔，每次输出 3 个字符

#### Scenario: 开始输出
- **GIVEN** 已创建 `OutputRateController` 实例
- **WHEN** 调用 `controller.start(content, onChunk, onComplete)`
- **THEN** 按配置速率逐步调用 `onChunk(chunk, accumulated)`
- **AND** 输出完成后调用 `onComplete`

#### Scenario: 暂停和恢复
- **GIVEN** 正在输出中
- **WHEN** 调用 `controller.pause()`
- **THEN** 输出暂停，状态变为 `paused`
- **WHEN** 调用 `controller.resume()`
- **THEN** 从暂停位置继续输出

#### Scenario: 跳过到结束
- **GIVEN** 正在输出中
- **WHEN** 调用 `controller.skipToEnd()`
- **THEN** 立即输出剩余全部内容
- **AND** 触发 `onComplete`

#### Scenario: 运行时更改速率
- **GIVEN** 正在输出中
- **WHEN** 调用 `controller.setRate('fast')`
- **THEN** 后续输出使用新速率

---

### Requirement: React 组件速率配置
系统 SHALL 在 `StreamingMarkdown` 组件和 `useStreamingMarkdown` Hook 中支持 `outputRate` 配置。

#### Scenario: 组件使用预设速率
- **GIVEN** 使用 `<StreamingMarkdown source={content} outputRate="medium" />`
- **WHEN** 组件挂载
- **THEN** 自动按中等速率输出内容

#### Scenario: 组件使用自定义速率
- **GIVEN** 使用 `<StreamingMarkdown source={content} outputRate={{ interval: 50, chunkSize: 1 }} />`
- **WHEN** 组件挂载
- **THEN** 按自定义速率输出

#### Scenario: 默认速率
- **GIVEN** 使用 `<StreamingMarkdown source={content} />` 未指定 `outputRate`
- **WHEN** 组件挂载
- **THEN** 使用默认值 `medium`

#### Scenario: Hook 速率控制
- **GIVEN** 使用 `useStreamingMarkdown({ outputRate: 'slow' })`
- **WHEN** 调用 `start(content)`
- **THEN** 按 `slow` 速率输出内容

#### Scenario: source 与 content 模式
- **GIVEN** 同时提供 `source` 和 `content` props
- **WHEN** 渲染组件
- **THEN** `source` 模式优先，使用内置速率控制
- **AND** `content` prop 被忽略

---

### Requirement: Vue 组件速率配置
系统 SHALL 在 Vue `StreamingMarkdown` 组件和 `useStreamingMarkdown` Composable 中支持 `outputRate` 配置。

#### Scenario: 组件使用速率配置
- **GIVEN** 使用 `<StreamingMarkdown :source="content" output-rate="medium" />`
- **WHEN** 组件挂载
- **THEN** 按指定速率输出

#### Scenario: Composable 速率控制
- **GIVEN** 使用 `useStreamingMarkdown({ outputRate: 'fast' })`
- **WHEN** 调用 `start(content)`
- **THEN** 按 `fast` 速率输出

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


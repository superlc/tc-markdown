# markdown-streaming Specification Delta

## ADDED Requirements

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

# mermaid-streaming Specification

## Purpose
定义 Mermaid 图表在流式渲染场景下的渐进式显示行为，使图表元素以动画形式依次展现。

## ADDED Requirements

### Requirement: Mermaid 流式动画渲染

系统 SHALL 在流式渲染场景下，为 Mermaid 图表提供元素渐进式显示动画。

#### Scenario: 流式模式下触发动画

- **GIVEN** StreamingMarkdown 组件正在流式渲染
- **AND** 内容包含 Mermaid 代码块
- **WHEN** Mermaid 代码块变为 `stable: true`
- **THEN** 系统 SHALL 渲染 SVG 图表
- **AND** 图表元素 SHALL 以动画形式依次显示
- **AND** 动画从第一个元素开始，逐步显示后续元素

#### Scenario: 节点先于连线显示

- **GIVEN** Mermaid 图表包含节点和连线
- **WHEN** 流式动画播放
- **THEN** 节点元素 SHALL 先于连线元素显示
- **AND** 连线动画 SHALL 在起始节点显示后开始

#### Scenario: 非流式模式跳过动画

- **GIVEN** 使用静态 `<Markdown>` 组件（非流式）
- **WHEN** 渲染 Mermaid 图表
- **THEN** 图表 SHALL 立即完整显示
- **AND** 不播放任何动画

#### Scenario: 禁用流式动画

- **GIVEN** MermaidBlock 设置 `streamingAnimation={false}`
- **WHEN** 在流式模式下渲染图表
- **THEN** 图表 SHALL 立即完整显示
- **AND** 不播放动画

---

### Requirement: 动画配置

系统 SHALL 支持配置 Mermaid 流式动画的时长和间隔。

#### Scenario: 配置动画时长

- **GIVEN** MermaidBlock 设置 `animationDuration={200}`
- **WHEN** 流式动画播放
- **THEN** 每个元素的淡入动画时长 SHALL 为 200ms

#### Scenario: 配置元素间隔

- **GIVEN** MermaidBlock 设置 `animationStagger={100}`
- **WHEN** 流式动画播放
- **THEN** 相邻元素开始显示的间隔 SHALL 为 100ms

#### Scenario: 默认动画配置

- **GIVEN** 未配置动画参数
- **WHEN** 流式动画播放
- **THEN** 动画时长 SHALL 使用默认值 150ms
- **AND** 元素间隔 SHALL 使用默认值 50ms

#### Scenario: Markdown 组件传递配置

- **GIVEN** `<Markdown mermaidAnimation={{ duration: 300, stagger: 80 }}>`
- **WHEN** 渲染 Mermaid 图表
- **THEN** 配置 SHALL 传递给内部 MermaidBlock

---

### Requirement: 动画完成回调

系统 SHALL 在流式动画完成时触发回调。

#### Scenario: 动画完成事件

- **GIVEN** MermaidBlock 设置 `onAnimationComplete={callback}`
- **WHEN** 所有元素动画播放完毕
- **THEN** `callback` SHALL 被调用

#### Scenario: 动画期间工具栏状态

- **GIVEN** 流式动画正在播放
- **WHEN** 用户查看工具栏
- **THEN** 下载按钮 SHALL 显示禁用状态
- **AND** 缩放按钮 SHALL 显示禁用状态
- **WHEN** 动画完成
- **THEN** 按钮 SHALL 恢复可用状态

---

### Requirement: 大型图表优化

系统 SHALL 为大型图表提供性能优化处理。

#### Scenario: 元素过多时跳过动画

- **GIVEN** Mermaid 图表包含超过 100 个 SVG 元素
- **WHEN** 在流式模式下渲染
- **THEN** 系统 SHALL 跳过动画
- **AND** 图表立即完整显示
- **AND** 控制台 MAY 输出警告信息

#### Scenario: 配置元素数量阈值

- **GIVEN** 配置 `maxAnimatedElements={50}`
- **WHEN** 图表包含超过 50 个元素
- **THEN** 系统 SHALL 跳过动画

---

### Requirement: 跳过动画交互

系统 SHALL 支持用户主动跳过正在播放的动画。

#### Scenario: 点击跳过动画

- **GIVEN** 流式动画正在播放
- **WHEN** 用户点击图表区域
- **THEN** 动画 SHALL 立即完成
- **AND** 所有元素 SHALL 立即显示
- **AND** `onAnimationComplete` SHALL 被调用

#### Scenario: 新渲染取消旧动画

- **GIVEN** 图表 A 的流式动画正在播放
- **WHEN** 新的图表 B 开始渲染
- **THEN** 图表 A 的动画 SHALL 立即停止
- **AND** 图表 A SHALL 完整显示
- **AND** 图表 B 的动画 SHALL 开始播放

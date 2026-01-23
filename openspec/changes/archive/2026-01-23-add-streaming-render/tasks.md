# Tasks: 支持流式渲染

## 1. Core 包 - 高性能增量解析器
- [ ] 1.1 设计增量解析器接口和类型定义
  - `StreamingParser` 接口
  - `BlockInfo` 块信息类型
  - `StreamingOptions` 配置类型
  - `ParserStats` 性能统计类型
- [ ] 1.2 实现块边界检测器 `BlockSplitter`
  - 段落边界检测（空行分隔）
  - 标题边界检测（`#` 开头）
  - 代码块边界检测（围栏 ` ``` ` 配对）
  - 列表边界检测
  - 引用块边界检测
- [ ] 1.3 实现块缓存管理器 `BlockCache`
  - 稳定块 HAST 缓存
  - Key 生成（`stable-{index}-{hash}` / `pending-{index}`）
  - 缓存命中/失效逻辑
- [ ] 1.4 实现 `createStreamingParser()` 工厂函数
  - `append(chunk)` - 追加内容，触发分块解析
  - `getState()` - 返回 `{ hast, blocks }`
  - `getStats()` - 返回性能统计
  - `finish()` - 标记完成，固化所有块
  - `reset()` - 重置解析器状态
- [ ] 1.5 性能优化
  - 仅重新解析非稳定块
  - 复用稳定块的 HAST 节点
  - 内容 hash 计算优化
- [ ] 1.6 添加单元测试
  - 块边界检测测试
  - 缓存命中测试
  - 性能基准测试

## 2. React 包 - 增量渲染
- [ ] 2.1 实现 `useStreamingMarkdown` Hook
  - 集成 `StreamingParser`
  - RAF 批处理更新
  - 可配置 `minUpdateInterval`
  - 返回 `{ element, append, reset, blocks, stats }`
- [ ] 2.2 实现稳定块 Memo 组件
  - `StableBlock` - 基于 key 跳过重渲染
  - 渲染时注入 `data-block-key` 属性
- [ ] 2.3 实现 `StreamingMarkdown` 组件
  - 受控模式（`content` prop）
  - `isComplete` / `onComplete` 支持
  - 未闭合块 pending 样式
- [ ] 2.4 添加单元测试
- [ ] 2.5 添加 Storybook 示例
  - 模拟流式输入演示
  - 性能统计面板

## 3. Vue 包 - 增量渲染
- [ ] 3.1 实现 `useStreamingMarkdown` Composable
  - 集成 `StreamingParser`
  - 响应式 VNode 生成
  - 批处理更新
  - 返回 `{ vnode, append, reset, blocks, stats }`
- [ ] 3.2 实现 `StreamingMarkdown` 组件
  - Props: `content`, `isComplete`
  - Events: `@complete`, `@block-stable`
  - 基于 key 的 VNode 复用
- [ ] 3.3 添加单元测试
- [ ] 3.4 添加 Storybook 示例

## 4. 样式与文档
- [ ] 4.1 添加 pending 块样式
  - `.code-block--pending` 光标动画
  - `.block--pending` 通用样式
- [ ] 4.2 更新各包的 `index.ts` 导出
- [ ] 4.3 更新类型定义文件
